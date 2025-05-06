
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
  Menu,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMobile } from "@/hooks/useMobile";

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  to: string;
  active: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, text, to, active }) => {
  return (
    <Link
      to={to}
      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors ${
        active ? "bg-brand-50 text-brand-600" : "text-gray-700"
      }`}
    >
      {icon}
      <span className="mr-2">{text}</span>
    </Link>
  );
};

const FooterItem: React.FC<NavItemProps> = ({ icon, text, to, active }) => {
  return (
    <Link
      to={to}
      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors text-gray-500`}
    >
      {icon}
      <span className="mr-2">{text}</span>
    </Link>
  );
};

export function Sidebar() {
  const { pathname } = useLocation();
  const { user, isAdmin } = useAuth();
  const isMobile = useMobile();
  const [collapsed, setCollapsed] = useState(false);

  const userAvatar = user?.avatar || "/img/default-user.jpg";

  const isActive = (path: string) => {
    return pathname === path;
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <>
      {/* Toggle Button for Mobile */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-4 right-4 z-50 lg:hidden bg-white p-2 rounded-full shadow-md`}
      >
        {collapsed ? <Menu size={24} /> : <X size={24} />}
      </button>

      <aside
        className={`fixed inset-y-0 z-10 flex flex-col bg-white border-l border-gray-200 shadow transition-all duration-300 overflow-auto scrollbar-hidden ${
          collapsed ? "w-0 -right-64" : "w-64 right-0"
        } ${isMobile ? "lg:hidden" : "lg:flex"}`}
      >
        {/* Logo and User Info Section */}
        <div className="flex items-center justify-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/img/logo.png" alt="Logo" className="w-auto h-8" />
            <span className="text-lg font-bold">اسم الموقع</span>
          </Link>
        </div>

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
            <h2 className="text-sm font-semibold">{user?.name || user?.username}</h2>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>

        <nav className="flex-1 mt-6 space-y-1.5">
          <NavItem
            icon={<LayoutDashboard className="ml-2" />}
            text="لوحة التحكم"
            to="/dashboard"
            active={isActive("/dashboard")}
          />
          <NavItem
            icon={<ListOrdered className="ml-2" />}
            text="طلباتي"
            to="/dashboard/orders"
            active={isActive("/dashboard/orders")}
          />
          <NavItem
            icon={<WalletCards className="ml-2" />}
            text="رصيدي"
            to="/dashboard/balance"
            active={isActive("/dashboard/balance")}
          />
          <NavItem
            icon={<Flag className="ml-2" />}
            text="الدول المتاحة"
            to="/dashboard/countries"
            active={isActive("/dashboard/countries")}
          />
          <NavItem
            icon={<Server className="ml-2" />}
            text="المزودين النشطين"
            to="/dashboard/active-providers"
            active={isActive("/dashboard/active-providers")}
          />
          <NavItem
            icon={<CircleHelp className="ml-2" />}
            text="الدعم الفني"
            to="/dashboard/support"
            active={isActive("/dashboard/support")}
          />

          {/* Admin Menu */}
          {user?.role === "admin" && (
            <>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase">
                  Admin
                </h3>
              </div>
              
              <NavItem
                icon={<LayoutDashboard className="ml-2" />}
                text="لوحة تحكم المدير"
                to="/dashboard/admin"
                active={isActive("/dashboard/admin")}
              />
              <NavItem
                icon={<Users className="ml-2" />}
                text="المستخدمين"
                to="/dashboard/admin/users"
                active={isActive("/dashboard/admin/users")}
              />
              <NavItem
                icon={<Flag className="ml-2" />}
                text="إدارة الدول"
                to="/dashboard/admin/countries"
                active={isActive("/dashboard/admin/countries")}
              />
              <NavItem
                icon={<Server className="ml-2" />}
                text="إدارة المزودين"
                to="/dashboard/admin/providers"
                active={isActive("/dashboard/admin/providers")}
              />
              <NavItem
                icon={<WalletCards className="ml-2" />}
                text="أرصدة المزودين"
                to="/dashboard/admin/providers/balances"
                active={isActive("/dashboard/admin/providers/balances")}
              />
              <NavItem
                icon={<WalletCards className="ml-2" />}
                text="توليد كوبون رصيد"
                to="/dashboard/admin/prepaid-codes"
                active={isActive("/dashboard/admin/prepaid-codes")}
              />
              <NavItem
                icon={<ListOrdered className="ml-2" />}
                text="خدمات التفعيل اليدوي"
                to="/dashboard/admin/manual-services"
                active={isActive("/dashboard/admin/manual-services")}
              />
              <NavItem
                icon={<ListOrdered className="ml-2" />}
                text="طلبات التفعيل اليدوي"
                to="/dashboard/admin/manual-requests"
                active={isActive("/dashboard/admin/manual-requests")}
              />
            </>
          )}
        </nav>

        {/* Footer Items */}
        <div className="mt-auto space-y-1.5">
          {/* Show settings only for admin */}
          {user?.role === "admin" && (
            <FooterItem
              icon={<UserCog className="ml-2" />}
              text="الإعدادات"
              to="/dashboard/settings"
              active={isActive("/dashboard/settings")}
            />
          )}
          <FooterItem
            icon={<UserCog className="ml-2" />}
            text="تعديل الحساب"
            to="/dashboard/profile"
            active={isActive("/dashboard/profile")}
          />
        </div>
      </aside>
    </>
  );
}
