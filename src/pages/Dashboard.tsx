
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { api } from '@/services/api';
import { CreditCard, ArrowLeft, Smartphone } from 'lucide-react';

// Import refactored components
import { SearchBar } from '@/components/dashboard/SearchBar';
import { BalanceCards } from '@/components/dashboard/BalanceCards';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { TransactionsList } from '@/components/dashboard/TransactionsList';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // States
  const [balance, setBalance] = useState<number | null>(null);
  const [points, setPoints] = useState<number>(85);
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

  return (
    <div className="space-y-6">
      {/* Search bar - Comment out if you want to hide it */}
      {/* <SearchBar /> */}
      
      {/* Balance and Points Cards */}
      <BalanceCards 
        balance={balance} 
        isLoadingProfile={isLoadingProfile} 
        points={points} 
      />
      
      {/* Quick Actions */}
      <QuickActions />
      
      {/* Recent Transactions */}
      <TransactionsList transactions={transactions} />
    </div>
  );
};

export default Dashboard;
