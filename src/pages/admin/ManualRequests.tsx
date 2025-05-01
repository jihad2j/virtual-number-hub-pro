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
import { ManualService } from '@/types/ManualService';
import { Textarea } from "@/components/ui/textarea"

const ManualRequests = () => {
  const [requests, setRequests] = useState<ManualRequest[]>([]);
  const [manualServices, setManualServices] = useState<ManualService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ManualService | null>(null);
  const [customService, setCustomService] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');

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

  const handleCreateRequest = async () => {
    try {
      const requestData = {
        service: selectedService?.id || '',
        customService: customService,
        phoneNumber: phoneNumber,
        message: message,
      };
      
      const response = await api.createManualRequest(requestData);
      
      if (response) {
        toast.success('تم إرسال طلبك بنجاح');
        setSelectedService(null);
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

  const columns = [
    {
      accessorKey: 'createdAt',
      header: 'تاريخ الطلب',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      accessorKey: 'service',
      header: 'الخدمة',
      cell: ({ row }) => {
        const service = manualServices.find(s => s.id === row.original.service);
        return service ? service.name : row.original.customService || 'غير محددة';
      },
    },
    {
      accessorKey: 'phoneNumber',
      header: 'رقم الهاتف',
    },
    {
      accessorKey: 'message',
      header: 'الرسالة',
    },
    {
      id: 'actions',
      header: 'الإجراءات',
      cell: ({ row }) => (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleDeleteRequest(row.original.id)}
        >
          حذف
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">الطلبات اليدوية</h1>
        <Button onClick={() => setDialogOpen(true)}>إضافة طلب يدوي</Button>
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
            <DialogTitle>إضافة طلب يدوي</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="service">الخدمة</Label>
              <select
                id="service"
                className="w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                onChange={(e) => {
                  const selected = manualServices.find(s => s.id === e.target.value);
                  setSelectedService(selected || null);
                  setCustomService('');
                }}
                value={selectedService?.id || ''}
              >
                <option value="">اختر خدمة</option>
                {manualServices.map(service => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
            </div>

            {!selectedService && (
              <div className="space-y-2">
                <Label htmlFor="customService">خدمة مخصصة</Label>
                <Input
                  id="customService"
                  value={customService}
                  onChange={(e) => setCustomService(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">رقم الهاتف</Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">الرسالة</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleCreateRequest}>إرسال</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManualRequests;
