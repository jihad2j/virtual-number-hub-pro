
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
      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors ${
        active ? "bg-brand-50 text-brand-600" : "text-gray-700"
      } ${isCollapsed ? "justify-center" : ""}`}
      title={isCollapsed ? text : undefined}
    >
      {icon}
      {!isCollapsed && <span className="mr-2">{text}</span>}
    </Link>
  );
};

const FooterItem: React.FC<NavItemProps> = ({ icon, text, to, active, isCollapsed }) => {
  return (
    <Link
      to={to}
      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors text-gray-500 ${
        isCollapsed ? "justify-center" : ""
      }`}
      title={isCollapsed ? text : undefined}
    >
      {icon}
      {!isCollapsed && <span className="mr-2">{text}</span>}
    </Link>
  );
};

export function Sidebar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const userAvatar = "/img/default-user.jpg";

  const isActive = (path: string) => {
    return pathname === path;
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={`fixed inset-y-0 z-10 flex flex-col bg-white border-l border-gray-200 shadow transition-all duration-300 overflow-auto scrollbar-hidden ${
      isCollapsed ? 'w-16' : 'w-64'
    } p-3`}>
      {/* Logo and Toggle Button */}
      <div className="flex items-center justify-between h-16 mb-4">
        {!isCollapsed && (
          <Link to="/" className="flex items-center space-x-2">
            <img src="/img/logo.png" alt="Logo" className="w-auto h-8" />
            <span className="text-lg font-bold">اسم الموقع</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 ml-auto"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* User Info Section */}
      {!isCollapsed && (
        <div className="flex items-center p-3 mt-4 space-x-3 rounded-md">
          <div className="relative">
            <img
              src={userAvatar}
              alt="User Avatar"
              className="w-10 h-10 rounded-full"
            />
            <span className="absolute bottom-0 right-0 inline-block w-3 h-3 bg-green-500 border border-white rounded-full"></span>
          </div>
          <div>
            <h2 className="text-sm font-semibold">{user?.username || 'مستخدم'}</h2>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
      )}

      <nav className="flex-1 mt-6 space-y-1.5">
        <NavItem
          icon={<LayoutDashboard className="ml-2 h-5 w-5" />}
          text="لوحة التحكم"
          to="/dashboard"
          active={isActive("/dashboard")}
          isCollapsed={isCollapsed}
        />
        <NavItem
          icon={<ListOrdered className="ml-2 h-5 w-5" />}
          text="طلباتي"
          to="/dashboard/orders"
          active={isActive("/dashboard/orders")}
          isCollapsed={isCollapsed}
        />
        <NavItem
          icon={<WalletCards className="ml-2 h-5 w-5" />}
          text="رصيدي"
          to="/dashboard/balance"
          active={isActive("/dashboard/balance")}
          isCollapsed={isCollapsed}
        />
        <NavItem
          icon={<Flag className="ml-2 h-5 w-5" />}
          text="الدول المتاحة"
          to="/dashboard/countries"
          active={isActive("/dashboard/countries")}
          isCollapsed={isCollapsed}
        />
        <NavItem
          icon={<Package className="ml-2 h-5 w-5" />}
          text="التطبيقات"
          to="/dashboard/applications"
          active={isActive("/dashboard/applications")}
          isCollapsed={isCollapsed}
        />
        <NavItem
          icon={<Server className="ml-2 h-5 w-5" />}
          text="المزودين النشطين"
          to="/dashboard/active-providers"
          active={isActive("/dashboard/active-providers")}
          isCollapsed={isCollapsed}
        />
        <NavItem
          icon={<CircleHelp className="ml-2 h-5 w-5" />}
          text="الدعم الفني"
          to="/dashboard/support"
          active={isActive("/dashboard/support")}
          isCollapsed={isCollapsed}
        />

        {/* Admin Menu */}
        {user?.role === "admin" && (
          <>
            {!isCollapsed && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase">
                  Admin
                </h3>
              </div>
            )}
            
            <NavItem
              icon={<LayoutDashboard className="ml-2 h-5 w-5" />}
              text="لوحة تحكم المدير"
              to="/dashboard/admin"
              active={isActive("/dashboard/admin")}
              isCollapsed={isCollapsed}
            />
            <NavItem
              icon={<Users className="ml-2 h-5 w-5" />}
              text="المستخدمين"
              to="/dashboard/admin/users"
              active={isActive("/dashboard/admin/users")}
              isCollapsed={isCollapsed}
            />
            <NavItem
              icon={<Flag className="ml-2 h-5 w-5" />}
              text="إدارة الدول"
              to="/dashboard/admin/countries"
              active={isActive("/dashboard/admin/countries")}
              isCollapsed={isCollapsed}
            />
            <NavItem
              icon={<Server className="ml-2 h-5 w-5" />}
              text="إدارة المزودين"
              to="/dashboard/admin/providers"
              active={isActive("/dashboard/admin/providers")}
              isCollapsed={isCollapsed}
            />
            <NavItem
              icon={<Package className="ml-2 h-5 w-5" />}
              text="إدارة التطبيقات"
              to="/dashboard/admin/applications"
              active={isActive("/dashboard/admin/applications")}
              isCollapsed={isCollapsed}
            />
            <NavItem
              icon={<WalletCards className="ml-2 h-5 w-5" />}
              text="أرصدة المزودين"
              to="/dashboard/admin/providers/balances"
              active={isActive("/dashboard/admin/providers/balances")}
              isCollapsed={isCollapsed}
            />
          </>
        )}
      </nav>

      {/* Footer Items */}
      <div className="mt-auto space-y-1.5">
        <FooterItem
          icon={<UserCog className="ml-2 h-5 w-5" />}
          text="تعديل الحساب"
          to="/dashboard/settings"
          active={isActive("/dashboard/settings")}
          isCollapsed={isCollapsed}
        />
      </div>
    </aside>
  );
}
