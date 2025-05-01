
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { Edit, Trash, Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { ManualService } from '@/types/ManualService';

const ManualServices = () => {
  const [services, setServices] = useState<ManualService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<ManualService | null>(null);
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    price: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAllManualServices();
      // Convert data to match our updated ManualService type
      const convertedData = data.map(service => ({
        ...service,
        isActive: service.isActive ?? service.available ?? true
      }));
      setServices(convertedData);
    } catch (error) {
      console.error('Failed to fetch services', error);
      toast.error('فشل في جلب قائمة الخدمات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!formValues.name || !formValues.description || formValues.price <= 0) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      const serviceToAdd = {
        name: formValues.name,
        description: formValues.description,
        price: formValues.price,
        available: true, // Set available to true to match the required property
        isActive: formValues.isActive,
      };
      
      const addedService = await api.createManualService(serviceToAdd);
      // Add isActive field to match our type
      const updatedService = { ...addedService, isActive: addedService.isActive ?? addedService.available ?? true };
      setServices([...services, updatedService]);
      resetForm();
      setIsAddDialogOpen(false);
      toast.success(`تم إضافة الخدمة ${addedService.name} بنجاح`);
    } catch (error) {
      console.error('Failed to add service', error);
      toast.error('فشل في إضافة الخدمة');
    }
  };

  const handleEditService = async () => {
    if (!currentService) return;
    if (!formValues.name || !formValues.description || formValues.price <= 0) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      const serviceToUpdate = {
        name: formValues.name,
        description: formValues.description,
        price: formValues.price,
        available: true, // Set available to true to match the required property
        isActive: formValues.isActive,
      };
      
      const updatedService = await api.updateManualService(currentService.id, serviceToUpdate);
      // Add isActive field to match our type
      const convertedService = { ...updatedService, isActive: updatedService.isActive ?? updatedService.available ?? true };
      setServices(services.map(service => service.id === currentService.id ? convertedService : service));
      setIsEditDialogOpen(false);
      toast.success(`تم تحديث الخدمة ${updatedService.name} بنجاح`);
    } catch (error) {
      console.error('Failed to update service', error);
      toast.error('فشل في تحديث الخدمة');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذه الخدمة؟')) return;
    
    try {
      await api.deleteManualService(id);
      setServices(services.filter(service => service.id !== id));
      toast.success('تم حذف الخدمة بنجاح');
    } catch (error) {
      console.error('Failed to delete service', error);
      toast.error('فشل في حذف الخدمة');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const serviceToUpdate = services.find(service => service.id === id);
      if (!serviceToUpdate) return;
      
      const updatedService = await api.updateManualService(id, { 
        isActive, 
        available: isActive // Update both fields to ensure compatibility
      });
      
      // Add isActive field to match our type
      const convertedService = { ...updatedService, isActive: updatedService.isActive ?? updatedService.available ?? true };
      setServices(services.map(service => service.id === id ? convertedService : service));
      toast.success(`تم ${isActive ? 'تنشيط' : 'تعطيل'} الخدمة بنجاح`);
    } catch (error) {
      console.error('Failed to update service status', error);
      toast.error('فشل في تحديث حالة الخدمة');
    }
  };

  const openEditDialog = (service: ManualService) => {
    setCurrentService(service);
    setFormValues({
      name: service.name,
      description: service.description,
      price: service.price,
      isActive: service.isActive ?? service.available ?? true,
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormValues({
      name: '',
      description: '',
      price: 0,
      isActive: true,
    });
    setCurrentService(null);
  };

  const columns: ColumnDef<ManualService>[] = [
    {
      accessorKey: 'name',
      header: 'اسم الخدمة',
    },
    {
      accessorKey: 'description',
      header: 'الوصف',
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate">
          {row.original.description}
        </div>
      )
    },
    {
      accessorKey: 'price',
      header: 'السعر',
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.price} $
        </div>
      )
    },
    {
      accessorKey: 'isActive',
      header: 'نشطة',
      cell: ({ row }) => (
        <Switch 
          checked={row.original.isActive ?? row.original.available ?? true} 
          onCheckedChange={(checked) => handleToggleActive(row.original.id, checked)}
        />
      )
    },
    {
      id: 'actions',
      header: 'الإجراءات',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => openEditDialog(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => handleDeleteService(row.original.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">إدارة خدمات التفعيل اليدوي</h1>
        <Button onClick={() => {
          resetForm();
          setIsAddDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-1" /> إضافة خدمة
        </Button>
      </div>
      
      <Card className="overflow-hidden">
        <DataTable 
          columns={columns} 
          data={services} 
          loading={isLoading} 
          onRefresh={fetchServices}
        />
      </Card>

      {/* Add Service Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة خدمة جديدة</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم الخدمة</Label>
              <Input 
                id="name"
                value={formValues.name}
                onChange={(e) => setFormValues({...formValues, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">وصف الخدمة</Label>
              <Textarea 
                id="description"
                value={formValues.description}
                onChange={(e) => setFormValues({...formValues, description: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">السعر (بالدولار)</Label>
              <Input 
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formValues.price}
                onChange={(e) => setFormValues({...formValues, price: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="isActive"
                checked={formValues.isActive}
                onCheckedChange={(checked) => setFormValues({...formValues, isActive: checked})}
              />
              <Label htmlFor="isActive">نشطة</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleAddService}>إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل الخدمة</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">اسم الخدمة</Label>
              <Input 
                id="edit-name"
                value={formValues.name}
                onChange={(e) => setFormValues({...formValues, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">وصف الخدمة</Label>
              <Textarea 
                id="edit-description"
                value={formValues.description}
                onChange={(e) => setFormValues({...formValues, description: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">السعر (بالدولار)</Label>
              <Input 
                id="edit-price"
                type="number"
                min="0"
                step="0.01"
                value={formValues.price}
                onChange={(e) => setFormValues({...formValues, price: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="edit-isActive"
                checked={formValues.isActive}
                onCheckedChange={(checked) => setFormValues({...formValues, isActive: checked})}
              />
              <Label htmlFor="edit-isActive">نشطة</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleEditService}>حفظ التغييرات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManualServices;
