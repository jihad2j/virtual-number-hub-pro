
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api } from "@/services/api";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Edit, DollarSign, Info } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ManualService {
  id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  image?: string;
}

const AddServiceDialog = ({ onSuccess }: { onSuccess: () => void }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleAddService = async () => {
    if (!name || !description || !price) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);
    try {
      await api.createManualService({
        name,
        description,
        price: Number(price),
        available: true,
        image
      });

      setName('');
      setDescription('');
      setPrice('');
      setImage('');
      setOpen(false);
      onSuccess();
      toast.success('تمت إضافة الخدمة بنجاح');
    } catch (error) {
      console.error('Failed to add service:', error);
      toast.error('فشل في إضافة الخدمة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-bg">
          <Plus className="w-4 h-4 ml-2" />
          إضافة خدمة جديدة
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>إضافة خدمة تفعيل يدوي جديدة</DialogTitle>
          <DialogDescription>
            أدخل تفاصيل الخدمة الجديدة التي تريد إضافتها
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">اسم الخدمة</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="اسم الخدمة" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">وصف الخدمة</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="وصف الخدمة" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">السعر</Label>
            <Input 
              id="price" 
              type="number" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              placeholder="سعر الخدمة" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">رابط الصورة (اختياري)</Label>
            <Input 
              id="image" 
              value={image} 
              onChange={(e) => setImage(e.target.value)} 
              placeholder="رابط صورة الخدمة" 
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleAddService} 
            className="gradient-bg" 
            disabled={loading}
          >
            {loading ? 'جاري الإضافة...' : 'إضافة الخدمة'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EditServiceDialog = ({ service, onSuccess }: { service: ManualService, onSuccess: () => void }) => {
  const [name, setName] = useState(service.name);
  const [description, setDescription] = useState(service.description);
  const [price, setPrice] = useState(service.price.toString());
  const [image, setImage] = useState(service.image || '');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleUpdateService = async () => {
    if (!name || !description || !price) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);
    try {
      await api.updateManualService(service.id, {
        name,
        description,
        price: Number(price),
        image
      });

      setOpen(false);
      onSuccess();
      toast.success('تم تحديث الخدمة بنجاح');
    } catch (error) {
      console.error('Failed to update service:', error);
      toast.error('فشل في تحديث الخدمة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4 ml-1" />
          تعديل
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>تعديل خدمة التفعيل اليدوي</DialogTitle>
          <DialogDescription>
            تعديل تفاصيل خدمة "{service.name}"
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">اسم الخدمة</Label>
            <Input 
              id="edit-name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="اسم الخدمة" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">وصف الخدمة</Label>
            <Textarea 
              id="edit-description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="وصف الخدمة" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-price">السعر</Label>
            <Input 
              id="edit-price" 
              type="number" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              placeholder="سعر الخدمة" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-image">رابط الصورة (اختياري)</Label>
            <Input 
              id="edit-image" 
              value={image} 
              onChange={(e) => setImage(e.target.value)} 
              placeholder="رابط صورة الخدمة" 
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleUpdateService} 
            className="gradient-bg" 
            disabled={loading}
          >
            {loading ? 'جاري التحديث...' : 'تحديث الخدمة'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ManualServices = () => {
  const [services, setServices] = useState<ManualService[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchServices();
  }, [isAdmin, navigate]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const servicesData = await api.getManualServices();
      setServices(Array.isArray(servicesData) ? servicesData : (servicesData.data || []));
    } catch (error) {
      console.error('Failed to fetch manual services:', error);
      toast.error('فشل في جلب خدمات التفعيل اليدوي');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (serviceId: string, currentAvailability: boolean) => {
    try {
      await api.updateManualService(serviceId, {
        available: !currentAvailability
      });
      
      // Update the services state locally
      setServices(services.map(service => 
        service.id === serviceId ? 
        { ...service, available: !service.available } : 
        service
      ));
      
      toast.success(`تم ${!currentAvailability ? 'تفعيل' : 'تعطيل'} الخدمة بنجاح`);
    } catch (error) {
      console.error('Failed to toggle service availability:', error);
      toast.error('فشل في تغيير حالة الخدمة');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">إدارة خدمات التفعيل اليدوي</h1>
        <AddServiceDialog onSuccess={fetchServices} />
      </div>
      
      {services.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            <Info className="mx-auto h-12 w-12 mb-4" />
            <p>لا توجد خدمات تفعيل يدوي حالياً</p>
            <Button className="mt-4 gradient-bg" onClick={() => document.querySelector<HTMLButtonElement>('[data-trigger="add-service"]')?.click()}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة أول خدمة
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <Card key={service.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={service.available}
                      onCheckedChange={() => handleToggleAvailability(service.id, service.available)}
                    />
                    <span className={service.available ? "text-green-600" : "text-gray-400"}>
                      {service.available ? "متاح" : "غير متاح"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center text-green-600 font-bold">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {service.price} ريال
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {service.image && (
                  <div className="h-40 overflow-hidden rounded-md">
                    <img 
                      src={service.image} 
                      alt={service.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <p className="text-gray-600">{service.description}</p>
                <div className="flex justify-end pt-4">
                  <EditServiceDialog 
                    service={service} 
                    onSuccess={fetchServices} 
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManualServices;
