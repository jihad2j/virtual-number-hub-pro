
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCcw, AlertTriangle, DollarSign, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const ProviderBalances = () => {
  const [providerBalances, setProviderBalances] = useState<Array<{
    id: string;
    name: string;
    code: string;
    balance?: { balance: number; currency: string };
    error?: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBalances();
  }, []);

  const fetchBalances = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAllProvidersBalances();
      setProviderBalances(data);
      toast.success('تم تحديث أرصدة المزودين بنجاح');
    } catch (error) {
      console.error('Error fetching provider balances:', error);
      toast.error('فشل في جلب أرصدة المزودين');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 relative">
          <div className="absolute inset-0 bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="w-full h-full flex items-center justify-center">
              <DollarSign className="w-10 h-10 text-orange-500" />
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">أرصدة مزودي الخدمة</h1>
        <p className="text-gray-600 text-lg">متابعة أرصدة جميع مزودي الخدمة</p>
      </div>

      <div className="border-gradient-colorful">
        <Card className="bg-white shadow-xl border-0 rounded-2xl">
          <CardHeader className="pb-6">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-3 text-xl text-gray-800">
                  <DollarSign className="h-6 w-6 text-blue-500" />
                  أرصدة المزودين
                </CardTitle>
                <CardDescription className="text-gray-600 text-base mt-2">
                  عرض أرصدة جميع مزودي الخدمة المتاحين
                </CardDescription>
              </div>
              <Button 
                onClick={fetchBalances} 
                disabled={isLoading}
                className="orange-button px-6 py-3 text-base font-semibold"
              >
                <RefreshCcw className={`ml-2 h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                تحديث الأرصدة
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providerBalances.map((provider) => (
                <div key={provider.id} className={`floating-card p-6 rounded-2xl border ${provider.error ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-gray-800">{provider.name}</h3>
                    <Badge 
                      variant={provider.error ? "destructive" : "default"}
                      className={`${provider.error ? 'bg-red-500' : 'bg-green-500'} text-white px-3 py-1 rounded-full`}
                    >
                      {provider.code}
                    </Badge>
                  </div>
                  
                  {provider.error ? (
                    <div className="flex items-center text-red-600">
                      <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
                      <p className="text-sm font-medium">{provider.error}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-sm text-green-600 font-medium">متصل</span>
                      </div>
                      <p className="text-4xl font-bold text-green-600 mb-1">
                        {provider.balance?.balance}
                      </p>
                      <p className="text-gray-600 font-medium">
                        {provider.balance?.currency}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {isLoading && (
              <div className="flex justify-center my-12">
                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProviderBalances;
