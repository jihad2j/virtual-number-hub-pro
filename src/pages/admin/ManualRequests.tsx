
import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { api } from '@/services/api';

const ManualRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await api.getAllManualRequests();
      setRequests(response);
    } catch (error) {
      console.error('Failed to fetch manual requests', error);
      toast.error('فشل في جلب طلبات التفعيل اليدوي');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (request) => {
    setSelectedRequest(request);
    setAdminResponse('');
    setVerificationCode('');
    setDialogOpen(true);
  };

  const handleSubmitResponse = async () => {
    if (!adminResponse.trim()) {
      toast.error('الرجاء إدخال رد للطلب');
      return;
    }

    try {
      await api.respondToManualRequest(selectedRequest.id, adminResponse, verificationCode);
      // Also update the status to completed
      await api.updateManualRequestStatus(selectedRequest.id, 'completed');
      
      toast.success('تم الرد على الطلب بنجاح');
      setDialogOpen(false);
      fetchRequests();
    } catch (error) {
      console.error('Failed to respond to request', error);
      toast.error('فشل في إرسال الرد');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.updateManualRequestStatus(id, status);
      toast.success(`تم تحديث حالة الطلب إلى ${status}`);
      fetchRequests();
    } catch (error) {
      console.error('Failed to update request status', error);
      toast.error('فشل في تحديث حالة الطلب');
    }
  };

  const columns = [
    {
      accessorKey: 'id',
      header: 'رقم الطلب',
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.id.substring(0, 8)}</span>
    },
    {
      accessorKey: 'serviceName',
      header: 'الخدمة',
      cell: ({ row }) => <span>{row.original.service?.name || 'غير معروف'}</span>
    },
    {
      accessorKey: 'username',
      header: 'المستخدم',
      cell: ({ row }) => <span>{row.original.user?.username || 'غير معروف'}</span>
    },
    {
      accessorKey: 'status',
      header: 'الحالة',
      cell: ({ row }) => {
        const status = row.original.status;
        let color = 'bg-gray-500';
        
        if (status === 'pending') color = 'bg-yellow-500';
        if (status === 'processing') color = 'bg-blue-500';
        if (status === 'completed') color = 'bg-green-500';
        if (status === 'cancelled') color = 'bg-red-500';
        
        return (
          <Badge className={color}>{status}</Badge>
        );
      }
    },
    {
      accessorKey: 'createdAt',
      header: 'تاريخ الطلب',
      cell: ({ row }) => <span>{new Date(row.original.createdAt).toLocaleString('ar-SA')}</span>
    },
    {
      id: 'actions',
      header: 'الإجراءات',
      cell: ({ row }) => {
        const request = row.original;
        const isPending = request.status === 'pending';
        const isProcessing = request.status === 'processing';
        
        return (
          <div className="space-x-2 flex">
            {(isPending || isProcessing) && (
              <>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleOpenDialog(request)}
                >
                  الرد
                </Button>
                
                {isPending && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                    onClick={() => handleUpdateStatus(request.id, 'processing')}
                  >
                    قيد المعالجة
                  </Button>
                )}
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-red-50 text-red-600 hover:bg-red-100"
                  onClick={() => handleUpdateStatus(request.id, 'cancelled')}
                >
                  إلغاء
                </Button>
              </>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">طلبات التفعيل اليدوي</h1>
      
      <Card className="overflow-hidden">
        <DataTable 
          columns={columns} 
          data={requests} 
          isLoading={isLoading} 
          onRefresh={fetchRequests}
        />
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>الرد على طلب تفعيل يدوي</DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <div className="mt-2">
                  <p><strong>الخدمة:</strong> {selectedRequest.service?.name}</p>
                  <p><strong>المستخدم:</strong> {selectedRequest.user?.username}</p>
                  <p><strong>ملاحظات المستخدم:</strong> {selectedRequest.notes || 'لا توجد ملاحظات'}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="response">الرد</Label>
              <Textarea 
                id="response" 
                value={adminResponse} 
                onChange={(e) => setAdminResponse(e.target.value)} 
                placeholder="أدخل الرد للمستخدم هنا..." 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="verificationCode">رمز التحقق (اختياري)</Label>
              <Input 
                id="verificationCode" 
                value={verificationCode} 
                onChange={(e) => setVerificationCode(e.target.value)} 
                placeholder="أدخل رمز التحقق هنا (إذا كان متاحاً)..." 
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button 
              onClick={handleSubmitResponse}
            >
              إرسال الرد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManualRequests;
