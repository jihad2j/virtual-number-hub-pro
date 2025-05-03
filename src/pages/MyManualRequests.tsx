
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { ManualRequest } from '@/types/ManualRequest';

const MyManualRequests = () => {
  const [requests, setRequests] = useState<ManualRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRequests();
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">طلبات التفعيل اليدوي</h1>
      
      {requests.length === 0 ? (
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
    </div>
  );
};

export default MyManualRequests;
