
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
      <div className="min-h-screen bg-slate-50 bg-pattern-silver flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-28 h-28 mx-auto mb-8 relative">
            <div className="absolute inset-0 bg-white rounded-3xl shadow-xl border border-gray-200">
              <div className="w-full h-full flex items-center justify-center">
                <div className="relative">
                  <div className="w-16 h-16 bg-orange-500 rounded-2xl transform rotate-12 absolute"></div>
                  <div className="w-12 h-12 bg-blue-500 rounded-xl transform -rotate-12 relative z-10"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-3xl p-8 text-gray-800 max-w-md mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-gradient-colorful">شام كاش</h3>
            <p className="text-gray-600 text-lg font-medium">جاري تحميل لوحة التحكم الآمنة...</p>
            <div className="mt-4 flex justify-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-200"></div>
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
    <div dir="rtl" className="min-h-screen bg-slate-50 bg-pattern-silver flex overflow-hidden">
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
