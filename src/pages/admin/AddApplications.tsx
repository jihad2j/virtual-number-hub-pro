
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from '@/services/api';
import { Plus, Package, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";

interface Application {
  id: string;
  name: string;
  providerName: string;
  countryName: string;
  serverName: string;
  price: number;
  description?: string;
  isAvailable: boolean;
}

const AddApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    applicationName: '',
    providerName: '',
    countryName: '',
    serverName: '',
    price: '',
    description: ''
  });

  const predefinedApps = [
    'WhatsApp', 'Telegram', 'Instagram', 'Facebook', 'Twitter', 'TikTok',
    'Snapchat', 'LinkedIn', 'YouTube', 'Gmail', 'Signal', 'Viber',
    'WeChat', 'Line', 'Discord', 'Skype'
  ];

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const data = await api.getUserApplications();
      setApplications(data);
    } catch (error) {
      console.error('Failed to fetch applications', error);
      toast.error('فشل في جلب التطبيقات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.applicationName || !formData.providerName || !formData.countryName || 
        !formData.serverName || !formData.price) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      if (editingApp) {
        const updatedApp = await api.updateUserApplication(editingApp.id, {
          name: formData.applicationName,
          providerName: formData.providerName,
          countryName: formData.countryName,
          serverName: formData.serverName,
          price: parseFloat(formData.price),
          description: formData.description
        });
        setApplications(applications.map(app => 
          app.id === editingApp.id ? updatedApp : app
        ));
        toast.success('تم تحديث التطبيق بنجاح');
      } else {
        const newApp = await api.addUserApplication({
          applicationName: formData.applicationName,
          providerName: formData.providerName,
          countryName: formData.countryName,
          serverName: formData.serverName,
          price: parseFloat(formData.price),
          description: formData.description
        });
        setApplications([...applications, newApp]);
        toast.success('تم إضافة التطبيق بنجاح');
      }
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save application', error);
      toast.error('فشل في حفظ التطبيق');
    }
  };

  const handleEdit = (app: Application) => {
    setEditingApp(app);
    setFormData({
      applicationName: app.name,
      providerName: app.providerName,
      countryName: app.countryName,
      serverName: app.serverName,
      price: app.price.toString(),
      description: app.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (appId: string) => {
    try {
      await api.deleteUserApplication(appId);
      setApplications(applications.filter(app => app.id !== appId));
      toast.success('تم حذف التطبيق بنجاح');
    } catch (error) {
      console.error('Failed to delete application', error);
      toast.error('فشل في حذف التطبيق');
    }
  };

  const resetForm = () => {
    setFormData({
      applicationName: '',
      providerName: '',
      countryName: '',
      serverName: '',
      price: '',
      description: ''
    });
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
          <h1 className="text-2xl font-bold">إدارة التطبيقات</h1>
          <p className="text-gray-600">إضافة وإدارة التطبيقات المتاحة للمستخدمين</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              إضافة تطبيق جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingApp ? 'تعديل التطبيق' : 'إضافة تطبيق جديد'}
              </DialogTitle>
              <DialogDescription>
                {editingApp ? 'تعديل بيانات التطبيق' : 'إضافة تطبيق جديد للمستخدمين'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="applicationName">اسم التطبيق *</Label>
                <Select 
                  value={formData.applicationName} 
                  onValueChange={(value) => setFormData({...formData, applicationName: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر التطبيق" />
                  </SelectTrigger>
                  <SelectContent>
                    {predefinedApps.map((app) => (
                      <SelectItem key={app} value={app}>
                        {app}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="providerName">اسم المزود *</Label>
                <Input
                  id="providerName"
                  value={formData.providerName}
                  onChange={(e) => setFormData({...formData, providerName: e.target.value})}
                  placeholder="مثال: SMS-Activate"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="countryName">اسم الدولة *</Label>
                <Input
                  id="countryName"
                  value={formData.countryName}
                  onChange={(e) => setFormData({...formData, countryName: e.target.value})}
                  placeholder="مثال: الولايات المتحدة"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serverName">اسم السيرفر *</Label>
                <Input
                  id="serverName"
                  value={formData.serverName}
                  onChange={(e) => setFormData({...formData, serverName: e.target.value})}
                  placeholder="مثال: Server-01"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">السعر *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="0.00"
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
                <Button type="submit">
                  {editingApp ? 'تحديث' : 'إضافة'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>التطبيقات المتاحة</CardTitle>
          <CardDescription>قائمة بجميع التطبيقات المتاحة للمستخدمين</CardDescription>
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
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{app.name}</CardTitle>
                      <Badge variant={app.isAvailable ? "default" : "secondary"}>
                        {app.isAvailable ? 'متاح' : 'غير متاح'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div><strong>المزود:</strong> {app.providerName}</div>
                      <div><strong>الدولة:</strong> {app.countryName}</div>
                      <div><strong>السيرفر:</strong> {app.serverName}</div>
                      <div><strong>السعر:</strong> ${app.price}</div>
                      {app.description && (
                        <div><strong>الوصف:</strong> {app.description}</div>
                      )}
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
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

export default AddApplications;
