
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { User } from 'lucide-react';

const Profile = () => {
  const { user, updateUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');

  const handleUpdate = async () => {
    if (!username.trim()) {
      toast.error('يرجى إدخال اسم المستخدم');
      return;
    }
    
    try {
      await updateUserData({ username });
      setIsEditing(false);
      toast.success('تم تحديث الملف الشخصي بنجاح');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('فشل في تحديث الملف الشخصي');
    }
  };

  if (!user) {
    return (
      <div className="text-center py-10">
        <p>يرجى تسجيل الدخول لعرض الملف الشخصي</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">الملف الشخصي</h1>
      
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center">
            <div className="bg-brand-100 text-brand-800 rounded-full w-10 h-10 flex items-center justify-center mr-3">
              <User className="h-5 w-5" />
            </div>
            <span>معلومات الحساب</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">البريد الإلكتروني</label>
              <div className="p-2 bg-muted/30 rounded-md">
                {user.email}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">اسم المستخدم</label>
              {isEditing ? (
                <div className="flex gap-2">
                  <Input 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleUpdate}>حفظ</Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      setUsername(user.username || '');
                    }}
                  >
                    إلغاء
                  </Button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div className="p-2 bg-muted/30 rounded-md flex-1">
                    {user.username}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditing(true)}
                    className="ml-2"
                  >
                    تعديل
                  </Button>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">الرصيد الحالي</label>
              <div className="p-2 bg-muted/30 rounded-md font-bold text-brand-600">
                {user.balance} $
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">نوع الحساب</label>
              <div className="p-2 bg-muted/30 rounded-md">
                {user.role === 'admin' ? 'مدير النظام' : 'مستخدم عادي'}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">تاريخ إنشاء الحساب</label>
              <div className="p-2 bg-muted/30 rounded-md">
                {new Date(user.createdAt).toLocaleDateString('ar-SA')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
