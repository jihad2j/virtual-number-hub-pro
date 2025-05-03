
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { User } from '@/types/User';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newBalance, setNewBalance] = useState('');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('فشل في تحميل بيانات المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUpdateDialog = (user: User) => {
    setSelectedUser(user);
    setNewBalance(user.balance.toString());
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateBalance = async () => {
    if (!selectedUser) return;

    try {
      // Correcting the function call to use the format expected by the API
      await api.updateUser({
        id: selectedUser.id,
        balance: parseFloat(newBalance)
      });
      
      toast.success('تم تحديث رصيد المستخدم بنجاح');
      setIsUpdateDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user balance:', error);
      toast.error('فشل في تحديث رصيد المستخدم');
    }
  };

  const getUserStatusBadge = (isActive?: boolean) => {
    return isActive ? (
      <Badge className="bg-green-500 hover:bg-green-600">نشط</Badge>
    ) : (
      <Badge variant="destructive">غير نشط</Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>إدارة المستخدمين</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">جميع المستخدمين</TabsTrigger>
            {/* <TabsTrigger value="active">المستخدمين النشطين</TabsTrigger>
            <TabsTrigger value="inactive">المستخدمين غير النشطين</TabsTrigger> */}
          </TabsList>
          <TabsContent value="all">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم المستخدم</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>الرصيد</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.balance}</TableCell>
                    <TableCell>{getUserStatusBadge(user.isActive)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => handleOpenUpdateDialog(user)}>
                        تعديل الرصيد
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          {/* <TabsContent value="active">
            <p>This is the active users tab.</p>
          </TabsContent>
          <TabsContent value="inactive">
            <p>This is the inactive users tab.</p>
          </TabsContent> */}
        </Tabs>
      </CardContent>

      {/* Update Balance Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل رصيد المستخدم</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="balance" className="text-right">
                الرصيد الجديد
              </Label>
              <Input
                type="number"
                id="balance"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsUpdateDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleUpdateBalance}>تحديث الرصيد</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
