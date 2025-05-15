
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { ManualService } from '@/types/ManualService';
import { ManualRequest } from '@/types/ManualRequest';
import { Badge } from '@/components/ui/badge';

const ManualActivation = () => {
  const [services, setServices] = useState<ManualService[]>([]);
  const [requests, setRequests] = useState<ManualRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<ManualService | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmRequestId, setConfirmRequestId] = useState<string>('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch services and user requests in parallel
      const servicesData = await api.getManualServices();
      console.log("Fetched manual services:", servicesData);
      
      try {
        const requestsData = await api.getUserManualRequests();
        console.log("Fetched user requests:", requestsData);
        setRequests(requestsData || []);
      } catch (reqError) {
        console.error('Failed to fetch user requests:', reqError);
        setRequests([]);
      }
      
      // Filter available services
      if (Array.isArray(servicesData)) {
        setServices(servicesData.filter(service => service.available));
      } else {
        setServices([]);
      }
    } catch (error) {
      console.error('Failed to fetch services data:', error);
      toast.error('فشل في تحميل الخدمات');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestService = (service: ManualService) => {
    setSelectedService(service);
    setNotes('');
    setIsRequestDialogOpen(true);
  };

  const handleSubmitRequest = async () => {
    if (!selectedService) return;
    
    try {
      await api.createManualRequest({
        serviceId: selectedService.id,
        notes
      });
      
      toast.success('تم إرسال طلب التفعيل بنجاح');
      setIsRequestDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to submit request:', error);
      toast.error('فشل في إرسال طلب التفعيل');
    }
  };

  const handleConfirmReceived = (requestId: string) => {
    setConfirmRequestId(requestId);
    setIsConfirmDialogOpen(true);
  };

  const confirmReceived = async () => {
    try {
      await api.respondToManualRequest(confirmRequestId, { status: 'completed' });
      toast.success('تم تأكيد استلام الخدمة بنجاح');
      setIsConfirmDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to confirm request:', error);
      toast.error('فشل في تأكيد استلام الخدمة');
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

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">خدمات التفعيل اليدوي</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <Card key={service.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle>{service.name}</CardTitle>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{service.price} $</p>
            </CardContent>
            <CardFooter className="bg-muted/20 flex justify-end">
              <Button onClick={() => handleRequestService(service)}>طلب الخدمة</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {services.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">لا توجد خدمات متاحة حالياً</p>
        </div>
      )}
      
      <h2 className="text-xl font-bold mt-8">طلباتي السابقة</h2>
      
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
              <CardContent>
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
            
            <CardFooter className="bg-muted/20 flex justify-end">
              {request.status === 'processing' && request.verificationCode && (
                <Button onClick={() => handleConfirmReceived(request.id)}>
                  تم استلام الخدمة
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
        
        {requests.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">لا توجد طلبات سابقة</p>
          </div>
        )}
      </div>
      
      {/* Request Service Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>طلب خدمة {selectedService?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
              <Textarea 
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أضف أي ملاحظات تريد إرسالها مع الطلب"
              />
            </div>
            
            <div className="font-medium">
              <p>سعر الخدمة: {selectedService?.price} $</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSubmitRequest}>تأكيد الطلب</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirm Received Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد استلام الخدمة</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>هل أنت متأكد من أنك تريد تأكيد استلام هذه الخدمة؟</p>
            <p className="text-muted-foreground text-sm mt-2">
              بعد التأكيد، سيتم إغلاق الطلب وتحديثه كمكتمل.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>إلغاء</Button>
            <Button onClick={confirmReceived}>تأكيد الاستلام</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManualActivation;
