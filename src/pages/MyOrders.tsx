import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { phoneNumberApi } from '@/services/api/phoneNumberApi';
import { PhoneNumber } from '@/types/PhoneNumber';
import { RefreshCw, Phone, CheckCircle, XCircle, Clock, Copy, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const numbers = await phoneNumberApi.getUserPhoneNumbers();
      
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
        toast.success('🎉 تم استلام كود التفعيل!');
      } else {
        toast.info('⏳ لم يتم استلام كود التفعيل بعد');
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

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${type} بنجاح`);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return (
          <Badge className="bg-gradient-to-r from-shamcash-success to-green-600 text-white shadow-lg">
            <Clock className="h-3 w-3 mr-1" />
            نشط
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-gradient-to-r from-shamcash-primary to-shamcash-accent text-white shadow-lg">
            <CheckCircle className="h-3 w-3 mr-1" />
            مكتمل
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-gradient-to-r from-shamcash-error to-red-600 text-white shadow-lg">
            <XCircle className="h-3 w-3 mr-1" />
            منتهي
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-gradient-to-r from-shamcash-gray-500 to-gray-600 text-white shadow-lg">
            <XCircle className="h-3 w-3 mr-1" />
            ملغي
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-shamcash-accent to-shamcash-secondary text-white shadow-lg">
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

  const goToActivationWaiting = (orderId: string) => {
    navigate(`/dashboard/activation-waiting/${orderId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-shamcash-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-shamcash-gray-700">جاري تحميل طلباتك...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-shamcash-light via-white to-shamcash-primary/5 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-shamcash-primary flex items-center gap-3">
            <div className="bg-gradient-to-r from-shamcash-primary to-shamcash-accent text-white rounded-full p-3">
              <Phone className="h-6 w-6" />
            </div>
            طلباتي
          </h1>
          <p className="text-shamcash-gray-600 mt-2">إدارة ومتابعة جميع طلبات الأرقام الافتراضية</p>
        </div>
        <Button 
          onClick={fetchOrders}
          className="shamcash-button flex items-center gap-2 shadow-lg"
          size="lg"
        >
          <RefreshCw className="h-4 w-4" />
          تحديث الطلبات
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card className="shamcash-card p-12 text-center">
          <div className="bg-gradient-to-r from-shamcash-light to-green-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <Phone className="h-12 w-12 text-shamcash-primary" />
          </div>
          <h3 className="text-xl font-semibold text-shamcash-primary mb-2">لا توجد طلبات حتى الآن</h3>
          <p className="text-shamcash-gray-600">ابدأ بشراء أول رقم افتراضي لك</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <Card key={order.id} className="shamcash-card p-6 hover:shadow-2xl transition-all duration-300 border-0">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                
                {/* Order Information */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-r from-shamcash-light to-green-50 p-4 rounded-xl border border-shamcash-accent/30">
                    <label className="text-sm text-shamcash-gray-600 font-medium flex items-center gap-2 mb-2">
                      <Phone className="h-4 w-4" />
                      رقم الهاتف
                    </label>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-lg font-bold text-shamcash-primary">{order.phoneNumber}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(order.phoneNumber, 'رقم الهاتف')}
                        className="p-1 h-6 w-6 hover:bg-shamcash-primary/10"
                      >
                        <Copy className="h-3 w-3 text-shamcash-primary" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-shamcash-light to-green-50 p-4 rounded-xl border border-shamcash-accent/30">
                    <label className="text-sm text-shamcash-gray-600 font-medium flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4" />
                      الخدمة
                    </label>
                    <p className="font-semibold text-shamcash-primary">{order.service}</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-shamcash-light to-green-50 p-4 rounded-xl border border-shamcash-accent/30">
                    <label className="text-sm text-shamcash-gray-600 font-medium mb-2 block">الدولة</label>
                    <p className="font-semibold text-shamcash-primary">{order.country}</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-shamcash-light to-green-50 p-4 rounded-xl border border-shamcash-accent/30">
                    <label className="text-sm text-shamcash-gray-600 font-medium mb-2 block">الحالة</label>
                    <div className="mt-1">{getStatusBadge(order.status)}</div>
                  </div>
                </div>

                {/* SMS Code and Actions */}
                <div className="flex flex-col gap-4 lg:w-80">
                  {order.smsCode ? (
                    <div className="bg-gradient-to-r from-shamcash-success/10 to-green-50 border border-shamcash-success/30 rounded-xl p-4 shadow-lg">
                      <label className="text-sm text-shamcash-success font-semibold flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4" />
                        كود التفعيل
                      </label>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-2xl font-bold text-shamcash-success">{order.smsCode}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(order.smsCode, 'كود التفعيل')}
                          className="p-2 hover:bg-shamcash-success/10 text-shamcash-success"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-shamcash-gray-50 to-gray-50 border border-shamcash-gray-200 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-shamcash-gray-600 mb-2">
                        <Clock className="h-4 w-4 animate-pulse" />
                        <span className="text-sm font-medium">في انتظار الكود</span>
                      </div>
                      <p className="text-xs text-shamcash-gray-500">سيصل الكود خلال دقائق قليلة</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {order.status === 'active' && !isExpired(order.expiresAt || '') && (
                      <>
                        <Button
                          onClick={() => goToActivationWaiting(order.id)}
                          size="sm"
                          className="flex-1 shamcash-button"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          صفحة الانتظار
                        </Button>
                        <Button
                          onClick={() => checkForSms(order.id)}
                          disabled={checkingNumbers.has(order.id)}
                          size="sm"
                          variant="outline"
                          className="border-shamcash-accent text-shamcash-accent hover:bg-shamcash-accent hover:text-white"
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
                      </>
                    )}

                    {['active', 'pending'].includes(order.status.toLowerCase()) && (
                      <Button
                        onClick={() => cancelOrder(order.id)}
                        variant="outline"
                        size="sm"
                        className="border-shamcash-error text-shamcash-error hover:bg-shamcash-error hover:text-white"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        إلغاء
                      </Button>
                    )}
                  </div>

                  {/* Date Information */}
                  <div className="text-xs text-shamcash-gray-600 bg-shamcash-light/30 rounded-lg p-3 space-y-1">
                    <div className="flex justify-between">
                      <span>تاريخ الطلب:</span>
                      <span className="font-medium">{formatDate(order.createdAt)}</span>
                    </div>
                    {order.expiresAt && (
                      <div className="flex justify-between">
                        <span>ينتهي في:</span>
                        <span className={`font-medium ${isExpired(order.expiresAt) ? 'text-shamcash-error' : 'text-shamcash-success'}`}>
                          {formatDate(order.expiresAt)}
                        </span>
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
