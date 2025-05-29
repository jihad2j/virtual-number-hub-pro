
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { RefreshCw, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // States
  const [userApplications, setUserApplications] = useState<UserApplication[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  
  // Loading states
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Error states
  const [applicationsError, setApplicationsError] = useState<string | null>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    fetchUserApplications();
    fetchUserBalance();
  }, []);

  // Fetch available applications for users
  const fetchUserApplications = async () => {
    setIsLoadingApplications(true);
    setApplicationsError(null);
    
    try {
      const response = await apiClient.get('/applications/user');
      setUserApplications(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch user applications', error);
      setApplicationsError('فشل في جلب قائمة التطبيقات، يرجى المحاولة مرة أخرى.');
      toast({
        title: "خطأ",
        description: "فشل في جلب قائمة التطبيقات، يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingApplications(false);
    }
  };

  // Fetch user balance
  const fetchUserBalance = async () => {
    setIsLoadingBalance(true);
    setBalanceError(null);
    
    try {
      // Get user balance from user profile
      setBalance(user?.balance || 0);
    } catch (error) {
      console.error('Failed to fetch balance', error);
      setBalanceError('فشل في جلب الرصيد، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchUserApplications(),
        fetchUserBalance()
      ]);
      toast({
        title: "تم التحديث",
        description: "تم تحديث البيانات بنجاح",
      });
    } catch (error) {
      console.error('Failed to refresh data', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث البيانات",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Purchase application
  const handlePurchaseApplication = async (application: UserApplication) => {
    setIsPurchasing(application.id);
    
    try {
      const response = await apiClient.post('/numbers/purchase', {
        applicationId: application.id,
        providerName: application.providerName,
        countryName: application.countryName,
        applicationName: application.name,
        serverName: application.serverName
      });
      
      toast({
        title: "تم الشراء بنجاح",
        description: `تم شراء ${application.name} بنجاح.`,
        variant: "default"
      });
      
      // Refresh balance after purchase
      fetchUserBalance();
    } catch (error: any) {
      console.error('Failed to purchase application', error);
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في شراء التطبيق، يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setIsPurchasing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <Button 
          variant="outline" 
          onClick={refreshData} 
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          تحديث البيانات
        </Button>
      </div>

      {/* User Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle>الرصيد الحالي</CardTitle>
          <CardDescription>رصيدك المتاح لشراء التطبيقات</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingBalance ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
          ) : balanceError ? (
            <p className="text-red-500">{balanceError}</p>
          ) : (
            <div className="text-2xl font-bold text-green-600">
              ${balance?.toFixed(2) || '0.00'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            التطبيقات المتاحة
          </CardTitle>
          <CardDescription>اختر التطبيق الذي تريد شراء رقم له</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingApplications ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
            </div>
          ) : applicationsError ? (
            <div className="text-center py-12 text-red-500">
              <p>{applicationsError}</p>
              <Button 
                onClick={fetchUserApplications} 
                className="mt-4"
              >
                إعادة المحاولة
              </Button>
            </div>
          ) : userApplications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>لا توجد تطبيقات متاحة حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userApplications.map((app) => (
                <div key={app.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium text-lg">{app.name}</h3>
                      {app.description && (
                        <p className="text-sm text-gray-600">{app.description}</p>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>المزود: {app.providerName}</div>
                      <div>الدولة: {app.countryName}</div>
                      <div>السيرفر: {app.serverName}</div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <div className="text-lg font-bold text-brand-600">
                        ${app.price.toFixed(2)}
                      </div>
                      <Button 
                        onClick={() => handlePurchaseApplication(app)}
                        disabled={isPurchasing === app.id || !app.isAvailable}
                        size="sm"
                      >
                        {isPurchasing === app.id ? 'جاري الشراء...' : 'شراء الآن'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
