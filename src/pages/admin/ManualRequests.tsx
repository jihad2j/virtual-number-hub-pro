
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from '@/services/api';
import { toast } from 'sonner';
import { Plus, MessageCircle, CheckCircle, XCircle, Loader, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ManualService {
  id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
}

interface ManualRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  serviceId: string;
  serviceName: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  notes: string;
  adminResponse?: string;
  verificationCode?: string;
  createdAt: string;
  updatedAt?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
}

const ManualRequests = () => {
  const [requests, setRequests] = useState<ManualRequest[]>([]);
  const [services, setServices] = useState<ManualService[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Service management state
  const [newService, setNewService] = useState<Partial<ManualService>>({
    name: '',
    description: '',
    price: 0,
    available: true
  });
  const [editingService, setEditingService] = useState<ManualService | null>(null);
  const [showAddServiceDialog, setShowAddServiceDialog] = useState(false);
  
  // Request management state
  const [selectedTab, setSelectedTab] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<ManualRequest | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [respondingToRequest, setRespondingToRequest] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [requestsData, servicesData, usersData] = await Promise.all([
        api.getAllManualRequests(),
        api.getManualServices(),
        api.getUsers()
      ]);
      
      setRequests(requestsData);
      setServices(servicesData);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('فشل في جلب البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  // Service Management Functions
  const handleSaveService = async () => {
    if (!newService.name || (newService.price === undefined || newService.price <= 0)) {
      toast.error('يرجى إدخال اسم وسعر صحيح للخدمة');
      return;
    }

    try {
      const addedService = await api.createManualService(newService as ManualService);
      setServices([...services, addedService]);
      setNewService({
        name: '',
        description: '',
        price: 0,
        available: true
      });
      setShowAddServiceDialog(false);
      toast.success('تم إضافة الخدمة بنجاح');
    } catch (error) {
      console.error('Failed to add service:', error);
      toast.error('فشل في إضافة الخدمة');
    }
  };

  const handleUpdateService = async (service: ManualService) => {
    try {
      await api.updateManualService(service);
      setServices(services.map(s => s.id === service.id ? service : s));
      setEditingService(null);
      toast.success('تم تحديث الخدمة بنجاح');
    } catch (error) {
      console.error('Failed to update service:', error);
      toast.error('فشل في تحديث الخدمة');
    }
  };

  const toggleServiceAvailability = async (serviceId: string, available: boolean) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    try {
      const updatedService = { ...service, available };
      await api.updateManualService(updatedService);
      setServices(services.map(s => s.id === serviceId ? updatedService : s));
      toast.success(`تم ${available ? 'تفعيل' : 'تعطيل'} الخدمة بنجاح`);
    } catch (error) {
      console.error('Failed to toggle service availability:', error);
      toast.error('فشل في تغيير حالة الخدمة');
    }
  };

  // Request Management Functions
  const handleRespondToRequest = async (requestId: string) => {
    if (!adminResponse && !verificationCode) {
      toast.error('يرجى إدخال رد أو رمز تحقق');
      return;
    }

    setRespondingToRequest(true);
    try {
      const response = {
        adminResponse: adminResponse || undefined,
        verificationCode: verificationCode || undefined,
        status: verificationCode ? 'processing' : 'pending'
      };

      await api.respondToManualRequest(requestId, response);
      
      // Update the local state
      setRequests(requests.map(req => 
        req.id === requestId 
          ? { ...req, ...response } 
          : req
      ));

      setSelectedRequest(null);
      setAdminResponse('');
      setVerificationCode('');
      toast.success('تم إرسال الرد بنجاح');
    } catch (error) {
      console.error('Failed to respond to request:', error);
      toast.error('فشل في إرسال الرد');
    } finally {
      setRespondingToRequest(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: 'processing' | 'completed' | 'cancelled') => {
    try {
      await api.updateManualRequestStatus(requestId, status);
      
      // Update the local state
      setRequests(requests.map(req => 
        req.id === requestId 
          ? { ...req, status } 
          : req
      ));

      toast.success(`تم تغيير حالة الطلب إلى ${
        status === 'processing' ? 'قيد المعالجة' : 
        status === 'completed' ? 'مكتمل' : 'ملغي'
      }`);
    } catch (error) {
      console.error('Failed to update request status:', error);
      toast.error('فشل في تغيير حالة الطلب');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">قيد الانتظار</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500">قيد المعالجة</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">مكتمل</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">ملغي</Badge>;
      default:
        return <Badge>غير معروف</Badge>;
    }
  };

  const filteredRequests = requests.filter(req => {
    if (selectedTab === 'all') return true;
    return req.status === selectedTab;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">إدارة طلبات التفعيل اليدوي</h1>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="pending">قيد الانتظار</TabsTrigger>
          <TabsTrigger value="processing">قيد المعالجة</TabsTrigger>
          <TabsTrigger value="completed">مكتملة</TabsTrigger>
          <TabsTrigger value="cancelled">ملغاة</TabsTrigger>
        </TabsList>
        
        <TabsContent value={selectedTab} className="mt-4">
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  <MessageCircle className="mx-auto h-12 w-12 mb-4" />
                  <p>لا توجد طلبات في هذه الحالة</p>
                </CardContent>
              </Card>
            ) : (
              filteredRequests.map(request => (
                <Card key={request.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{request.serviceName}</CardTitle>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="flex justify-between items-center">
                      <CardDescription>
                        المستخدم: {request.userName || request.userEmail}
                      </CardDescription>
                      <CardDescription>
                        تاريخ الطلب: {new Date(request.createdAt).toLocaleString('ar-SA')}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="py-2 space-y-2">
                    {request.notes && (
                      <div>
                        <p className="font-semibold">ملاحظات المستخدم:</p>
                        <p className="text-gray-600">{request.notes}</p>
                      </div>
                    )}
                    
                    {request.adminResponse && (
                      <div>
                        <p className="font-semibold">رد الإدارة:</p>
                        <p className="text-gray-600">{request.adminResponse}</p>
                      </div>
                    )}
                    
                    {request.verificationCode && (
                      <div className="mt-2">
                        <p className="font-semibold">رمز التحقق:</p>
                        <p className="text-gray-600 font-mono">{request.verificationCode}</p>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="pt-2 flex justify-end gap-2">
                    {request.status === 'pending' && (
                      <>
                        <Button 
                          variant="outline"
                          onClick={() => updateRequestStatus(request.id, 'cancelled')}
                        >
                          <XCircle className="h-4 w-4 ml-1" />
                          إلغاء الطلب
                        </Button>
                        
                        <Button 
                          variant="default"
                          onClick={() => {
                            setSelectedRequest(request);
                            setAdminResponse('');
                            setVerificationCode('');
                          }}
                        >
                          <MessageCircle className="h-4 w-4 ml-1" />
                          الرد على الطلب
                        </Button>
                      </>
                    )}
                    
                    {request.status === 'processing' && (
                      <>
                        <Button 
                          variant="outline"
                          onClick={() => updateRequestStatus(request.id, 'cancelled')}
                        >
                          <XCircle className="h-4 w-4 ml-1" />
                          إلغاء الطلب
                        </Button>
                        
                        <Button 
                          className="gradient-bg"
                          onClick={() => updateRequestStatus(request.id, 'completed')}
                        >
                          <CheckCircle className="h-4 w-4 ml-1" />
                          تأكيد اكتمال الطلب
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <h2 className="text-xl font-bold mt-8">إدارة خدمات التفعيل اليدوي</h2>
      
      <div className="flex justify-end">
        <Dialog open={showAddServiceDialog} onOpenChange={setShowAddServiceDialog}>
          <DialogTrigger asChild>
            <Button className="gradient-bg">
              <Plus className="h-4 w-4 ml-1" />
              إضافة خدمة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة خدمة تفعيل يدوي جديدة</DialogTitle>
              <DialogDescription>
                أدخل تفاصيل الخدمة التي سيتم عرضها للمستخدمين
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="service-name">اسم الخدمة</Label>
                <Input
                  id="service-name"
                  value={newService.name}
                  onChange={(e) => setNewService({...newService, name: e.target.value})}
                  placeholder="أدخل اسم الخدمة"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="service-description">وصف الخدمة</Label>
                <Textarea
                  id="service-description"
                  value={newService.description}
                  onChange={(e) => setNewService({...newService, description: e.target.value})}
                  placeholder="أدخل وصف الخدمة"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="service-price">سعر الخدمة</Label>
                <Input
                  id="service-price"
                  type="number"
                  value={newService.price?.toString()}
                  onChange={(e) => setNewService({...newService, price: parseFloat(e.target.value) || 0})}
                  placeholder="أدخل سعر الخدمة"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="block mb-2">متاحة للمستخدمين</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newService.available}
                    onCheckedChange={(checked) => setNewService({...newService, available: checked})}
                  />
                  <span className="mr-2">{newService.available ? 'متاحة' : 'غير متاحة'}</span>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowAddServiceDialog(false)}
              >
                إلغاء
              </Button>
              <Button 
                onClick={handleSaveService}
                className="gradient-bg"
              >
                إضافة الخدمة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {services.map((service) => (
          <Card key={service.id} className={!service.available ? "opacity-70" : ""}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{service.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={service.available}
                    onCheckedChange={(checked) => toggleServiceAvailability(service.id, checked)}
                  />
                  <span>{service.available ? 'متاحة' : 'غير متاحة'}</span>
                </div>
              </div>
              <CardDescription>
                السعر: {service.price} ريال
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {service.description && (
                <p className="text-gray-600">{service.description}</p>
              )}
            </CardContent>
            
            <CardFooter className="justify-end">
              <Button 
                variant="outline"
                onClick={() => setEditingService(service)}
              >
                تعديل
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Dialog for editing a service */}
      {editingService && (
        <Dialog open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل خدمة التفعيل اليدوي</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-service-name">اسم الخدمة</Label>
                <Input
                  id="edit-service-name"
                  value={editingService.name}
                  onChange={(e) => setEditingService({...editingService, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-service-description">وصف الخدمة</Label>
                <Textarea
                  id="edit-service-description"
                  value={editingService.description}
                  onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-service-price">سعر الخدمة</Label>
                <Input
                  id="edit-service-price"
                  type="number"
                  value={editingService.price.toString()}
                  onChange={(e) => setEditingService({...editingService, price: parseFloat(e.target.value) || 0})}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="block mb-2">متاحة للمستخدمين</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingService.available}
                    onCheckedChange={(checked) => setEditingService({...editingService, available: checked})}
                  />
                  <span className="mr-2">{editingService.available ? 'متاحة' : 'غير متاحة'}</span>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setEditingService(null)}
              >
                إلغاء
              </Button>
              <Button 
                onClick={() => handleUpdateService(editingService)}
                className="gradient-bg"
              >
                حفظ التغييرات
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Dialog for responding to a request */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>الرد على طلب التفعيل</DialogTitle>
              <DialogDescription>
                خدمة: {selectedRequest.serviceName} | 
                المستخدم: {selectedRequest.userName || selectedRequest.userEmail}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {selectedRequest.notes && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="font-semibold">ملاحظات المستخدم:</p>
                  <p>{selectedRequest.notes}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="admin-response">رد الإدارة (اختياري)</Label>
                <Textarea
                  id="admin-response"
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="أدخل ردك على طلب المستخدم"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="verification-code">رمز التحقق</Label>
                <Input
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="أدخل رمز التحقق الذي سيتم إرساله للمستخدم"
                />
                <p className="text-sm text-gray-500">
                  إذا قمت بإدخال رمز التحقق، سيتم تغيير حالة الطلب إلى "قيد المعالجة"
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setSelectedRequest(null)}
              >
                إلغاء
              </Button>
              <Button 
                onClick={() => handleRespondToRequest(selectedRequest.id)}
                className="gradient-bg"
                disabled={respondingToRequest}
              >
                {respondingToRequest ? (
                  <>
                    <Loader className="h-4 w-4 ml-1 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 ml-1" />
                    إرسال الرد
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ManualRequests;
