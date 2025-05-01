
import React, { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  // Mock notifications data for now
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'رسالة دعم جديدة',
        message: 'لقد تلقيت رداً جديداً على تذكرة الدعم الخاصة بك',
        read: false,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'تم تحديث طلب التفعيل',
        message: 'تم تحديث حالة طلب التفعيل اليدوي الخاص بك إلى "قيد المعالجة"',
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '3',
        title: 'تم إضافة رصيد',
        message: 'تم إضافة 50$ إلى رصيد حسابك بنجاح',
        read: true,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    setUnreadCount(0);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">التنبيهات</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-8"
              onClick={handleMarkAllAsRead}
            >
              تعليم الكل كمقروء
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-6 text-center text-gray-500">
              لا توجد تنبيهات
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    {!notification.read && <Badge variant="success" className="ml-2">جديد</Badge>}
                  </div>
                  <p className="text-gray-600 text-sm">{notification.message}</p>
                  <p className="text-gray-400 text-xs mt-2">
                    {new Date(notification.createdAt).toLocaleTimeString('ar-SA', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
