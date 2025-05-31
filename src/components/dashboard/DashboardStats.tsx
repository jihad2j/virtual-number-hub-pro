
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Phone, Globe, ShoppingCart } from 'lucide-react';

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  description: string;
}

const StatsCard = ({ icon, title, value, description }: StatsCardProps) => (
  <Card>
    <CardContent className="p-6 flex items-center gap-4">
      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="font-bold text-2xl">{value}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </CardContent>
  </Card>
);

interface DashboardStatsProps {
  balance: number | null;
  countriesCount: number;
  purchasedNumbersCount: number;
  activePurchasesCount: string | null;
  isLoadingBalance: boolean;
  isLoadingCountries: boolean;
  balanceError: string | null;
  countriesError: string | null;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  balance,
  countriesCount,
  purchasedNumbersCount,
  activePurchasesCount,
  isLoadingBalance,
  isLoadingCountries,
  balanceError,
  countriesError,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        icon={<DollarSign className="h-6 w-6 text-blue-500" />}
        title="رصيدك"
        value={isLoadingBalance ? "جاري التحميل..." : balanceError ? "خطأ في جلب الرصيد" : balance !== null ? `${balance.toFixed(2)} RUB` : '0.00 RUB'}
        description="الرصيد المتاح"
      />
      
      <StatsCard
        icon={<Globe className="h-6 w-6 text-green-500" />}
        title="الدول المتاحة"
        value={isLoadingCountries ? "جاري التحميل..." : countriesError ? "خطأ" : countriesCount}
        description="دولة متاحة"
      />
      
      <StatsCard
        icon={<Phone className="h-6 w-6 text-purple-500" />}
        title="الأرقام المشتراة"
        value={purchasedNumbersCount}
        description="رقم مشترى"
      />
      
      <StatsCard
        icon={<ShoppingCart className="h-6 w-6 text-orange-500" />}
        title="الطلبات النشطة"
        value={activePurchasesCount ? '1' : '0'}
        description="طلب نشط"
      />
    </div>
  );
};
