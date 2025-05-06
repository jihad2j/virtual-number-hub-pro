import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, CreditCard, ShoppingCart, Activity } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { formatCurrency } from '@/lib/utils';
import { Transaction } from '@/types/Transaction';

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

  const renderStatCards = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderChart = () => {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>نظرة عامة على المبيعات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  };

  const transactionColumns = [
    {
      accessorKey: 'id',
      header: 'رقم العملية',
    },
    {
      accessorKey: 'username',
      header: 'المستخدم',
    },
    {
      accessorKey: 'amount',
      header: 'المبلغ',
      cell: ({ row }) => formatCurrency(row.original.amount),
    },
    {
      accessorKey: 'type',
      header: 'النوع',
      cell: ({ row }) => {
        const typeMap = {
          deposit: 'إيداع',
          withdrawal: 'سحب',
          purchase: 'شراء',
          refund: 'استرداد',
          gift: 'هدية',
          manual: 'يدوي',
          admin: 'إداري',
        };
        return typeMap[row.original.type] || row.original.type;
      },
    },
    {
      accessorKey: 'status',
      header: 'الحالة',
      cell: ({ row }) => {
        const statusMap = {
          pending: 'قيد الانتظار',
          completed: 'مكتمل',
          cancelled: 'ملغي',
          failed: 'فشل',
        };
        return statusMap[row.original.status] || row.original.status;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'التاريخ',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString('ar-SA'),
    },
  ];

  const renderRecentTransactions = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>أحدث المعاملات</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={transactionColumns} 
            data={recentTransactions} 
            loading={isLoading}
            onRefresh={fetchDashboardData}
          />
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">لوحة التحكم</h1>
      
      {renderStatCards()}
      {renderChart()}
      {renderRecentTransactions()}
    </div>
  );
};

export default AdminDashboard;
