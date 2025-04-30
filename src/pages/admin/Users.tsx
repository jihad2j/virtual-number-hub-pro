
import React, { useState, useEffect } from 'react';
import { api, User } from '@/services/api';
import { toast } from 'sonner';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Card, CardContent, CardDescription, 
  CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, MoreVertical, Edit, Trash2, User as UserIcon,
  Check, Users as UsersIcon, RefreshCw, Wallet
} from 'lucide-react';

interface NewUserForm {
  username: string;
  email: string;
  role: 'user' | 'admin';
  balance: number;
  isActive: boolean;
}

const UsersManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openNewUserDialog, setOpenNewUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<NewUserForm>({
    username: '',
    email: '',
    role: 'user',
    balance: 0,
    isActive: true,
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const usersData = await api.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch users', error);
      toast.error('فشل في جلب بيانات المستخدمين');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.email) {
      toast.error('الرجاء إدخال اسم المستخدم والبريد الإلكتروني');
      return;
    }

    try {
      const addedUser = await api.addUser({
        ...newUser,
        createdAt: new Date().toISOString(),
      });
      setUsers([...users, addedUser]);
      setNewUser({
        username: '',
        email: '',
        role: 'user',
        balance: 0,
        isActive: true,
      });
      setOpenNewUserDialog(false);
      toast.success(`تم إضافة المستخدم ${addedUser.username} بنجاح`);
    } catch (error) {
      console.error('Failed to add user', error);
      toast.error('حدث خطأ أثناء إضافة المستخدم');
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      await api.updateUser(editingUser);
      setUsers(users.map(user => user.id === editingUser.id ? editingUser : user));
      setEditingUser(null);
      toast.success(`تم تحديث المستخدم ${editingUser.username} بنجاح`);
    } catch (error) {
      console.error('Failed to update user', error);
      toast.error('حدث خطأ أثناء تحديث المستخدم');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      try {
        await api.deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
        toast.success('تم حذف المستخدم بنجاح');
      } catch (error) {
        console.error('Failed to delete user', error);
        toast.error('حدث خطأ أثناء حذف المستخدم');
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const formatDate = (dateStr?: string) => {
    try {
      if (!dateStr) return "لا يوجد";
      return new Date(dateStr).toLocaleString('ar-SA');
    } catch (e) {
      return dateStr || "لا يوجد";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="بحث..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-8 w-64"
            />
          </div>
          
          <Dialog open={openNewUserDialog} onOpenChange={setOpenNewUserDialog}>
            <DialogTrigger asChild>
              <Button className="gradient-bg">
                <Plus className="ml-2 h-4 w-4" />
                إضافة مستخدم جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                <DialogDescription>
                  أدخل معلومات المستخدم الجديد
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="username">اسم المستخدم</Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    placeholder="أدخل اسم المستخدم"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="أدخل البريد الإلكتروني"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="balance">الرصيد</Label>
                  <Input
                    id="balance"
                    type="number"
                    value={newUser.balance}
                    onChange={(e) => setNewUser({...newUser, balance: Number(e.target.value)})}
                    placeholder="أدخل الرصيد الابتدائي"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="block mb-2">دور المستخدم</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newUser.role === 'admin'}
                      onCheckedChange={(checked) => setNewUser({...newUser, role: checked ? 'admin' : 'user'})}
                    />
                    <span className="mr-2">{newUser.role === 'admin' ? 'مسؤول' : 'مستخدم'}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="block mb-2">حالة الحساب</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newUser.isActive}
                      onCheckedChange={(checked) => setNewUser({...newUser, isActive: checked})}
                    />
                    <span className="mr-2">{newUser.isActive ? 'نشط' : 'غير نشط'}</span>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenNewUserDialog(false)}>
                  إلغاء
                </Button>
                <Button className="gradient-bg" onClick={handleAddUser}>
                  إضافة المستخدم
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل المستخدم</DialogTitle>
            <DialogDescription>
              قم بتعديل معلومات المستخدم
            </DialogDescription>
          </DialogHeader>
          
          {editingUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-username">اسم المستخدم</Label>
                <Input
                  id="edit-username"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-email">البريد الإلكتروني</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-balance">الرصيد</Label>
                <Input
                  id="edit-balance"
                  type="number"
                  value={editingUser.balance}
                  onChange={(e) => setEditingUser({...editingUser, balance: Number(e.target.value)})}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="block mb-2">دور المستخدم</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingUser.role === 'admin'}
                    onCheckedChange={(checked) => setEditingUser({...editingUser, role: checked ? 'admin' : 'user'})}
                  />
                  <span className="mr-2">{editingUser.role === 'admin' ? 'مسؤول' : 'مستخدم'}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="block mb-2">حالة الحساب</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingUser.isActive}
                    onCheckedChange={(checked) => setEditingUser({...editingUser, isActive: checked})}
                  />
                  <span className="mr-2">{editingUser.isActive ? 'نشط' : 'غير نشط'}</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              إلغاء
            </Button>
            <Button className="gradient-bg" onClick={handleUpdateUser}>
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-brand-600" />
              <CardTitle>قائمة المستخدمين ({filteredUsers.length})</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={fetchUsers}>
              <RefreshCw className="h-4 w-4 ml-2" />
              تحديث
            </Button>
          </div>
          <CardDescription>
            إدارة جميع المستخدمين في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المعرف</TableHead>
                <TableHead>اسم المستخدم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead>الرصيد</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ التسجيل</TableHead>
                <TableHead>آخر دخول</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id.substring(0, 8)}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'destructive' : 'outline'}>
                        {user.role === 'admin' ? 'مسؤول' : 'مستخدم'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Wallet className="h-4 w-4 text-green-500 ml-1" />
                        {user.balance.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>{user.lastLogin ? formatDate(user.lastLogin) : 'لم يسجل دخول بعد'}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>خيارات المستخدم</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setEditingUser(user)}>
                            <Edit className="h-4 w-4 ml-2" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 ml-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    لا يوجد مستخدمين مطابقين للبحث
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersManagement;
