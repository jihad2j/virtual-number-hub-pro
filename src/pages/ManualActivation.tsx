
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { ManualRequest } from '@/types/ManualRequest';
import { ManualService } from '@/types/ManualService';
import { Badge } from '@/components/ui/badge';
import { Check, MessageSquare } from 'lucide-react';

const ManualActivation = () => {
  const [manualServices, setManualServices] = useState<ManualService[]>([]);
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

  const handleCreateRequest = async (serviceId: string) => {
    try {
      const requestData = {
        serviceId: serviceId,
        notes: message
      };
      
      const response = await api.createManualRequest(requestData);
      
      if (response) {
        toast.success('تم إرسال طلبك بنجاح');
        setMessage('');
        // Refresh requests
        fetchRequests();
      }
    } catch (error) {
      console.error('Error creating manual request:', error);
      toast.error('فشل في إرسال الطلب');
    }
  };

  const handleConfirmServiceReceived = async (id: string) => {
    try {
      await api.respondToManualRequest(id, { status: 'completed' });
      toast.success('تم تأكيد استلام الخدمة بنجاح');
      // Refresh requests
      fetchRequests();
    } catch (error) {
      console.error('Error confirming service receipt:', error);
      toast.error('فشل في تأكيد استلام الخدمة');
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

  const columns: ColumnDef<ManualRequest>[] = [
    {
      accessorKey: 'serviceName',
      header: 'الخدمة',
    },
    {
      accessorKey: 'status',
      header: 'الحالة',
      cell: ({ row }) => getStatusBadge(row.original.status)
    },
    {
      accessorKey: 'notes',
      header: 'التفاصيل',
    },
    {
      accessorKey: 'adminResponse',
      header: 'رد المشرف',
    },
    {
      accessorKey: 'verificationCode',
      header: 'رمز التحقق',
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
        <div className="flex gap-2">
          {row.original.status === 'processing' && row.original.verificationCode && (
            <Button 
              variant="success" 
              size="sm" 
              className="bg-green-500 hover:bg-green-600"
              onClick={() => handleConfirmServiceReceived(row.original.id)}
            >
              <Check className="w-4 h-4 mr-1" /> تم استلام الخدمة
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
      ),
    },
  ];

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">طلب تفعيل يدوي</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>معلومات الطلب</CardTitle>
            <CardDescription>أدخل أي معلومات إضافية للتفعيل اليدوي (اختياري)</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="message" className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" /> رسالة إضافية (اختياري)
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="أدخل أي معلومات إضافية هنا..."
              />
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-bold">اختر خدمة</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {manualServices.map((service) => (
            <Card key={service.id} className={!service.available ? 'opacity-60' : ''}>
              <CardHeader>
                <CardTitle>{service.name}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-green-600 mt-2">
                  {service.price} $
                </div>
                {!service.available && (
                  <Badge variant="destructive" className="mt-2">غير متاح حالياً</Badge>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleCreateRequest(service.id)} 
                  disabled={!service.available}
                  className="w-full"
                >
                  طلب الخدمة
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">طلبات التفعيل اليدوية</h2>
          <Card className="overflow-hidden">
            <DataTable 
              columns={columns} 
              data={requests} 
              loading={isLoading} 
              onRefresh={fetchRequests}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

// Add Label component missing in the original code
const Label: React.FC<{
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ htmlFor, className, children }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    >
      {children}
    </label>
  );
};

export default ManualActivation;
