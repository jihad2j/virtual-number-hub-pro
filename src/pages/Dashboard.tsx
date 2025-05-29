
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardStats from '@/components/dashboard/DashboardStats';
import { ShoppingBag, CreditCard, Settings, Users, PhoneCall, Wrench } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const userCards = [
    {
      title: 'شراء أرقام',
      description: 'اختر من مجموعة واسعة من الأرقام',
      icon: ShoppingBag,
      path: '/dashboard/countries',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'طلباتي',
      description: 'عرض جميع طلباتك السابقة',
      icon: PhoneCall,
      path: '/dashboard/orders',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'إدارة الرصيد',
      description: 'شحن رصيدك وعرض المعاملات',
      icon: CreditCard,
      path: '/dashboard/balance',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'خدمات التفعيل اليدوي',
      description: 'طلب خدمات التفعيل اليدوي',
      icon: Wrench,
      path: '/dashboard/services/manual-activation',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const adminCards = [
    {
      title: 'إدارة المستخدمين',
      description: 'عرض وإدارة جميع المستخدمين',
      icon: Users,
      path: '/dashboard/admin/users',
      color: 'from-red-500 to-red-600'
    },
    {
      title: 'إدارة الخدمات اليدوية',
      description: 'إضافة وتعديل خدمات التفعيل اليدوي',
      icon: Wrench,
      path: '/dashboard/admin/manual-services',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      title: 'طلبات التفعيل اليدوي',
      description: 'عرض والرد على طلبات التفعيل',
      icon: Settings,
      path: '/dashboard/admin/manual-requests',
      color: 'from-teal-500 to-teal-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>
          <p className="text-muted-foreground">مرحباً بك، {user?.username}</p>
        </div>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userCards.map((card, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className={`h-2 bg-gradient-to-r ${card.color}`} />
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex-1">
                <CardTitle className="text-lg">{card.title}</CardTitle>
                <CardDescription className="text-sm">{card.description}</CardDescription>
              </div>
              <card.icon className="h-8 w-8 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => navigate(card.path)}
              >
                الدخول
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {isAdmin && (
        <>
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">أدوات الإدارة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminCards.map((card, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${card.color}`} />
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{card.title}</CardTitle>
                      <CardDescription className="text-sm">{card.description}</CardDescription>
                    </div>
                    <card.icon className="h-8 w-8 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full" 
                      onClick={() => navigate(card.path)}
                    >
                      الدخول
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
