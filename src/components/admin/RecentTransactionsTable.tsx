
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { formatCurrency } from '@/lib/utils';
import { Transaction } from '@/types/Transaction';

interface RecentTransactionsTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({ 
  transactions, 
  isLoading,
  onRefresh 
}) => {
  const transactionColumns = [
    {
      accessorKey: 'id',
      header: 'رقم العملية',
    },
    {
      accessorKey: 'username',
      header: 'المستخدم',
    },
    {
      accessorKey: 'amount',
      header: 'المبلغ',
      cell: ({ row }: { row: any }) => formatCurrency(row.original.amount),
    },
    {
      accessorKey: 'type',
      header: 'النوع',
      cell: ({ row }: { row: any }) => {
        const typeMap = {
          deposit: 'إيداع',
          withdrawal: 'سحب',
          purchase: 'شراء',
          refund: 'استرداد',
          gift: 'هدية',
          manual: 'يدوي',
          admin: 'إداري',
        };
        return typeMap[row.original.type] || row.original.type;
      },
    },
    {
      accessorKey: 'status',
      header: 'الحالة',
      cell: ({ row }: { row: any }) => {
        const statusMap = {
          pending: 'قيد الانتظار',
          completed: 'مكتمل',
          cancelled: 'ملغي',
          failed: 'فشل',
        };
        return statusMap[row.original.status] || row.original.status;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'التاريخ',
      cell: ({ row }: { row: any }) => new Date(row.original.createdAt).toLocaleString('ar-SA'),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>أحدث المعاملات</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable 
          columns={transactionColumns} 
          data={transactions} 
          loading={isLoading}
          onRefresh={onRefresh}
        />
      </CardContent>
    </Card>
  );
};
