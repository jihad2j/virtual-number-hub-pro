
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

  return (
    <header className="bg-white border-b border-gray-200 py-3 px-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        
      </div>
      <div className="flex items-center space-x-4">
        <Notifications />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 relative px-2">
              <div className="bg-brand-100 text-brand-800 rounded-full w-8 h-8 flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <span className="mr-2">{user?.username || 'مستخدم'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>حسابي</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate('/dashboard/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>الملف الشخصي</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>الإعدادات</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>تسجيل الخروج</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
