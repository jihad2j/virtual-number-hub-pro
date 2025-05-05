
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Users, CreditCard, ShoppingCart, Activity } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { StatCards } from '@/components/admin/dashboard/StatCards';
import { SalesChart } from '@/components/admin/dashboard/SalesChart';
import { RecentTransactionsTable } from '@/components/admin/dashboard/RecentTransactionsTable';
import { Transaction, DashboardStats } from '@/types/Dashboard';

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats[]>([
    { title: 'إجمالي المستخدمين', value: '0', description: 'مستخدم', icon: <Users className="h-4 w-4 text-muted-foreground" /> },
    { title: 'إجمالي المبيعات', value: '0', description: 'ريال', icon: <CreditCard className="h-4 w-4 text-muted-foreground" /> },
    { title: 'عدد الطلبات', value: '0', description: 'طلب', icon: <ShoppingCart className="h-4 w-4 text-muted-foreground" /> },
    { title: 'معدل النمو', value: '0%', description: 'هذا الشهر', icon: <Activity className="h-4 w-4 text-muted-foreground" /> }
  ]);
  const [chartData, setChartData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const dashboardData = await api.getDashboardStats();
      
      // Update stats
      if (dashboardData.stats) {
        setStats([
          { 
            title: 'إجمالي المستخدمين', 
            value: dashboardData.stats.totalUsers.toString(), 
            description: 'مستخدم', 
            icon: <Users className="h-4 w-4 text-muted-foreground" /> 
          },
          { 
            title: 'إجمالي المبيعات', 
            value: formatCurrency(dashboardData.stats.totalSales), 
            description: 'ريال', 
            icon: <CreditCard className="h-4 w-4 text-muted-foreground" /> 
          },
          { 
            title: 'عدد الطلبات', 
            value: dashboardData.stats.totalOrders.toString(), 
            description: 'طلب', 
            icon: <ShoppingCart className="h-4 w-4 text-muted-foreground" /> 
          },
          { 
            title: 'معدل النمو', 
            value: `${dashboardData.stats.growthRate}%`, 
            description: 'هذا الشهر', 
            icon: <Activity className="h-4 w-4 text-muted-foreground" /> 
          }
        ]);
      }
      
      // Update chart data
      if (dashboardData.chartData) {
        setChartData(dashboardData.chartData);
      }
      
      // Update recent transactions
      if (dashboardData.recentTransactions) {
        setRecentTransactions(dashboardData.recentTransactions);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">لوحة التحكم</h1>
      
      <StatCards stats={stats} />
      <SalesChart chartData={chartData} />
      <RecentTransactionsTable 
        transactions={recentTransactions} 
        isLoading={isLoading} 
        onRefresh={fetchDashboardData} 
      />
    </div>
  );
};

export default AdminDashboard;
