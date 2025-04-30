
import React, { useState, useEffect } from 'react';
import { api, ManualService } from '@/services/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ManualActivation = () => {
  const [services, setServices] = useState<ManualService[]>([]);
  const [userRequests, setUserRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<ManualService | null>(null);
  const [notes, setNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [servicesData, userRequestsData] = await Promise.all([
        api.getManualServices(),
        user ? api.getUserManualRequests() : Promise.resolve([])
      ]);
      
      setServices(servicesData || []);
      setUserRequests(userRequestsData || []);
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('فشل في جلب البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenRequestDialog = (service: ManualService) => {
    setSelectedService(service);
    setIsDialogOpen(true);
  };

  const handleRequestService = async () => {
    if (!selectedService || !user) return;
    
    try {
      await api.createManualRequest({
        serviceId: selectedService.id,
        notes: notes
      });
      
      setIsDialogOpen(false);
      setNotes('');
      setSelectedService(null);
      toast.success('تم إرسال طلب التفعيل اليدوي بنجاح');
      
      // Refresh user requests
      fetchData();
    } catch (error) {
      console.error('Failed to create manual request', error);
      toast.error('فشل في إرسال طلب التفعيل اليدوي');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'processing':
        return 'bg-blue-500 text-white';
      case 'completed':
        return 'bg-green-500 text-white';
      case 'cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'processing':
        return 'قيد المعالجة';
      case 'completed':
        return 'مكتمل';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
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
      <h1 className="text-2xl font-bold">خدمات التفعيل اليدوي</h1>
      
      <Tabs defaultValue="services">
        <TabsList className="mb-4">
          <TabsTrigger value="services">الخدمات المتاحة</TabsTrigger>
          <TabsTrigger value="requests">طلباتي</TabsTrigger>
        </TabsList>
        
        <TabsContent value="services">
          {services.length === 0 ? (
            <div className="text-center p-10 border rounded-lg">
              <p className="text-gray-500">لا توجد خدمات متاحة حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.filter(service => service.available).map((service) => (
                <Card key={service.id} className="overflow-hidden">
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
                    <CardTitle>{service.name}</CardTitle>
                    <CardDescription>
                      السعر: {service.price} ريال
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-700">{service.description}</p>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => handleOpenRequestDialog(service)}
                      disabled={!user}
                    >
                      طلب الخدمة
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="requests">
          {!user ? (
            <div className="text-center p-10 border rounded-lg">
              <p className="text-gray-500">يرجى تسجيل الدخول لعرض طلباتك</p>
            </div>
          ) : userRequests.length === 0 ? (
            <div className="text-center p-10 border rounded-lg">
              <p className="text-gray-500">لا توجد طلبات سابقة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{request.serviceName}</CardTitle>
                      <span className={`px-3 py-1 rounded-full text-xs ${getStatusBadgeClass(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </div>
                    <CardDescription>
                      تاريخ الطلب: {new Date(request.createdAt).toLocaleString('ar')}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    {request.notes && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-1">ملاحظاتك:</h4>
                        <p className="text-gray-700">{request.notes}</p>
                      </div>
                    )}
                    
                    {request.adminResponse && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-1">رد الإدارة:</h4>
                        <p className="text-gray-700">{request.adminResponse}</p>
                      </div>
                    )}
                    
                    {request.verificationCode && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-1">رمز التفعيل:</h4>
                        <p className="bg-gray-100 p-2 rounded font-mono text-center text-lg">
                          {request.verificationCode}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Dialog for creating a new request */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>طلب خدمة {selectedService?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <p className="font-semibold mb-1">الخدمة:</p>
              <p>{selectedService?.name}</p>
            </div>
            
            <div>
              <p className="font-semibold mb-1">السعر:</p>
              <p>{selectedService?.price} ريال</p>
            </div>
            
            <div>
              <p className="font-semibold mb-1">ملاحظات (اختياري):</p>
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="أضف أي معلومات إضافية تريد إرسالها مع الطلب" 
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleRequestService}>تأكيد الطلب</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManualActivation;
