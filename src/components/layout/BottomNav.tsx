
import { Home, ListOrdered, WalletCards, UserCog } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const BottomNav = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        <Link 
          to="/dashboard" 
          className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-300 ${
            isActive('/dashboard') 
              ? 'text-white bg-orange-500 shadow-lg transform scale-105' 
              : 'text-gray-600 hover:text-orange-500'
          }`}
        >
          <Home size={20} />
          <span className="text-xs font-medium">الرئيسية</span>
        </Link>
        
        <Link 
          to="/dashboard/orders" 
          className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-300 ${
            isActive('/dashboard/orders') 
              ? 'text-white bg-blue-500 shadow-lg transform scale-105' 
              : 'text-gray-600 hover:text-blue-500'
          }`}
        >
          <ListOrdered size={20} />
          <span className="text-xs font-medium">طلباتي</span>
        </Link>
        
        <Link 
          to="/dashboard/balance" 
          className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-300 ${
            isActive('/dashboard/balance') 
              ? 'text-white bg-orange-500 shadow-lg transform scale-105' 
              : 'text-gray-600 hover:text-orange-500'
          }`}
        >
          <WalletCards size={20} />
          <span className="text-xs font-medium">رصيدي</span>
        </Link>
        
        <Link 
          to="/dashboard/settings" 
          className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-300 ${
            isActive('/dashboard/settings') 
              ? 'text-white bg-blue-500 shadow-lg transform scale-105' 
              : 'text-gray-600 hover:text-blue-500'
          }`}
        >
          <UserCog size={20} />
          <span className="text-xs font-medium">الإعدادات</span>
        </Link>
      </div>
    </div>
  );
};
