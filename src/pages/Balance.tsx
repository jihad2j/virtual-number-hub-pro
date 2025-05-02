
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Transaction } from '@/types/Transaction';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Gift, RefreshCw, Ticket } from 'lucide-react';

const Balance = () => {
  const { user, refreshUserData } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isGiftDialogOpen, setIsGiftDialogOpen] = useState(false);
  const [isRedeemDialogOpen, setIsRedeemDialogOpen] = useState(false);
  
  // Form states
  const [depositAmount, setDepositAmount] = useState<number>(10);
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
  const [giftAmount, setGiftAmount] = useState<number>(5);
  const [giftRecipient, setGiftRecipient] = useState<string>('');
  const [giftNote, setGiftNote] = useState<string>('');
  const [redeemCode, setRedeemCode] = useState<string>('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await api.getUserTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
      toast.error('فشل في جلب المعاملات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (depositAmount <= 0) {
      toast.error('يرجى إدخال مبلغ صالح');
      return;
    }

    try {
      await api.createDepositTransaction(depositAmount, paymentMethod);
      await refreshUserData();
      fetchTransactions();
      setIsDepositDialogOpen(false);
      toast.success('تم إضافة الرصيد بنجاح');
    } catch (error) {
      console.error('Failed to deposit', error);
      toast.error('فشل في إضافة الرصيد');
    }
  };

  const handleGift = async () => {
    if (giftAmount <= 0) {
      toast.error('يرجى إدخال مبلغ صالح');
      return;
    }

    if (!giftRecipient) {
      toast.error('يرجى تحديد المستلم');
      return;
    }

    if (user && giftAmount > user.balance) {
      toast.error('رصيدك غير كافٍ');
      return;
    }

    try {
      await api.giftBalance(giftRecipient, giftAmount, giftNote);
      await refreshUserData();
      fetchTransactions();
      setIsGiftDialogOpen(false);
      toast.success('تم إرسال الهدية بنجاح');
    } catch (error) {
      console.error('Failed to send gift', error);
      toast.error('فشل في إرسال الهدية');
    }
  };

  const handleRedeemCode = async () => {
    if (!redeemCode.trim()) {
      toast.error('يرجى إدخال كود الشحن');
      return;
    }

    try {
      const result = await api.redeemPrepaidCode(redeemCode);
      await refreshUserData();
      fetchTransactions();
      setIsRedeemDialogOpen(false);
      toast.success(`تم شحن الرصيد بنجاح: ${result.amount}$`);
      setRedeemCode('');
    } catch (error) {
      console.error('Failed to redeem code', error);
      toast.error('كود الشحن غير صالح أو مستخدم بالفعل');
    }
  };

  const getTransactionTypeDisplay = (type: string) => {
    switch (type) {
      case 'deposit': return 'إيداع';
      case 'withdrawal': return 'سحب';
      case 'purchase': return 'شراء';
      case 'gift': return 'هدية';
      case 'refund': return 'استرداد';
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">مكتمل</Badge>;
      case 'pending':
        return <Badge variant="secondary">قيد المعالجة</Badge>;
      case 'failed':
        return <Badge variant="destructive">فشل</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">رصيدي</h1>

      {/* Current Balance and Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>رصيدك الحالي</CardTitle>
            <CardDescription>يمكنك استخدام هذا الرصيد لشراء أرقام جديدة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-600">
              {user?.balance || 0} $
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={() => setIsDepositDialogOpen(true)}>
                <CreditCard className="mr-2 h-4 w-4" /> شحن رصيد
              </Button>
              <Button variant="outline" onClick={() => setIsGiftDialogOpen(true)}>
                <Gift className="mr-2 h-4 w-4" /> إهداء رصيد
              </Button>
              <Button variant="outline" onClick={() => setIsRedeemDialogOpen(true)}>
                <Ticket className="mr-2 h-4 w-4" /> استخدام كود شحن
              </Button>
              <Button variant="ghost" onClick={() => fetchTransactions()}>
                <RefreshCw className="mr-2 h-4 w-4" /> تحديث
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>المعاملات الأخيرة</CardTitle>
          <CardDescription>سجل معاملاتك المالية</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">جاري التحميل...</p>
            </div>
          ) : transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-right">التاريخ</th>
                    <th className="py-2 px-4 text-right">النوع</th>
                    <th className="py-2 px-4 text-right">المبلغ</th>
                    <th className="py-2 px-4 text-right">الحالة</th>
                    <th className="py-2 px-4 text-right">الوصف</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">{new Date(transaction.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 px-4">{getTransactionTypeDisplay(transaction.type)}</td>
                      <td className={`py-2 px-4 ${transaction.type === 'purchase' || transaction.type === 'withdrawal' ? 'text-red-500' : 'text-green-500'}`}>
                        {transaction.type === 'purchase' || transaction.type === 'withdrawal' ? '-' : '+'}{transaction.amount} $
                      </td>
                      <td className="py-2 px-4">{getStatusBadge(transaction.status)}</td>
                      <td className="py-2 px-4">{transaction.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">لا توجد معاملات حتى الآن</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deposit Dialog */}
      <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>شحن رصيد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deposit-amount">المبلغ (بالدولار)</Label>
              <Input
                id="deposit-amount"
                type="number"
                min="5"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-method">طريقة الدفع</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="payment-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">بطاقة ائتمان</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDepositDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleDeposit}>تأكيد</Button>
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
              <Label htmlFor="gift-recipient">اسم المستخدم أو البريد الإلكتروني للمستلم</Label>
              <Input
                id="gift-recipient"
                value={giftRecipient}
                onChange={(e) => setGiftRecipient(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gift-amount">المبلغ (بالدولار)</Label>
              <Input
                id="gift-amount"
                type="number"
                min="1"
                max={user?.balance || 0}
                value={giftAmount}
                onChange={(e) => setGiftAmount(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">رصيدك الحالي: {user?.balance || 0} $</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gift-note">رسالة (اختياري)</Label>
              <Input
                id="gift-note"
                value={giftNote}
                onChange={(e) => setGiftNote(e.target.value)}
                placeholder="أضف رسالة مع الهدية"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGiftDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleGift}>إرسال الهدية</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Redeem Code Dialog */}
      <Dialog open={isRedeemDialogOpen} onOpenChange={setIsRedeemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>استخدام كود شحن</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="redeem-code">كود الشحن</Label>
              <Input
                id="redeem-code"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value)}
                placeholder="أدخل كود الشحن هنا"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRedeemDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleRedeemCode}>تأكيد</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Balance;
