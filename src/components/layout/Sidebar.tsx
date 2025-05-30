
import React, { useState } from "react";
import {
  LayoutDashboard,
  ListOrdered,
  WalletCards,
  UserCog,
  Flag,
  CircleHelp,
  Server,
  Users,
  Package,
  ChevronLeft,
  ChevronRight,
  Wrench,
  ClipboardList,
  Plus,
  Settings,
  Shield,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  to: string;
  active: boolean;
  isCollapsed?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, text, to, active, isCollapsed }) => {
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
        active 
          ? "bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30" 
          : "text-rajhi-light hover:bg-white/10 hover:text-white"
      } ${isCollapsed ? "justify-center" : ""}`}
      title={isCollapsed ? text : undefined}
    >
      <div className={`transition-transform duration-300 ${active ? 'scale-110' : ''}`}>
        {icon}
      </div>
      {!isCollapsed && <span className="mr-3 font-medium">{text}</span>}
      {active && !isCollapsed && (
        <div className="mr-auto w-2 h-2 bg-rajhi-gold rounded-full animate-pulse"></div>
      )}
    </Link>
  );
};

const FooterItem: React.FC<NavItemProps> = ({ icon, text, to, active, isCollapsed }) => {
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 text-rajhi-light hover:bg-white/10 hover:text-white ${
        isCollapsed ? "justify-center" : ""
      }`}
      title={isCollapsed ? text : undefined}
    >
      {icon}
      {!isCollapsed && <span className="mr-3">{text}</span>}
    </Link>
  );
};

