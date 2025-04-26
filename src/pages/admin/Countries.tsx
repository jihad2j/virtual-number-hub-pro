import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api, Country } from '@/services/api';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Globe, Plus, RefreshCw, Edit, Save, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

const CountriesManagement = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [openNewCountryDialog, setOpenNewCountryDialog] = useState(false);
  const [newCountry, setNewCountry] = useState<Omit<Country, 'id'>>({
    name: '',
    flag: '',
    code: '',
    available: true
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    setIsLoading(true);
    try {
      const countriesData = await api.getCountries();
      setCountries(Array.isArray(countriesData) ? countriesData : []);
    } catch (error) {
      console.error('Failed to fetch countries', error);
      toast.error('فشل في جلب بيانات الدول');
      setCountries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCountryAvailability = (countryId: string) => {
    setCountries(countries.map(country => {
      if (country.id === countryId) {
        return { ...country, available: !country.available };
      }
      return country;
    }));
  };

  const handleSaveCountry = async (country: Country) => {
    try {
      setCountries(prevCountries => 
        prevCountries.map(c => c.id === country.id ? country : c)
      );
      
      toast.success(`تم تحديث الدولة ${country.name} بنجاح`);
    } catch (error) {
      console.error('Failed to save country', error);
      toast.error('حدث خطأ أثناء حفظ الدولة');
    }
  };

  const handleAddCountry = async () => {
    if (!newCountry.name || !newCountry.code) {
      toast.error('الرجاء إدخال اسم ورمز الدولة');
      return;
    }

    try {
      const addedCountries = await api.addCountries([newCountry]);
      if (addedCountries && addedCountries.length > 0) {
        setCountries([...countries, addedCountries[0]]);
        setNewCountry({
          name: '',
          flag: '',
          code: '',
          available: true
        });
        setOpenNewCountryDialog(false);
        toast.success(`تم إضافة الدولة ${addedCountries[0].name} بنجاح`);
      }
    } catch (error) {
      console.error('Failed to add country', error);
      toast.error('حدث خطأ أثناء إضافة الدولة');
    }
  };

  const handleGenerateFlagEmoji = () => {
    if (!newCountry.code) {
      toast.warning('أدخل رمز الدولة أولاً (مثل eg أو sa)');
      return;
    }

    try {
      const countryCode = newCountry.code.toUpperCase();
      const codePoints = countryCode.split('').map(char => 127397 + char.charCodeAt(0));
      const flagEmoji = String.fromCodePoint(...codePoints);
      setNewCountry({...newCountry, flag: flagEmoji});
    } catch (error) {
      console.error('Error generating flag emoji', error);
      toast.error('تعذر إنشاء علم الدولة، تأكد من إدخال رمز صحيح');
    }
  };

  const filteredCountries = Array.isArray(countries) 
    ? countries.filter(country => 
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        country.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

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
        <h1 className="text-2xl font-bold">إدارة الدول</h1>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="بحث..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-8 w-64"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          
          <Dialog open={openNewCountryDialog} onOpenChange={setOpenNewCountryDialog}>
            <DialogTrigger asChild>
              <Button className="gradient-bg">
                <Plus className="ml-2 h-4 w-4" />
                إضافة دولة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة دولة جديدة</DialogTitle>
                <DialogDescription>
                  أدخل معلومات الدولة الجديدة
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="country-name">اسم الدولة</Label>
                  <Input
                    id="country-name"
                    value={newCountry.name}
                    onChange={(e) => setNewCountry({...newCountry, name: e.target.value})}
                    placeholder="أدخل اسم الدولة"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country-code">رمز الدولة</Label>
                  <div className="flex gap-2">
                    <Input
                      id="country-code"
                      value={newCountry.code}
                      onChange={(e) => setNewCountry({...newCountry, code: e.target.value.toLowerCase()})}
                      placeholder="مثال: sa أو eg"
                      maxLength={2}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleGenerateFlagEmoji}
                      className="whitespace-nowrap"
                    >
                      توليد العلم
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country-flag">علم الدولة</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="country-flag"
                      value={newCountry.flag}
                      onChange={(e) => setNewCountry({...newCountry, flag: e.target.value})}
                      placeholder="سيتم توليده تلقائياً"
                      className="flex-1"
                    />
                    <div className="text-3xl min-w-10 flex justify-center">
                      {newCountry.flag || "🏳️"}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="block mb-2">متاحة للمستخدمين</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newCountry.available}
                      onCheckedChange={(checked) => setNewCountry({...newCountry, available: checked})}
                    />
                    <span className="mr-2">{newCountry.available ? 'متاحة' : 'غير متاحة'}</span>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenNewCountryDialog(false)}>
                  إلغاء
                </Button>
                <Button className="gradient-bg" onClick={handleAddCountry}>
                  إضافة الدولة
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-brand-600" />
              <CardTitle>قائمة الدول ({filteredCountries.length})</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={fetchCountries}>
              <RefreshCw className="h-4 w-4 ml-2" />
              تحديث
            </Button>
          </div>
          <CardDescription>
            إدارة الدول المتاحة في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العلم</TableHead>
                <TableHead>اسم الدولة</TableHead>
                <TableHead>الرمز</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <TableRow key={country.id}>
                    <TableCell className="text-2xl">{country.flag}</TableCell>
                    <TableCell className="font-medium">{country.name}</TableCell>
                    <TableCell>{country.code.toUpperCase()}</TableCell>
                    <TableCell>
                      <Switch
                        checked={country.available}
                        onCheckedChange={() => handleToggleCountryAvailability(country.id)}
                      />
                      <Badge 
                        variant={country.available ? 'default' : 'secondary'}
                        className="mr-2"
                      >
                        {country.available ? 'متاحة' : 'غير متاحة'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSaveCountry(country)}
                      >
                        <Save className="h-4 w-4 ml-2" />
                        حفظ
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    لا يوجد دول مطابقة للبحث
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CountriesManagement;
