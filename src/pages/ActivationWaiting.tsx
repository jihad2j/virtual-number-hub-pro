
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { phoneNumberApi } from '@/services/api/phoneNumberApi';
import { PhoneNumber } from '@/types/PhoneNumber';
import { Clock, Phone, CheckCircle, XCircle, Copy, RefreshCw, AlertCircle } from 'lucide-react';

const ActivationWaiting = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<PhoneNumber | null>(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isChecking, setIsChecking] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  useEffect(() => {
    if (timeLeft > 0 && !order?.smsCode) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, order?.smsCode]);

  useEffect(() => {
    if (!order?.smsCode && timeLeft > 0) {
      const interval = setInterval(() => {
        checkForSms();
      }, 10000); // Check every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [order?.smsCode, timeLeft]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    
    setIsLoading(true);
    try {
      const orderData = await phoneNumberApi.checkPhoneNumber(orderId);
      setOrder(orderData);
      
      if (orderData.smsCode) {
        toast.success('🎉 تم استلام كود التفعيل!');
      }
    } catch (error) {
      console.error('Failed to fetch order details', error);
      toast.error('فشل في جلب تفاصيل الطلب');
      navigate('/dashboard/orders');
    } finally {
      setIsLoading(false);
    }
  };

  const checkForSms = async () => {
    if (!orderId || isChecking || order?.smsCode) return;
    
    setIsChecking(true);
    try {
      const updatedOrder = await phoneNumberApi.checkPhoneNumber(orderId);
      setOrder(updatedOrder);
      
      if (updatedOrder.smsCode) {
        toast.success('🎉 تم استلام كود التفعيل!');
      }
    } catch (error) {
      console.error('Failed to check SMS', error);
    } finally {
      setIsChecking(false);
    }
  };

  const cancelOrder = async () => {
    if (!orderId) return;
    
    setIsCancelling(true);
    try {
      const success = await phoneNumberApi.cancelPhoneNumber(orderId);
      
      if (success) {
        toast.success('تم إلغاء الطلب بنجاح');
        navigate('/dashboard/orders');
      }
    } catch (error) {
      console.error('Failed to cancel order', error);
      toast.error('فشل في إلغاء الطلب');
    } finally {
      setIsCancelling(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${type} بنجاح`);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
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
          <Badge className="bg-gradient-to-r from-shamcash-warning to-orange-500 text-white shadow-lg">
            <Clock className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-shamcash-light via-white to-shamcash-primary/5 p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-shamcash-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-shamcash-gray-700">جاري تحميل تفاصيل الطلب...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-shamcash-light via-white to-shamcash-primary/5 p-6">
        <Card className="shamcash-card p-8 text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-shamcash-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-shamcash-gray-900 mb-2">لم يتم العثور على الطلب</h2>
          <p className="text-shamcash-gray-600 mb-6">الطلب المطلوب غير موجود أو تم حذفه</p>
          <Button onClick={() => navigate('/dashboard/orders')} className="shamcash-button">
            العودة للطلبات
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-shamcash-light via-white to-shamcash-primary/5 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-shamcash-primary mb-2">انتظار كود التفعيل</h1>
          <p className="text-shamcash-gray-600">سيتم إرسال كود التفعيل خلال دقائق قليلة</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Order Details Card */}
          <Card className="shamcash-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-shamcash-primary">
                <Phone className="h-5 w-5" />
                تفاصيل الطلب
              </CardTitle>
              <CardDescription>معلومات الرقم المشترى</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-shamcash-light to-green-50 p-4 rounded-xl border border-shamcash-accent/30">
                <label className="text-sm text-shamcash-gray-700 font-medium flex items-center gap-2 mb-2">
                  <Phone className="h-4 w-4" />
                  رقم الهاتف
                </label>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-lg font-bold text-shamcash-primary">{order.number}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(order.number, 'رقم الهاتف')}
                    className="p-1 h-6 w-6 hover:bg-shamcash-primary/10"
                  >
                    <Copy className="h-3 w-3 text-shamcash-primary" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-shamcash-light/50 p-3 rounded-lg">
                  <label className="text-sm text-shamcash-gray-600 font-medium">الخدمة</label>
                  <p className="font-semibold text-shamcash-primary">{order.service}</p>
                </div>
                <div className="bg-shamcash-light/50 p-3 rounded-lg">
                  <label className="text-sm text-shamcash-gray-600 font-medium">الدولة</label>
                  <p className="font-semibold text-shamcash-primary">{order.countryName}</p>
                </div>
              </div>

              <div className="bg-shamcash-light/50 p-3 rounded-lg">
                <label className="text-sm text-shamcash-gray-600 font-medium mb-2 block">الحالة</label>
                {getStatusBadge(order.status)}
              </div>
            </CardContent>
          </Card>

          {/* Activation Code Card */}
          <Card className="shamcash-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-shamcash-primary">
                {order.smsCode ? <CheckCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                كود التفعيل
              </CardTitle>
              <CardDescription>
                {order.smsCode ? 'تم استلام الكود بنجاح' : 'في انتظار وصول الكود'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {order.smsCode ? (
                <div className="bg-gradient-to-r from-shamcash-success/10 to-green-50 border border-shamcash-success/30 rounded-xl p-6 text-center shadow-lg">
                  <CheckCircle className="h-12 w-12 text-shamcash-success mx-auto mb-4" />
                  <label className="text-sm text-shamcash-success font-semibold mb-2 block">كود التفعيل</label>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <p className="font-mono text-3xl font-bold text-shamcash-success">{order.smsCode}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(order.smsCode, 'كود التفعيل')}
                      className="p-2 hover:bg-shamcash-success/10 text-shamcash-success"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button 
                    onClick={() => navigate('/dashboard/orders')} 
                    className="shamcash-button w-full"
                  >
                    العودة للطلبات
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-6">
                  {/* Countdown Timer */}
                  <div className="bg-gradient-to-r from-shamcash-primary/10 to-shamcash-accent/10 border border-shamcash-accent/30 rounded-xl p-6">
                    <Clock className="h-12 w-12 text-shamcash-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-shamcash-primary mb-2">الوقت المتبقي</h3>
                    <div className="text-4xl font-bold text-shamcash-primary font-mono mb-2">
                      {formatTime(timeLeft)}
                    </div>
                    <p className="text-sm text-shamcash-gray-600">دقائق حتى انتهاء صلاحية الرقم</p>
                  </div>

                  {/* Auto-check status */}
                  {isChecking && (
                    <div className="flex items-center justify-center gap-2 text-shamcash-accent">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span className="text-sm">جاري التحقق من الكود...</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={checkForSms}
                      disabled={isChecking}
                      className="w-full shamcash-button"
                    >
                      {isChecking ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          جاري التحقق...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          تحقق من الكود الآن
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={cancelOrder}
                      disabled={isCancelling}
                      variant="outline"
                      className="w-full border-shamcash-error text-shamcash-error hover:bg-shamcash-error hover:text-white"
                    >
                      {isCancelling ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          جاري الإلغاء...
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          إلغاء العملية
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        {!order.smsCode && (
          <Card className="shamcash-card mt-6">
            <CardContent className="p-6">
              <h3 className="font-semibold text-shamcash-primary mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                تعليمات مهمة
              </h3>
              <ul className="space-y-2 text-sm text-shamcash-gray-700">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-shamcash-accent rounded-full mt-2 flex-shrink-0"></span>
                  سيتم التحقق من وصول كود التفعيل تلقائياً كل 10 ثوانِ
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-shamcash-accent rounded-full mt-2 flex-shrink-0"></span>
                  عند وصول الكود ستتلقى إشعاراً فورياً
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-shamcash-accent rounded-full mt-2 flex-shrink-0"></span>
                  يمكنك إلغاء العملية في أي وقت قبل انتهاء المهلة الزمنية
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-shamcash-accent rounded-full mt-2 flex-shrink-0"></span>
                  في حالة عدم وصول الكود خلال 10 دقائق سيتم استرداد المبلغ تلقائياً
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ActivationWaiting;
