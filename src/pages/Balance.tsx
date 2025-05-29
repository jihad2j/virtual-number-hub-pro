
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Wallet, Plus, CreditCard, Gift } from 'lucide-react';
import { transactionApi } from '@/services/api/transactionApi';
import { toast } from 'sonner';

export default function Balance() {
  const { user } = useAuth();
  const [isGiftDialogOpen, setIsGiftDialogOpen] = useState(false);
  const [giftRecipient, setGiftRecipient] = useState('');
  const [giftAmount, setGiftAmount] = useState('');
  const [giftNote, setGiftNote] = useState('');
  const [isGifting, setIsGifting] = useState(false);

  const handleAddFunds = () => {
    // Add funds logic here
    console.log('Adding funds...');
  };

  const handleGiftBalance = async () => {
    if (!giftRecipient || !giftAmount) {
      toast.error('يرجى إدخال معرف المستلم والمبلغ');
      return;
    }

    const amount = parseFloat(giftAmount);
    if (amount <= 0) {
      toast.error('يرجى إدخال مبلغ صالح');
      return;
    }

    if (user && user.balance < amount) {
      toast.error('رصيدك غير كافٍ لإتمام هذه العملية');
      return;
    }

    setIsGifting(true);
    try {
      await transactionApi.giftBalance(giftRecipient, amount, giftNote);
      toast.success('تم إهداء الرصيد بنجاح');
      setIsGiftDialogOpen(false);
      setGiftRecipient('');
      setGiftAmount('');
      setGiftNote('');
      // Refresh page or update user balance
      window.location.reload();
    } catch (error) {
      console.error('Gift balance error:', error);
      toast.error('فشل في إهداء الرصيد. يرجى المحاولة مرة أخرى');
    } finally {
      setIsGifting(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">رصيدي</h1>
        <div className="flex gap-2">
          <Button onClick={handleAddFunds} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            إضافة رصيد
          </Button>
          <Button 
            onClick={() => setIsGiftDialogOpen(true)} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <Gift className="h-4 w-4" />
            إهداء رصيد
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الرصيد الحالي</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${user?.balance || 0}</div>
            <p className="text-xs text-muted-foreground">
              آخر تحديث منذ دقيقة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المصروفات هذا الشهر</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0</div>
            <p className="text-xs text-muted-foreground">
              +0% من الشهر الماضي
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تاريخ المعاملات</CardTitle>
          <CardDescription>
            آخر المعاملات المالية الخاصة بك
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">لا توجد معاملات حتى الآن</p>
        </CardContent>
      </Card>

      {/* Gift Balance Dialog */}
      <Dialog open={isGiftDialogOpen} onOpenChange={setIsGiftDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              إهداء رصيد
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">معرف المستلم (اسم المستخدم أو البريد الإلكتروني)</Label>
              <Input
                id="recipient"
                value={giftRecipient}
                onChange={(e) => setGiftRecipient(e.target.value)}
                placeholder="اسم المستخدم أو البريد الإلكتروني"
                className="text-right"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">المبلغ ($)</Label>
              <Input
                id="amount"
                type="number"
                value={giftAmount}
                onChange={(e) => setGiftAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="text-right"
              />
              <p className="text-sm text-muted-foreground">
                رصيدك الحالي: ${user?.balance || 0}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="note">ملاحظة (اختيارية)</Label>
              <Textarea
                id="note"
                value={giftNote}
                onChange={(e) => setGiftNote(e.target.value)}
                placeholder="اكتب رسالة للمستلم..."
                className="text-right"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsGiftDialogOpen(false)}
              disabled={isGifting}
            >
              إلغاء
            </Button>
            <Button 
              onClick={handleGiftBalance}
              disabled={isGifting || !giftRecipient || !giftAmount}
              className="flex items-center gap-2"
            >
              {isGifting ? (
                <>جاري الإرسال...</>
              ) : (
                <>
                  <Gift className="h-4 w-4" />
                  إهداء الرصيد
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
