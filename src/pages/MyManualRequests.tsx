
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { ManualService, ManualRequest } from '@/types/ManualRequest';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';

const MyManualRequests = () => {
  const [requests, setRequests] = useState<ManualRequest[]>([]);
  const [services, setServices] = useState<ManualService[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceLoading, setServiceLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ManualService | null>(null);
  const [notes, setNotes] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchUserRequests();
    fetchServices();
  }, []);

  const fetchUserRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getUserManualRequests();
      setRequests(data || []);
    } catch (error) {
      console.error('Failed to fetch manual requests:', error);
      toast.error('فشل في تحميل طلبات التفعيل اليدوي');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    setServiceLoading(true);
    try {
      const data = await api.getManualServices();
      setServices(data || []);
    } catch (error) {
      console.error('Failed to fetch manual services:', error);
      toast.error('فشل في تحميل خدمات التفعيل اليدوي');
    } finally {
      setServiceLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">قيد الانتظار</Badge>;
      case 'processing':
        return <Badge variant="secondary">قيد المعالجة</Badge>;
      case 'completed':
        return <Badge variant="default">مكتمل</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">ملغي</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const confirmRequest = async (requestId: string) => {
    try {
      await api.respondToManualRequest(requestId, { status: 'completed' });
      toast.success('تم تأكيد استلام الخدمة بنجاح');
      fetchUserRequests();
    } catch (error) {
      console.error('Failed to confirm request:', error);
      toast.error('فشل في تأكيد استلام الخدمة');
    }
  };

  const handleOpenServiceDialog = (service: ManualService) => {
    setSelectedService(service);
    setNotes('');
    setDialogOpen(true);
  };

  const handleCreateRequest = async () => {
    if (!selectedService) return;
    
    try {
      await api.createManualRequest({
        serviceId: selectedService.id,
        notes: notes
      });
      
      toast.success('تم إرسال طلب التفعيل بنجاح');
      setDialogOpen(false);
      setSelectedService(null);
      setNotes('');
      fetchUserRequests();
    } catch (error) {
      console.error('Error creating manual request:', error);
      toast.error('فشل في إرسال طلب التفعيل');
    }
  };

  if (loading && serviceLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="services" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="services">خدمات التفعيل اليدوي</TabsTrigger>
          <TabsTrigger value="requests">طلباتي السابقة</TabsTrigger>
        </TabsList>
        
        <TabsContent value="services">
          <h1 className="text-2xl font-bold mb-4">خدمات التفعيل اليدوي</h1>
          
          {serviceLoading ? (
            <Card>
              <CardContent className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
              </CardContent>
            </Card>
          ) : services.length === 0 ? (
            <Card>
              <CardContent className="flex justify-center items-center h-40">
                <p className="text-muted-foreground">لا توجد خدمات تفعيل يدوي متاحة حاليًا</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <Card key={service.id} className={`overflow-hidden ${!service.available ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-2">
                    <CardTitle>{service.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{service.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-2xl font-bold text-primary">
                        {service.price.toFixed(2)} $
                      </div>
                      <Button 
                        onClick={() => handleOpenServiceDialog(service)}
                        disabled={!service.available || (user?.balance && user.balance < service.price)}
                      >
                        طلب الخدمة
                      </Button>
                    </div>
                    {user?.balance && user.balance < service.price && (
                      <p className="text-sm text-destructive mt-2">رصيدك غير كافٍ</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="requests">
          <h1 className="text-2xl font-bold mb-4">طلباتي السابقة</h1>
          
          {loading ? (
            <Card>
              <CardContent className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
              </CardContent>
            </Card>
          ) : requests.length === 0 ? (
            <Card>
              <CardContent className="flex justify-center items-center h-40">
                <p className="text-muted-foreground">لا يوجد لديك طلبات تفعيل يدوي سابقة</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{request.serviceName}</CardTitle>
                        <CardDescription className="mt-1">
                          تاريخ الطلب: {new Date(request.createdAt).toLocaleDateString('ar-SA')}
                        </CardDescription>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </CardHeader>
                  
                  {request.notes && (
                    <CardContent className="pt-0">
                      <p><strong>ملاحظاتك:</strong> {request.notes}</p>
                    </CardContent>
                  )}
                  
                  {request.adminResponse && (
                    <CardContent className="border-t pt-4">
                      <p><strong>رد المدير:</strong> {request.adminResponse}</p>
                      
                      {request.verificationCode && (
                        <p className="mt-2"><strong>كود التفعيل:</strong> <span className="bg-muted p-1 rounded">{request.verificationCode}</span></p>
                      )}
                    </CardContent>
                  )}
                  
                  {request.status === 'processing' && (
                    <CardContent className="flex justify-end border-t pt-4">
                      <Button onClick={() => confirmRequest(request.id)}>
                        تأكيد استلام الخدمة
                      </Button>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog for creating a new request */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>طلب خدمة تفعيل يدوي</DialogTitle>
          </DialogHeader>

          {selectedService && (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="font-semibold">{selectedService.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedService.description}</p>
                <p className="text-lg font-bold mt-2">{selectedService.price.toFixed(2)} $</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium">ملاحظات (اختياري)</label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أضف أي ملاحظات أو تفاصيل إضافية هنا..."
                  className="resize-none"
                />
              </div>

              {user?.balance && user.balance < (selectedService?.price || 0) ? (
                <div className="bg-destructive/20 p-2 rounded text-destructive text-sm">
                  رصيدك الحالي غير كافٍ لطلب هذه الخدمة.
                </div>
              ) : (
                <div className="bg-muted p-2 rounded text-sm">
                  سيتم خصم <span className="font-bold">{selectedService.price.toFixed(2)} $</span> من رصيدك.
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button 
              onClick={handleCreateRequest} 
              disabled={!selectedService || (user?.balance && user.balance < (selectedService?.price || 0))}
            >
              تأكيد الطلب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyManualRequests;
