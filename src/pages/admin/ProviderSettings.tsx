
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { providerService } from '@/services/providerService';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, Settings, RefreshCcw, X, Star, StarOff, Info } from 'lucide-react';
import { Provider, ProviderCode, ProviderBalance } from '@/types/Provider';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

const providerDefaults = {
  '5sim': {
    name: '5SIM',
    description: 'خدمة أرقام افتراضية للاستقبال من جميع أنحاء العالم',
    apiUrl: 'https://5sim.net/v1/',
    endpoints: {
      balance: '/user/balance',
      countries: '/guest/countries',
      products: '/guest/products/country/{country}',
      purchase: '/user/buy/activation/{country}/{operator}/{product}',
      status: '/user/check/{id}',
      cancel: '/user/cancel/{id}'
    },
    settings: {}
  },
  'smsactivate': {
    name: 'SMS Activate',
    description: 'خدمة أرقام للتفعيل والاستقبال',
    apiUrl: 'https://api.sms-activate.org/stubs/handler_api.php',
    endpoints: {
      balance: '?api_key={api_key}&action=getBalance',
      countries: '?api_key={api_key}&action=getCountries',
      products: '?api_key={api_key}&action=getServices',
      purchase: '?api_key={api_key}&action=getNumber&service={service}&country={country}',
      status: '?api_key={api_key}&action=getStatus&id={id}',
      cancel: '?api_key={api_key}&action=setStatus&status=8&id={id}'
    },
    settings: {}
  },
  'getsmscode': {
    name: 'GetSmsCode',
    description: 'خدمة استقبال رسائل SMS للتحقق',
    apiUrl: 'https://api.getsmscode.com/',
    endpoints: {
      balance: 'usdo.php?action=login&username={username}&token={api_key}',
      countries: 'usdo.php?action=getCountries&username={username}&token={api_key}',
      products: 'usdo.php?action=getProducts&username={username}&token={api_key}&country={country}',
      purchase: 'usdo.php?action=getmobile&username={username}&token={api_key}&pid={product}&cocode={country}',
      status: 'usdo.php?action=getsms&username={username}&token={api_key}&vnumber={number}&pid={product}',
      cancel: 'usdo.php?action=releasephone&username={username}&token={api_key}&pid={product}&mobile={number}&cocode={country}'
    },
    settings: {
      username: ''
    }
  },
  'smsman': {
    name: 'SMS Man',
    description: 'خدمة SMS Man للأرقام الافتراضية',
    apiUrl: 'http://api.sms-man.com/control/',
    endpoints: {
      balance: 'get-balance?token={api_key}',
      countries: 'countries?token={api_key}',
      products: 'applications?token={api_key}&country_id={country}',
      purchase: 'get-number?token={api_key}&country_id={country}&application_id={product}',
      status: 'check-sms?token={api_key}&request_id={id}',
      cancel: 'cancel?token={api_key}&request_id={id}'
    },
    settings: {}
  },
  'onlinesims': {
    name: 'Online SIMs',
    description: 'خدمة أرقام متنوعة من جميع أنحاء العالم',
    apiUrl: 'https://onlinesim.io/api/',
    endpoints: {
      balance: 'getBalance.php?apikey={api_key}',
      countries: 'getCountries.php?apikey={api_key}',
      products: 'getServices.php?apikey={api_key}&country={country}',
      purchase: 'getNumber.php?apikey={api_key}&service={service}&country={country}',
      status: 'getState.php?apikey={api_key}&tzid={id}',
      cancel: 'setOperationRevise.php?apikey={api_key}&tzid={id}'
    },
    settings: {}
  }
};

