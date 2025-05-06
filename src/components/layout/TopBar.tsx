
import React from 'react';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const TopBar: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="app-header">
      <div className="container mx-auto flex items-center justify-between w-full">
        <div className="flex items-center">
          <div className="relative">
            <Bell className="h-6 w-6 text-white" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
              3
            </span>
          </div>
        </div>
        
        <div className="flex items-center">
          <h1 className="text-lg font-bold">تطبيقنا</h1>
          <p className="text-xs opacity-75 mr-1">مرحبا بك، {user?.username || 'مستخدم'}</p>
        </div>
        
        <div>
          <img 
            src="/lovable-uploads/4b7ba182-3501-41b5-bc8f-a427d9c05b7d.png" 
            alt="شعار التطبيق" 
            className="h-8 w-8 rounded-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};
