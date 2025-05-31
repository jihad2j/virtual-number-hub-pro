
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated, loadingInitial } = useAuth();

  if (loadingInitial) {
    return (
      <div className="min-h-screen modern-gradient bg-pattern-modern flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-8 relative">
            <div className="absolute inset-0 glass-card glow-effect rounded-3xl">
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-3xl p-8 text-white max-w-md mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-gradient">شام كاش</h3>
            <p className="text-white/80 text-lg font-medium">جاري تحميل لوحة التحكم الآمنة...</p>
            <div className="mt-4 flex justify-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-primary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-primary rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-purple-accent rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div dir="rtl" className="min-h-screen modern-gradient bg-pattern-modern flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto pb-20 md:pb-6">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
};

export default DashboardLayout;
