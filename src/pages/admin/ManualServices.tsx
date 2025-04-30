
import React, { useState, useEffect } from 'react';
import { api, ManualService } from '@/services/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pencil, Trash2, Plus, Upload } from 'lucide-react';

const ManualServices = () => {
  const [services, setServices] = useState<ManualService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingService, setEditingService] = useState<ManualService | null>(null);
  const [isNewServiceDialogOpen, setIsNewServiceDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Form states
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePrice, setServicePrice] = useState(0);
  const [serviceAvailable, setServiceAvailable] = useState(true);
  const [serviceImage, setServiceImage] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const servicesData = await api.getManualServices();
      setServices(servicesData || []);
    } catch (error) {
      console.error('Failed to fetch services', error);
      toast.error('فشل في جلب خدمات التفعيل اليدوي');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!serviceName) {
      toast.error('يرجى إدخال اسم الخدمة');
      return;
    }

    if (servicePrice <= 0) {
      toast.error('يرجى إدخال سعر صحيح للخدمة');
      return;
    }

    const newService = {
      name: serviceName,
      description: serviceDescription,
      price: servicePrice,
      available: serviceAvailable,
      image: serviceImage
    };

    try {
      await api.createManualService(newService);
      resetForm();
      setIsNewServiceDialogOpen(false);
      fetchServices();
      toast.success('تم إضافة خدمة التفعيل اليدوي بنجاح');
    } catch (error) {
      console.error('Failed to add service', error);
      toast.error('فشل في إضافة خدمة التفعيل اليدوي');
    }
  };

  const handleEditService = (service: ManualService) => {
    setEditingService(service);
    setServiceName(service.name);
    setServiceDescription(service.description);
    setServicePrice(service.price);
    setServiceAvailable(service.available);
    setServiceImage(service.image || '');
    setIsEditDialogOpen(true);
  };

  const handleUpdateService = async () => {
    if (!editingService) return;

    if (!serviceName) {
      toast.error('يرجى إدخال اسم الخدمة');
      return;
    }

    if (servicePrice <= 0) {
      toast.error('يرجى إدخال سعر صحيح للخدمة');
      return;
    }

    const updatedService = {
      ...editingService,
      name: serviceName,
      description: serviceDescription,
      price: servicePrice,
      available: serviceAvailable,
      image: serviceImage
    };

    try {
      await api.updateManualService(updatedService);
      resetForm();
      setIsEditDialogOpen(false);
      fetchServices();
      toast.success('تم تحديث خدمة التفعيل اليدوي بنجاح');
    } catch (error) {
      console.error('Failed to update service', error);
      toast.error('فشل في تحديث خدمة التفعيل اليدوي');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      await api.deleteManualService(serviceId);
      fetchServices();
      toast.success('تم حذف خدمة التفعيل اليدوي بنجاح');
    } catch (error) {
      console.error('Failed to delete service', error);
      toast.error('فشل في حذف خدمة التفعيل اليدوي');
    }
  };

  const resetForm = () => {
    setServiceName('');
    setServiceDescription('');
    setServicePrice(0);
    setServiceAvailable(true);
    setServiceImage('');
    setEditingService(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">إدارة خدمات التفعيل اليدوي</h1>
        <Button onClick={() => setIsNewServiceDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> إضافة خدمة جديدة
        </Button>
      </div>

      {services.length === 0 ? (
        <div className="text-center p-10 border rounded-lg">
          <p className="text-gray-500">لا توجد خدمات متاحة حالياً</p>
          <Button 
            variant="outline" 
            onClick={() => setIsNewServiceDialogOpen(true)} 
            className="mt-4"
          >
            <Plus className="mr-2 h-4 w-4" /> إضافة خدمة جديدة
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className={!service.available ? 'opacity-60' : ''}>
              {service.image && (
                <div className="h-40 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}
              
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{service.name}</CardTitle>
                    <CardDescription>
                      السعر: {service.price} ريال
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditService(service)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف الخدمة</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من رغبتك في حذف هذه الخدمة؟ لا يمكن التراجع عن هذا الإجراء.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteService(service.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-700 mb-2">{service.description}</p>
                <div className="flex items-center space-x-2">
                  <Label>متاح:</Label>
                  <span>{service.available ? 'نعم' : 'لا'}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Dialog for adding a new service */}
      <Dialog open={isNewServiceDialogOpen} onOpenChange={setIsNewServiceDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>إضافة خدمة تفعيل يدوي جديدة</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="service-name">اسم الخدمة</Label>
              <Input 
                id="service-name" 
                value={serviceName} 
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="أدخل اسم الخدمة"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service-description">وصف الخدمة</Label>
              <Textarea 
                id="service-description" 
                value={serviceDescription} 
                onChange={(e) => setServiceDescription(e.target.value)}
                placeholder="أدخل وصف الخدمة"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service-price">السعر</Label>
              <Input 
                id="service-price" 
                type="number"
                value={servicePrice} 
                onChange={(e) => setServicePrice(Number(e.target.value))}
                min="0"
                step="0.01"
                placeholder="أدخل سعر الخدمة"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service-image">رابط الصورة</Label>
              <Input 
                id="service-image" 
                value={serviceImage} 
                onChange={(e) => setServiceImage(e.target.value)}
                placeholder="أدخل رابط صورة الخدمة (اختياري)"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="service-available" 
                checked={serviceAvailable} 
                onCheckedChange={setServiceAvailable}
              />
              <Label htmlFor="service-available">متاح للطلب</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewServiceDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleAddService}>إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for editing a service */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>تعديل خدمة التفعيل اليدوي</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-service-name">اسم الخدمة</Label>
              <Input 
                id="edit-service-name" 
                value={serviceName} 
                onChange={(e) => setServiceName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-service-description">وصف الخدمة</Label>
              <Textarea 
                id="edit-service-description" 
                value={serviceDescription} 
                onChange={(e) => setServiceDescription(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-service-price">السعر</Label>
              <Input 
                id="edit-service-price" 
                type="number"
                value={servicePrice} 
                onChange={(e) => setServicePrice(Number(e.target.value))}
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-service-image">رابط الصورة</Label>
              <Input 
                id="edit-service-image" 
                value={serviceImage} 
                onChange={(e) => setServiceImage(e.target.value)}
                placeholder="أدخل رابط صورة الخدمة (اختياري)"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="edit-service-available" 
                checked={serviceAvailable} 
                onCheckedChange={setServiceAvailable}
              />
              <Label htmlFor="edit-service-available">متاح للطلب</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleUpdateService}>حفظ التغييرات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManualServices;
