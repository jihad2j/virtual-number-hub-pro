
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { ShoppingBag, CreditCard, Settings, Users, PhoneCall, Wrench, Sparkles } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const dashboardStats = useDashboardStats();

  const userCards = [
    {
      title: 'شراء أرقام',
      description: 'اختر من مجموعة واسعة من الأرقام',
      icon: ShoppingBag,
      path: '/dashboard/countries',
      gradient: 'from-purple-primary to-purple-secondary'
    },
    {
      title: 'طلباتي',
      description: 'عرض جميع طلباتك السابقة',
      icon: PhoneCall,
      path: '/dashboard/orders',
      gradient: 'from-emerald-primary to-emerald-secondary'
    },
    {
      title: 'إدارة الرصيد',
      description: 'شحن رصيدك وعرض المعاملات',
      icon: CreditCard,
      path: '/dashboard/balance',
      gradient: 'from-purple-accent to-emerald-primary'
    },
    {
      title: 'خدمات التفعيل اليدوي',
      description: 'طلب خدمات التفعيل اليدوي',
      icon: Wrench,
      path: '/dashboard/services/manual-activation',
      gradient: 'from-emerald-accent to-purple-primary'
    }
  ];

  const adminCards = [
    {
      title: 'إدارة المستخدمين',
      description: 'عرض وإدارة جميع المستخدمين',
      icon: Users,
      path: '/dashboard/admin/users',
      gradient: 'from-purple-primary to-emerald-primary'
    },
    {
      title: 'إدارة الخدمات اليدوية',
      description: 'إضافة وتعديل خدمات التفعيل اليدوي',
      icon: Wrench,
      path: '/dashboard/admin/manual-services',
      gradient: 'from-emerald-secondary to-purple-accent'
    },
    {
      title: 'طلبات التفعيل اليدوي',
      description: 'عرض والرد على طلبات التفعيل',
      icon: Settings,
      path: '/dashboard/admin/manual-requests',
      gradient: 'from-purple-secondary to-emerald-accent'
    }
  ];

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div className="animate-fade-in">
          <h1 className="text-4xl font-bold text-gradient mb-2">لوحة التحكم</h1>
          <p className="text-white/80 text-lg">مرحباً بك، <span className="font-semibold text-white">{user?.username}</span></p>
        </div>
        <div className="hidden md:block">
          <div className="glass-card p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-purple-primary animate-pulse" />
              <span className="text-white/90 font-medium">نظام إدارة الأرقام الذكي</span>
            </div>
          </div>
        </div>
      </div>

      <DashboardStats {...dashboardStats} />

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-primary to-emerald-primary rounded-full"></div>
            الخدمات الرئيسية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userCards.map((card, index) => (
              <Card key={index} className="floating-card border-0 overflow-hidden group animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`h-1 bg-gradient-to-r ${card.gradient}`} />
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-xl glow-effect group-hover:scale-110 transition-transform duration-300`}>
                      <card.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-xl text-white font-bold">{card.title}</CardTitle>
                  <CardDescription className="text-white/70 font-medium">{card.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    className="w-full modern-button h-12 text-base font-semibold"
                    onClick={() => navigate(card.path)}
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      الدخول
                    </span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {isAdmin && (
          <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-emerald-primary to-purple-primary rounded-full"></div>
              أدوات الإدارة
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminCards.map((card, index) => (
                <Card key={index} className="floating-card border-0 overflow-hidden group animate-slide-up" style={{ animationDelay: `${(index + 4) * 0.1}s` }}>
                  <div className={`h-1 bg-gradient-to-r ${card.gradient}`} />
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-xl glow-effect group-hover:scale-110 transition-transform duration-300`}>
                        <card.icon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-xl text-white font-bold">{card.title}</CardTitle>
                    <CardDescription className="text-white/70 font-medium">{card.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button 
                      className="w-full modern-button h-12 text-base font-semibold"
                      onClick={() => navigate(card.path)}
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        الدخول
                      </span>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
