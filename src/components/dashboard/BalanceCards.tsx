
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Activity } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface BalanceCardsProps {
  balance: number | null;
  isLoadingProfile: boolean;
  points: number;
}

export const BalanceCards: React.FC<BalanceCardsProps> = ({ 
  balance, 
  isLoadingProfile,
  points
}) => {
  const { toast } = useToast();
  
  const handleViewServices = () => {
    window.location.href = '/dashboard/countries';
  };
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="p-4 orange-card rounded-2xl">
        <div className="flex justify-between items-start mb-2">
          <Activity className="h-6 w-6" />
          <div className="text-right">
            <div className="text-sm opacity-90">الخدمات المتاحة</div>
            <div className="font-bold text-2xl">{points.toLocaleString()}</div>
          </div>
        </div>
        <div className="mt-4">
          <Button 
            className="w-full bg-white text-app-orange hover:bg-gray-100 rounded-full"
            onClick={handleViewServices}
          >
            عرض الخدمات
          </Button>
        </div>
      </Card>
      
      <Card className="p-4 blue-card rounded-2xl">
        <div className="flex justify-between items-start mb-2">
          <DollarSign className="h-6 w-6" />
          <div className="text-right">
            <div className="text-sm opacity-90">الرصيد</div>
            <div className="font-bold text-2xl">
              {isLoadingProfile ? '...' : 
               balance !== null ? `${balance.toFixed(0)} ر.س` : '0 ر.س'}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Button 
            className="w-full bg-white text-app-blue hover:bg-gray-100 rounded-full"
            onClick={() => window.location.href = '/dashboard/balance'}
          >
            عرض التفاصيل
          </Button>
        </div>
      </Card>
    </div>
  );
};