export function Sidebar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={`rajhi-sidebar shadow-2xl transition-all duration-300 overflow-hidden ${
      isCollapsed ? 'w-20' : 'w-72'
    } p-4 flex flex-col relative`}>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"40\" height=\"40\" viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.03\"%3E%3Cpath d=\"M20 20c0-11.046-8.954-20-20-20v20h20z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
      
      <div className="relative z-10">
        {/* Logo and Toggle */}
        <div className="flex items-center justify-between mb-6">
          {!isCollapsed && (
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">Virtual Hub</span>
                <p className="text-xs text-rajhi-light">الأرقام الافتراضية</p>
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-10 w-10 text-white hover:bg-white/20 border border-white/30 rounded-xl"
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        {/* User Profile */}
        {!isCollapsed && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-rajhi-gold rounded-full flex items-center justify-center text-rajhi-primary font-bold text-lg">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="absolute bottom-0 right-0 inline-block w-3 h-3 bg-rajhi-success border-2 border-white rounded-full"></span>
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-white">{user?.username || 'مستخدم'}</h2>
                <p className="text-xs text-rajhi-light truncate">{user?.email}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-1 h-1 bg-rajhi-success rounded-full animate-pulse"></div>
                  <span className="text-xs text-rajhi-success">متصل</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          <NavItem
            icon={<LayoutDashboard className="h-5 w-5" />}
            text="لوحة التحكم"
            to="/dashboard"
            active={isActive("/dashboard")}
            isCollapsed={isCollapsed}
          />
          <NavItem
            icon={<ListOrdered className="h-5 w-5" />}
            text="طلباتي"
            to="/dashboard/orders"
            active={isActive("/dashboard/orders")}
            isCollapsed={isCollapsed}
          />
          <NavItem
            icon={<WalletCards className="h-5 w-5" />}
            text="رصيدي"
            to="/dashboard/balance"
            active={isActive("/dashboard/balance")}
            isCollapsed={isCollapsed}
          />
          <NavItem
            icon={<Flag className="h-5 w-5" />}
            text="الدول المتاحة"
            to="/dashboard/countries"
            active={isActive("/dashboard/countries")}
            isCollapsed={isCollapsed}
          />
          <NavItem
            icon={<Package className="h-5 w-5" />}
            text="التطبيقات"
            to="/dashboard/applications"
            active={isActive("/dashboard/applications")}
            isCollapsed={isCollapsed}
          />
          <NavItem
            icon={<Server className="h-5 w-5" />}
            text="المزودين النشطين"
            to="/dashboard/active-providers"
            active={isActive("/dashboard/active-providers")}
            isCollapsed={isCollapsed}
          />
          <NavItem
            icon={<Wrench className="h-5 w-5" />}
            text="التفعيل اليدوي"
            to="/dashboard/services/manual-activation"
            active={isActive("/dashboard/services/manual-activation")}
            isCollapsed={isCollapsed}
          />
          <NavItem
            icon={<CircleHelp className="h-5 w-5" />}
            text="الدعم الفني"
            to="/dashboard/support"
            active={isActive("/dashboard/support")}
            isCollapsed={isCollapsed}
          />

          {/* Admin Section */}
          {user?.role === "admin" && (
            <>
              {!isCollapsed && (
                <div className="mt-6 pt-4 border-t border-white/20">
                  <h3 className="px-4 text-xs font-semibold text-rajhi-light uppercase tracking-wider mb-3">
                    إدارة النظام
                  </h3>
                </div>
              )}
              
              <NavItem
                icon={<LayoutDashboard className="h-5 w-5" />}
                text="لوحة المدير"
                to="/dashboard/admin"
                active={isActive("/dashboard/admin")}
                isCollapsed={isCollapsed}
              />
              <NavItem
                icon={<Users className="h-5 w-5" />}
                text="المستخدمين"
                to="/dashboard/admin/users"
                active={isActive("/dashboard/admin/users")}
                isCollapsed={isCollapsed}
              />
              <NavItem
                icon={<Flag className="h-5 w-5" />}
                text="إدارة الدول"
                to="/dashboard/admin/countries"
                active={isActive("/dashboard/admin/countries")}
                isCollapsed={isCollapsed}
              />
              <NavItem
                icon={<Server className="h-5 w-5" />}
                text="إدارة المزودين"
                to="/dashboard/admin/providers"
                active={isActive("/dashboard/admin/providers")}
                isCollapsed={isCollapsed}
              />
              <NavItem
                icon={<Settings className="h-5 w-5" />}
                text="أسماء التطبيقات"
                to="/dashboard/admin/manage-applications"
                active={isActive("/dashboard/admin/manage-applications")}
                isCollapsed={isCollapsed}
              />
              <NavItem
                icon={<Package className="h-5 w-5" />}
                text="إدارة التطبيقات"
                to="/dashboard/admin/applications"
                active={isActive("/dashboard/admin/applications")}
                isCollapsed={isCollapsed}
              />
              <NavItem
                icon={<Plus className="h-5 w-5" />}
                text="إضافة تطبيقات"
                to="/dashboard/admin/add-applications"
                active={isActive("/dashboard/admin/add-applications")}
                isCollapsed={isCollapsed}
              />
              <NavItem
                icon={<Wrench className="h-5 w-5" />}
                text="الخدمات اليدوية"
                to="/dashboard/admin/manual-services"
                active={isActive("/dashboard/admin/manual-services")}
                isCollapsed={isCollapsed}
              />
              <NavItem
                icon={<ClipboardList className="h-5 w-5" />}
                text="طلبات التفعيل"
                to="/dashboard/admin/manual-requests"
                active={isActive("/dashboard/admin/manual-requests")}
                isCollapsed={isCollapsed}
              />
              <NavItem
                icon={<CircleHelp className="h-5 w-5" />}
                text="إدارة الدعم"
                to="/dashboard/admin/support"
                active={isActive("/dashboard/admin/support")}
                isCollapsed={isCollapsed}
              />
              <NavItem
                icon={<WalletCards className="h-5 w-5" />}
                text="أرصدة المزودين"
                to="/dashboard/admin/providers/balances"
                active={isActive("/dashboard/admin/providers/balances")}
                isCollapsed={isCollapsed}
              />
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-white/20">
          <FooterItem
            icon={<UserCog className="h-5 w-5" />}
            text="إعدادات الحساب"
            to="/dashboard/settings"
            active={isActive("/dashboard/settings")}
            isCollapsed={isCollapsed}
          />
          
          {!isCollapsed && (
            <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xs text-rajhi-light text-center">
                <p>نسخة 2.0.1</p>
                <p className="mt-1">Virtual Number Hub Pro</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