const ProviderSettings: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [providerBalances, setProviderBalances] = useState<Record<string, ProviderBalance>>({});
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [apiKeyVisible, setApiKeyVisible] = useState<Record<string, boolean>>({});
  const [selectedTab, setSelectedTab] = useState<ProviderCode>('5sim');

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAllProviders();
      setProviders(data);
      
      // أوتوماتيكياً أنشيء مزودي الخدمة إذا لم يكونوا موجودين
      await checkAndCreateDefaultProviders(data);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast.error('فشل في جلب مزودي الخدمة');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAndCreateDefaultProviders = async (existingProviders: Provider[]) => {
    const defaultCodes: ProviderCode[] = ['5sim', 'smsactivate', 'getsmscode', 'smsman', 'onlinesims'];
    
    for (const code of defaultCodes) {
      if (!existingProviders.some(p => p.code === code)) {
        // إنشاء المزود إذا لم يكن موجوداً
        try {
          const defaultProvider = providerDefaults[code];
          await api.createProvider({
            name: defaultProvider.name,
            code: code,
            description: defaultProvider.description,
            apiKey: '',
            apiUrl: defaultProvider.apiUrl,
            endpoints: defaultProvider.endpoints,
            isActive: false,
            settings: defaultProvider.settings,
            countries: []
          });
        } catch (error) {
          console.error(`Error creating default provider ${code}:`, error);
        }
      }
    }
    
    // إعادة تحميل المزودين بعد إنشاء الافتراضيين
    const updatedProviders = await api.getAllProviders();
    setProviders(updatedProviders);
  };

  const getProviderByCode = (code: string): Provider | undefined => {
    return providers.find(p => p.code === code);
  };

  const handleUpdateProvider = async (provider: Provider) => {
    try {
      const updatedProvider = await api.updateProvider(provider);
      setProviders(prev => prev.map(p => p.id === provider.id ? updatedProvider : p));
      toast.success('تم تحديث المزود بنجاح');
    } catch (error) {
      console.error('Error updating provider:', error);
      toast.error('فشل في تحديث المزود');
    }
  };

  const testConnection = async (providerId: string) => {
    setTestingProvider(providerId);
    try {
      const success = await providerService.testConnection(providerId);
      
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
      await api.toggleProviderStatus(provider.id);
      setProviders(prev => prev.map(p => 
        p.id === provider.id ? { ...p, isActive: !p.isActive } : p
      ));
      toast.success(`تم ${!provider.isActive ? 'تفعيل' : 'تعطيل'} المزود بنجاح`);
    } catch (error) {
      console.error('Error toggling provider status:', error);
      toast.error('فشل في تغيير حالة المزود');
    }
  };

  const setDefaultProvider = async (providerId: string) => {
    try {
      await api.setDefaultProvider(providerId);
      setProviders(prev => prev.map(p => ({
        ...p,
        isDefault: p.id === providerId
      })));
      toast.success('تم تعيين المزود الافتراضي بنجاح');
    } catch (error) {
      console.error('Error setting default provider:', error);
      toast.error('فشل في تعيين المزود الافتراضي');
    }
  };

  const toggleApiKeyVisibility = (providerId: string) => {
    setApiKeyVisible({
      ...apiKeyVisible,
      [providerId]: !apiKeyVisible[providerId]
    });
  };

  const handleFieldChange = (
    provider: Provider, 
    field: keyof Provider | string, 
    value: any,
    nestedField?: string, 
    nestedSubField?: string
  ) => {
    const updatedProvider = { ...provider };

    if (nestedField && nestedSubField) {
      // For deeply nested fields like endpoints.balance
      updatedProvider[nestedField as keyof Provider][nestedSubField] = value;
    } else if (nestedField) {
      // For nested fields like settings.someField
      if (!updatedProvider[nestedField as keyof Provider]) {
        updatedProvider[nestedField as keyof Provider] = {};
      }
      updatedProvider[nestedField as keyof Provider][field] = value;
    } else {
      // For top-level fields
      updatedProvider[field as keyof Provider] = value;
    }

    setProviders(prev => prev.map(p => p.id === provider.id ? updatedProvider : p));
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
        <h1 className="text-2xl font-bold">إعدادات مزودي الخدمة</h1>
        <Button onClick={fetchProviders}>
          <RefreshCcw className="ml-2 h-4 w-4" />
          تحديث
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as ProviderCode)}>
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="5sim">5SIM</TabsTrigger>
          <TabsTrigger value="smsactivate">SMS Activate</TabsTrigger>
          <TabsTrigger value="getsmscode">GetSmsCode</TabsTrigger>
          <TabsTrigger value="smsman">SMS Man</TabsTrigger>
          <TabsTrigger value="onlinesims">Online SIMs</TabsTrigger>
        </TabsList>

        {['5sim', 'smsactivate', 'getsmscode', 'smsman', 'onlinesims'].map((code) => {
          const provider = getProviderByCode(code);
          if (!provider) return null;

          return (
            <TabsContent value={code} key={code}>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{provider.name}</CardTitle>
                      <CardDescription>{provider.description}</CardDescription>
                    </div>
                    <div className="flex gap-2 items-center">
                      {provider.isDefault && (
                        <Badge variant="outline" className="bg-yellow-100">
                          <Star className="h-3 w-3 mr-1 text-yellow-600" />
                          المزود الافتراضي
                        </Badge>
                      )}
                      <Badge variant={provider.isActive ? "success" : "destructive"}>
                        {provider.isActive ? 'نشط' : 'معطل'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* معلومات المزود الأساسية */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${code}-name`}>اسم المزود</Label>
                      <Input
                        id={`${code}-name`}
                        value={provider.name}
                        onChange={(e) => handleFieldChange(provider, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${code}-desc`}>وصف المزود</Label>
                      <Textarea
                        id={`${code}-desc`}
                        value={provider.description || ''}
                        onChange={(e) => handleFieldChange(provider, 'description', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* بيانات API */}
                  <div className="space-y-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <h3 className="font-bold">بيانات API</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`${code}-apikey`} className="flex items-center">
                          مفتاح API
                          <Info className="h-4 w-4 mr-1 text-muted-foreground" />
                        </Label>
                        <div className="relative">
                          <Input
                            id={`${code}-apikey`}
                            type={apiKeyVisible[provider.id] ? 'text' : 'password'}
                            value={provider.apiKey || ''}
                            onChange={(e) => handleFieldChange(provider, 'apiKey', e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute left-2 top-1/2 transform -translate-y-1/2"
                            onClick={() => toggleApiKeyVisibility(provider.id)}
                          >
                            {apiKeyVisible[provider.id] ? 'إخفاء' : 'إظهار'}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${code}-apiurl`}>رابط API</Label>
                        <Input
                          id={`${code}-apiurl`}
                          value={provider.apiUrl || ''}
                          onChange={(e) => handleFieldChange(provider, 'apiUrl', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* إعدادات خاصة لبعض المزودين */}
                    {code === 'getsmscode' && (
                      <div className="space-y-2 mt-4">
                        <Label htmlFor={`${code}-username`}>اسم المستخدم</Label>
                        <Input
                          id={`${code}-username`}
                          value={provider.settings?.username || ''}
                          onChange={(e) => handleFieldChange(provider, 'username', e.target.value, 'settings')}
                        />
                      </div>
                    )}
                  </div>

                  {/* المسارات النهائية */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="endpoints">
                      <AccordionTrigger>مسارات API</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-1 gap-4 mt-2">
                          <div className="space-y-2">
                            <Label htmlFor={`${code}-balance`}>مسار الرصيد</Label>
                            <Input
                              id={`${code}-balance`}
                              value={provider.endpoints?.balance || ''}
                              onChange={(e) => handleFieldChange(provider, 'balance', e.target.value, 'endpoints')}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`${code}-countries`}>مسار الدول</Label>
                            <Input
                              id={`${code}-countries`}
                              value={provider.endpoints?.countries || ''}
                              onChange={(e) => handleFieldChange(provider, 'countries', e.target.value, 'endpoints')}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`${code}-products`}>مسار المنتجات/الخدمات</Label>
                            <Input
                              id={`${code}-products`}
                              value={provider.endpoints?.products || ''}
                              onChange={(e) => handleFieldChange(provider, 'products', e.target.value, 'endpoints')}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`${code}-purchase`}>مسار الشراء</Label>
                            <Input
                              id={`${code}-purchase`}
                              value={provider.endpoints?.purchase || ''}
                              onChange={(e) => handleFieldChange(provider, 'purchase', e.target.value, 'endpoints')}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`${code}-status`}>مسار الحالة</Label>
                            <Input
                              id={`${code}-status`}
                              value={provider.endpoints?.status || ''}
                              onChange={(e) => handleFieldChange(provider, 'status', e.target.value, 'endpoints')}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`${code}-cancel`}>مسار الإلغاء</Label>
                            <Input
                              id={`${code}-cancel`}
                              value={provider.endpoints?.cancel || ''}
                              onChange={(e) => handleFieldChange(provider, 'cancel', e.target.value, 'endpoints')}
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* إعدادات الحد */}
                  <div className="space-y-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <h3 className="font-bold">إعدادات متقدمة</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`${code}-ratelimit`}>الحد الأقصى للطلبات/دقيقة</Label>
                        <Input
                          id={`${code}-ratelimit`}
                          type="number"
                          value={provider.rateLimit?.requestsPerMinute || 60}
                          onChange={(e) => handleFieldChange(
                            provider, 
                            'requestsPerMinute', 
                            parseInt(e.target.value), 
                            'rateLimit'
                          )}
                        />
                      </div>
                    </div>

                    {/* عرض معلومات الرصيد إذا كانت متوفرة */}
                    {providerBalances[provider.id] && (
                      <div className="mt-4 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-900">
                        <p className="text-sm font-medium">
                          الرصيد: {providerBalances[provider.id].balance} {providerBalances[provider.id].currency}
                        </p>
                      </div>
                    )}
                  </div>
                  
                </CardContent>
                
                <CardFooter className="flex flex-wrap gap-3 justify-end border-t pt-6">
                  <div className="flex items-center gap-2 ml-auto">
                    <Switch
                      checked={provider.isActive}
                      onCheckedChange={() => toggleProviderActive(provider)}
                    />
                    <Label>{provider.isActive ? 'نشط' : 'معطل'}</Label>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => setDefaultProvider(provider.id)}
                    disabled={provider.isDefault}
                  >
                    <Star className="h-4 w-4 ml-2" />
                    تعيين كافتراضي
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => testConnection(provider.id)}
                    disabled={testingProvider === provider.id || !provider.apiKey}
                  >
                    {testingProvider === provider.id ? (
                      <RefreshCcw className="h-4 w-4 ml-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 ml-2" />
                    )}
                    اختبار الاتصال
                  </Button>
                  
                  <Button onClick={() => handleUpdateProvider(provider)}>
                    <Settings className="h-4 w-4 ml-2" />
                    حفظ الإعدادات
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default ProviderSettings;
