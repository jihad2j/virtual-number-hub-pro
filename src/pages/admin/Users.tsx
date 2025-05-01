
import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { api } from '@/services/api';
import { Edit, Trash, Ban, Key, Plus, User } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { User as UserType } from '@/types/User';

interface EditUserData {
  username: string;
  role: 'user' | 'admin';
  isActive: boolean;
  balance: number;
}

interface PasswordChangeData {
  newPassword: string;
}

const Users = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user' as 'user' | 'admin',
    isActive: true,
    balance: 0,
  });
  const [editUserId, setEditUserId] = useState('');
  const [editUserData, setEditUserData] = useState<EditUserData>({
    username: '',
    role: 'user',
    isActive: true,
    balance: 0,
  });
  const [passwordChangeData, setPasswordChangeData] = useState<PasswordChangeData>({
    newPassword: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAllUsers();
      setUsers(data.map(user => ({
        ...user,
        isActive: user.isActive ?? true,
      })));
    } catch (error) {
      console.error('Failed to fetch users', error);
      toast.error('فشل في جلب قائمة المستخدمين');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.email) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      const userToAdd = {
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        isActive: newUser.isActive,
        balance: newUser.balance || 0,
      };
      
      const addedUser = await api.createUser(userToAdd);
      setUsers([...users, {...addedUser, isActive: addedUser.isActive ?? true}]);
      setNewUser({
        username: '',
        email: '',
        password: '',
        role: 'user',
        isActive: true,
        balance: 0,
      });
      setIsAddDialogOpen(false);
      toast.success(`تم إضافة المستخدم ${addedUser.username} بنجاح`);
    } catch (error) {
      console.error('Failed to add user', error);
      toast.error('فشل في إضافة المستخدم');
    }
  };

  const openEditDialog = (user: UserType) => {
    setEditUserId(user.id);
    setEditUserData({
      username: user.username,
      role: user.role,
      isActive: user.isActive,
      balance: user.balance,
    });
    setIsEditDialogOpen(true);
  };

  const openPasswordDialog = (userId: string) => {
    setEditUserId(userId);
    setPasswordChangeData({ newPassword: '' });
    setIsPasswordDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    try {
      const updatedUser = await api.updateUser(editUserId, editUserData);
      setUsers(users.map(user => user.id === editUserId ? {...updatedUser, isActive: updatedUser.isActive ?? true} : user));
      setIsEditDialogOpen(false);
      toast.success('تم تحديث بيانات المستخدم بنجاح');
    } catch (error) {
      console.error('Failed to update user', error);
      toast.error('فشل في تحديث بيانات المستخدم');
    }
  };

  const handleChangePassword = async () => {
    if (!passwordChangeData.newPassword) {
      toast.error('يرجى إدخال كلمة المرور الجديدة');
      return;
    }
    
    try {
      // Using updateUser instead of directly handling password changes
      await api.updateUser(editUserId, { 
        password: passwordChangeData.newPassword 
      });
      setIsPasswordDialogOpen(false);
      toast.success('تم تغيير كلمة المرور بنجاح');
    } catch (error) {
      console.error('Failed to change password', error);
      toast.error('فشل في تغيير كلمة المرور');
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      const updatedUser = await api.updateUser(userId, { isActive });
      setUsers(users.map(user => user.id === userId ? {...user, isActive} : user));
      toast.success(`تم ${isActive ? 'تنشيط' : 'تعطيل'} المستخدم بنجاح`);
    } catch (error) {
      console.error('Failed to update user status', error);
      toast.error('فشل في تحديث حالة المستخدم');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا المستخدم؟')) return;
    
    try {
      await api.deleteUser(id);
      setUsers(users.filter(user => user.id !== id));
      toast.success('تم حذف المستخدم بنجاح');
    } catch (error) {
      console.error('Failed to delete user', error);
      toast.error('فشل في حذف المستخدم');
    }
  };

  const columns: ColumnDef<UserType>[] = [
    {
      accessorKey: 'username',
      header: 'اسم المستخدم',
    },
    {
      accessorKey: 'email',
      header: 'البريد الإلكتروني',
    },
    {
      accessorKey: 'role',
      header: 'الدور',
    },
    {
      accessorKey: 'balance',
      header: 'الرصيد',
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.balance} $
        </div>
      )
    },
    {
      accessorKey: 'isActive',
      header: 'نشط',
      cell: ({ row }) => (
        <Switch 
          checked={row.original.isActive} 
          onCheckedChange={(checked) => handleToggleActive(row.original.id, checked)}
        />
      )
    },
    {
      id: 'actions',
      header: 'الإجراءات',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => openEditDialog(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => openPasswordDialog(row.original.id)}
          >
            <Key className="h-4 w-4" />
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => handleDeleteUser(row.original.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> إضافة مستخدم
        </Button>
      </div>
      
      <Card className="overflow-hidden">
        <DataTable 
          columns={columns} 
          data={users} 
          loading={isLoading} 
          onRefresh={fetchUsers}
        />
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة مستخدم جديد</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم</Label>
              <Input 
                id="username"
                value={newUser.username}
                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input 
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input 
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">الدور</Label>
              <Select onValueChange={(value) => setNewUser({...newUser, role: value as 'user' | 'admin'})}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="اختر دور المستخدم" defaultValue={newUser.role} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">مستخدم</SelectItem>
                  <SelectItem value="admin">مدير</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="isActive"
                checked={newUser.isActive}
                onCheckedChange={(checked) => setNewUser({...newUser, isActive: checked})}
              />
              <Label htmlFor="isActive">نشط</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="balance">الرصيد</Label>
              <Input
                id="balance"
                type="number"
                value={newUser.balance.toString()}
                onChange={(e) => setNewUser({ ...newUser, balance: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleAddUser}>إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل بيانات المستخدم</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">اسم المستخدم</Label>
              <Input 
                id="edit-username"
                value={editUserData.username}
                onChange={(e) => setEditUserData({...editUserData, username: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">الدور</Label>
              <Select 
                value={editUserData.role} 
                onValueChange={(value) => setEditUserData({...editUserData, role: value as 'user' | 'admin'})}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="اختر دور المستخدم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">مستخدم</SelectItem>
                  <SelectItem value="admin">مدير</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="edit-isActive"
                checked={editUserData.isActive}
                onCheckedChange={(checked) => setEditUserData({...editUserData, isActive: checked})}
              />
              <Label htmlFor="edit-isActive">نشط</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-balance">الرصيد</Label>
              <Input
                id="edit-balance"
                type="number"
                value={editUserData.balance.toString()}
                onChange={(e) => setEditUserData({ ...editUserData, balance: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleUpdateUser}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تغيير كلمة المرور</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
              <Input 
                id="new-password"
                type="password"
                value={passwordChangeData.newPassword}
                onChange={(e) => setPasswordChangeData({...passwordChangeData, newPassword: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleChangePassword}>تغيير كلمة المرور</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
