
import { Home, ListOrdered, WalletCards, UserCog } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const BottomNav = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-ocean-accent/20 z-50 md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        <Link 
          to="/dashboard" 
          className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-300 ${
            isActive('/dashboard') 
              ? 'text-white bg-gradient-to-r from-ocean-primary to-ocean-accent shadow-lg transform scale-105' 
              : 'text-ocean-secondary hover:text-ocean-primary'
          }`}
        >
          <Home size={20} />
          <span className="text-xs font-medium">الرئيسية</span>
        </Link>
        
        <Link 
          to="/dashboard/orders" 
          className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-300 ${
            isActive('/dashboard/orders') 
              ? 'text-white bg-gradient-to-r from-ocean-primary to-ocean-accent shadow-lg transform scale-105' 
              : 'text-ocean-secondary hover:text-ocean-primary'
          }`}
        >
          <ListOrdered size={20} />
          <span className="text-xs font-medium">طلباتي</span>
        </Link>
        
        <Link 
          to="/dashboard/balance" 
          className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-300 ${
            isActive('/dashboard/balance') 
              ? 'text-white bg-gradient-to-r from-ocean-primary to-ocean-accent shadow-lg transform scale-105' 
              : 'text-ocean-secondary hover:text-ocean-primary'
          }`}
        >
          <WalletCards size={20} />
          <span className="text-xs font-medium">رصيدي</span>
        </Link>
        
        <Link 
          to="/dashboard/settings" 
          className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-300 ${
            isActive('/dashboard/settings') 
              ? 'text-white bg-gradient-to-r from-ocean-primary to-ocean-accent shadow-lg transform scale-105' 
              : 'text-ocean-secondary hover:text-ocean-primary'
          }`}
        >
          <UserCog size={20} />
          <span className="text-xs font-medium">الإعدادات</span>
        </Link>
      </div>
    </div>
  );
};
