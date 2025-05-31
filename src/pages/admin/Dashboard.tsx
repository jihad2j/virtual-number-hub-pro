
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Users, CreditCard, ShoppingCart, Activity, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { DashboardStatsCards } from '@/components/admin/DashboardStatsCards';
import { SalesOverviewChart } from '@/components/admin/SalesOverviewChart';
import { RecentTransactionsTable } from '@/components/admin/RecentTransactionsTable';
import { Transaction } from '@/types/Transaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminDashboard = () => {
  const [stats, setStats] = useState([
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
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 relative">
          <div className="absolute inset-0 bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="w-full h-full flex items-center justify-center">
              <TrendingUp className="w-10 h-10 text-orange-500" />
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">لوحة التحكم الإدارية</h1>
        <p className="text-gray-600 text-lg">إحصائيات وتقارير النظام</p>
      </div>

      <div className="border-gradient-colorful">
        <Card className="bg-white shadow-xl border-0 rounded-2xl">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-xl text-gray-800">
              <TrendingUp className="h-6 w-6 text-blue-500" />
              نظرة عامة على الإحصائيات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardStatsCards stats={stats} />
            <div className="mt-8">
              <SalesOverviewChart chartData={chartData} />
            </div>
            <div className="mt-8">
              <RecentTransactionsTable 
                transactions={recentTransactions} 
                isLoading={isLoading} 
                onRefresh={fetchDashboardData}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
