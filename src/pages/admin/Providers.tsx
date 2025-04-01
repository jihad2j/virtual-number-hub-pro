
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { api, Provider, Country } from '@/services/api';
import { Server, Plus, Globe, Edit, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

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
  });
  const [openNewProviderDialog, setOpenNewProviderDialog] = useState(false);

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
    } catch (error) {
      console.error('Failed to fetch data', error);
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
      });
      setOpenNewProviderDialog(false);
      toast.success(`تم إضافة مزود الخدمة ${addedProvider.name} بنجاح`);
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
                  <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                    <Server className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <CardTitle>{provider.name}</CardTitle>
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
                <div className="flex items-center gap-2">
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
