
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Phone,
  AlertCircle, 
  MessageSquare
} from 'lucide-react';
import { 
  fiveSimApi, 
  FiveSimPhoneNumber, 
  FiveSimOrdersResponse,
  FiveSimSMS 
} from '@/services/fiveSimService';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const MyOrders = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // States
  const [activationOrders, setActivationOrders] = useState<FiveSimPhoneNumber[]>([]);
  const [hostingOrders, setHostingOrders] = useState<FiveSimPhoneNumber[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<FiveSimPhoneNumber | null>(null);
  const [smsMessages, setSmsMessages] = useState<FiveSimSMS[]>([]);
  const [activeTab, setActiveTab] = useState("activation");
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSms, setIsLoadingSms] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const [activationResponse, hostingResponse] = await Promise.all([
        fiveSimApi.getOrders('activation', 50, 0, true),
        fiveSimApi.getOrders('hosting', 50, 0, true)
      ]);
      
      setActivationOrders(activationResponse.Data || []);
      setHostingOrders(hostingResponse.Data || []);
      
      toast({
        title: "تم التحميل",
        description: "تم تحميل الطلبات بنجاح",
      });
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تحميل الطلبات",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshOrders = async () => {
    setIsRefreshing(true);
    try {
      await fetchOrders();
      if (selectedOrder) {
        await viewOrderDetails(selectedOrder.id);
      }
      toast({
        title: "تم التحديث",
        description: "تم تحديث البيانات بنجاح",
      });
    } catch (error) {
      console.error('Failed to refresh orders:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تحديث البيانات",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const viewOrderDetails = async (orderId: number) => {
    setIsLoadingSms(true);
    try {
      const orderResponse = await fiveSimApi.checkNumber(orderId);
      setSelectedOrder(orderResponse);
      
      // Fetch SMS messages for this order
      const smsResponse = await fiveSimApi.getSmsInbox(orderId);
      setSmsMessages(smsResponse.Data || []);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تحميل تفاصيل الطلب",
      });
    } finally {
      setIsLoadingSms(false);
    }
  };

  const cancelOrder = async (orderId: number) => {
    setActionLoading(orderId);
    try {
      await fiveSimApi.cancelNumber(orderId);
      await refreshOrders();
      toast({
        title: "تم إلغاء الطلب",
        description: "تم إلغاء الطلب بنجاح",
      });
    } catch (error) {
      console.error('Failed to cancel order:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في إلغاء الطلب",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const banOrder = async (orderId: number) => {
    setActionLoading(orderId);
    try {
      await fiveSimApi.banNumber(orderId);
      await refreshOrders();
      toast({
        title: "تم حظر الرقم",
        description: "تم حظر الرقم بنجاح",
      });
    } catch (error) {
      console.error('Failed to ban number:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في حظر الرقم",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const finishOrder = async (orderId: number) => {
    setActionLoading(orderId);
    try {
      await fiveSimApi.finishNumber(orderId);
      await refreshOrders();
      toast({
        title: "تم إنهاء الطلب",
        description: "تم إنهاء الطلب بنجاح",
      });
    } catch (error) {
      console.error('Failed to finish order:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في إنهاء الطلب",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-500';
      case 'RECEIVED':
        return 'bg-green-500';
      case 'FINISHED':
        return 'bg-blue-500';
      case 'CANCELED':
        return 'bg-red-500';
      case 'TIMEOUT':
        return 'bg-orange-500';
      case 'BANNED':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'RECEIVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'FINISHED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CANCELED':
        return <XCircle className="h-4 w-4" />;
      case 'TIMEOUT':
        return <AlertTriangle className="h-4 w-4" />;
      case 'BANNED':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const renderOrderList = (orders: FiveSimPhoneNumber[]) => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-md p-4">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-6 w-[100px]" />
              </div>
              <div className="mt-2 space-y-2">
                <Skeleton className="h-4 w-[300px]" />
                <Skeleton className="h-4 w-[250px]" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <Alert>
          <AlertTitle>لا توجد طلبات</AlertTitle>
          <AlertDescription>
            لم يتم العثور على أي طلبات في هذه الفئة.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-md p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-gray-500" />
                <span className="font-medium">{order.phone}</span>
                <Badge className={getStatusColor(order.status)}>
                  {getOrderStatusIcon(order.status)}
                  <span className="mr-1">{order.status}</span>
                </Badge>
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(order.created_at)}
              </div>
            </div>
            
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="text-sm text-gray-500">الخدمة: </span>
                <span className="text-sm font-medium">{order.product}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">البلد: </span>
                <span className="text-sm font-medium">{order.country}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">المشغل: </span>
                <span className="text-sm font-medium">{order.operator}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">السعر: </span>
                <span className="text-sm font-medium">{order.price} RUB</span>
              </div>
            </div>
            
            <div className="mt-3 flex justify-end space-x-2">
              {actionLoading === order.id ? (
                <Button variant="outline" disabled>
                  <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                  جاري التنفيذ...
                </Button>
              ) : (
                <>
                  {order.status.toUpperCase() === 'PENDING' && (
                    <Button variant="outline" 
                      onClick={() => cancelOrder(order.id)} 
                      className="mr-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700">
                      إلغاء
                    </Button>
                  )}
                  
                  {(order.status.toUpperCase() === 'PENDING' || order.status.toUpperCase() === 'RECEIVED') && (
                    <Button variant="outline" 
                      onClick={() => banOrder(order.id)}
                      className="mr-2 bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700">
                      حظر
                    </Button>
                  )}
                  
                  {order.status.toUpperCase() === 'RECEIVED' && (
                    <Button variant="outline" 
                      onClick={() => finishOrder(order.id)}
                      className="mr-2 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700">
                      إنهاء
                    </Button>
                  )}
                  
                  <Button variant="default" onClick={() => viewOrderDetails(order.id)} className="mr-2">
                    <MessageSquare className="ml-2 h-4 w-4" />
                    عرض التفاصيل
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">طلباتي</h1>
        
        <Button 
          variant="outline" 
          onClick={refreshOrders} 
          disabled={isRefreshing}>
          <RefreshCw className={`ml-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>نوع الطلب</CardTitle>
              <CardDescription>اختر نوع الطلبات التي تريد عرضها</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs 
                defaultValue="activation" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="activation">التفعيل</TabsTrigger>
                  <TabsTrigger value="hosting">الاستضافة</TabsTrigger>
                </TabsList>
                
                <div className="mt-6">
                  <TabsContent value="activation">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">طلبات التفعيل</h3>
                      <p className="text-sm text-gray-500">
                        عدد الطلبات: {activationOrders.length}
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="hosting">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">طلبات الاستضافة</h3>
                      <p className="text-sm text-gray-500">
                        عدد الطلبات: {hostingOrders.length}
                      </p>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-1 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === "activation" ? "طلبات التفعيل" : "طلبات الاستضافة"}
              </CardTitle>
              <CardDescription>
                قائمة الطلبات السابقة
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              {activeTab === "activation" ? 
                renderOrderList(activationOrders) : 
                renderOrderList(hostingOrders)}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {selectedOrder && (
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل الطلب #{selectedOrder.id}</CardTitle>
            <CardDescription>
              معلومات تفصيلية عن الطلب والرسائل المستلمة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">الرقم</p>
                <p className="font-bold text-xl">{selectedOrder.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">الحالة</p>
                <div className="flex items-center">
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {getOrderStatusIcon(selectedOrder.status)}
                    <span className="mr-1">{selectedOrder.status}</span>
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">البلد</p>
                <p className="font-bold">{selectedOrder.country}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">المشغل</p>
                <p className="font-bold">{selectedOrder.operator}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">الخدمة</p>
                <p className="font-bold">{selectedOrder.product}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">السعر</p>
                <p className="font-bold">{selectedOrder.price} RUB</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">تاريخ الإنشاء</p>
                <p className="font-bold">{formatDate(selectedOrder.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">تاريخ الانتهاء</p>
                <p className="font-bold">{formatDate(selectedOrder.expires)}</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium text-lg mb-3">الرسائل المستلمة</h3>
              
              {isLoadingSms ? (
                <div className="space-y-2">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <>
                  {selectedOrder.sms && selectedOrder.sms.length > 0 ? (
                    <div className="space-y-3">
                      {selectedOrder.sms.map((sms, index) => (
                        <div key={index} className="border p-3 rounded-md bg-green-50">
                          <div className="flex justify-between items-center">
                            <p className="font-medium">{sms.sender}</p>
                            <p className="text-xs text-gray-500">
                              {formatDate(sms.created_at)}
                            </p>
                          </div>
                          <p className="mt-1">{sms.text}</p>
                          {sms.code && (
                            <p className="font-bold text-green-600 mt-2">
                              الكود: {sms.code}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <AlertDescription>
                        لم يتم استلام أي رسائل لهذا الطلب حتى الآن.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {smsMessages.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-medium text-lg mb-3">رسائل إضافية</h3>
                      <div className="space-y-3">
                        {smsMessages.map((sms, index) => (
                          <div key={index} className="border p-3 rounded-md bg-blue-50">
                            <div className="flex justify-between items-center">
                              <p className="font-medium">{sms.sender}</p>
                              <p className="text-xs text-gray-500">
                                {formatDate(sms.created_at)}
                              </p>
                            </div>
                            <p className="mt-1">{sms.text}</p>
                            {sms.code && (
                              <p className="font-bold text-blue-600 mt-2">
                                الكود: {sms.code}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyOrders;
