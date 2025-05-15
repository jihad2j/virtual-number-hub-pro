
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { api } from '@/services/api';
import { Transaction } from '@/types/Transaction';
import { useAuth } from '@/contexts/AuthContext';

const Balance = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [prepaidCode, setPrepaidCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const { currentUser, refreshUserData } = useAuth();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await api.getUserTransactions();
      console.log("User transactions:", data);
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('فشل في جلب سجل المعاملات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeemCode = async () => {
    if (!prepaidCode.trim()) {
      toast.error('يرجى إدخال كود صالح');
      return;
    }

    setIsRedeeming(true);
    try {
      const result = await api.redeemPrepaidCode(prepaidCode.trim());
      console.log("Redemption result:", result);
      
      toast.success(`تم شحن رصيدك بنجاح بقيمة ${result.amount}$`);
      setRedeemDialogOpen(false);
      setPrepaidCode('');
      
      // Refresh transactions and user data
      fetchTransactions();
      refreshUserData();
    } catch (error) {
      console.error('Error redeeming prepaid code:', error);
      toast.error('كود الشحن غير صالح أو تم استخدامه بالفعل');
    } finally {
      setIsRedeeming(false);
    }
  };

  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'تاريخ غير صالح';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return '➕';
      case 'withdrawal':
        return '➖';
      case 'purchase':
        return '🛒';
      case 'refund':
        return '↩️';
      default:
        return '💸';
    }
  };

  const getTransactionStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">مكتمل</span>;
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">معلق</span>;
      case 'failed':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">فاشل</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">رصيدي</h1>
        <div className="flex space-x-2">
          <Button onClick={() => setRedeemDialogOpen(true)} variant="outline">استخدام كود الشحن</Button>
          <Button onClick={fetchTransactions}>تحديث</Button>
        </div>
      </div>
      
      {/* Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle>الرصيد الحالي</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-4xl font-bold text-brand-600">${currentUser?.balance?.toFixed(2) || '0.00'}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Transactions History */}
      <Card>
        <CardHeader>
          <CardTitle>سجل المعاملات</CardTitle>
          <CardDescription>سجل كامل بالمعاملات على حسابك</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد معاملات حتى الآن
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-right">النوع</th>
                    <th className="px-4 py-2 text-right">المبلغ</th>
                    <th className="px-4 py-2 text-right">الوصف</th>
                    <th className="px-4 py-2 text-right">الحالة</th>
                    <th className="px-4 py-2 text-right">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <span className="mr-2">{getTransactionIcon(transaction.type)}</span>
                        {transaction.type === 'deposit' ? 'إيداع' :
                          transaction.type === 'withdrawal' ? 'سحب' :
                          transaction.type === 'purchase' ? 'شراء' :
                          transaction.type === 'refund' ? 'استرداد' : transaction.type}
                      </td>
                      <td className={`px-4 py-2 ${transaction.type === 'deposit' || transaction.type === 'refund' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'deposit' || transaction.type === 'refund' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-2">{transaction.description}</td>
                      <td className="px-4 py-2">{getTransactionStatusBadge(transaction.status)}</td>
                      <td className="px-4 py-2">{formatDate(transaction.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Redeem Code Dialog */}
      <Dialog open={redeemDialogOpen} onOpenChange={setRedeemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>استخدام كود الشحن</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label htmlFor="code">أدخل كود الشحن</Label>
            <Input 
              id="code" 
              value={prepaidCode} 
              onChange={(e) => setPrepaidCode(e.target.value)} 
              placeholder="مثال: ABC123DEF456"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setRedeemDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button 
              onClick={handleRedeemCode} 
              disabled={isRedeeming || !prepaidCode.trim()}
            >
              {isRedeeming ? 'جاري التنفيذ...' : 'تأكيد'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Balance;
