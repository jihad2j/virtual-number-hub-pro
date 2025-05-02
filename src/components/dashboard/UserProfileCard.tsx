
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

export interface UserProfileData {
  id?: number;
  email?: string;
  balance: number;
  rating?: number;
  default_country?: {
    name: string;
    iso: string;
    prefix: string;
  };
}

interface UserProfileCardProps {
  userProfile: UserProfileData | null;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({ userProfile }) => {
  if (!userProfile) return null;
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>معلومات الحساب</CardTitle>
        <CardDescription>بيانات حساب المزود</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {userProfile.email && (
            <div>
              <p className="text-sm text-gray-500">البريد الإلكتروني</p>
              <p className="font-bold">{userProfile.email}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-500">الرصيد</p>
            <p className="font-bold">{userProfile.balance.toFixed(2)} RUB</p>
          </div>
          {userProfile.rating !== undefined && (
            <div>
              <p className="text-sm text-gray-500">التقييم</p>
              <p className="font-bold">{userProfile.rating} / 96</p>
            </div>
          )}
          {userProfile.default_country && (
            <div>
              <p className="text-sm text-gray-500">الدولة الافتراضية</p>
              <p className="font-bold">{userProfile.default_country.name} ({userProfile.default_country.prefix})</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
