
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhoneNumber } from '@/types/PhoneNumber';

interface PhoneNumberDetailsProps {
  purchasedNumber: PhoneNumber | null;
  onCancel: (id: string) => Promise<void>;
  onUpdate: (id: string) => Promise<void>;
}

export const PhoneNumberDetails: React.FC<PhoneNumberDetailsProps> = ({
  purchasedNumber,
  onCancel,
  onUpdate,
}) => {
  if (!purchasedNumber) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>الرقم المشترى</CardTitle>
        <CardDescription>تفاصيل الرقم الذي تم شراؤه</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-4 border rounded-lg bg-green-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">الرقم</p>
              <p className="font-bold text-xl">{purchasedNumber.number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">البلد</p>
              <p className="font-bold">{purchasedNumber.countryName || purchasedNumber.countryId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">الخدمة</p>
              <p className="font-bold">{purchasedNumber.service}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">تاريخ الشراء</p>
              <p className="font-bold">{new Date(purchasedNumber.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">الحالة</p>
              <p className="font-bold">{purchasedNumber.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">تاريخ الانتهاء</p>
              <p className="font-bold">{new Date(purchasedNumber.expiresAt).toLocaleString()}</p>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <p className="font-bold">الرسائل المستلمة</p>
            {purchasedNumber.smsCode ? (
              <div className="border p-3 rounded-lg">
                <p className="font-bold text-green-600">الكود: {purchasedNumber.smsCode}</p>
              </div>
            ) : (
              <p className="text-gray-500">لم يتم استلام أي رسائل بعد</p>
            )}
          </div>
          
          <div className="mt-4 space-x-2 flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => onCancel(purchasedNumber.id)}
            >
              إلغاء الرقم
            </Button>
            <Button 
              onClick={() => onUpdate(purchasedNumber.id)}
            >
              تحديث البيانات
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
