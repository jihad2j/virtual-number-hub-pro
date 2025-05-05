
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { DollarSign, CreditCard, Star, Smartphone, Grid, Zap, ArrowLeft, ArrowDown, ArrowUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { api } from '@/services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // States
  const [balance, setBalance] = useState<number | null>(null);
  const [points, setPoints] = useState<number>(1850);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [transactions, setTransactions] = useState([
    { id: 1, title: 'متجر إلكترونيات', amount: -250, type: 'purchase', date: 'اليوم 10:45 ص', icon: <CreditCard className="h-5 w-5 text-white" /> },
    { id: 2, title: 'تحويل من صديق', amount: 500, type: 'transfer', date: 'بالأمس 3:20 م', icon: <ArrowLeft className="h-5 w-5 text-white" /> },
    { id: 3, title: 'شحن رصيد', amount: -100, type: 'mobile', date: 'بالأمس 11:15 ص', icon: <Smartphone className="h-5 w-5 text-white" /> },
  ]);

  // Fetch user profile on mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Fetch user profile
  const fetchUserProfile = async () => {
    setIsLoadingProfile(true);
    
    try {
      const userData = await api.getCurrentUser();
      setBalance(userData.balance);
    } catch (error) {
      console.error('Failed to fetch user profile', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب بيانات المستخدم",
        variant: "destructive"
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };
  
  // Handle exchange points
  const handleExchangePoints = () => {
    toast({
      title: "تم الإرسال",
      description: "تم إرسال طلب استبدال النقاط بنجاح"
    });
  };

  // Render transaction icon based on type
  const renderTransactionIcon = (type, icon) => {
    const bgColorClass = type === 'purchase' ? 'bg-red-500' : 
                         type === 'transfer' ? 'bg-green-500' : 
                         'bg-blue-500';
    
    return (
      <div className={`${bgColorClass} rounded-full p-2`}>
        {icon}
      </div>
    );
  };

  // Render transaction amount with proper styling
  const renderTransactionAmount = (amount) => {
    const isPositive = amount > 0;
    return (
      <div className={`font-bold ${isPositive ? 'transaction-positive' : 'transaction-negative'}`}>
        {isPositive ? `+ ${amount}` : `- ${Math.abs(amount)}`} ر.س
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="search-bar flex items-center px-4 py-2.5">
        <Search className="h-5 w-5 text-gray-400 ml-2" />
        <input
          type="text"
          placeholder="ابحث هنا..."
          className="w-full bg-transparent border-none focus:outline-none text-right text-gray-700"
        />
      </div>
      
      {/* Balance and Points Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 orange-card rounded-2xl">
          <div className="flex justify-between items-start mb-2">
            <Star className="h-6 w-6" />
            <div className="text-right">
              <div className="text-sm opacity-90">النقاط</div>
              <div className="font-bold text-2xl">1,850 نقطة</div>
            </div>
          </div>
          <div className="mt-4">
            <Button 
              className="w-full bg-white text-app-orange hover:bg-gray-100 rounded-full"
              onClick={handleExchangePoints}
            >
              استبدال النقاط
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
      
      {/* Quick Actions */}
      <div>
        <h2 className="font-bold text-lg mb-3">أدوات سريعة</h2>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="flex flex-col items-center">
            <div className="quick-action-icon quick-action-orange">
              <Grid className="h-5 w-5 text-orange-500" />
            </div>
            <span className="text-xs">مسح</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="quick-action-icon quick-action-purple">
              <Zap className="h-5 w-5 text-purple-500" />
            </div>
            <span className="text-xs">فواتير</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="quick-action-icon quick-action-green">
              <Smartphone className="h-5 w-5 text-green-500" />
            </div>
            <span className="text-xs">شحن</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="quick-action-icon quick-action-blue">
              <ArrowLeft className="h-5 w-5 text-blue-500" />
            </div>
            <span className="text-xs">تحويل</span>
          </div>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <Button 
            variant="link" 
            className="text-app-blue p-0" 
            onClick={() => window.location.href = '/dashboard/balance'}
          >
            عرض الكل
          </Button>
          <h2 className="font-bold text-lg">آخر العمليات</h2>
        </div>
        
        <div className="space-y-3">
          {transactions.map(transaction => (
            <div key={transaction.id} className="bg-white p-3 rounded-xl flex justify-between items-center shadow-sm">
              <div className="flex items-center">
                {renderTransactionIcon(transaction.type, transaction.icon)}
                <div className="mr-3">
                  <div className="font-medium">{transaction.title}</div>
                  <div className="text-xs text-gray-500">{transaction.date}</div>
                </div>
              </div>
              {renderTransactionAmount(transaction.amount)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
