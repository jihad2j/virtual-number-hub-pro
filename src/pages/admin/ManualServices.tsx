
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { api, ManualService } from '@/services/api';
import { Plus, Save, Trash2, Settings, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const ManualServices = () => {
  const [services, setServices] = useState<ManualService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openNewServiceDialog, setOpenNewServiceDialog] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [newService, setNewService] = useState<Omit<ManualService, 'id'>>({
    name: '',
    description: '',
    price: 0,
    available: true
  });
  const [editingService, setEditingService] = useState<ManualService | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const data = await api.getManualServices();
      setServices(data);
    } catch (error) {
      console.error('Failed to fetch manual services:', error);
      toast.error('فشل في جلب خدمات التفعيل اليدوي');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!newService.name) {
      toast.error('الرجاء إدخال اسم الخدمة');
      return;
    }

    try {
      const addedService = await api.createManualService(newService);
      setServices([...services, addedService]);
      setNewService({
        name: '',
        description: '',
        price: 0,
        available: true
      });
      setOpenNewServiceDialog(false);
      toast.success(`تم إضافة خدمة ${addedService.name} بنجاح`);
    } catch (error) {
      console.error('Failed to add service:', error);
      toast.error('فشل في إضافة الخدمة');
    }
  };

  const handleSaveService = async (service: ManualService) => {
    try {
      await api.updateManualService(service);
      setServices(services.map(s => s.id === service.id ? service : s));
      setEditingService(null);
      toast.success(`تم تحديث خدمة ${service.name} بنجاح`);
    } catch (error) {
      console.error('Failed to save service:', error);
      toast.error('فشل في حفظ الخدمة');
    }
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;

    try {
      await api.deleteManualService(serviceToDelete);
      setServices(services.filter(s => s.id !== serviceToDelete));
      setServiceToDelete(null);
      toast.success('تم حذف الخدمة بنجاح');
    } catch (error) {
      console.error('Failed to delete service:', error);
      toast.error('فشل في حذف الخدمة');
    }
  };

  const handleToggleAvailability = (serviceId: string) => {
    setServices(services.map(service => {
      if (service.id === serviceId) {
        return { ...service, available: !service.available };
      }
      return service;
    }));
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
        <h1 className="text-2xl font-bold">إدارة خدمات التفعيل اليدوي</h1>
        
        <Dialog open={openNewServiceDialog} onOpenChange={setOpenNewServiceDialog}>
          <DialogTrigger asChild>
            <Button className="gradient-bg">
              <Plus className="ml-2 h-4 w-4" />
              إضافة خدمة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة خدمة تفعيل يدوي جديدة</DialogTitle>
              <DialogDescription>
                أدخل معلومات الخدمة الجديدة
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="service-name">اسم الخدمة</Label>
                <Input
                  id="service-name"
                  value={newService.name}
                  onChange={(e) => setNewService({...newService, name: e.target.value})}
                  placeholder="أدخل اسم الخدمة"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="service-description">وصف الخدمة</Label>
                <Textarea
                  id="service-description"
                  value={newService.description}
                  onChange={(e) => setNewService({...newService, description: e.target.value})}
                  placeholder="أدخل وصفًا مختصرًا للخدمة"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="service-price">السعر (بالريال)</Label>
                <Input
                  id="service-price"
                  type="number"
                  value={newService.price}
                  onChange={(e) => setNewService({...newService, price: Number(e.target.value)})}
                  placeholder="أدخل سعر الخدمة"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="block mb-2">الخدمة متاحة</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newService.available}
                    onCheckedChange={(checked) => setNewService({...newService, available: checked})}
                  />
                  <span className="mr-2">{newService.available ? 'متاحة' : 'غير متاحة'}</span>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenNewServiceDialog(false)}>
                إلغاء
              </Button>
              <Button className="gradient-bg" onClick={handleAddService}>
                إضافة الخدمة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <Card key={service.id} className={!service.available ? 'opacity-70' : ''}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {service.name}
                    {service.available ? (
                      <Badge className="bg-green-500">متاحة</Badge>
                    ) : (
                      <Badge variant="secondary">غير متاحة</Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {service.price} ريال
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setEditingService(service)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={() => setServiceToDelete(service.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{service.description}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Switch
                checked={service.available}
                onCheckedChange={() => handleToggleAvailability(service.id)}
              />
              <span>{service.available ? 'متاحة للمستخدمين' : 'غير متاحة'}</span>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Edit Service Dialog */}
      {editingService && (
        <Dialog open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل خدمة {editingService.name}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-service-name">اسم الخدمة</Label>
                <Input
                  id="edit-service-name"
                  value={editingService.name}
                  onChange={(e) => setEditingService({...editingService, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-service-description">وصف الخدمة</Label>
                <Textarea
                  id="edit-service-description"
                  value={editingService.description}
                  onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-service-price">السعر (بالريال)</Label>
                <Input
                  id="edit-service-price"
                  type="number"
                  value={editingService.price}
                  onChange={(e) => setEditingService({...editingService, price: Number(e.target.value)})}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="block mb-2">الخدمة متاحة</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingService.available}
                    onCheckedChange={(checked) => setEditingService({...editingService, available: checked})}
                  />
                  <span className="mr-2">{editingService.available ? 'متاحة' : 'غير متاحة'}</span>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingService(null)}>
                إلغاء
              </Button>
              <Button onClick={() => handleSaveService(editingService)}>
                <Save className="ml-2 h-4 w-4" />
                حفظ التغييرات
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Service Confirmation */}
      <AlertDialog open={!!serviceToDelete} onOpenChange={(open) => !open && setServiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذه الخدمة؟</AlertDialogTitle>
            <AlertDialogDescription>
              لا يمكن التراجع عن هذا الإجراء بعد الحذف.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteService} className="bg-red-600 hover:bg-red-700">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManualServices;
