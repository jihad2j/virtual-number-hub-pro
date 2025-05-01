
import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { PhoneNumber } from '@/types/PhoneNumber';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Copy, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ColumnDef } from '@tanstack/react-table';

// Define the Order type separately, not extending PhoneNumber
interface Order {
  id: string;
  phoneNumber: string;
  service: string;
  country: string;
  status: string;
  smsCode?: string;
  createdAt: string;
  expiresAt?: string;
}

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const numbers = await api.getUserPhoneNumbers();
      setOrders(numbers.map(number => ({
        id: number.id || '',
        phoneNumber: number.number || '', // Update to use 'number' instead of 'phoneNumber'
        service: number.serviceId || '',
        country: number.countryId || '', // Update to use 'countryId' instead of 'country'
        status: number.status || 'pending',
        smsCode: number.smsCode || '',
        createdAt: number.createdAt || new Date().toISOString(),
      })));
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('فشل في جلب طلباتك');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('تم نسخ النص إلى الحافظة');
  };

  const checkStatus = async (id: string) => {
    try {
      const updatedNumber = await api.checkPhoneNumber(id);
      setOrders(orders.map(order => 
        order.id === id ? {
          ...order,
          status: updatedNumber.status,
          smsCode: updatedNumber.smsCode
        } : order
      ));
      toast.success('تم تحديث حالة الطلب');
    } catch (error) {
      console.error('Failed to check order status:', error);
      toast.error('فشل في تحديث حالة الطلب');
    }
  };

  const cancelOrder = async (id: string) => {
    try {
      const result = await api.cancelPhoneNumber(id);
      if (result) {
        setOrders(orders.map(order => 
          order.id === id ? { ...order, status: 'cancelled' } : order
        ));
        toast.success('تم إلغاء الطلب بنجاح');
      } else {
        toast.error('لا يمكن إلغاء هذا الطلب');
      }
    } catch (error) {
      console.error('Failed to cancel order:', error);
      toast.error('فشل في إلغاء الطلب');
    }
  };

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'service',
      header: 'الخدمة',
    },
    {
      accessorKey: 'country',
      header: 'الدولة',
    },
    {
      accessorKey: 'phoneNumber',
      header: 'رقم الهاتف',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <span dir="ltr">{row.original.phoneNumber}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => copyToClipboard(row.original.phoneNumber)}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'الحالة',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant={
            status === 'active' ? 'default' :
            status === 'pending' ? 'outline' :
            status === 'complete' ? 'success' :
            status === 'cancelled' ? 'destructive' :
            'secondary'
          }>
            {status === 'active' ? 'نشط' :
             status === 'pending' ? 'قيد الانتظار' :
             status === 'complete' ? 'مكتمل' :
             status === 'cancelled' ? 'ملغي' : status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'smsCode',
      header: 'رمز التحقق',
      cell: ({ row }) => {
        const smsCode = row.original.smsCode;
        return smsCode ? (
          <div className="flex items-center space-x-2">
            <span className="bg-muted py-1 px-2 rounded">{smsCode}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => copyToClipboard(smsCode)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">لا يوجد</span>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'التاريخ',
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return (
          <span>
            {date.toLocaleDateString('ar-SA')} {date.toLocaleTimeString('ar-SA')}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'الإجراءات',
      cell: ({ row }) => {
        const isActive = row.original.status === 'active';
        const isPending = row.original.status === 'pending';
        
        return (
          <div className="flex space-x-2">
            {(isActive || isPending) && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => checkStatus(row.original.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  تحديث
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => cancelOrder(row.original.id)}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  إلغاء
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">طلباتي</h1>
      
      <Card className="overflow-hidden">
        <DataTable 
          columns={columns} 
          data={orders} 
          loading={isLoading} 
          onRefresh={fetchOrders}
          searchKey="phoneNumber"
        />
      </Card>
    </div>
  );
};

export default MyOrders;
