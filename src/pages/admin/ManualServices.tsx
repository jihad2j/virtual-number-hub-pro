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

interface ManualService {
  id: string;
  name: string;
  price: number;
  description: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const ManualServices = () => {
  const [manualServices, setManualServices] = useState<ManualService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    price: 0,
    description: '',
    isActive: true,
  });

  useEffect(() => {
    fetchManualServices();
  }, []);

  const fetchManualServices = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAllManualServices();
      setManualServices(data);
    } catch (error) {
      console.error('Failed to fetch manual services', error);
      toast.error('فشل في جلب الخدمات اليدوية');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateService = async () => {
    try {
      const response = await api.createManualService(newService);
      
      if (response) {
        setManualServices([...manualServices, response]);
        setNewService({
          name: '',
          price: 0,
          description: '',
          isActive: true,
        });
        setDialogOpen(false);
        toast.success('تم إنشاء الخدمة بنجاح');
      }
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('فشل في إنشاء الخدمة');
    }
  };

  const handleUpdateService = async (id: string, data: Partial<ManualService>) => {
    try {
      await api.updateManualService(id, data);
      setManualServices(manualServices.map(service =>
        service.id === id ? { ...service, ...data } : service
      ));
      toast.success('تم تحديث الخدمة بنجاح');
    } catch (error) {
      console.error('Failed to update manual service', error);
      toast.error('فشل في تحديث الخدمة');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذه الخدمة؟')) return;

    try {
      await api.deleteManualService(id);
      setManualServices(manualServices.filter(service => service.id !== id));
      toast.success('تم حذف الخدمة بنجاح');
    } catch (error) {
      console.error('Failed to delete manual service', error);
      toast.error('فشل في حذف الخدمة');
    }
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'اسم الخدمة',
    },
    {
      accessorKey: 'price',
      header: 'السعر',
    },
    {
      accessorKey: 'description',
      header: 'الوصف',
    },
    {
      accessorKey: 'isActive',
      header: 'مفعلة',
      cell: ({ row }) => (
        <Switch
          checked={row.original.isActive}
          onCheckedChange={(checked) =>
            handleUpdateService(row.original.id, { isActive: checked })
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
          onClick={() => handleDeleteService(row.original.id)}
        >
          حذف
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">إدارة الخدمات اليدوية</h1>
        <Button onClick={() => setDialogOpen(true)}>إضافة خدمة جديدة</Button>
      </div>

      <Card className="overflow-hidden">
        <DataTable
          columns={columns}
          data={manualServices}
          loading={isLoading}
          onRefresh={fetchManualServices}
        />
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة خدمة يدوية جديدة</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم الخدمة</Label>
              <Input
                id="name"
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">السعر</Label>
              <Input
                id="price"
                type="number"
                value={newService.price}
                onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Input
                id="description"
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={newService.isActive}
                onCheckedChange={(checked) => setNewService({ ...newService, isActive: checked })}
              />
              <Label htmlFor="isActive">مفعلة</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleCreateService}>إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManualServices;
