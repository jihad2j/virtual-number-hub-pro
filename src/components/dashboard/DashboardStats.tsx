
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Phone, Globe, ShoppingCart } from 'lucide-react';

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  description: string;
  gradient: string;
}

const StatsCard = ({ icon, title, value, description, gradient }: StatsCardProps) => (
  <Card className="floating-card border-0 overflow-hidden">
    <div className={`h-1 bg-gradient-to-r ${gradient}`} />
    <CardContent className="p-6 relative">
      <div className="flex items-center justify-between mb-4">
        <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg glow-effect`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
        <div className="text-right">
          <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
          <p className="font-bold text-2xl text-white text-gradient">{value}</p>
          <p className="text-sm text-white/70 font-medium">{description}</p>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-8 translate-x-8"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-4 -translate-x-4"></div>
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
  const statsData = [
    {
      icon: <DollarSign className="h-7 w-7" />,
      title: "رصيدك",
      value: isLoadingBalance ? "جاري التحميل..." : balanceError ? "خطأ في جلب الرصيد" : balance !== null ? `${balance.toFixed(2)} RUB` : '0.00 RUB',
      description: "الرصيد المتاح",
      gradient: "from-purple-primary to-purple-secondary"
    },
    {
      icon: <Globe className="h-7 w-7" />,
      title: "الدول المتاحة",
      value: isLoadingCountries ? "جاري التحميل..." : countriesError ? "خطأ" : countriesCount,
      description: "دولة متاحة",
      gradient: "from-emerald-primary to-emerald-secondary"
    },
    {
      icon: <Phone className="h-7 w-7" />,
      title: "الأرقام المشتراة",
      value: purchasedNumbersCount,
      description: "رقم مشترى",
      gradient: "from-purple-accent to-emerald-primary"
    },
    {
      icon: <ShoppingCart className="h-7 w-7" />,
      title: "الطلبات النشطة",
      value: activePurchasesCount ? '1' : '0',
      description: "طلب نشط",
      gradient: "from-emerald-accent to-purple-primary"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
      {statsData.map((stat, index) => (
        <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
          <StatsCard {...stat} />
        </div>
      ))}
    </div>
  );
};
