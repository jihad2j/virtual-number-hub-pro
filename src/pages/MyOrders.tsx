
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// Adjust the interface to match the transaction data structure
interface Order {
  id: string;
  description: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
  createdAt: string;
}

const MyOrders = () => {
  // This would be replaced with actual orders API endpoint
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.getUserTransactions()
  });

  // Map the transactions to the Order format required by the UI
  const orders: Order[] = transactions.map(transaction => ({
    id: transaction.id,
    description: transaction.description || 'غير محدد',
    amount: transaction.amount,
    status: transaction.status,
    createdAt: transaction.createdAt
  }));

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'id',
      header: 'رقم الطلب',
    },
    {
      accessorKey: 'description',
      header: 'الخدمة',
      cell: ({ row }) => row.original.description || 'غير محدد',
    },
    {
      accessorKey: 'amount',
      header: 'المبلغ',
      cell: ({ row }) => `$${row.original.amount.toFixed(2)}`,
    },
    {
      accessorKey: 'status',
      header: 'الحالة',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant={
            status === 'completed' ? 'success' : 
            status === 'pending' ? 'outline' : 
            'destructive'
          }>
            {
              status === 'completed' ? 'مكتمل' : 
              status === 'pending' ? 'قيد التنفيذ' : 
              status === 'failed' ? 'فشل' : 'ملغي'
            }
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'تاريخ الطلب',
      cell: ({ row }) => {
        return format(new Date(row.original.createdAt), 'PPP', { locale: ar });
      },
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">طلباتي</h1>
        <p className="text-gray-500">عرض جميع الطلبات الخاصة بك</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>قائمة الطلبات</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={orders} 
              searchKey="description"
              searchPlaceholder="البحث عن خدمة..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyOrders;
