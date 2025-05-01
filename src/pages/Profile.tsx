
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { User as UserIcon, Mail, DollarSign, Calendar } from 'lucide-react';

const Profile = () => {
  const { user, updateUserData } = useAuth();
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      const updatedUser = await api.updateUser(user?.id || '', { username });
      updateUserData(updatedUser);
      toast.success('تم تحديث الملف الشخصي بنجاح');
    } catch (error) {
      console.error('Failed to update profile', error);
      toast.error('فشل في تحديث الملف الشخصي');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('كلمات المرور الجديدة غير متطابقة');
      return;
    }
    
    setIsLoading(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('تم تغيير كلمة المرور بنجاح');
    } catch (error) {
      console.error('Failed to change password', error);
      toast.error('فشل في تغيير كلمة المرور');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-2xl font-bold">الملف الشخصي</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>معلومات المستخدم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center py-6">
                <div className="h-24 w-24 rounded-full bg-brand-100 flex items-center justify-center mb-4">
                  <UserIcon className="h-12 w-12 text-brand-600" />
                </div>
                <h2 className="text-xl font-semibold">{user.username}</h2>
                <span className="text-gray-500">{user.email}</span>
                <div className="mt-4 bg-brand-50 text-brand-600 px-3 py-1 rounded-full text-sm">
                  {user.role === 'admin' ? 'مشرف' : 'مستخدم'}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center py-2">
                  <Mail className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                    <p>{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center py-2">
                  <DollarSign className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">الرصيد</p>
                    <p>{user.balance} $</p>
                  </div>
                </div>
                
                <div className="flex items-center py-2">
                  <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">تاريخ التسجيل</p>
                    <p>{new Date(user.createdAt).toLocaleDateString('ar-SA')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تعديل الملف الشخصي</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">اسم المستخدم</Label>
                  <Input 
                    id="username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required 
                  />
                </div>
                
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'جاري التحديث...' : 'تحديث الملف الشخصي'}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>تغيير كلمة المرور</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">كلمة المرور الحالية</Label>
                  <Input 
                    id="current-password" 
                    type="password" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
                  <Input 
                    id="new-password" 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">تأكيد كلمة المرور الجديدة</Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                  />
                </div>
                
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'جاري التحديث...' : 'تغيير كلمة المرور'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
