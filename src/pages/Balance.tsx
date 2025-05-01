
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction } from '@/types/Transaction';

const Balance = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const [isGiftDialogOpen, setIsGiftDialogOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState(10);
  const [paymentMethod, setPaymentMethod] = useState('paypal');
  const [redeemCode, setRedeemCode] = useState('');
  const [giftRecipient, setGiftRecipient] = useState('');
  const [giftAmount, setGiftAmount] = useState(5);
  const [giftNote, setGiftNote] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await api.getUserTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('فشل في جلب سجل المعاملات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (depositAmount < 5) {
      toast.error('الحد الأدنى للإيداع هو 5 دولار');
      return;
    }

    try {
      const transaction = await api.createDepositTransaction(depositAmount, paymentMethod);
      setTransactions([transaction, ...transactions]);
      toast.success(`تم إنشاء طلب الإيداع بنجاح. قيمة الإيداع: ${depositAmount}$`);
      setIsDepositDialogOpen(false);
    } catch (error) {
      console.error('Failed to create deposit:', error);
      toast.error('فشل في إنشاء طلب الإيداع');
    }
  };

  const handleRedeemCode = async () => {
    if (!redeemCode.trim()) {
      toast.error('يرجى إدخال كود الشحن');
      return;
    }

    try {
      const result = await api.redeemPrepaidCode(redeemCode);
      toast.success(`تم شحن رصيدك بنجاح: ${result.amount}$`);
      setIsCodeDialogOpen(false);
      setRedeemCode('');
      fetchTransactions();
    } catch (error) {
      console.error('Failed to redeem code:', error);
      toast.error('فشل في استخدام كود الشحن. تأكد من صحة الكود');
    }
  };

  const handleGiftBalance = async () => {
    if (!giftRecipient.trim()) {
      toast.error('يرجى إدخال اسم المستخدم أو البريد الإلكتروني للمستلم');
      return;
    }

    if (giftAmount < 1) {
      toast.error('الحد الأدنى للإهداء هو 1 دولار');
      return;
    }

    try {
      await api.giftBalance(giftRecipient, giftAmount, giftNote);
      toast.success(`تم إهداء ${giftAmount}$ إلى ${giftRecipient} بنجاح`);
      setIsGiftDialogOpen(false);
      setGiftRecipient('');
      setGiftAmount(5);
      setGiftNote('');
      fetchTransactions();
    } catch (error) {
      console.error('Failed to gift balance:', error);
      toast.error('فشل في إهداء الرصيد. تأكد من وجود المستلم ومن كفاية رصيدك');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">الرصيد والمعاملات</h1>
        <div className="flex space-x-2">
          <Button onClick={() => setIsGiftDialogOpen(true)} variant="outline" className="ml-2">
            إهداء رصيد
          </Button>
          <Button onClick={() => setIsCodeDialogOpen(true)} className="ml-2">
            استخدام كود شحن
          </Button>
          <Button onClick={() => setIsDepositDialogOpen(true)}>
            شحن الرصيد
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>رصيدك الحالي</CardTitle>
          <CardDescription>يمكنك استخدام هذا الرصيد لشراء الخدمات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-brand-600">
            {user?.balance || 0} $
          </div>
        </CardContent>
      </Card>
      
      <h2 className="text-xl font-bold mt-6">سجل المعاملات</h2>
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      ) : transactions.length > 0 ? (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <Card key={transaction.id} className="overflow-hidden">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    {transaction.type === 'deposit' && 'إيداع'}
                    {transaction.type === 'purchase' && 'شراء خدمة'}
                    {transaction.type === 'refund' && 'استرجاع'}
                    {transaction.type === 'manual' && 'خدمة يدوية'}
                    {transaction.type === 'withdrawal' && 'سحب'}
                    {transaction.type === 'gift_sent' && 'إهداء رصيد'}
                    {transaction.type === 'gift_received' && 'استلام هدية'}
                    {transaction.type === 'admin' && 'تعديل إداري'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.description || ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(transaction.createdAt || '').toLocaleDateString('ar-SA')}
                  </p>
                </div>
                <div className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount} $
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">لا توجد معاملات سابقة</p>
        </div>
      )}
      
      {/* Deposit Dialog */}
      <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>شحن الرصيد</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">المبلغ (بالدولار)</Label>
              <Input 
                id="amount"
                type="number"
                min="5"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-method">وسيلة الدفع</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="اختر وسيلة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="bank">التحويل البنكي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDepositDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleDeposit}>تأكيد الشحن</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Redeem Code Dialog */}
      <Dialog open={isCodeDialogOpen} onOpenChange={setIsCodeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>استخدام كود شحن</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">كود الشحن</Label>
              <Input 
                id="code"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value)}
                placeholder="أدخل كود الشحن هنا"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCodeDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleRedeemCode}>تفعيل الكود</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gift Balance Dialog */}
      <Dialog open={isGiftDialogOpen} onOpenChange={setIsGiftDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إهداء رصيد</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">المستلم</Label>
              <Input 
                id="recipient"
                value={giftRecipient}
                onChange={(e) => setGiftRecipient(e.target.value)}
                placeholder="اسم المستخدم أو البريد الإلكتروني"
              />
              <p className="text-xs text-muted-foreground">أدخل اسم المستخدم أو البريد الإلكتروني للمستلم</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gift-amount">المبلغ (بالدولار)</Label>
              <Input 
                id="gift-amount"
                type="number"
                min="1"
                value={giftAmount}
                onChange={(e) => setGiftAmount(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gift-note">ملاحظة (اختياري)</Label>
              <Input 
                id="gift-note"
                value={giftNote}
                onChange={(e) => setGiftNote(e.target.value)}
                placeholder="اكتب رسالة مع الهدية"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGiftDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleGiftBalance}>تأكيد الإهداء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Balance;
