
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, DollarSign, Calendar, Shield, Edit3 } from 'lucide-react';

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
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 relative">
          <div className="absolute inset-0 bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-10 h-10 text-orange-500" />
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">الملف الشخصي</h1>
        <p className="text-gray-600 text-lg">إدارة معلومات حسابك الشخصي</p>
      </div>

      <div className="border-gradient-colorful">
        <Card className="bg-white shadow-xl border-0 rounded-2xl">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-xl text-gray-800">
              <Shield className="h-6 w-6 text-blue-500" />
              معلومات الحساب
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <label className="text-gray-700 font-semibold flex items-center gap-3 text-base">
                  <Mail className="h-5 w-5 text-orange-500" />
                  البريد الإلكتروني
                </label>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-800 font-medium">{user.email}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="text-gray-700 font-semibold flex items-center gap-3 text-base">
                  <User className="h-5 w-5 text-blue-500" />
                  اسم المستخدم
                </label>
                {isEditing ? (
                  <div className="flex gap-3">
                    <Input 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)}
                      className="flex-1 h-12 rounded-xl border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                    />
                    <Button 
                      onClick={handleUpdate}
                      className="orange-button px-4 py-2"
                    >
                      حفظ
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        setUsername(user.username || '');
                      }}
                      className="px-4 py-2 border-gray-300 hover:bg-gray-50"
                    >
                      إلغاء
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex-1">
                      <span className="text-gray-800 font-medium">{user.username}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditing(true)}
                      className="mr-3 blue-button px-4 py-2 flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      تعديل
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <label className="text-gray-700 font-semibold flex items-center gap-3 text-base">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  الرصيد الحالي
                </label>
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <span className="text-green-700 font-bold text-lg">{user.balance} $</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="text-gray-700 font-semibold flex items-center gap-3 text-base">
                  <Shield className="h-5 w-5 text-purple-500" />
                  نوع الحساب
                </label>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <span className="text-purple-700 font-medium">
                    {user.role === 'admin' ? 'مدير النظام' : 'مستخدم عادي'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4 md:col-span-2">
                <label className="text-gray-700 font-semibold flex items-center gap-3 text-base">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  تاريخ إنشاء الحساب
                </label>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <span className="text-blue-700 font-medium">
                    {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
