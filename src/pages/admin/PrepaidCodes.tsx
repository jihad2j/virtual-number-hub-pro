
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { PrepaidCode } from '@/types/PrepaidCode';
import { Plus, Download } from 'lucide-react';

const PrepaidCodes = () => {
  const [codes, setCodes] = useState<PrepaidCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [amount, setAmount] = useState<number>(10);
  const [count, setCount] = useState<number>(1);
  
  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAllPrepaidCodes();
      setCodes(data);
    } catch (error) {
      console.error('Failed to fetch prepaid codes', error);
      toast.error('فشل في جلب أكواد الشحن');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCodes = async () => {
    if (amount <= 0) {
      toast.error('يجب أن تكون قيمة الكود موجبة');
      return;
    }

    if (count <= 0 || count > 100) {
      toast.error('يرجى تحديد عدد صحيح من الأكواد (1-100)');
      return;
    }

    try {
      await api.generatePrepaidCodes(amount, count);
      toast.success(`تم إنشاء ${count} كود شحن بنجاح`);
      setIsGenerateDialogOpen(false);
      fetchCodes();
    } catch (error) {
      console.error('Failed to generate codes', error);
      toast.error('فشل في إنشاء أكواد الشحن');
    }
  };

  const handleDeleteCode = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الكود؟')) {
      try {
        await api.deletePrepaidCode(id);
        setCodes(codes.filter(code => code.id !== id));
        toast.success('تم حذف الكود بنجاح');
      } catch (error) {
        console.error('Failed to delete code', error);
        toast.error('فشل في حذف الكود');
      }
    }
  };

  const downloadCodes = () => {
    if (codes.length === 0) {
      toast.error('لا توجد أكواد للتحميل');
      return;
    }

    const unusedCodes = codes.filter(code => !code.isUsed);
    if (unusedCodes.length === 0) {
      toast.error('لا توجد أكواد غير مستخدمة للتحميل');
      return;
    }

    const codesText = unusedCodes.map(code => 
      `كود: ${code.code}, القيمة: ${code.amount}$`
    ).join('\n');

    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prepaid-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('تم تحميل الأكواد بنجاح');
  };

  const columns: ColumnDef<PrepaidCode>[] = [
    {
      accessorKey: 'code',
      header: 'الكود',
    },
    {
      accessorKey: 'amount',
      header: 'القيمة',
      cell: ({ row }) => `${row.original.amount} $`
    },
    {
      accessorKey: 'isUsed',
      header: 'الحالة',
      cell: ({ row }) => (
        row.original.isUsed ? 
        <span className="text-red-500">مستخدم</span> : 
        <span className="text-green-500">متاح</span>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'تاريخ الإنشاء',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString()
    },
    {
      accessorKey: 'usedAt',
      header: 'تاريخ الاستخدام',
      cell: ({ row }) => row.original.usedAt ? new Date(row.original.usedAt).toLocaleDateString() : '-'
    },
    {
      id: 'actions',
      header: 'الإجراءات',
      cell: ({ row }) => (
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => handleDeleteCode(row.original.id)}
          disabled={row.original.isUsed}
        >
          حذف
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">إدارة أكواد الشحن</h1>
        <div className="space-x-2 flex">
          <Button onClick={() => setIsGenerateDialogOpen(true)}>
            <Plus className="h-4 w-4 ml-2" /> إنشاء أكواد جديدة
          </Button>
          <Button variant="outline" onClick={downloadCodes}>
            <Download className="h-4 w-4 ml-2" /> تحميل الأكواد
          </Button>
        </div>
      </div>
      
      <Card className="overflow-hidden">
        <DataTable 
          columns={columns} 
          data={codes} 
          loading={isLoading}
          onRefresh={fetchCodes}
        />
      </Card>
      
      {/* Generate Codes Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إنشاء أكواد شحن جديدة</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">قيمة الكود (بالدولار)</Label>
              <Input 
                id="amount"
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="count">عدد الأكواد</Label>
              <Input 
                id="count"
                type="number"
                min="1" 
                max="100"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">يمكنك إنشاء حتى 100 كود دفعة واحدة</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleGenerateCodes}>إنشاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrepaidCodes;
