
import React, { useState, useEffect } from 'react';
import { api, Provider } from '@/services/api';
import { providerService } from '@/services/providerService';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Check, Settings, RefreshCcw, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Providers = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [newProvider, setNewProvider] = useState({
    name: '',
    code: '',
    description: '',
    apiKey: '',
    apiUrl: '',
    isActive: true
  });
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, boolean>>({});
  const [providerBalances, setProviderBalances] = useState<Record<string, { balance: number; currency: string }>>({});
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [apiKeyVisible, setApiKeyVisible] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAllProviders();
      setProviders(data);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast.error('فشل في جلب مزودي الخدمة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProvider = async () => {
    try {
      if (!newProvider.name || !newProvider.code) {
        toast.error('يرجى إدخال اسم ورمز مزود الخدمة');
        return;
      }

      const providerData = {
        name: newProvider.name,
        code: newProvider.code,
        description: newProvider.description,
        apiKey: newProvider.apiKey,
        apiUrl: newProvider.apiUrl,
        isActive: newProvider.isActive,
        countries: []
      };

      const createdProvider = await api.createProvider(providerData);
      setProviders([...providers, createdProvider]);
      setNewProvider({
        name: '',
        code: '',
        description: '',
        apiKey: '',
        apiUrl: '',
        isActive: true
      });
      setOpenNewDialog(false);
      toast.success('تم إنشاء مزود خدمة جديد بنجاح');
    } catch (error) {
      console.error('Error creating provider:', error);
      toast.error('فشل في إنشاء مزود الخدمة');
    }
  };

  const handleUpdateProvider = async () => {
    try {
      if (!selectedProvider) return;
      
      await api.updateProvider(selectedProvider);
      setProviders(providers.map(p => p.id === selectedProvider.id ? selectedProvider : p));
      setOpenDialog(false);
      toast.success('تم تحديث مزود الخدمة بنجاح');
    } catch (error) {
      console.error('Error updating provider:', error);
      toast.error('فشل في تحديث مزود الخدمة');
    }
  };

  const testConnection = async (providerId: string) => {
    setTestingProvider(providerId);
    try {
      const success = await providerService.testConnection(providerId);
      
      setConnectionStatuses({
        ...connectionStatuses,
        [providerId]: success
      });
      
      if (success) {
        toast.success('تم الاتصال بنجاح');
        // Get balance after successful connection
        fetchBalance(providerId);
      } else {
        toast.error('فشل الاتصال');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error('فشل اختبار الاتصال');
      setConnectionStatuses({
        ...connectionStatuses,
        [providerId]: false
      });
    } finally {
      setTestingProvider(null);
    }
  };

  const fetchBalance = async (providerId: string) => {
    try {
      const balanceData = await providerService.getBalance(providerId);
      setProviderBalances({
        ...providerBalances,
        [providerId]: balanceData
      });
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast.error('فشل في جلب الرصيد');
    }
  };

  const toggleProviderActive = async (provider: Provider) => {
    try {
      const updatedProvider = { ...provider, isActive: !provider.isActive };
      await api.updateProvider(updatedProvider);
      setProviders(providers.map(p => p.id === provider.id ? updatedProvider : p));
      toast.success(`تم ${updatedProvider.isActive ? 'تفعيل' : 'تعطيل'} مزود الخدمة بنجاح`);
    } catch (error) {
      console.error('Error toggling provider status:', error);
      toast.error('فشل في تغيير حالة مزود الخدمة');
    }
  };

  const toggleApiKeyVisibility = (providerId: string) => {
    setApiKeyVisible({
      ...apiKeyVisible,
      [providerId]: !apiKeyVisible[providerId]
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">إدارة مزودي الخدمة</h1>
        <Button onClick={() => setOpenNewDialog(true)}>إضافة مزود جديد</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((provider) => (
          <Card key={provider.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{provider.name}</CardTitle>
                <Badge variant={provider.isActive ? "success" : "destructive"}>
                  {provider.isActive ? 'نشط' : 'معطل'}
                </Badge>
              </div>
              <CardDescription>{provider.code}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                {provider.description || 'لا يوجد وصف'}
              </div>
              
              {connectionStatuses[provider.id] && (
                <div className="flex items-center text-sm text-green-600">
                  <Check className="w-4 h-4 mr-1" />
                  متصل
                </div>
              )}
              
              {providerBalances[provider.id] && (
                <div className="text-sm font-medium">
                  الرصيد: {providerBalances[provider.id].balance} {providerBalances[provider.id].currency}
                </div>
              )}
              
              <div className="flex items-center justify-between mt-2">
                <span>حالة التنشيط</span>
                <Switch 
                  checked={provider.isActive}
                  onCheckedChange={() => toggleProviderActive(provider)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <div className="flex gap-2 w-full">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => testConnection(provider.id)}
                  disabled={testingProvider === provider.id}
                >
                  {testingProvider === provider.id ? (
                    <RefreshCcw className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-1" />
                  )}
                  اختبار الاتصال
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => {
                    setSelectedProvider(provider);
                    setOpenDialog(true);
                  }}
                >
                  <Settings className="w-4 h-4 mr-1" />
                  إعدادات
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Provider Settings Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إعدادات مزود الخدمة</DialogTitle>
          </DialogHeader>

          {selectedProvider && (
            <Tabs defaultValue="general">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="general">عام</TabsTrigger>
                <TabsTrigger value="api">إعدادات API</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">الاسم</Label>
                  <Input 
                    id="name"
                    value={selectedProvider.name}
                    onChange={(e) => setSelectedProvider({...selectedProvider, name: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="code">الرمز</Label>
                  <Input 
                    id="code"
                    value={selectedProvider.code}
                    onChange={(e) => setSelectedProvider({...selectedProvider, code: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">الوصف</Label>
                  <Input 
                    id="description"
                    value={selectedProvider.description || ''}
                    onChange={(e) => setSelectedProvider({...selectedProvider, description: e.target.value})}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="isActive"
                    checked={selectedProvider.isActive}
                    onCheckedChange={(checked) => setSelectedProvider({...selectedProvider, isActive: checked})}
                  />
                  <Label htmlFor="isActive">نشط</Label>
                </div>
              </TabsContent>
              
              <TabsContent value="api" className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="apiKey">مفتاح API</Label>
                  <div className="relative">
                    <Input 
                      id="apiKey"
                      type={apiKeyVisible[selectedProvider.id] ? 'text' : 'password'}
                      value={selectedProvider.apiKey}
                      onChange={(e) => setSelectedProvider({...selectedProvider, apiKey: e.target.value})}
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => toggleApiKeyVisibility(selectedProvider.id)}
                    >
                      {apiKeyVisible[selectedProvider.id] ? 'إخفاء' : 'إظهار'}
                    </Button>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="apiUrl">رابط API</Label>
                  <Input 
                    id="apiUrl"
                    value={selectedProvider.apiUrl || ''}
                    onChange={(e) => setSelectedProvider({...selectedProvider, apiUrl: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => testConnection(selectedProvider.id)}
                    disabled={testingProvider === selectedProvider.id}
                  >
                    {testingProvider === selectedProvider.id ? 
                      <RefreshCcw className="w-4 h-4 mr-1 animate-spin" /> : 
                      <Check className="w-4 h-4 mr-1" />
                    }
                    اختبار الاتصال
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>إلغاء</Button>
            <Button onClick={handleUpdateProvider}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Provider Dialog */}
      <Dialog open={openNewDialog} onOpenChange={setOpenNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة مزود خدمة جديد</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="new-name">الاسم</Label>
              <Input 
                id="new-name"
                value={newProvider.name}
                onChange={(e) => setNewProvider({...newProvider, name: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="new-code">الرمز</Label>
              <Input 
                id="new-code"
                value={newProvider.code}
                onChange={(e) => setNewProvider({...newProvider, code: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="new-description">الوصف</Label>
              <Input 
                id="new-description"
                value={newProvider.description}
                onChange={(e) => setNewProvider({...newProvider, description: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="new-apiKey">مفتاح API</Label>
              <Input 
                id="new-apiKey"
                value={newProvider.apiKey}
                onChange={(e) => setNewProvider({...newProvider, apiKey: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="new-apiUrl">رابط API</Label>
              <Input 
                id="new-apiUrl"
                value={newProvider.apiUrl}
                onChange={(e) => setNewProvider({...newProvider, apiUrl: e.target.value})}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="new-isActive"
                checked={newProvider.isActive}
                onCheckedChange={(checked) => setNewProvider({...newProvider, isActive: checked})}
              />
              <Label htmlFor="new-isActive">نشط</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenNewDialog(false)}>إلغاء</Button>
            <Button onClick={handleCreateProvider}>إنشاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Providers;
