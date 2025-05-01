
import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { ManualRequest } from '@/types/ManualRequest';
import { ManualService } from '@/types/ManualRequest';
import { Textarea } from "@/components/ui/textarea"
import { Badge } from '@/components/ui/badge';

const ManualRequests = () => {
  const [requests, setRequests] = useState<ManualRequest[]>([]);
  const [manualServices, setManualServices] = useState<ManualService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ManualService | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [requestsData, servicesData] = await Promise.all([
        api.getAllManualRequests(),
        api.getAllManualServices()
      ]);
      setRequests(requestsData);
      setManualServices(servicesData);
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('فشل في جلب البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const requestsData = await api.getAllManualRequests();
      setRequests(requestsData);
    } catch (error) {
      console.error('Failed to fetch requests', error);
      toast.error('فشل في جلب الطلبات');
    }
  };

  const handleRespond = async () => {
    if (!selectedRequestId) return;
    
    try {
      await api.respondToManualRequest(selectedRequestId, {
        adminResponse,
        verificationCode,
        status: 'processing'
      });
      
      toast.success('تم الرد على الطلب بنجاح');
      setDialogOpen(false);
      setAdminResponse('');
      setVerificationCode('');
      setSelectedRequestId(null);
      fetchRequests();
    } catch (error) {
      console.error('Error responding to request:', error);
      toast.error('فشل في الرد على الطلب');
    }
  };

  const handleDeleteRequest = async (id: string) => {
    try {
      await api.deleteManualRequest(id);
      toast.success('تم حذف الطلب بنجاح');
      fetchRequests();
    } catch (error) {
      console.error('Error deleting manual request:', error);
      toast.error('فشل في حذف الطلب');
    }
  };

  const openRespondDialog = (requestId: string) => {
    setSelectedRequestId(requestId);
    setDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string, variant: "default" | "secondary" | "destructive" | "outline" | "success" | "link" | "ghost" }> = {
      'pending': { label: 'قيد الانتظار', variant: 'secondary' },
      'processing': { label: 'قيد المعالجة', variant: 'default' },
      'completed': { label: 'مكتمل', variant: 'success' },
      'cancelled': { label: 'ملغي', variant: 'destructive' }
    };
    const statusInfo = statusMap[status] || { label: status, variant: 'secondary' };
    
    return (
      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
    );
  };

  const columns = [
    {
      accessorKey: 'createdAt',
      header: 'تاريخ الطلب',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      accessorKey: 'userName',
      header: 'المستخدم',
      cell: ({ row }) => row.original.userName || 'غير معروف',
    },
    {
      accessorKey: 'serviceName',
      header: 'الخدمة',
      cell: ({ row }) => row.original.serviceName || 'غير محددة',
    },
    {
      accessorKey: 'status',
      header: 'الحالة',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'notes',
      header: 'الملاحظات',
      cell: ({ row }) => row.original.notes || 'لا توجد ملاحظات',
    },
    {
      id: 'actions',
      header: 'الإجراءات',
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row.original.status === 'pending' && (
            <Button
              variant="default"
              size="sm"
              onClick={() => openRespondDialog(row.original.id)}
            >
              الرد
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteRequest(row.original.id)}
          >
            حذف
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">الطلبات اليدوية</h1>
        <Button onClick={fetchRequests}>تحديث</Button>
      </div>

      <Card className="overflow-hidden">
        <DataTable 
          columns={columns} 
          data={requests} 
          loading={isLoading} 
          onRefresh={fetchRequests}
        />
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>الرد على طلب يدوي</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="adminResponse">الرد</Label>
              <Textarea
                id="adminResponse"
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="أدخل الرد للمستخدم هنا..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="verificationCode">رمز التحقق</Label>
              <Input
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="أدخل رمز التحقق هنا..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleRespond}>إرسال الرد</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManualRequests;
