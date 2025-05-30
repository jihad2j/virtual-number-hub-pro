
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Notifications } from './Notifications';

export const TopBar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 18) return 'مساء الخير';
    return 'مساء الخير';
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-ocean-accent/20 py-4 px-6 flex justify-between items-center shadow-lg">
      <div className="flex items-center space-x-4">
        <div className="hidden md:block text-right">
          <p className="text-sm text-ocean-secondary">{getCurrentGreeting()}</p>
          <p className="text-lg font-semibold text-ocean-primary">{user?.username || 'مستخدم'}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">        
        <div className="flex items-center gap-3">
          <Notifications />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 relative px-3 py-2 hover:bg-ocean-light/30 rounded-xl transition-all duration-300">
                <div className="bg-gradient-to-r from-ocean-primary to-ocean-accent text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                  {user?.username?.charAt(0).toUpperCase() || <User className="h-5 w-5" />}
                </div>
                <div className="hidden md:block text-right mr-2">
                  <span className="font-medium text-ocean-primary">{user?.username || 'مستخدم'}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-ocean-success rounded-full animate-pulse"></div>
                    <span className="text-xs text-ocean-secondary">متصل</span>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-2 glass-effect border-ocean-accent/30" align="end">
              <DropdownMenuLabel className="text-ocean-primary">
                <div className="flex items-center gap-3 p-2">
                  <div className="bg-gradient-to-r from-ocean-primary to-ocean-accent text-white rounded-full w-12 h-12 flex items-center justify-center">
                    {user?.username?.charAt(0).toUpperCase() || <User className="h-6 w-6" />}
                  </div>
                  <div>
                    <p className="font-semibold">{user?.username || 'مستخدم'}</p>
                    <p className="text-sm text-ocean-secondary font-normal">{user?.email}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-2 h-2 bg-ocean-success rounded-full"></div>
                      <span className="text-xs text-ocean-success">نشط الآن</span>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-ocean-accent/20" />
              <DropdownMenuGroup>
                <DropdownMenuItem 
                  onClick={() => navigate('/dashboard/profile')}
                  className="hover:bg-ocean-light/30 rounded-lg transition-colors cursor-pointer p-3"
                >
                  <User className="mr-2 h-4 w-4 text-ocean-primary" />
                  <span className="text-ocean-primary">الملف الشخصي</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate('/dashboard/settings')}
                  className="hover:bg-ocean-light/30 rounded-lg transition-colors cursor-pointer p-3"
                >
                  <Settings className="mr-2 h-4 w-4 text-ocean-primary" />
                  <span className="text-ocean-primary">الإعدادات</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-ocean-accent/20" />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="hover:bg-red-50 rounded-lg transition-colors cursor-pointer p-3 text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
