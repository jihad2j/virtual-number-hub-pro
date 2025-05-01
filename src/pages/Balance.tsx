
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { DollarSign, CreditCard, History, Gift, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Balance = () => {
  const { user, refreshUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [prepaidCode, setPrepaidCode] = useState('');
  const [isRedeemingCode, setIsRedeemingCode] = useState(false);
  const [giftAmount, setGiftAmount] = useState('');
  const [giftRecipient, setGiftRecipient] = useState('');
  const [isGifting, setIsGifting] = useState(false);
  const [openGiftDialog, setOpenGiftDialog] = useState(false);
  const [openRedeemDialog, setOpenRedeemDialog] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setIsLoadingTransactions(true);
    try {
      const data = await api.getUserTransactions();
      setTransactions(data || []);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const handleAddFunds = async (method: 'card' | 'paypal') => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('الرجاء إدخال مبلغ صالح');
      return;
    }

    setIsLoading(true);
    try {
      await api.createDepositTransaction(Number(amount), method);
      toast.success(`تمت إضافة $${amount} إلى رصيدك بنجاح`);
      setAmount('');
      fetchTransactions();
      refreshUser(); // Update user balance in context
    } catch (error) {
      console.error('Failed to add funds', error);
      toast.error('حدث خطأ أثناء إضافة الرصيد');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeemCode = async () => {
    if (!prepaidCode.trim()) {
      toast.error('الرجاء إدخال كود الشحن');
      return;
    }

    setIsRedeemingCode(true);
    try {
      const result = await api.redeemPrepaidCode(prepaidCode.trim());
      toast.success(`تم شحن رصيدك بمبلغ $${result.amount} بنجاح`);
      setPrepaidCode('');
      setOpenRedeemDialog(false);
      fetchTransactions();
      refreshUser(); // Update user balance in context
    } catch (error) {
      console.error('Failed to redeem code', error);
      toast.error('كود الشحن غير صالح أو تم استخدامه بالفعل');
    } finally {
      setIsRedeemingCode(false);
    }
  };

  const handleGiftBalance = async () => {
    if (!giftAmount || isNaN(Number(giftAmount)) || Number(giftAmount) <= 0) {
      toast.error('الرجاء إدخال مبلغ صالح');
      return;
    }

    if (!giftRecipient.trim()) {
      toast.error('الرجاء إدخال معرف المستخدم المستلم');
      return;
    }

    if (Number(giftAmount) > (user?.balance || 0)) {
      toast.error('رصيدك غير كافٍ لإتمام هذه العملية');
      return;
    }

    setIsGifting(true);
    try {
      await api.giftBalance(giftRecipient.trim(), Number(giftAmount));
      toast.success(`تم إرسال $${giftAmount} إلى المستخدم ${giftRecipient} بنجاح`);
      setGiftAmount('');
      setGiftRecipient('');
      setOpenGiftDialog(false);
      fetchTransactions();
      refreshUser(); // Update user balance in context
    } catch (error) {
      console.error('Failed to gift balance', error);
      toast.error('فشل في إرسال الرصيد. تأكد من معرف المستخدم');
    } finally {
      setIsGifting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <div className="mb-6 text-center">
              <DollarSign className="h-12 w-12 mx-auto text-brand-500" />
              <h2 className="text-2xl font-bold mt-2">رصيدك الحالي</h2>
              <p className="text-4xl font-bold text-brand-600 mt-2">${user?.balance?.toFixed(2)}</p>
            </div>
            
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => document.getElementById('add-funds')?.scrollIntoView({ behavior: 'smooth' })}
              >
                إضافة رصيد
              </Button>
              
              <Dialog open={openGiftDialog} onOpenChange={setOpenGiftDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="outline">
                    <Gift className="ml-2 h-4 w-4" />
                    إهداء رصيد
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إهداء رصيد لمستخدم آخر</DialogTitle>
                    <DialogDescription>
                      أدخل معرف المستخدم والمبلغ الذي ترغب في إهدائه
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="username">معرف المستخدم المستلم</Label>
                      <Input
                        id="username"
                        placeholder="أدخل اسم المستخدم أو البريد الإلكتروني"
                        value={giftRecipient}
                        onChange={(e) => setGiftRecipient(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="gift-amount">المبلغ (بالدولار)</Label>
                      <Input
                        id="gift-amount"
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="أدخل المبلغ"
                        value={giftAmount}
                        onChange={(e) => setGiftAmount(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        أقصى مبلغ متاح: ${user?.balance?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleGiftBalance} 
                      disabled={isGifting}
                    >
                      {isGifting ? 'جاري المعالجة...' : 'إرسال الهدية'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog open={openRedeemDialog} onOpenChange={setOpenRedeemDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="outline">
                    <CreditCard className="ml-2 h-4 w-4" />
                    استخدام كود شحن
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>استخدام كود شحن</DialogTitle>
                    <DialogDescription>
                      أدخل كود الشحن لإضافة الرصيد إلى حسابك
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="prepaid-code">كود الشحن</Label>
                      <Input
                        id="prepaid-code"
                        placeholder="أدخل كود الشحن"
                        value={prepaidCode}
                        onChange={(e) => setPrepaidCode(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleRedeemCode} 
                      disabled={isRedeemingCode}
                    >
                      {isRedeemingCode ? 'جاري المعالجة...' : 'تأكيد'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  refreshUser();
                  toast.success("تم تحديث رصيدك بنجاح");
                }}
              >
                <RefreshCcw className="ml-2 h-4 w-4" />
                تحديث الرصيد
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2" id="add-funds">
          <CardHeader>
            <CardTitle>إضافة رصيد</CardTitle>
            <CardDescription>أضف رصيدًا إلى حسابك لشراء أرقام افتراضية</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="card">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="card">بطاقة الائتمان</TabsTrigger>
                <TabsTrigger value="paypal">PayPal</TabsTrigger>
              </TabsList>
              
              <TabsContent value="card" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">المبلغ (بالدولار)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    placeholder="أدخل المبلغ"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="card-number">رقم البطاقة</Label>
                  <Input
                    id="card-number"
                    placeholder="xxxx xxxx xxxx xxxx"
                    className="ltr"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">تاريخ الانتهاء</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      className="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      className="ltr"
                    />
                  </div>
                </div>
                
                <Button 
                  className="w-full gradient-bg mt-4"
                  onClick={() => handleAddFunds('card')}
                  disabled={isLoading}
                >
                  {isLoading ? 'جاري المعالجة...' : 'إضافة الرصيد'}
                </Button>
              </TabsContent>
              
              <TabsContent value="paypal" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="paypal-amount">المبلغ (بالدولار)</Label>
                  <Input
                    id="paypal-amount"
                    type="number"
                    min="1"
                    placeholder="أدخل المبلغ"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md text-center">
                  <p className="mb-2">سيتم تحويلك إلى PayPal لإتمام عملية الدفع</p>
                  <CreditCard className="h-12 w-12 mx-auto text-brand-500" />
                </div>
                
                <Button 
                  className="w-full gradient-bg mt-4"
                  onClick={() => handleAddFunds('paypal')}
                  disabled={isLoading}
                >
                  {isLoading ? 'جاري المعالجة...' : 'الدفع عبر PayPal'}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            سجل المعاملات
          </CardTitle>
          <CardDescription>تاريخ معاملاتك المالية</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTransactions ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>لا توجد معاملات حتى الآن</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-right">التاريخ</th>
                    <th className="py-2 px-4 text-right">النوع</th>
                    <th className="py-2 px-4 text-right">الوصف</th>
                    <th className="py-2 px-4 text-right">المبلغ</th>
                    <th className="py-2 px-4 text-right">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(transaction => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {new Date(transaction.createdAt).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          transaction.type === 'deposit' 
                            ? 'bg-green-100 text-green-800' 
                            : transaction.type === 'gift_sent'
                            ? 'bg-purple-100 text-purple-800'
                            : transaction.type === 'gift_received'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {transaction.type === 'deposit' ? 'إيداع' : 
                           transaction.type === 'purchase' ? 'شراء' :
                           transaction.type === 'gift_sent' ? 'هدية مرسلة' :
                           transaction.type === 'gift_received' ? 'هدية مستلمة' :
                           transaction.type === 'redeem' ? 'استخدام كود' : 
                           transaction.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">{transaction.description}</td>
                      <td className="py-3 px-4">
                        <span className={
                          transaction.type === 'deposit' || transaction.type === 'gift_received' || transaction.type === 'redeem' 
                            ? 'text-green-600' 
                            : 'text-blue-600'
                        }>
                          {transaction.type === 'deposit' || transaction.type === 'gift_received' || transaction.type === 'redeem' 
                            ? '+' 
                            : '-'}${transaction.amount?.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          transaction.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status === 'completed' ? 'مكتمل' : 
                           transaction.status === 'pending' ? 'قيد المعالجة' : 'فشل'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Balance;
