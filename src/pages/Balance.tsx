import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api, Transaction } from '@/services/api';
import { CreditCard, Plus, Gift, History } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistance } from 'date-fns';
import { ar } from 'date-fns/locale';

const Balance = () => {
  const { user, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isGiftDialogOpen, setIsGiftDialogOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [giftAmount, setGiftAmount] = useState('');
  const [giftRecipient, setGiftRecipient] = useState('');
  const [giftNote, setGiftNote] = useState('');
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const transactions = await api.getUserTransactions();
      console.log('Fetched transactions:', transactions);
      setTransactions(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('فشل في جلب سجل المعاملات');
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح');
      return;
    }

    setLoading(true);
    try {
      await api.createDepositTransaction(Number(depositAmount), 'card');
      toast.success('تم تقديم طلب الإيداع بنجاح');
      await refreshUserData();
      fetchTransactions();
      setIsDepositDialogOpen(false);
      setDepositAmount('');
    } catch (error) {
      console.error('Error making deposit:', error);
      toast.error('فشل في إجراء عملية الإيداع');
    } finally {
      setLoading(false);
    }
  };

  const handleGift = async () => {
    if (!giftAmount || isNaN(Number(giftAmount)) || Number(giftAmount) <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح');
      return;
    }

    if (!giftRecipient) {
      toast.error('الرجاء إدخال معرف المستلم');
      return;
    }

    setLoading(true);
    try {
      await api.giftBalance(giftRecipient, Number(giftAmount), giftNote);
      toast.success('تم إرسال الهدية بنجاح');
      await refreshUserData();
      fetchTransactions();
      setIsGiftDialogOpen(false);
      setGiftAmount('');
      setGiftRecipient('');
      setGiftNote('');
    } catch (error) {
      console.error('Error gifting balance:', error);
      toast.error('فشل في إرسال الهدية');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'إيداع';
      case 'purchase':
        return 'شراء';
      case 'gift_sent':
        return 'هدية مرسلة';
      case 'gift_received':
        return 'هدية مستلمة';
      case 'admin':
        return 'إداري';
      default:
        return type;
    }
  };

  const getTransactionStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'قيد المعالجة';
      case 'completed':
        return 'مكتمل';
      case 'failed':
        return 'فشل';
      default:
        return status;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'purchase':
        return <CreditCard className="h-4 w-4 text-red-500" />;
      case 'gift_sent':
        return <Gift className="h-4 w-4 text-blue-500" />;
      case 'gift_received':
        return <Gift className="h-4 w-4 text-purple-500" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };

  const getTransactionStatusClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionAmountClass = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'gift_received':
        return 'text-green-600';
      case 'purchase':
      case 'gift_sent':
        return 'text-red-600';
      default:
        return '';
    }
  };

  const getTransactionAmountSign = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'gift_received':
        return '+';
      case 'purchase':
      case 'gift_sent':
        return '-';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle>رصيدي</CardTitle>
          <CardDescription>الرصيد الحالي والعمليات المتاحة</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="text-4xl font-bold text-center mb-4">{user?.balance?.toFixed(2)} $</div>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={() => setIsDepositDialogOpen(true)}>
              <Plus className="ml-1 h-4 w-4" />
              إيداع رصيد
            </Button>
            <Button variant="outline" onClick={() => setIsGiftDialogOpen(true)}>
              <Gift className="ml-1 h-4 w-4" />
              إهداء رصيد
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Card */}
      <Card>
        <CardHeader>
          <CardTitle>سجل المعاملات</CardTitle>
          <CardDescription>آخر العمليات على حسابك</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTransactions ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>لا توجد معاملات سابقة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm"
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-gray-100 mr-3">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <div className="font-medium">{getTransactionTypeText(transaction.type)}</div>
                      <div className="text-xs text-gray-500">
                        {transaction.createdAt && formatDistance(
                          new Date(transaction.createdAt),
                          new Date(),
                          { addSuffix: true, locale: ar }
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className={getTransactionAmountClass(transaction.type)}>
                      {getTransactionAmountSign(transaction.type)}{transaction.amount?.toFixed(2)} $
                    </div>
                    <div className={`text-xs px-2 py-0.5 rounded-full ${getTransactionStatusClass(transaction.status || '')}`}>
                      {getTransactionStatusText(transaction.status || '')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" size="sm" onClick={fetchTransactions} disabled={loadingTransactions}>
            تحديث
          </Button>
        </CardFooter>
      </Card>

      {/* Deposit Dialog */}
      <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إيداع رصيد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">المبلغ (دولار)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                placeholder="أدخل المبلغ"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDepositDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleDeposit} disabled={loading}>
              {loading ? 'جاري التنفيذ...' : 'إيداع'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gift Dialog */}
      <Dialog open={isGiftDialogOpen} onOpenChange={setIsGiftDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إهداء رصيد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">معرف المستلم (البريد الإلكتروني أو اسم المستخدم)</Label>
              <Input
                id="recipient"
                placeholder="أدخل معرف المستلم"
                value={giftRecipient}
                onChange={(e) => setGiftRecipient(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gift-amount">المبلغ (دولار)</Label>
              <Input
                id="gift-amount"
                type="number"
                min="1"
                placeholder="أدخل المبلغ"
                value={giftAmount}
                onChange={(e) => setGiftAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">ملاحظة (اختياري)</Label>
              <Input
                id="note"
                placeholder="أدخل ملاحظة للمستلم"
                value={giftNote}
                onChange={(e) => setGiftNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGiftDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleGift} disabled={loading}>
              {loading ? 'جاري التنفيذ...' : 'إرسال الهدية'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Balance;
