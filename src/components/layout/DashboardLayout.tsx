
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar />
      <div className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
        <div className="flex flex-1">
          <div className="hidden md:block">
            <Sidebar />
          </div>
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4">
            <Outlet />
          </main>
        </div>
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
