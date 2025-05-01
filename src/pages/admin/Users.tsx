
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";
import { toast } from "sonner";
import { User } from "@/types/User";
import { ColumnDef } from "@tanstack/react-table";

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Form states
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"user" | "admin">("user");
  const [newIsActive, setNewIsActive] = useState(true);
  const [newBalance, setNewBalance] = useState(0);
  
  // Edit states
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"user" | "admin">("user");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editBalance, setEditBalance] = useState(0);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("فشل في جلب المستخدمين");
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateUser = async () => {
    try {
      const newUser = await api.createUser({
        username: newUsername,
        email: newEmail,
        role: newRole,
        isActive: newIsActive,
        balance: newBalance,
      });
      
      setUsers([...users, newUser]);
      toast.success("تم إنشاء المستخدم بنجاح");
      resetCreateForm();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Failed to create user:", error);
      toast.error("فشل في إنشاء المستخدم");
    }
  };
  
  const handleEditUser = async () => {
    if (!currentUser) return;
    
    try {
      const updatedUserData = {
        username: editUsername,
        email: editEmail,
        role: editRole,
        isActive: editIsActive,
        balance: editBalance,
      };
      
      const updatedUser = await api.updateUser(currentUser.id, updatedUserData);
      
      setUsers(users.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      ));
      
      toast.success("تم تحديث المستخدم بنجاح");
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error("فشل في تحديث المستخدم");
    }
  };
  
  const resetCreateForm = () => {
    setNewUsername("");
    setNewEmail("");
    setNewRole("user");
    setNewIsActive(true);
    setNewBalance(0);
  };
  
  const openEditDialog = (user: User) => {
    setCurrentUser(user);
    setEditUsername(user.username || "");
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditIsActive(user.isActive);
    setEditBalance(user.balance);
    setIsEditDialogOpen(true);
  };
  
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "username",
      header: "اسم المستخدم",
    },
    {
      accessorKey: "email",
      header: "البريد الإلكتروني",
    },
    {
      accessorKey: "role",
      header: "الصلاحية",
      cell: ({ row }) => {
        const role = row.original.role;
        return (
          <Badge variant={role === "admin" ? "default" : "outline"}>
            {role === "admin" ? "مدير النظام" : "مستخدم عادي"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "balance",
      header: "الرصيد",
      cell: ({ row }) => {
        return (
          <span className="font-medium">{row.original.balance} $</span>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "الحالة",
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        return (
          <Badge variant={isActive ? "success" : "destructive"}>
            {isActive ? "نشط" : "معطل"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "تاريخ التسجيل",
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return date.toLocaleDateString("ar-SA");
      },
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => {
        return (
          <Button variant="outline" onClick={() => openEditDialog(row.original)}>
            تعديل
          </Button>
        );
      },
    },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>إضافة مستخدم جديد</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>المستخدمين</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={users} 
            loading={loading} 
            onRefresh={fetchUsers}
            searchKey="email"
          />
        </CardContent>
      </Card>
      
      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة مستخدم جديد</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-username">اسم المستخدم</Label>
              <Input 
                id="new-username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="اسم المستخدم"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-email">البريد الإلكتروني</Label>
              <Input 
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="example@domain.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-role">نوع المستخدم</Label>
              <Select 
                value={newRole} 
                onValueChange={(value) => setNewRole(value as "user" | "admin")}
              >
                <SelectTrigger id="new-role">
                  <SelectValue placeholder="اختر نوع المستخدم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">مستخدم عادي</SelectItem>
                  <SelectItem value="admin">مدير النظام</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-balance">الرصيد</Label>
              <Input 
                id="new-balance"
                type="number"
                value={newBalance.toString()}
                onChange={(e) => setNewBalance(Number(e.target.value))}
                placeholder="0"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="new-is-active"
                checked={newIsActive}
                onCheckedChange={setNewIsActive}
              />
              <Label htmlFor="new-is-active">مستخدم نشط</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleCreateUser}>إنشاء المستخدم</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل المستخدم</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">اسم المستخدم</Label>
              <Input 
                id="edit-username"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                placeholder="اسم المستخدم"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-email">البريد الإلكتروني</Label>
              <Input 
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="example@domain.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-role">نوع المستخدم</Label>
              <Select 
                value={editRole} 
                onValueChange={(value) => setEditRole(value as "user" | "admin")}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="اختر نوع المستخدم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">مستخدم عادي</SelectItem>
                  <SelectItem value="admin">مدير النظام</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-balance">الرصيد</Label>
              <Input 
                id="edit-balance"
                type="number"
                value={editBalance.toString()}
                onChange={(e) => setEditBalance(Number(e.target.value))}
                placeholder="0"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="edit-is-active"
                checked={editIsActive}
                onCheckedChange={setEditIsActive}
              />
              <Label htmlFor="edit-is-active">مستخدم نشط</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleEditUser}>حفظ التغييرات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
