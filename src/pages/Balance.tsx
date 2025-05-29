
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Plus, CreditCard } from 'lucide-react';

export default function Balance() {
  const { user } = useAuth();

  const handleAddFunds = () => {
    // Add funds logic here
    console.log('Adding funds...');
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">رصيدي</h1>
        <Button onClick={handleAddFunds} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          إضافة رصيد
        </Button>
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
    </div>
  );
}
