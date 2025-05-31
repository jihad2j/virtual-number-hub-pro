
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ocean-primary via-ocean-accent to-ocean-secondary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Virtual Number Hub</h3>
            <p className="text-ocean-light">جاري تحميل لوحة التحكم الآمنة...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-ocean-light via-white to-ocean-primary/5 flex overflow-hidden">
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
