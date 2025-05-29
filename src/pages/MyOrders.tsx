
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { phoneNumberApi } from '@/services/api/phoneNumberApi';
import { PhoneNumber } from '@/types/PhoneNumber';
import { RefreshCw, Phone, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Order {
  id: string;
  phoneNumber: string;
  service: string;
  country: string;
  status: string;
  smsCode: string;
  createdAt: string;
  expiresAt?: string;
}

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkingNumbers, setCheckingNumbers] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const numbers = await phoneNumberApi.getUserPhoneNumbers();
      
      // Transform PhoneNumber objects to Order objects
      const transformedOrders: Order[] = numbers.map(number => ({
        id: number.id,
        phoneNumber: number.number,
        service: number.service,
        country: number.countryName || number.countryCode,
        status: number.status,
        smsCode: number.smsCode || '',
        createdAt: typeof number.createdAt === 'object' ? 
          new Date(number.createdAt).toISOString() : 
          (number.createdAt || new Date().toISOString()),
        expiresAt: typeof number.expiresAt === 'object' ? 
          new Date(number.expiresAt).toISOString() : 
          (number.expiresAt || '')
      }));
      
      setOrders(transformedOrders);
    } catch (error) {
      console.error('Failed to fetch orders', error);
      toast.error('فشل في جلب الطلبات');
    } finally {
      setIsLoading(false);
    }
  };

  const checkForSms = async (orderId: string) => {
    setCheckingNumbers(prev => new Set(prev).add(orderId));
    
    try {
      const updatedNumber = await phoneNumberApi.checkPhoneNumber(orderId);
      
      // Update the specific order in the state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? {
                ...order,
                status: updatedNumber.status,
                smsCode: updatedNumber.smsCode || order.smsCode
              }
            : order
        )
      );

      if (updatedNumber.smsCode) {
        toast.success('تم استلام كود التفعيل!');
      } else {
        toast.info('لم يتم استلام كود التفعيل بعد');
      }
    } catch (error) {
      console.error('Failed to check SMS', error);
      toast.error('فشل في التحقق من حالة الرقم');
    } finally {
      setCheckingNumbers(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const success = await phoneNumberApi.cancelPhoneNumber(orderId);
      
      if (success) {
        toast.success('تم إلغاء الطلب بنجاح');
        // Update the order status
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, status: 'cancelled' }
              : order
          )
        );
      }
    } catch (error) {
      console.error('Failed to cancel order', error);
      toast.error('فشل في إلغاء الطلب');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800">
            <Clock className="h-3 w-3 mr-1" />
            نشط
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            مكتمل
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            منتهي
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <XCircle className="h-3 w-3 mr-1" />
            ملغي
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'تاريخ غير صالح';
    }
  };

  const isExpired = (expiresAt: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">طلباتي</h1>
        <Button 
          onClick={fetchOrders}
          className="flex items-center gap-2"
          variant="outline"
        >
          <RefreshCw className="h-4 w-4" />
          تحديث
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card className="p-8 text-center">
          <Phone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">لا توجد طلبات حتى الآن</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">رقم الهاتف</label>
                    <p className="font-mono text-lg font-semibold">{order.phoneNumber}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">الخدمة</label>
                    <p className="font-medium">{order.service}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">الدولة</label>
                    <p className="font-medium">{order.country}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">الحالة</label>
                    <div className="mt-1">{getStatusBadge(order.status)}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 lg:w-64">
                  {order.smsCode ? (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <label className="text-sm text-green-600 font-medium">كود التفعيل</label>
                      <p className="font-mono text-xl font-bold text-green-800">{order.smsCode}</p>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 border rounded-lg text-center">
                      <p className="text-sm text-gray-500">لم يتم استلام الكود بعد</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {order.status === 'active' && !isExpired(order.expiresAt || '') && (
                      <Button
                        onClick={() => checkForSms(order.id)}
                        disabled={checkingNumbers.has(order.id)}
                        size="sm"
                        className="flex-1"
                      >
                        {checkingNumbers.has(order.id) ? (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                            جاري التحقق...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            تحقق من الكود
                          </>
                        )}
                      </Button>
                    )}

                    {['active', 'pending'].includes(order.status.toLowerCase()) && (
                      <Button
                        onClick={() => cancelOrder(order.id)}
                        variant="outline"
                        size="sm"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        إلغاء
                      </Button>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 text-center">
                    <div>تاريخ الطلب: {formatDate(order.createdAt)}</div>
                    {order.expiresAt && (
                      <div className={isExpired(order.expiresAt) ? 'text-red-500' : ''}>
                        ينتهي في: {formatDate(order.expiresAt)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
