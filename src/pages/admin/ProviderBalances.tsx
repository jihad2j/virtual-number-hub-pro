
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCcw, AlertTriangle } from 'lucide-react';
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
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">أرصدة مزودي الخدمة</h1>
        <Button onClick={fetchBalances} disabled={isLoading}>
          <RefreshCcw className={`ml-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          تحديث الأرصدة
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providerBalances.map((provider) => (
          <Card key={provider.id} className={provider.error ? 'border-red-300' : 'border-green-300'}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle>{provider.name}</CardTitle>
                <Badge variant={provider.error ? "destructive" : "success"}>
                  {provider.code}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {provider.error ? (
                <div className="flex items-center text-red-500">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <p className="text-sm">{provider.error}</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {provider.balance?.balance}
                  </p>
                  <p className="text-gray-500">
                    {provider.balance?.currency}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      )}
    </div>
  );
};

export default ProviderBalances;
