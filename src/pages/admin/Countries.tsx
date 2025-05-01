
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

const Countries = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCountry, setNewCountry] = useState<Omit<Country, 'id'>>({
    name: '',
    flag: '',
    code: '',
    available: true,
    services: [] // Add the required services array
  });

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAllCountries();
      setCountries(data);
    } catch (error) {
      console.error('Failed to fetch countries', error);
      toast.error('فشل في جلب قائمة الدول');
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
          isLoading={isLoading} 
          onRefresh={fetchCountries}
        />
      </Card>

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
    </div>
  );
};

export default Countries;
