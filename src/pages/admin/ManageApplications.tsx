
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Package, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { applicationApi, BaseApplication } from '@/services/api/applicationApi';

const ManageApplications = () => {
  const [applications, setApplications] = useState<BaseApplication[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<BaseApplication | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const queryClient = useQueryClient();

  // Fetch applications
  const { data: fetchedApplications = [], isLoading } = useQuery({
    queryKey: ['base-applications'],
    queryFn: applicationApi.getAllBaseApplications
  });

  React.useEffect(() => {
    setApplications(fetchedApplications);
  }, [fetchedApplications]);

  // Add application mutation
  const addMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      applicationApi.addBaseApplication(data.name, data.description),
    onSuccess: (newApp) => {
      setApplications([...applications, newApp]);
      toast.success('تم إضافة التطبيق بنجاح');
      setIsDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['base-applications'] });
    },
    onError: () => {
      toast.error('فشل في إضافة التطبيق');
    }
  });

  // Update application mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; name: string; description?: string }) =>
      applicationApi.updateBaseApplication(data.id, { name: data.name, description: data.description }),
    onSuccess: (updatedApp) => {
      setApplications(applications.map(app => 
        app.id === updatedApp.id ? updatedApp : app
      ));
      toast.success('تم تحديث التطبيق بنجاح');
      setIsDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['base-applications'] });
    },
    onError: () => {
      toast.error('فشل في تحديث التطبيق');
    }
  });

  // Delete application mutation
  const deleteMutation = useMutation({
    mutationFn: applicationApi.deleteBaseApplication,
    onSuccess: (_, deletedId) => {
      setApplications(applications.filter(app => app.id !== deletedId));
      toast.success('تم حذف التطبيق بنجاح');
      queryClient.invalidateQueries({ queryKey: ['base-applications'] });
    },
    onError: () => {
      toast.error('فشل في حذف التطبيق');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('اسم التطبيق مطلوب');
      return;
    }

    if (editingApp) {
      updateMutation.mutate({
        id: editingApp.id,
        name: formData.name,
        description: formData.description
      });
    } else {
      addMutation.mutate({
        name: formData.name,
        description: formData.description
      });
    }
  };

  const handleEdit = (app: BaseApplication) => {
    setEditingApp(app);
    setFormData({
      name: app.name,
      description: app.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (appId: string) => {
    deleteMutation.mutate(appId);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingApp(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">إدارة أسماء التطبيقات</h1>
          <p className="text-gray-600">إضافة وإدارة أسماء التطبيقات الأساسية</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              إضافة تطبيق
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingApp ? 'تعديل التطبيق' : 'إضافة تطبيق جديد'}
              </DialogTitle>
              <DialogDescription>
                {editingApp ? 'تعديل اسم التطبيق' : 'إضافة اسم تطبيق جديد'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم التطبيق *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="مثال: WhatsApp"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="وصف اختياري للتطبيق"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  إلغاء
                </Button>
                <Button 
                  type="submit"
                  disabled={addMutation.isPending || updateMutation.isPending}
                >
                  {editingApp ? 'تحديث' : 'إضافة'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>أسماء التطبيقات</CardTitle>
          <CardDescription>قائمة بجميع أسماء التطبيقات المتاحة</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">جاري التحميل...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-4 text-gray-500">لا توجد تطبيقات مضافة حتى الآن</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {applications.map((app) => (
                <Card key={app.id} className="relative">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{app.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {app.description && (
                      <p className="text-sm text-gray-600 mb-4">{app.description}</p>
                    )}
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(app)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>حذف التطبيق</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من حذف تطبيق {app.name}؟ هذا الإجراء لا يمكن التراجع عنه.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(app.id)}>
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageApplications;
