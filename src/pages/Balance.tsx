
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { api, Transaction } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDown, ArrowUp, Calendar, Wallet } from 'lucide-react';

const Balance = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddFundsDialog, setShowAddFundsDialog] = useState(false);
  const [amount, setAmount] = useState('');
  const [showGiftDialog, setShowGiftDialog] = useState(false);
  const [giftAmount, setGiftAmount] = useState('');
  const [recipientId, setRecipientId] = useState('');

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('فشل في جلب المعاملات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFunds = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح');
      return;
    }

    try {
      await api.addFunds(parseFloat(amount), 'manual');
      toast.success('تم إرسال طلب الإيداع بنجاح');
      setShowAddFundsDialog(false);
      setAmount('');
      fetchTransactions();
    } catch (error) {
      console.error('Error adding funds:', error);
      toast.error('فشل في إضافة الرصيد');
    }
  };

  const handleGiftBalance = async () => {
    if (!giftAmount || isNaN(parseFloat(giftAmount)) || parseFloat(giftAmount) <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح');
      return;
    }

    if (!recipientId) {
      toast.error('الرجاء إدخال معرف المستلم');
      return;
    }

    try {
      await api.giftBalance(recipientId, parseFloat(giftAmount));
      toast.success('تم إرسال الرصيد بنجاح');
      setShowGiftDialog(false);
      setGiftAmount('');
      setRecipientId('');
      fetchTransactions();
    } catch (error) {
      console.error('Error gifting balance:', error);
      toast.error('فشل في إرسال الرصيد');
    }
  };

  const getTransactionTypeDetails = (type: string) => {
    switch (type) {
      case 'deposit':
        return { 
          icon: <ArrowDown className="h-5 w-5 text-green-500" />, 
          text: 'إيداع',
          class: 'text-green-600'
        };
      case 'withdrawal':
        return { 
          icon: <ArrowUp className="h-5 w-5 text-red-500" />, 
          text: 'سحب',
          class: 'text-red-600'
        };
      case 'purchase':
        return { 
          icon: <Wallet className="h-5 w-5 text-blue-500" />, 
          text: 'شراء',
          class: 'text-blue-600'
        };
      case 'gift':
        return { 
          icon: <Wallet className="h-5 w-5 text-purple-500" />, 
          text: 'هدية',
          class: 'text-purple-600'
        };
      case 'refund':
        return { 
          icon: <ArrowDown className="h-5 w-5 text-yellow-500" />, 
          text: 'استرداد',
          class: 'text-yellow-600'
        };
      default:
        return { 
          icon: <Wallet className="h-5 w-5 text-gray-500" />, 
          text: 'معاملة',
          class: 'text-gray-600'
        };
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-xl mt-8">يرجى تسجيل الدخول لعرض رصيد حسابك</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">رصيد حسابك</h1>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button onClick={() => setShowGiftDialog(true)}>
            إهداء رصيد
          </Button>
          <Button onClick={() => setShowAddFundsDialog(true)}>
            إضافة رصيد
          </Button>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-brand-600" />
            <CardTitle>الرصيد الحالي</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center p-8">
            <div className="text-4xl font-bold text-brand-600">
              {user.balance?.toFixed(2)} ريال
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">جميع المعاملات</TabsTrigger>
          <TabsTrigger value="deposits">الإيداعات</TabsTrigger>
          <TabsTrigger value="purchases">المشتريات</TabsTrigger>
          <TabsTrigger value="gifts">الهدايا</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {renderTransactions(transactions)}
        </TabsContent>
        
        <TabsContent value="deposits">
          {renderTransactions(transactions.filter(t => t.type === 'deposit' || t.type === 'refund'))}
        </TabsContent>
        
        <TabsContent value="purchases">
          {renderTransactions(transactions.filter(t => t.type === 'purchase'))}
        </TabsContent>
        
        <TabsContent value="gifts">
          {renderTransactions(transactions.filter(t => t.type === 'gift'))}
        </TabsContent>
      </Tabs>

      {/* Add Funds Dialog */}
      <Dialog open={showAddFundsDialog} onOpenChange={setShowAddFundsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة رصيد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">المبلغ (ريال)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="أدخل المبلغ"
                min="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddFundsDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddFunds}>
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gift Balance Dialog */}
      <Dialog open={showGiftDialog} onOpenChange={setShowGiftDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إهداء رصيد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">معرف المستخدم المستلم</Label>
              <Input
                id="recipient"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                placeholder="أدخل معرف المستخدم المستلم"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gift-amount">المبلغ (ريال)</Label>
              <Input
                id="gift-amount"
                type="number"
                value={giftAmount}
                onChange={(e) => setGiftAmount(e.target.value)}
                placeholder="أدخل المبلغ"
                min="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGiftDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleGiftBalance}>
              إرسال
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
  
  function renderTransactions(transactionsToRender: Transaction[]) {
    if (isLoading) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      );
    }
    
    if (transactionsToRender.length === 0) {
      return (
        <Card>
          <CardContent className="flex justify-center items-center p-12">
            <p className="text-gray-500">لا توجد معاملات</p>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="space-y-4">
        {transactionsToRender.map((transaction) => {
          const typeDetails = getTransactionTypeDetails(transaction.type);
          
          return (
            <Card key={transaction.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {typeDetails.icon}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${typeDetails.class}`}>{typeDetails.text}</h3>
                      <p className="text-sm text-gray-500">{transaction.description || '-'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${transaction.type === 'purchase' || transaction.type === 'withdrawal' || (transaction.type === 'gift' && transaction.amount < 0) ? 'text-red-600' : 'text-green-600'}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount} ريال
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 ml-1" />
                      {formatDate(transaction.createdAt)}
                    </div>
                  </div>
                </div>
                {transaction.status !== 'completed' && (
                  <div className={`mt-2 text-xs px-2 py-1 rounded-full w-fit ${
                    transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.status === 'pending' ? 'قيد المعالجة' : 'فشلت'}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }
};

export default Balance;
