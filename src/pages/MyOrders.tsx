import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { toast } from 'sonner';
import { api } from '@/services/api';
import { PhoneNumber } from '@/types/PhoneNumber';

interface Order {
  id: string;
  phoneNumber: string;
  service: string;
  country: string;
  status: string;
  smsCode: string;
  createdAt: string;
}

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const numbers = await api.getUserPhoneNumbers();
      
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
          (number.createdAt || new Date().toISOString())
      }));
      
      setOrders(transformedOrders);
    } catch (error) {
      console.error('Failed to fetch orders', error);
      toast.error('فشل في جلب الطلبات');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">نشط</span>;
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">قيد الانتظار</span>;
      case 'expired':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">منتهي</span>;
      case 'cancelled':
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">ملغي</span>;
      default:
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{status}</span>;
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
        <button 
          onClick={fetchOrders}
          className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600 transition-colors"
        >
          تحديث
        </button>
      </div>

      {orders.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">لا توجد طلبات حتى الآن</p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-right">رقم الهاتف</th>
                <th className="px-4 py-3 text-right">الخدمة</th>
                <th className="px-4 py-3 text-right">الدولة</th>
                <th className="px-4 py-3 text-right">الحالة</th>
                <th className="px-4 py-3 text-right">رمز التحقق</th>
                <th className="px-4 py-3 text-right">تاريخ الطلب</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{order.phoneNumber}</td>
                  <td className="px-4 py-3">{order.service}</td>
                  <td className="px-4 py-3">{order.country}</td>
                  <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                  <td className="px-4 py-3">
                    {order.smsCode ? (
                      <span className="bg-gray-100 px-2 py-1 rounded font-mono">{order.smsCode}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
