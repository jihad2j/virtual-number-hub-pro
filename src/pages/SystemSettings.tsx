
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { Save, RefreshCw, Settings2, Users, Globe, ShieldCheck, DollarSign } from 'lucide-react';
import { api } from '@/services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SystemSetting {
  id: string;
  key: string;
  value: string;
  category: string;
  description: string;
}

const SystemSettings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // States
  const [generalSettings, setGeneralSettings] = useState<SystemSetting[]>([
    {
      id: '1',
      key: 'site_name',
      value: 'نظام أرقام التفعيل',
      category: 'general',
      description: 'اسم الموقع'
    },
    {
      id: '2',
      key: 'site_description',
      value: 'نظام لإدارة أرقام التفعيل الافتراضية',
      category: 'general',
      description: 'وصف الموقع'
    },
    {
      id: '3',
      key: 'site_logo',
      value: '/logo.png',
      category: 'general',
      description: 'شعار الموقع'
    },
    {
      id: '4',
      key: 'site_theme',
      value: 'light',
      category: 'general',
      description: 'سمة الموقع'
    },
    {
      id: '5',
      key: 'default_language',
      value: 'ar',
      category: 'general',
      description: 'اللغة الافتراضية'
    }
  ]);
  
  const [providerSettings, setProviderSettings] = useState<SystemSetting[]>([
    {
      id: '6',
      key: 'default_provider',
      value: '5sim',
      category: 'providers',
      description: 'المزود الافتراضي'
    },
    {
      id: '7',
      key: 'auto_renew_numbers',
      value: 'false',
      category: 'providers',
      description: 'تجديد الأرقام تلقائياً'
    },
    {
      id: '8',
      key: 'max_number_age',
      value: '60',
      category: 'providers',
      description: 'أقصى عمر للرقم (بالدقائق)'
    }
  ]);
  
  const [paymentSettings, setPaymentSettings] = useState<SystemSetting[]>([
    {
      id: '9',
      key: 'currency',
      value: 'USD',
      category: 'payment',
      description: 'العملة الافتراضية'
    },
    {
      id: '10',
      key: 'profit_margin',
      value: '20',
      category: 'payment',
      description: 'هامش الربح (%)'
    },
    {
      id: '11',
      key: 'enable_paypal',
      value: 'true',
      category: 'payment',
      description: 'تفعيل بايبال'
    },
    {
      id: '12',
      key: 'enable_stripe',
      value: 'true',
      category: 'payment',
      description: 'تفعيل سترايب'
    },
    {
      id: '13',
      key: 'enable_manual_payment',
      value: 'true',
      category: 'payment',
      description: 'تفعيل الدفع اليدوي'
    }
  ]);
  
  const [securitySettings, setSecuritySettings] = useState<SystemSetting[]>([
    {
      id: '14',
      key: 'enable_captcha',
      value: 'true',
      category: 'security',
      description: 'تفعيل كابتشا'
    },
    {
      id: '15',
      key: 'enable_2fa',
      value: 'false',
      category: 'security',
      description: 'تفعيل المصادقة الثنائية'
    },
    {
      id: '16',
      key: 'session_timeout',
      value: '60',
      category: 'security',
      description: 'مهلة الجلسة (بالدقائق)'
    },
    {
      id: '17',
      key: 'max_login_attempts',
      value: '5',
      category: 'security',
      description: 'أقصى عدد محاولات تسجيل الدخول'
    }
  ]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      // For demonstration, we'll just use the mock data
      // In a real app, you'd fetch settings from the API
      /*
      const settings = await api.getSystemSettings();
      
      // Organize settings by category
      const general = settings.filter(s => s.category === 'general');
      const provider = settings.filter(s => s.category === 'providers');
      const payment = settings.filter(s => s.category === 'payment');
      const security = settings.filter(s => s.category === 'security');
      
      setGeneralSettings(general);
      setProviderSettings(provider);
      setPaymentSettings(payment);
      setSecuritySettings(security);
      */
      
      toast({
        title: "تم التحميل",
        description: "تم تحميل إعدادات النظام بنجاح",
      });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تحميل إعدادات النظام",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveSettings = async (category: string) => {
    setIsSaving(true);
    try {
      let settingsToSave: SystemSetting[] = [];
      
      switch (category) {
        case 'general':
          settingsToSave = generalSettings;
          break;
        case 'providers':
          settingsToSave = providerSettings;
          break;
        case 'payment':
          settingsToSave = paymentSettings;
          break;
        case 'security':
          settingsToSave = securitySettings;
          break;
      }
      
      // In a real app, you'd save settings to the API
      // await api.saveSystemSettings(settingsToSave);
      
      toast({
        title: "تم الحفظ",
        description: "تم حفظ الإعدادات بنجاح",
      });
    } catch (error) {
      console.error(`Failed to save ${category} settings:`, error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في حفظ الإعدادات",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const updateSetting = (category: string, id: string, value: string) => {
    switch (category) {
      case 'general':
        setGeneralSettings(prev => prev.map(setting => 
          setting.id === id ? { ...setting, value } : setting
        ));
        break;
      case 'providers':
        setProviderSettings(prev => prev.map(setting => 
          setting.id === id ? { ...setting, value } : setting
        ));
        break;
      case 'payment':
        setPaymentSettings(prev => prev.map(setting => 
          setting.id === id ? { ...setting, value } : setting
        ));
        break;
      case 'security':
        setSecuritySettings(prev => prev.map(setting => 
          setting.id === id ? { ...setting, value } : setting
        ));
        break;
    }
  };
  
  const renderSettingInput = (setting: SystemSetting) => {
    // Handle boolean settings (switches)
    if (setting.value === 'true' || setting.value === 'false') {
      return (
        <div className="flex items-center space-x-2">
          <Switch
            id={setting.id}
            checked={setting.value === 'true'}
            onCheckedChange={(checked) => updateSetting(setting.category, setting.id, checked ? 'true' : 'false')}
          />
          <span className="mr-2">{setting.value === 'true' ? 'مفعل' : 'معطل'}</span>
        </div>
      );
    }
    
    // Handle select for specific settings
    if (setting.key === 'site_theme') {
      return (
        <Select 
          value={setting.value}
          onValueChange={(value) => updateSetting(setting.category, setting.id, value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر السمة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">فاتح</SelectItem>
            <SelectItem value="dark">داكن</SelectItem>
            <SelectItem value="system">حسب النظام</SelectItem>
          </SelectContent>
        </Select>
      );
    }
    
    if (setting.key === 'default_language') {
      return (
        <Select 
          value={setting.value}
          onValueChange={(value) => updateSetting(setting.category, setting.id, value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر اللغة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ar">العربية</SelectItem>
            <SelectItem value="en">الإنجليزية</SelectItem>
          </SelectContent>
        </Select>
      );
    }
    
    if (setting.key === 'currency') {
      return (
        <Select 
          value={setting.value}
          onValueChange={(value) => updateSetting(setting.category, setting.id, value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر العملة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
            <SelectItem value="EUR">يورو (EUR)</SelectItem>
            <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
            <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
          </SelectContent>
        </Select>
      );
    }
    
    if (setting.key === 'default_provider') {
      return (
        <Select 
          value={setting.value}
          onValueChange={(value) => updateSetting(setting.category, setting.id, value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر المزود" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5sim">5Sim</SelectItem>
            <SelectItem value="smsactivate">SMS Activate</SelectItem>
          </SelectContent>
        </Select>
      );
    }
    
    // Default to text input
    return (
      <Input
        id={setting.id}
        value={setting.value}
        onChange={(e) => updateSetting(setting.category, setting.id, e.target.value)}
      />
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">إعدادات النظام</h1>
        
        <Button 
          variant="outline" 
          onClick={fetchSettings} 
          disabled={isLoading}>
          <RefreshCw className={`ml-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            <span>عام</span>
          </TabsTrigger>
          <TabsTrigger value="providers" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>المزودون</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span>الدفع</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span>الأمان</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>الإعدادات العامة</CardTitle>
              <CardDescription>
                إعدادات عامة للنظام مثل اسم الموقع واللغة والسمة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generalSettings.map((setting) => (
                  <div key={setting.id} className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                    <div className="col-span-1">
                      <Label htmlFor={setting.id}>{setting.description}</Label>
                    </div>
                    <div className="col-span-2">
                      {renderSettingInput(setting)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={() => saveSettings('general')}
                disabled={isSaving}>
                <Save className="ml-2 h-4 w-4" />
                حفظ الإعدادات
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="providers">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات المزودين</CardTitle>
              <CardDescription>
                إعدادات خاصة بمزودي الخدمة للأرقام الافتراضية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providerSettings.map((setting) => (
                  <div key={setting.id} className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                    <div className="col-span-1">
                      <Label htmlFor={setting.id}>{setting.description}</Label>
                    </div>
                    <div className="col-span-2">
                      {renderSettingInput(setting)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={() => saveSettings('providers')}
                disabled={isSaving}>
                <Save className="ml-2 h-4 w-4" />
                حفظ الإعدادات
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الدفع</CardTitle>
              <CardDescription>
                إعدادات خاصة بأنظمة الدفع والعملات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentSettings.map((setting) => (
                  <div key={setting.id} className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                    <div className="col-span-1">
                      <Label htmlFor={setting.id}>{setting.description}</Label>
                    </div>
                    <div className="col-span-2">
                      {renderSettingInput(setting)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={() => saveSettings('payment')}
                disabled={isSaving}>
                <Save className="ml-2 h-4 w-4" />
                حفظ الإعدادات
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الأمان</CardTitle>
              <CardDescription>
                إعدادات خاصة بأمان الموقع والمستخدمين
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securitySettings.map((setting) => (
                  <div key={setting.id} className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                    <div className="col-span-1">
                      <Label htmlFor={setting.id}>{setting.description}</Label>
                    </div>
                    <div className="col-span-2">
                      {renderSettingInput(setting)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={() => saveSettings('security')}
                disabled={isSaving}>
                <Save className="ml-2 h-4 w-4" />
                حفظ الإعدادات
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings;
