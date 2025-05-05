
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, AlertTriangle, RefreshCcw } from "lucide-react";
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface ProviderBalance {
  id: string;
  name: string;
  code: string;
  balance?: {
    balance: number;
    currency: string;
  };
  error?: string;
  isActive: boolean;
}

const ActiveProviders = () => {
  const [providers, setProviders] = useState<ProviderBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshingProvider, setRefreshingProvider] = useState<string | null>(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const [providersList, balancesData] = await Promise.all([
        api.getAvailableProviders(),
        api.getAllProvidersBalances()
      ]);

      // Combine provider data with balance data
      const providersWithBalance = providersList.map(provider => {
        const balanceInfo = balancesData.find(b => b.id === provider.id);
        return {
          ...provider,
          balance: balanceInfo?.balance,
          error: balanceInfo?.error
        };
      });
      
      setProviders(providersWithBalance);
    } catch (error) {
      console.error('Error fetching providers data:', error);
      toast.error('فشل في جلب بيانات المزودين');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProviderBalance = async (providerId: string) => {
    setRefreshingProvider(providerId);
    try {
      const balance = await api.getProviderBalance(providerId);
      setProviders(prev => 
        prev.map(provider => 
          provider.id === providerId 
            ? { ...provider, balance, error: undefined } 
            : provider
        )
      );
      toast.success('تم تحديث رصيد المزود بنجاح');
    } catch (error) {
      console.error('Error refreshing provider balance:', error);
      toast.error('فشل في تحديث رصيد المزود');
    } finally {
      setRefreshingProvider(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>المزودين النشطين</CardTitle>
          <CardDescription>قائمة بمزودي الخدمة النشطين وأرصدتهم الحالية</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
            </div>
          ) : providers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>لا يوجد مزودين نشطين حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providers.map((provider) => (
                <Card key={provider.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                      <Badge variant={provider.isActive ? "success" : "destructive"}>
                        {provider.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </div>
                    <CardDescription>{provider.code}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {provider.error ? (
                      <div className="flex items-center text-red-500 mb-4">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        <p className="text-sm">{provider.error}</p>
                      </div>
                    ) : provider.balance ? (
                      <div className="text-center mb-4">
                        <p className="text-3xl font-bold text-green-600">
                          {provider.balance.balance}
                        </p>
                        <p className="text-gray-500">
                          {provider.balance.currency}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center mb-4 text-gray-500">
                        <p>لم يتم جلب الرصيد بعد</p>
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => refreshProviderBalance(provider.id)}
                      disabled={refreshingProvider === provider.id}
                    >
                      {refreshingProvider === provider.id ? (
                        <>
                          <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                          جاري التحديث...
                        </>
                      ) : (
                        <>
                          <RefreshCcw className="h-4 w-4 mr-2" />
                          تحديث الرصيد
                        </>
                      )}
                    </Button>
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

export default ActiveProviders;
