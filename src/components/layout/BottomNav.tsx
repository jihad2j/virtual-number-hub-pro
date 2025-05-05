
import { Home, ListOrdered, WalletCards, UserCog, BarChart2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const BottomNav = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-md z-50">
      <div className="flex justify-around items-center h-16">
        <Link to="/dashboard" className={`flex flex-col items-center space-y-1 ${isActive('/dashboard') ? 'text-brand-500' : 'text-gray-500'}`}>
          <Home size={22} />
          <span className="text-xs">الرئيسية</span>
        </Link>
        
        <Link to="/dashboard/balance" className={`flex flex-col items-center space-y-1 ${isActive('/dashboard/balance') ? 'text-brand-500' : 'text-gray-500'}`}>
          <WalletCards size={22} />
          <span className="text-xs">البطاقات</span>
        </Link>
        
        <Link to="/dashboard/orders" className={`flex flex-col items-center space-y-1 ${isActive('/dashboard/orders') ? 'text-brand-500' : 'text-gray-500'}`}>
          <BarChart2 size={22} />
          <span className="text-xs">الإحصائيات</span>
        </Link>
        
        <Link to="/dashboard/profile" className={`flex flex-col items-center space-y-1 ${isActive('/dashboard/profile') ? 'text-brand-500' : 'text-gray-500'}`}>
          <UserCog size={22} />
          <span className="text-xs">حسابي</span>
        </Link>
      </div>
    </div>
  );
};
