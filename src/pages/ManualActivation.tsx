
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { ManualRequest } from '@/types/ManualRequest';
import { ManualService } from '@/types/ManualService';

const ManualActivation = () => {
  const [manualServices, setManualServices] = useState<ManualService[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [customService, setCustomService] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [requests, setRequests] = useState<ManualRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchServices();
    fetchRequests();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await api.getManualServices();
      setManualServices(data);
    } catch (error) {
      console.error('Error fetching manual services:', error);
      toast.error('فشل في جلب الخدمات');
    }
  };

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await api.getUserManualRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching manual requests:', error);
      toast.error('فشل في جلب الطلبات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    try {
      if (!selectedServiceId && !customService) {
        toast.error('يرجى اختيار خدمة أو إدخال خدمة مخصصة');
        return;
      }
      
      if (!phoneNumber) {
        toast.error('يرجى إدخال رقم الهاتف');
        return;
      }
      
      const requestData = {
        serviceId: selectedServiceId,
        notes: `رقم الهاتف: ${phoneNumber}\nخدمة مخصصة: ${customService}\nرسالة: ${message}`
      };
      
      const response = await api.createManualRequest(requestData);
      
      if (response) {
        toast.success('تم إرسال طلبك بنجاح');
        setSelectedServiceId('');
        setCustomService('');
        setPhoneNumber('');
        setMessage('');
        // Refresh requests
        fetchRequests();
      }
    } catch (error) {
      console.error('Error creating manual request:', error);
      toast.error('فشل في إرسال الطلب');
    }
  };

  const handleDeleteRequest = async (id: string) => {
    try {
      await api.deleteManualRequest(id);
      toast.success('تم حذف الطلب بنجاح');
      // Refresh requests
      fetchRequests();
    } catch (error) {
      console.error('Error deleting manual request:', error);
      toast.error('فشل في حذف الطلب');
    }
  };

  const columns: ColumnDef<ManualRequest>[] = [
    {
      accessorKey: 'serviceName',
      header: 'الخدمة',
    },
    {
      accessorKey: 'status',
      header: 'الحالة',
      cell: ({ row }) => {
        const statusMap: Record<string, string> = {
          'pending': 'قيد الانتظار',
          'processing': 'قيد المعالجة',
          'completed': 'مكتمل',
          'cancelled': 'ملغي'
        };
        return statusMap[row.original.status] || row.original.status;
      }
    },
    {
      accessorKey: 'notes',
      header: 'التفاصيل',
    },
    {
      accessorKey: 'createdAt',
      header: 'تاريخ الإنشاء',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
    {
      id: 'actions',
      header: 'الإجراءات',
      cell: ({ row }) => (
        <Button variant="destructive" size="sm" onClick={() => handleDeleteRequest(row.original.id)}>
          حذف
        </Button>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>طلب تفعيل يدوي</CardTitle>
          <CardDescription>املأ النموذج لطلب تفعيل يدوي لرقم.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="service">الخدمة</Label>
            <Select onValueChange={(value) => setSelectedServiceId(value)}>
              <SelectTrigger id="service">
                <SelectValue placeholder="اختر خدمة" />
              </SelectTrigger>
              <SelectContent>
                {manualServices.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="custom-service">خدمة مخصصة (إذا لم تكن الخدمة موجودة)</Label>
            <Input
              type="text"
              id="custom-service"
              value={customService}
              onChange={(e) => setCustomService(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone-number">رقم الهاتف</Label>
            <Input
              type="tel"
              id="phone-number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">الرسالة</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="أدخل رسالتك هنا..."
            />
          </div>
          <Button onClick={handleCreateRequest}>إرسال الطلب</Button>
        </CardContent>
      </Card>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">طلبات التفعيل اليدوية</h2>
        <DataTable columns={columns} data={requests} loading={isLoading} onRefresh={fetchRequests} />
      </div>
    </div>
  );
};

export default ManualActivation;
