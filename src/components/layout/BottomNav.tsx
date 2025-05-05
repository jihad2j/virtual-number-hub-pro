
import { User, Wallet, BarChart2, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const BottomNav = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-md z-50 max-w-[500px] mx-auto">
      <div className="flex justify-around items-center h-16">
        <Link to="/dashboard" className={`flex flex-col items-center space-y-1 ${isActive('/dashboard') ? 'bottom-nav-active' : 'bottom-nav-inactive'}`}>
          <Home size={20} />
          <span className="text-xs">الرئيسية</span>
        </Link>
        
        <Link to="/dashboard/balance" className={`flex flex-col items-center space-y-1 ${isActive('/dashboard/balance') ? 'bottom-nav-active' : 'bottom-nav-inactive'}`}>
          <BarChart2 size={20} />
          <span className="text-xs">الإحصائيات</span>
        </Link>
        
        <Link to="/dashboard/orders" className={`flex flex-col items-center space-y-1 ${isActive('/dashboard/orders') ? 'bottom-nav-active' : 'bottom-nav-inactive'}`}>
          <Wallet size={20} />
          <span className="text-xs">البطاقات</span>
        </Link>
        
        <Link to="/dashboard/settings" className={`flex flex-col items-center space-y-1 ${isActive('/dashboard/settings') ? 'bottom-nav-active' : 'bottom-nav-inactive'}`}>
          <User size={20} />
          <span className="text-xs">حسابي</span>
        </Link>
      </div>
    </div>
  );
};
