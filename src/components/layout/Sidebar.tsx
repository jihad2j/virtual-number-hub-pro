
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Globe, 
  DollarSign, 
  ShoppingCart, 
  MessageSquare,
  Settings,
  Users,
  Server, 
  Menu,
  X,
  PhoneCall,
  LayoutDashboard,
  ChartBar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export const Sidebar: React.FC = () => {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const userNavItems = [
    { path: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { path: '/dashboard/countries', label: 'الدول المتاحة', icon: Globe },
    { path: '/dashboard/manual-activation', label: 'التفعيل اليدوي', icon: PhoneCall },
    { path: '/dashboard/balance', label: 'رصيد الحساب', icon: DollarSign },
    { path: '/dashboard/orders', label: 'طلباتي', icon: ShoppingCart },
    { path: '/dashboard/support', label: 'الدعم الفني', icon: MessageSquare },
  ];

  const adminNavItems = [
    { path: '/dashboard/admin', label: 'لوحة المشرف', icon: ChartBar },
    { path: '/dashboard/admin/providers', label: 'مزودي الخدمة', icon: Server },
    { path: '/dashboard/admin/countries', label: 'إدارة الدول', icon: Globe },
    { path: '/dashboard/admin/users', label: 'المستخدمين', icon: Users },
    { path: '/dashboard/admin/manual-requests', label: 'طلبات التفعيل اليدوي', icon: PhoneCall },
    { path: '/dashboard/admin/manual-services', label: 'خدمات التفعيل اليدوي', icon: PhoneCall },
    { path: '/dashboard/admin/settings', label: 'إعدادات النظام', icon: Settings },
  ];

  // Get all nav items based on user role
  const navItems = [...userNavItems, ...(isAdmin ? adminNavItems : [])];

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-md bg-white shadow-md"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white border-l border-gray-200 w-64 flex-shrink-0 flex flex-col z-50",
          "fixed inset-y-0 right-0 md:relative md:translate-x-0 transition-transform duration-300 ease-in-out",
          {
            "translate-x-0": isOpen,
            "translate-x-full": !isOpen && typeof window !== 'undefined' && window.innerWidth < 768
          }
        )}
      >
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-brand-600 text-center">Virtual Number Hub</h1>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    isActive 
                      ? "bg-brand-50 text-brand-600" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t">
          <Button 
            variant="outline" 
            className="w-full"
            asChild
          >
            <Link to="/dashboard/settings">
              <Settings className="h-4 w-4 ml-2" />
              <span>إعدادات الحساب</span>
            </Link>
          </Button>
        </div>
      </aside>
    </>
  );
};
