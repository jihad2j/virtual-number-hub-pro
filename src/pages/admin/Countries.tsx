import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, Country } from '@/services/api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash } from 'lucide-react';

interface Props {}

const CountriesAdmin: React.FC<Props> = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewCountryDialog, setShowNewCountryDialog] = useState(false);
  const [newCountryName, setNewCountryName] = useState('');
  const [newCountryCode, setNewCountryCode] = useState('');
  const [newCountryFlag, setNewCountryFlag] = useState('');
  const [newCountryAvailable, setNewCountryAvailable] = useState(true);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [showEditCountryDialog, setShowEditCountryDialog] = useState(false);
  const [editCountryName, setEditCountryName] = useState('');
  const [editCountryCode, setEditCountryCode] = useState('');
  const [editCountryFlag, setEditCountryFlag] = useState('');
  const [editCountryAvailable, setEditCountryAvailable] = useState(true);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const data = await api.getAllCountries();
      setCountries(data);
    } catch (error) {
      console.error('Error fetching countries:', error);
      toast.error('Failed to load countries');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'code',
      header: 'Code',
    },
    {
      accessorKey: 'flag',
      header: 'Flag',
      cell: ({ row }) => (
        <img src={row.flag} alt={row.name} className="w-6 h-6 rounded-full" />
      ),
    },
    {
      accessorKey: 'available',
      header: 'Available',
      cell: ({ row }) => (row.available ? 'Yes' : 'No'),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditCountryDialog(row)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteCountry(row.id)}
          >
            <Trash className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  const openNewCountryDialog = () => {
    setShowNewCountryDialog(true);
  };

  const closeNewCountryDialog = () => {
    setShowNewCountryDialog(false);
    setNewCountryName('');
    setNewCountryCode('');
    setNewCountryFlag('');
    setNewCountryAvailable(true);
  };

  const openEditCountryDialog = (country: Country) => {
    setEditingCountry(country);
    setEditCountryName(country.name);
    setEditCountryCode(country.code);
    setEditCountryFlag(country.flag);
    setEditCountryAvailable(country.available);
    setShowEditCountryDialog(true);
  };

  const closeEditCountryDialog = () => {
    setShowEditCountryDialog(false);
    setEditingCountry(null);
    setEditCountryName('');
    setEditCountryCode('');
    setEditCountryFlag('');
    setEditCountryAvailable(true);
  };

  const createNewCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCountryName || !newCountryCode) {
      toast.error('جميع الحقول مطلوبة');
      return;
    }
    
    try {
      // Create with all required properties
      const countryData: Omit<Country, 'id'> = {
        name: newCountryName,
        code: newCountryCode,
        flag: newCountryFlag,
        available: newCountryAvailable,
        services: []
      };
      
      await api.createCountry(countryData);
      toast.success('تم إضافة الدولة بنجاح');
      setNewCountryName('');
      setNewCountryCode('');
      setNewCountryFlag('');
      setNewCountryAvailable(true);
      setShowNewCountryDialog(false);
      fetchCountries();
    } catch (error) {
      console.error('Error creating country:', error);
      toast.error('حدث خطأ أثناء إضافة الدولة');
    }
  };

  const updateCountry = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingCountry) return;

    try {
      const updatedCountryData = {
        name: editCountryName,
        code: editCountryCode,
        flag: editCountryFlag,
        available: editCountryAvailable,
      };

      await api.updateCountry(editingCountry.id, updatedCountryData);
      toast.success('تم تحديث الدولة بنجاح');
      closeEditCountryDialog();
      fetchCountries();
    } catch (error) {
      console.error('Error updating country:', error);
      toast.error('حدث خطأ أثناء تحديث الدولة');
    }
  };

  const deleteCountry = async (id: string) => {
    try {
      await api.deleteCountry(id);
      toast.success('تم حذف الدولة بنجاح');
      fetchCountries();
    } catch (error) {
      console.error('Error deleting country:', error);
      toast.error('حدث خطأ أثناء حذف الدولة');
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">إدارة الدول</h1>
        <Button onClick={openNewCountryDialog}>
          <Plus className="mr-2 h-4 w-4" />
          إضافة دولة جديدة
        </Button>
      </div>
      {loading ? (
        <p>Loading countries...</p>
      ) : (
        <DataTable columns={columns} data={countries} />
      )}

      {/* New Country Dialog */}
      <Dialog open={showNewCountryDialog} onOpenChange={setShowNewCountryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة دولة جديدة</DialogTitle>
          </DialogHeader>
          <form onSubmit={createNewCountry} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">اسم الدولة</Label>
              <Input
                type="text"
                id="name"
                value={newCountryName}
                onChange={(e) => setNewCountryName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">رمز الدولة</Label>
              <Input
                type="text"
                id="code"
                value={newCountryCode}
                onChange={(e) => setNewCountryCode(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="flag">رابط العلم</Label>
              <Input
                type="text"
                id="flag"
                value={newCountryFlag}
                onChange={(e) => setNewCountryFlag(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="available"
                checked={newCountryAvailable}
                onCheckedChange={setNewCountryAvailable}
              />
              <Label htmlFor="available">متاح</Label>
            </div>
            <DialogFooter>
              <Button type="submit">إضافة</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Country Dialog */}
      <Dialog open={showEditCountryDialog} onOpenChange={setShowEditCountryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل الدولة</DialogTitle>
          </DialogHeader>
          <form onSubmit={updateCountry} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">اسم الدولة</Label>
              <Input
                type="text"
                id="edit-name"
                value={editCountryName}
                onChange={(e) => setEditCountryName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-code">رمز الدولة</Label>
              <Input
                type="text"
                id="edit-code"
                value={editCountryCode}
                onChange={(e) => setEditCountryCode(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-flag">رابط العلم</Label>
              <Input
                type="text"
                id="edit-flag"
                value={editCountryFlag}
                onChange={(e) => setEditCountryFlag(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-available"
                checked={editCountryAvailable}
                onCheckedChange={setEditCountryAvailable}
              />
              <Label htmlFor="edit-available">متاح</Label>
            </div>
            <DialogFooter>
              <Button type="submit">تحديث</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CountriesAdmin;
