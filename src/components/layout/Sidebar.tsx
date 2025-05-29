
import React from "react";
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
      <span>{text}</span>
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
      <span>{text}</span>
    </Link>
  );
};

export function Sidebar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const isMobile = useMobile();

  const userAvatar = user?.avatar || "/img/default-user.jpg";

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <aside
      className={`fixed inset-y-0 z-10 flex flex-col ${
        isMobile ? "hidden" : "lg:flex"
      } w-64 p-3 bg-white border-l border-gray-200 shadow transition-transform duration-300 overflow-auto scrollbar-hidden`}
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
          <h2 className="text-sm font-semibold">{user?.name}</h2>
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
          icon={<Package className="ml-2" />}
          text="التطبيقات"
          to="/dashboard/applications"
          active={isActive("/dashboard/applications")}
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
              icon={<Package className="ml-2" />}
              text="إدارة التطبيقات"
              to="/dashboard/admin/applications"
              active={isActive("/dashboard/admin/applications")}
            />
            <NavItem
              icon={<WalletCards className="ml-2" />}
              text="أرصدة المزودين"
              to="/dashboard/admin/providers/balances"
              active={isActive("/dashboard/admin/providers/balances")}
            />
          </>
        )}
      </nav>

      {/* Footer Items */}
      <div className="mt-auto space-y-1.5">
        <FooterItem
          icon={<UserCog className="ml-2" />}
          text="تعديل الحساب"
          to="/dashboard/settings"
          active={isActive("/dashboard/settings")}
        />
      </div>
    </aside>
  );
}
