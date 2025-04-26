
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { api } from '@/services/api';
import { MessageSquare, PhoneCall, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ManualService {
  id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
}

interface ManualRequest {
  id: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  notes: string;
  adminResponse?: string;
  verificationCode?: string;
  createdAt: string;
  updatedAt?: string;
}

const ManualActivation = () => {
  const [services, setServices] = useState<ManualService[]>([]);
  const [requests, setRequests] = useState<ManualRequest[]>([]);
  const [selectedService, setSelectedService] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmationCode, setConfirmationCode] = useState<string>("");
  const [confirmingRequestId, setConfirmingRequestId] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
    fetchRequests();
  }, []);

  const fetchServices = async () => {
    try {
      const servicesData = await api.getManualServices();
      setServices(Array.isArray(servicesData) ? servicesData.filter(service => service.available) : []);
    } catch (error) {
      console.error('Failed to fetch manual services:', error);
      toast.error('فشل في جلب خدمات التفعيل اليدوي');
    }
  };

  const fetchRequests = async () => {
    try {
      const requestsData = await api.getUserManualRequests();
      setRequests(requestsData);
    } catch (error) {
      console.error('Failed to fetch user requests:', error);
      toast.error('فشل في جلب طلبات التفعيل');
    }
  };

  const handleSubmitRequest = async () => {
    if (!selectedService) {
      toast.error('الرجاء اختيار الخدمة المطلوبة');
      return;
    }

    setLoading(true);
    try {
      const selectedServiceObj = services.find(s => s.id === selectedService);
      if (!selectedServiceObj) {
        toast.error('الخدمة المختارة غير متوفرة');
        setLoading(false);
        return;
      }

      await api.createManualRequest({
        serviceId: selectedService,
        notes: notes
      });

      toast.success('تم إرسال طلب التفعيل اليدوي بنجاح');
      setSelectedService("");
      setNotes("");
      fetchRequests(); // Refresh requests
    } catch (error) {
      console.error('Failed to submit manual request:', error);
      toast.error('فشل في إرسال طلب التفعيل');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCompletion = async (requestId: string) => {
    setConfirmingRequestId(requestId);
    const request = requests.find(r => r.id === requestId);
    if (!request || !request.verificationCode) {
      toast.error('لم يتم إرسال رمز التحقق بعد');
      setConfirmingRequestId(null);
      return;
    }

    if (confirmationCode !== request.verificationCode) {
      toast.error('رمز التحقق غير صحيح');
      return;
    }

    try {
      await api.confirmManualRequest(requestId);
      toast.success('تم تأكيد اكتمال الخدمة بنجاح');
      fetchRequests(); // Refresh requests
      setConfirmationCode("");
      setConfirmingRequestId(null);
    } catch (error) {
      console.error('Failed to confirm request completion:', error);
      toast.error('فشل في تأكيد اكتمال الخدمة');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">قيد الانتظار</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500">قيد المعالجة</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">مكتمل</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">ملغي</Badge>;
      default:
        return <Badge>غير معروف</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">طلب التفعيل اليدوي</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>طلب خدمة تفعيل يدوية جديدة</CardTitle>
          <CardDescription>
            اختر الخدمة المطلوبة وأضف أي ملاحظات إضافية
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service">الخدمة المطلوبة</Label>
            <Select
              value={selectedService}
              onValueChange={setSelectedService}
            >
              <SelectTrigger id="service">
                <SelectValue placeholder="اختر الخدمة" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} - {service.price} ريال
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedService && (
            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي معلومات إضافية تريد إضافتها للطلب"
                className="min-h-[100px]"
              />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSubmitRequest} 
            disabled={!selectedService || loading}
            className="gradient-bg w-full"
          >
            {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
          </Button>
        </CardFooter>
      </Card>
      
      <h2 className="text-xl font-bold mt-8">طلباتي السابقة</h2>
      
      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            <MessageSquare className="mx-auto h-12 w-12 mb-4" />
            <p>لا توجد طلبات سابقة</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{request.serviceName}</CardTitle>
                  {getStatusBadge(request.status)}
                </div>
                <CardDescription>
                  تاريخ الطلب: {new Date(request.createdAt).toLocaleString('ar-SA')}
                </CardDescription>
              </CardHeader>
              <CardContent className="py-2 space-y-2">
                {request.notes && (
                  <div>
                    <p className="font-semibold">ملاحظاتك:</p>
                    <p className="text-gray-600">{request.notes}</p>
                  </div>
                )}
                
                {request.adminResponse && (
                  <div>
                    <p className="font-semibold">رد الإدارة:</p>
                    <p className="text-gray-600">{request.adminResponse}</p>
                  </div>
                )}
                
                {request.verificationCode && request.status === 'processing' && (
                  <div className="mt-4 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                    <p className="font-semibold flex items-center">
                      <PhoneCall className="h-5 w-5 ml-1 text-yellow-600" />
                      رمز التحقق من الإدارة:
                    </p>
                    <p className="text-lg font-mono font-semibold text-center my-2">
                      {request.verificationCode}
                    </p>
                    <p className="text-sm text-gray-600">
                      قم بإدخال رمز التحقق أدناه لتأكيد اكتمال الخدمة
                    </p>
                  </div>
                )}
              </CardContent>
              
              {request.status === 'processing' && request.verificationCode && (
                <CardFooter className="flex-col gap-3">
                  <div className="w-full">
                    <Label htmlFor={`confirm-code-${request.id}`}>أدخل رمز التحقق لتأكيد اكتمال الخدمة</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id={`confirm-code-${request.id}`}
                        value={confirmingRequestId === request.id ? confirmationCode : ''}
                        onChange={(e) => {
                          setConfirmingRequestId(request.id);
                          setConfirmationCode(e.target.value);
                        }}
                        placeholder="أدخل رمز التحقق"
                      />
                      <Button 
                        onClick={() => handleConfirmCompletion(request.id)}
                        variant="default"
                        className="gradient-bg"
                      >
                        <CheckCircle className="h-5 w-5 ml-1" />
                        تأكيد
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManualActivation;
