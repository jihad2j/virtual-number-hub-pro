
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { apiClient } from '@/services/apiClient';

interface UserApplication {
  id: string;
  name: string;
  providerName: string;
  countryName: string;
  serverName: string;
  price: number;
  description?: string;
  isAvailable: boolean;
}

const Applications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['user-applications'],
    queryFn: async (): Promise<UserApplication[]> => {
      const response = await apiClient.get('/applications/user');
      return response.data.data;
    }
  });

  const purchaseMutation = useMutation({
    mutationFn: async (application: UserApplication) => {
      const response = await apiClient.post('/numbers/purchase', {
        applicationId: application.id,
        providerName: application.providerName,
        countryName: application.countryName,
        applicationName: application.name,
        serverName: application.serverName,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('تم شراء التطبيق بنجاح! جاري التوجه لصفحة انتظار كود التفعيل...');
      // Navigate to activation waiting page with the order ID
      if (data.data && data.data.id) {
        navigate(`/dashboard/activation-waiting/${data.data.id}`);
      } else {
        navigate('/dashboard/orders');
      }
      queryClient.invalidateQueries({ queryKey: ['user-applications'] });
      queryClient.invalidateQueries({ queryKey: ['user-phone-numbers'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في شراء التطبيق');
    }
  });

  const filteredApplications = applications.filter(app =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.countryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePurchase = (application: UserApplication) => {
    if (!user || user.balance < application.price) {
      toast.error('رصيدك غير كافي لشراء هذا التطبيق');
      return;
    }
    purchaseMutation.mutate(application);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">جاري تحميل التطبيقات...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-shamcash-primary">التطبيقات المتاحة</h1>
        <p className="text-shamcash-gray-600">اختر التطبيق المناسب لك واشتريه بأفضل الأسعار</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-shamcash-gray-400 h-4 w-4" />
          <Input
            placeholder="البحث في التطبيقات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 shamcash-input"
          />
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-shamcash-gray-500 text-lg">لا توجد تطبيقات متاحة حالياً</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.map((app) => (
            <Card key={app.id} className="h-full flex flex-col shamcash-card card-hover">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl text-shamcash-primary">{app.name}</CardTitle>
                  <Badge variant={app.isAvailable ? "default" : "secondary"} className={app.isAvailable ? "bg-shamcash-success" : ""}>
                    {app.isAvailable ? "متاح" : "غير متاح"}
                  </Badge>
                </div>
                <CardDescription className="text-shamcash-gray-600">{app.description || "تطبيق عالي الجودة"}</CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-shamcash-gray-600">المزود:</span>
                    <span className="text-sm font-medium text-shamcash-primary">{app.providerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-shamcash-gray-600">الدولة:</span>
                    <span className="text-sm font-medium text-shamcash-primary">{app.countryName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-shamcash-gray-600">السيرفر:</span>
                    <span className="text-sm font-medium text-shamcash-primary">{app.serverName}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-shamcash-gray-200">
                    <span className="text-lg font-bold text-shamcash-success">${app.price}</span>
                    <span className="text-sm text-shamcash-gray-500">رصيدك: ${user?.balance || 0}</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="w-full shamcash-button" 
                  onClick={() => handlePurchase(app)}
                  disabled={!app.isAvailable || !user || user.balance < app.price || purchaseMutation.isPending}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {purchaseMutation.isPending ? 'جاري الشراء...' : 'شراء التطبيق'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;
