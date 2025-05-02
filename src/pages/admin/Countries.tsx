
import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { Country } from '@/types/Country';
import { Provider } from '@/types/Provider';
import { Checkbox } from '@/components/ui/checkbox';

const Countries = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [providerDialogOpen, setProviderDialogOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [newCountry, setNewCountry] = useState<Omit<Country, 'id'>>({
    name: '',
    flag: '',
    code: '',
    available: true,
    services: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [countriesData, providersData] = await Promise.all([
        api.getAllCountries(),
        api.getAllProviders()
      ]);
      setCountries(countriesData);
      setProviders(providersData);
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('فشل في جلب البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCountry = async () => {
    if (!newCountry.name || !newCountry.code) {
      toast.error('الرجاء إدخال اسم ورمز الدولة');
      return;
    }

    try {
      const createdCountry = await api.createCountry(newCountry);
      setCountries([...countries, createdCountry]);
      setNewCountry({
        name: '',
        flag: '',
        code: '',
        available: true,
        services: []
      });
      setDialogOpen(false);
      toast.success(`تمت إضافة دولة ${createdCountry.name} بنجاح`);
    } catch (error) {
      console.error('Failed to create country', error);
      toast.error('فشل في إنشاء دولة جديدة');
    }
  };

  const handleUpdateCountry = async (id: string, data: Partial<Country>) => {
    try {
      await api.updateCountry(id, data);
      setCountries(countries.map(country => 
        country.id === id ? { ...country, ...data } : country
      ));
      toast.success('تم تحديث معلومات الدولة بنجاح');
    } catch (error) {
      console.error('Failed to update country', error);
      toast.error('فشل في تحديث معلومات الدولة');
    }
  };

  const handleDeleteCountry = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذه الدولة؟')) return;
    
    try {
      await api.deleteCountry(id);
      setCountries(countries.filter(country => country.id !== id));
      toast.success('تم حذف الدولة بنجاح');
    } catch (error) {
      console.error('Failed to delete country', error);
      toast.error('فشل في حذف الدولة');
    }
  };

  const openProviderDialog = (country: Country) => {
    setSelectedCountry(country);
    // Find providers that have this country in their countries array
    const countryProviders = providers.filter(provider => 
      provider.countries?.some(c => {
        if (c === null) return false;
        return typeof c === 'string' ? c === country.id : c.id === country.id;
      })
    );
    setSelectedProviders(countryProviders.map(p => p.id));
    setProviderDialogOpen(true);
  };

  const handleProviderSelection = async () => {
    if (!selectedCountry) return;
    
    try {
      // Update each provider's countries array
      for (const provider of providers) {
        const hasCountry = selectedProviders.includes(provider.id);
        const currentCountries = Array.isArray(provider.countries) 
          ? provider.countries.filter(c => c !== null).map(c => typeof c === 'string' ? c : c.id)
          : [];
        
        if (hasCountry && !currentCountries.includes(selectedCountry.id)) {
          // Add country to provider
          await api.updateProvider({
            ...provider,
            countries: [...currentCountries, selectedCountry.id]
          });
        } else if (!hasCountry && currentCountries.includes(selectedCountry.id)) {
          // Remove country from provider
          await api.updateProvider({
            ...provider,
            countries: currentCountries.filter(id => id !== selectedCountry.id)
          });
        }
      }
      
      toast.success(`تم تحديث مزودي الخدمة للدولة ${selectedCountry.name} بنجاح`);
      setProviderDialogOpen(false);
      // Refresh providers list
      const updatedProviders = await api.getAllProviders();
      setProviders(updatedProviders);
    } catch (error) {
      console.error('Failed to update provider countries', error);
      toast.error('فشل في تحديث مزودي الخدمة للدولة');
    }
  };

  const columns = [
    {
      accessorKey: 'flag',
      header: '',
      cell: ({ row }) => (
        <div className="text-xl">{row.original.flag}</div>
      )
    },
    {
      accessorKey: 'name',
      header: 'اسم الدولة',
    },
    {
      accessorKey: 'code',
      header: 'الرمز',
    },
    {
      accessorKey: 'available',
      header: 'متاحة',
      cell: ({ row }) => (
        <Switch 
          checked={row.original.available} 
          onCheckedChange={(checked) => 
            handleUpdateCountry(row.original.id, { available: checked })
          }
        />
      )
    },
    {
      id: 'providers',
      header: 'المزودين',
      cell: ({ row }) => (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => openProviderDialog(row.original)}
        >
          إدارة المزودين
        </Button>
      )
    },
    {
      id: 'actions',
      header: 'الإجراءات',
      cell: ({ row }) => (
        <Button 
          variant="destructive" 
          size="sm"
          onClick={() => handleDeleteCountry(row.original.id)}
        >
          حذف
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">إدارة الدول</h1>
        <Button onClick={() => setDialogOpen(true)}>إضافة دولة جديدة</Button>
      </div>
      
      <Card className="overflow-hidden">
        <DataTable 
          columns={columns} 
          data={countries} 
          loading={isLoading} 
          onRefresh={fetchData}
        />
      </Card>

      {/* Dialog for creating new country */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة دولة جديدة</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم الدولة</Label>
              <Input 
                id="name"
                value={newCountry.name}
                onChange={(e) => setNewCountry({...newCountry, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">رمز الدولة (مثال: SA, US)</Label>
              <Input 
                id="code"
                value={newCountry.code}
                onChange={(e) => setNewCountry({...newCountry, code: e.target.value.toUpperCase()})}
                maxLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flag">علم الدولة (emoji أو رابط صورة)</Label>
              <Input 
                id="flag"
                value={newCountry.flag}
                onChange={(e) => setNewCountry({...newCountry, flag: e.target.value})}
                placeholder="🇺🇸"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="available"
                checked={newCountry.available}
                onCheckedChange={(checked) => setNewCountry({...newCountry, available: checked})}
              />
              <Label htmlFor="available">متاحة</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleCreateCountry}>إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for managing country providers */}
      <Dialog open={providerDialogOpen} onOpenChange={setProviderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إدارة مزودي الخدمة لـ {selectedCountry?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">حدد مزودي الخدمة الذين يدعمون هذه الدولة:</p>
            
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {providers.map(provider => (
                <div key={provider.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`provider-${provider.id}`}
                    checked={selectedProviders.includes(provider.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedProviders([...selectedProviders, provider.id]);
                      } else {
                        setSelectedProviders(selectedProviders.filter(id => id !== provider.id));
                      }
                    }}
                  />
                  <Label htmlFor={`provider-${provider.id}`}>{provider.name}</Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setProviderDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleProviderSelection}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Countries;
