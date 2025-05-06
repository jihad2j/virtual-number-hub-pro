
import { Home, ListOrdered, WalletCards, UserCog } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const BottomNav = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        <Link to="/dashboard" className={`flex flex-col items-center space-y-1 ${isActive('/dashboard') ? 'text-brand-600' : 'text-gray-600'}`}>
          <Home size={24} />
          <span className="text-xs">الرئيسية</span>
        </Link>
        
        <Link to="/dashboard/orders" className={`flex flex-col items-center space-y-1 ${isActive('/dashboard/orders') ? 'text-brand-600' : 'text-gray-600'}`}>
          <ListOrdered size={24} />
          <span className="text-xs">طلباتي</span>
        </Link>
        
        <Link to="/dashboard/balance" className={`flex flex-col items-center space-y-1 ${isActive('/dashboard/balance') ? 'text-brand-600' : 'text-gray-600'}`}>
          <WalletCards size={24} />
          <span className="text-xs">رصيدي</span>
        </Link>
        
        <Link to="/dashboard/settings" className={`flex flex-col items-center space-y-1 ${isActive('/dashboard/settings') ? 'text-brand-600' : 'text-gray-600'}`}>
          <UserCog size={24} />
          <span className="text-xs">الإعدادات</span>
        </Link>
      </div>
    </div>
  );
};
