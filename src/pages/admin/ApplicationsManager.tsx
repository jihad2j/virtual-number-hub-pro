
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Server, MapPin, Package, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/services/apiClient';
import { Provider } from '@/types/Provider';
import { applicationApi, BaseApplication } from '@/services/api/applicationApi';

interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
}

interface ServerOption {
  id: string;
  name: string;
  price: number;
}

interface UserApplication {
  id: string;
  name: string;
  providerName: string;
  countryName: string;
  serverName: string;
  price: number;
}

const ApplicationsManager = () => {
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedApplication, setSelectedApplication] = useState<string>('');
  const [newAppPrice, setNewAppPrice] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch providers
  const { data: providers = [] } = useQuery({
    queryKey: ['admin-providers'],
    queryFn: async (): Promise<Provider[]> => {
      const response = await apiClient.get('/providers');
      return response.data.data;
    }
  });

  // Fetch countries based on selected provider
  const { data: countries = [] } = useQuery({
    queryKey: ['provider-countries', selectedProvider],
    queryFn: async (): Promise<Country[]> => {
      if (!selectedProvider) return [];
      const response = await apiClient.get(`/providers/code/${selectedProvider}/countries`);
      return response.data.data;
    },
    enabled: !!selectedProvider
  });

  // Fetch applications from database
  const { data: applications = [] } = useQuery({
    queryKey: ['admin-base-applications'],
    queryFn: applicationApi.getAllBaseApplications
  });

  // Fetch servers based on provider, country, and application
  const { data: servers = [] } = useQuery({
    queryKey: ['provider-servers', selectedProvider, selectedCountry, selectedApplication],
    queryFn: async (): Promise<ServerOption[]> => {
      if (!selectedProvider || !selectedCountry || !selectedApplication) return [];
      const response = await apiClient.get(`/providers/code/${selectedProvider}/services/${selectedCountry}`);
      return response.data.data.map((service: any) => ({
        id: service.id,
        name: service.name,
        price: service.price || 0
      }));
    },
    enabled: !!selectedProvider && !!selectedCountry && !!selectedApplication
  });

  // Fetch user applications
  const { data: userApplications = [] } = useQuery({
    queryKey: ['admin-user-applications'],
    queryFn: async (): Promise<UserApplication[]> => {
      const response = await apiClient.get('/applications/user');
      return response.data.data;
    }
  });

  // Add application mutation
  const addApplicationMutation = useMutation({
    mutationFn: async (data: {
      providerName: string;
      countryName: string;
      applicationName: string;
      serverName: string;
      price: number;
    }) => {
      const response = await apiClient.post('/applications/user', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('تم إضافة التطبيق بنجاح!');
      setIsAddDialogOpen(false);
      setNewAppPrice('');
      queryClient.invalidateQueries({ queryKey: ['admin-user-applications'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في إضافة التطبيق');
    }
  });

  const handleAddApplication = (serverName: string, serverPrice: number) => {
    const price = parseFloat(newAppPrice);
    if (!price || price <= 0) {
      toast.error('يرجى إدخال سعر صحيح');
      return;
    }

    const provider = providers.find(p => p.code === selectedProvider);
    const country = countries.find(c => c.code === selectedCountry);
    const application = applications.find(a => a.id === selectedApplication);

    if (!provider || !country || !application) {
      toast.error('يرجى اختيار جميع الخيارات المطلوبة');
      return;
    }

    addApplicationMutation.mutate({
      providerName: provider.name,
      countryName: country.name,
      applicationName: application.name,
      serverName,
      price
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">إدارة التطبيقات</h1>
        <p className="text-gray-600">إدارة المزودين والدول والتطبيقات والسيرفرات</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selection Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              إعدادات التطبيق
            </CardTitle>
            <CardDescription>اختر المزود والدولة والتطبيق لعرض السيرفرات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Providers List */}
            <div>
              <Label htmlFor="provider">المزود</Label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المزود" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.code}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Countries List */}
            <div>
              <Label htmlFor="country">الدولة</Label>
              <Select 
                value={selectedCountry} 
                onValueChange={setSelectedCountry}
                disabled={!selectedProvider}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الدولة" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.code}>
                      {country.flag} {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Applications List */}
            <div>
              <Label htmlFor="application">التطبيق</Label>
              <Select 
                value={selectedApplication} 
                onValueChange={setSelectedApplication}
                disabled={!selectedCountry}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر التطبيق" />
                </SelectTrigger>
                <SelectContent>
                  {applications.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      {app.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Servers List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              السيرفرات المتاحة
            </CardTitle>
            <CardDescription>اختر السيرفر وأضفه إلى تطبيقات المستخدمين</CardDescription>
          </CardHeader>
          <CardContent>
            {servers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                اختر المزود والدولة والتطبيق لعرض السيرفرات
              </div>
            ) : (
              <div className="space-y-3">
                {servers.map((server) => (
                  <div key={server.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{server.name}</div>
                      <div className="text-sm text-gray-500">السعر الأصلي: ${server.price}</div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          إضافة
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>إضافة تطبيق للمستخدمين</DialogTitle>
                          <DialogDescription>
                            إضافة {server.name} إلى قائمة التطبيقات المتاحة للمستخدمين
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="price">السعر للمستخدمين ($)</Label>
                            <Input
                              id="price"
                              type="number"
                              step="0.01"
                              value={newAppPrice}
                              onChange={(e) => setNewAppPrice(e.target.value)}
                              placeholder="أدخل السعر"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            onClick={() => handleAddApplication(server.name, server.price)}
                            disabled={addApplicationMutation.isPending}
                          >
                            {addApplicationMutation.isPending ? 'جاري الإضافة...' : 'إضافة التطبيق'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Applications List */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            التطبيقات المتاحة للمستخدمين
          </CardTitle>
          <CardDescription>قائمة بجميع التطبيقات المتاحة للشراء</CardDescription>
        </CardHeader>
        <CardContent>
          {userApplications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد تطبيقات مضافة بعد
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userApplications.map((app) => (
                <div key={app.id} className="border rounded-lg p-4">
                  <div className="font-medium text-lg mb-2">{app.name}</div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>المزود: {app.providerName}</div>
                    <div>الدولة: {app.countryName}</div>
                    <div>السيرفر: {app.serverName}</div>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <Badge variant="outline">${app.price}</Badge>
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

export default ApplicationsManager;
