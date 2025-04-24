
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { api, Provider, Country } from '@/services/api';
import { Server, Plus, Globe, Check, Save, Trash2, AlertCircle, RefreshCw, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { fiveSimApi, phoneServiceApi, smsActivateApi } from '@/services/fiveSimService';

const Providers = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [newProvider, setNewProvider] = useState({
    name: '',
    description: '',
    countries: [] as string[],
    isActive: true,
    apiKey: '',
    apiUrl: '',
  });
  const [openNewProviderDialog, setOpenNewProviderDialog] = useState(false);
  const [testingProviderConnection, setTestingProviderConnection] = useState<string | null>(null);
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, boolean>>({});
  const [apiKeyVisible, setApiKeyVisible] = useState<Record<string, boolean>>({});
  const [providerBalances, setProviderBalances] = useState<Record<string, { balance: number; currency: string }>>({});
  const [fetchingBalance, setFetchingBalance] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [providersData, countriesData] = await Promise.all([
        api.getProviders(),
        api.getCountries()
      ]);
      setProviders(providersData);
      setCountries(countriesData);
      
      // Test connection for each provider
      for (const provider of providersData) {
        testProviderConnection(provider.id);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('فشل في جلب البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCountry = (providerId: string, countryId: string) => {
    setProviders(providers.map(provider => {
      if (provider.id === providerId) {
        const updatedCountries = provider.countries.includes(countryId)
          ? provider.countries.filter(id => id !== countryId)
          : [...provider.countries, countryId];
        
        return { ...provider, countries: updatedCountries };
      }
      return provider;
    }));
  };

  const handleToggleProviderActive = (providerId: string) => {
    setProviders(providers.map(provider => {
      if (provider.id === providerId) {
        return { ...provider, isActive: !provider.isActive };
      }
      return provider;
    }));
  };

  const handleSaveProvider = async (provider: Provider) => {
    try {
      await api.updateProvider(provider);
      toast.success(`تم تحديث مزود الخدمة ${provider.name} بنجاح`);
    } catch (error) {
      console.error('Failed to save provider', error);
      toast.error('حدث خطأ أثناء حفظ مزود الخدمة');
    }
  };

  const handleAddProvider = async () => {
    if (!newProvider.name) {
      toast.error('الرجاء إدخال اسم مزود الخدمة');
      return;
    }

    try {
      const addedProvider = await api.addProvider(newProvider);
      setProviders([...providers, addedProvider]);
      setNewProvider({
        name: '',
        description: '',
        countries: [],
        isActive: true,
        apiKey: '',
        apiUrl: '',
      });
      setOpenNewProviderDialog(false);
      toast.success(`تم إضافة مزود الخدمة ${addedProvider.name} بنجاح`);
      
      // Test connection for the new provider
      testProviderConnection(addedProvider.id);
    } catch (error) {
      console.error('Failed to add provider', error);
      toast.error('حدث خطأ أثناء إضافة مزود الخدمة');
    }
  };

  const handleToggleNewProviderCountry = (countryId: string) => {
    setNewProvider(prev => {
      const updatedCountries = prev.countries.includes(countryId)
        ? prev.countries.filter(id => id !== countryId)
        : [...prev.countries, countryId];
      
      return { ...prev, countries: updatedCountries };
    });
  };
  
  const testProviderConnection = async (providerId: string) => {
    setTestingProviderConnection(providerId);
    try {
      // Find the provider
      const provider = providers.find(p => p.id === providerId);
      if (!provider) return;
      
      let success = false;
      if (provider.name.toLowerCase().includes('5sim')) {
        // Test 5Sim connection
        try {
          const countries = await fiveSimApi.getCountries();
          success = countries.length > 0;
        } catch (error) {
          console.error('Failed to test 5Sim connection:', error);
          success = false;
        }
      } else if (provider.name.toLowerCase().includes('smsactivate')) {
        // Test SMS Activate connection
        try {
          if (provider.apiKey) {
            smsActivateApi.setApiKey(provider.apiKey);
            await smsActivateApi.getBalance();
            success = true;
          }
        } catch (error) {
          console.error('Failed to test SMS Activate connection:', error);
          success = false;
        }
      } else {
        // Test other providers - implement as needed
        success = true; // Placeholder
      }
      
      // Update connection status
      setConnectionStatuses(prev => ({
        ...prev,
        [providerId]: success
      }));
      
      if (success) {
        toast.success(`تم الاتصال بمزود الخدمة ${provider.name} بنجاح`);
        // After successful connection, fetch balance
        fetchProviderBalance(providerId);
      } else {
        toast.error(`فشل الاتصال بمزود الخدمة ${provider.name}`);
      }
    } catch (error) {
      console.error(`Failed to test connection for provider ${providerId}:`, error);
      setConnectionStatuses(prev => ({
        ...prev,
        [providerId]: false
      }));
      toast.error('فشل اختبار الاتصال بالمزود');
    } finally {
      setTestingProviderConnection(null);
    }
  };
  
  const fetchProviderBalance = async (providerId: string) => {
    setFetchingBalance(providerId);
    try {
      const provider = providers.find(p => p.id === providerId);
      if (!provider) return;
      
      let balance = { balance: 0, currency: "Unknown" };
      
      if (provider.name.toLowerCase().includes('5sim')) {
        balance = await phoneServiceApi.getProviderBalance('5sim');
      } else if (provider.name.toLowerCase().includes('smsactivate') && provider.apiKey) {
        balance = await phoneServiceApi.getProviderBalance('smsactivate', provider.apiKey);
      }
      
      setProviderBalances(prev => ({
        ...prev,
        [providerId]: balance
      }));
      
      toast.success(`تم جلب رصيد مزود الخدمة ${provider.name} بنجاح`);
    } catch (error) {
      console.error(`Failed to fetch balance for provider ${providerId}:`, error);
      toast.error('فشل في جلب رصيد المزود');
    } finally {
      setFetchingBalance(null);
    }
  };
  
  const fetchProviderCountries = async (providerId: string) => {
    try {
      const provider = providers.find(p => p.id === providerId);
      if (!provider) return;
      
      toast.info(`جاري جلب الدول المتاحة من ${provider.name}...`);
      
      let fetchedCountries: any[] = [];
      
      // For 5Sim, we'll use our existing API
      if (provider.name.toLowerCase().includes('5sim')) {
        const fiveSimCountries = await phoneServiceApi.getProviderCountries('5sim');
        
        // Convert 5Sim countries to our country format
        const newCountries: Country[] = fiveSimCountries.map((country: any) => ({
          id: country.iso,
          name: country.name,
          flag: getFlagEmoji(country.iso.toUpperCase()),
          code: country.iso,
          available: true
        }));
        
        fetchedCountries = newCountries;
      } 
      // For SMS Activate
      else if (provider.name.toLowerCase().includes('smsactivate') && provider.apiKey) {
        smsActivateApi.setApiKey(provider.apiKey);
        const smsActivateCountries = await smsActivateApi.getCountries();
        
        // Convert SMS Activate countries to our country format
        const newCountries: Country[] = smsActivateCountries.map(country => ({
          id: country.id,
          name: country.name,
          flag: country.code ? getFlagEmoji(country.code.toUpperCase()) : '🌍',
          code: country.code || '',
          available: true
        }));
        
        fetchedCountries = newCountries;
      }
      // For other providers, you'll need to implement their APIs
      else {
        toast.info('هذه الميزة غير متاحة لهذا المزود حاليًا');
        return;
      }
      
      if (fetchedCountries.length > 0) {
        // Add any new countries to our countries list
        const existingCountryCodes = countries.map(c => c.code);
        const uniqueNewCountries = fetchedCountries.filter(c => !existingCountryCodes.includes(c.code));
        
        if (uniqueNewCountries.length > 0) {
          await api.addCountries(uniqueNewCountries);
          setCountries([...countries, ...uniqueNewCountries]);
          toast.success(`تم إضافة ${uniqueNewCountries.length} دولة جديدة`);
        } else {
          toast.info('لم يتم العثور على دول جديدة');
        }
      } else {
        toast.warning('لم يتم العثور على أي دول');
      }
    } catch (error) {
      console.error(`Failed to fetch countries from provider ${providerId}:`, error);
      toast.error('فشل في جلب الدول من المزود');
    }
  };
  
  // Helper function to get flag emoji from country code
  const getFlagEmoji = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };
  
  const toggleApiKeyVisibility = (providerId: string) => {
    setApiKeyVisible(prev => ({
      ...prev,
      [providerId]: !prev[providerId]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">إدارة مزودي الخدمة</h1>
        
        <Dialog open={openNewProviderDialog} onOpenChange={setOpenNewProviderDialog}>
          <DialogTrigger asChild>
            <Button className="gradient-bg">
              <Plus className="ml-2 h-4 w-4" />
              إضافة مزود جديد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة مزود خدمة جديد</DialogTitle>
              <DialogDescription>
                أدخل معلومات مزود الخدمة الجديد وحدد الدول المتاحة
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="provider-name">اسم مزود الخدمة</Label>
                <Input
                  id="provider-name"
                  value={newProvider.name}
                  onChange={(e) => setNewProvider({...newProvider, name: e.target.value})}
                  placeholder="أدخل اسم مزود الخدمة"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="provider-description">وصف مزود الخدمة</Label>
                <Textarea
                  id="provider-description"
                  value={newProvider.description}
                  onChange={(e) => setNewProvider({...newProvider, description: e.target.value})}
                  placeholder="أدخل وصفًا مختصرًا لمزود الخدمة"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="provider-api-url">عنوان API</Label>
                <Input
                  id="provider-api-url"
                  value={newProvider.apiUrl}
                  onChange={(e) => setNewProvider({...newProvider, apiUrl: e.target.value})}
                  placeholder="https://api.example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="provider-api-key">مفتاح API</Label>
                <Input
                  id="provider-api-key"
                  value={newProvider.apiKey}
                  onChange={(e) => setNewProvider({...newProvider, apiKey: e.target.value})}
                  type="password"
                  placeholder="أدخل مفتاح API الخاص بالمزود"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="block mb-2">مزود نشط</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newProvider.isActive}
                    onCheckedChange={(checked) => setNewProvider({...newProvider, isActive: checked})}
                  />
                  <span className="mr-2">{newProvider.isActive ? 'نشط' : 'غير نشط'}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="block mb-2">الدول المتاحة</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {countries.map(country => (
                    <div key={country.id} className="flex items-center space-x-2">
                      <Switch
                        checked={newProvider.countries.includes(country.id)}
                        onCheckedChange={() => handleToggleNewProviderCountry(country.id)}
                      />
                      <span className="mr-2">{country.flag} {country.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenNewProviderDialog(false)}>
                إلغاء
              </Button>
              <Button className="gradient-bg" onClick={handleAddProvider}>
                إضافة مزود الخدمة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {providers.map(provider => (
          <Card key={provider.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    connectionStatuses[provider.id] ? 'bg-green-100' : 'bg-brand-100'
                  }`}>
                    <Server className={`h-5 w-5 ${
                      connectionStatuses[provider.id] ? 'text-green-600' : 'text-brand-600'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle>{provider.name}</CardTitle>
                      {connectionStatuses[provider.id] !== undefined && (
                        <Badge className={connectionStatuses[provider.id] ? 'bg-green-500' : 'bg-red-500'}>
                          {connectionStatuses[provider.id] ? 'متصل' : 'غير متصل'}
                        </Badge>
                      )}
                      
                      {/* Show balance if available */}
                      {providerBalances[provider.id] && (
                        <Badge className="bg-blue-500 mr-2">
                          <Wallet className="h-3 w-3 ml-1" />
                          {providerBalances[provider.id].balance} 
                          {" "}
                          {providerBalances[provider.id].currency}
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{provider.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={provider.isActive}
                    onCheckedChange={() => handleToggleProviderActive(provider.id)}
                  />
                  <span>{provider.isActive ? 'نشط' : 'غير نشط'}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-gray-500" />
                      <h3 className="font-medium">إعدادات API</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={testingProviderConnection === provider.id ? 'animate-pulse' : ''}
                        onClick={() => testProviderConnection(provider.id)}
                      >
                        <RefreshCw className="h-4 w-4 ml-2" />
                        اختبار الاتصال
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => fetchProviderCountries(provider.id)}
                      >
                        <Globe className="h-4 w-4 ml-2" />
                        جلب الدول
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={fetchingBalance === provider.id ? 'animate-pulse' : ''}
                        onClick={() => fetchProviderBalance(provider.id)}
                      >
                        <Wallet className="h-4 w-4 ml-2" />
                        جلب الرصيد
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor={`api-url-${provider.id}`}>عنوان API</Label>
                      <Input
                        id={`api-url-${provider.id}`}
                        value={(provider as any).apiUrl || ''}
                        onChange={(e) => setProviders(providers.map(p => 
                          p.id === provider.id ? { ...p, apiUrl: e.target.value } : p
                        ))}
                        placeholder="https://api.example.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`api-key-${provider.id}`}>مفتاح API</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            id={`api-key-${provider.id}`}
                            value={(provider as any).apiKey || ''}
                            onChange={(e) => setProviders(providers.map(p => 
                              p.id === provider.id ? { ...p, apiKey: e.target.value } : p
                            ))}
                            type={apiKeyVisible[provider.id] ? 'text' : 'password'}
                            placeholder="أدخل مفتاح API الخاص بالمزود"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => toggleApiKeyVisibility(provider.id)}
                        >
                          {apiKeyVisible[provider.id] ? "إخفاء" : "إظهار"}
                        </Button>
                      </div>
                    </div>
                  </div>

                </div>
                
                <div className="border-t pt-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="h-5 w-5 text-gray-500" />
                    <h3 className="font-medium">الدول المتاحة ({provider.countries.length})</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {countries.map(country => (
                      <div 
                        key={country.id} 
                        className="flex items-center space-x-2"
                      >
                        <Switch
                          checked={provider.countries.includes(country.id)}
                          onCheckedChange={() => handleToggleCountry(provider.id, country.id)}
                        />
                        <span className="mr-2">
                          {country.flag} {country.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                variant="default" 
                onClick={() => handleSaveProvider(provider)}
              >
                <Save className="ml-2 h-4 w-4" />
                حفظ التغييرات
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Providers;
