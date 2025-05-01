
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  LineChart,
  Line
} from "recharts";
import { api } from '@/services/api';
import { DollarSign, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { format } from 'date-fns';

// Sample data - would be replaced with real data from API
const sampleSalesData = [
  { name: 'يناير', sales: 4000, profits: 2400 },
  { name: 'فبراير', sales: 3000, profits: 1398 },
  { name: 'مارس', sales: 2000, profits: 9800 },
  { name: 'أبريل', sales: 2780, profits: 3908 },
  { name: 'مايو', sales: 1890, profits: 4800 },
  { name: 'يونيو', sales: 2390, profits: 3800 },
];

const AdminDashboard = () => {
  const [period, setPeriod] = useState('monthly');
  const [salesData, setSalesData] = useState(sampleSalesData);
  const [providerBalances, setProviderBalances] = useState<Record<string, { balance: number; currency: string }>>({});
  const [providers, setProviders] = useState<any[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const [totalSales, setTotalSales] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [prepaidCodes, setPrepaidCodes] = useState<any[]>([]);
  const [newCode, setNewCode] = useState({ amount: 10, count: 1 });
  const [openGenerateDialog, setOpenGenerateDialog] = useState(false);
  
  useEffect(() => {
    fetchData();
    calculateTotals();
  }, [period]);

  const fetchData = async () => {
    setIsLoadingProviders(true);
    try {
      // Fetch providers
      const providersData = await api.getAllProviders();
      setProviders(providersData);
      
      // Fetch balance for each provider
      for (const provider of providersData) {
        if (provider.isActive) {
          try {
            const balance = await api.getProviderBalance(provider.id);
            setProviderBalances(prev => ({
              ...prev,
              [provider.id]: balance
            }));
          } catch (error) {
            console.error(`Failed to fetch balance for provider ${provider.name}:`, error);
          }
        }
      }
      
      // Fetch prepaid codes
      const codes = await api.getPrepaidCodes();
      setPrepaidCodes(codes || []);
      
      // Fetch active users count
      const usersData = await api.getActiveUsersCount();
      setActiveUsers(usersData?.count || 0);
      
      // Fetch sales data based on period
      // This would be replaced with real API call
      // const periodSales = await api.getSalesData(period);
      // setSalesData(periodSales);
      
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
      toast.error('فشل في جلب بيانات لوحة التحكم');
    } finally {
      setIsLoadingProviders(false);
    }
  };

  const calculateTotals = () => {
    // Calculate total sales and profits from the data
    const totals = salesData.reduce((acc, curr) => {
      return {
        sales: acc.sales + curr.sales,
        profits: acc.profits + curr.profits
      };
    }, { sales: 0, profits: 0 });
    
    setTotalSales(totals.sales);
    setTotalProfit(totals.profits);
  };
  
  const generatePrepaidCodes = async () => {
    try {
      const { amount, count } = newCode;
      
      if (!amount || amount <= 0 || !count || count <= 0) {
        toast.error('يرجى إدخال قيم صحيحة');
        return;
      }
      
      // Generate prepaid codes through API
      await api.generatePrepaidCodes(amount, count);
      
      toast.success(`تم إنشاء ${count} كود بقيمة $${amount} بنجاح`);
      setOpenGenerateDialog(false);
      
      // Refresh codes list
      const codes = await api.getPrepaidCodes();
      setPrepaidCodes(codes || []);
      
    } catch (error) {
      console.error('Failed to generate prepaid codes', error);
      toast.error('فشل في إنشاء أكواد الشحن');
    }
  };
  
  const deletePrepaidCode = async (codeId: string) => {
    try {
      await api.deletePrepaidCode(codeId);
      toast.success('تم حذف الكود بنجاح');
      
      // Refresh codes list
      const codes = await api.getPrepaidCodes();
      setPrepaidCodes(codes || []);
      
    } catch (error) {
      console.error('Failed to delete prepaid code', error);
      toast.error('فشل في حذف كود الشحن');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">لوحة التحكم</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي المبيعات</p>
                <h2 className="text-2xl font-bold">${totalSales.toLocaleString()}</h2>
              </div>
              <div className="bg-primary/20 p-2 rounded-full">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+12%</span>
              <span className="text-muted-foreground ml-2">مقارنة بالشهر السابق</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الأرباح</p>
                <h2 className="text-2xl font-bold">${totalProfit.toLocaleString()}</h2>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+8%</span>
              <span className="text-muted-foreground ml-2">مقارنة بالشهر السابق</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">المستخدمين النشطين</p>
                <h2 className="text-2xl font-bold">{activeUsers}</h2>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <CreditCard className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+15%</span>
              <span className="text-muted-foreground ml-2">مقارنة بالشهر السابق</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">معدل التحويل</p>
                <h2 className="text-2xl font-bold">24.5%</h2>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <CreditCard className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-red-500 font-medium">-2%</span>
              <span className="text-muted-foreground ml-2">مقارنة بالشهر السابق</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>تحليل المبيعات والأرباح</CardTitle>
            <Tabs 
              value={period} 
              onValueChange={setPeriod}
              className="w-[240px]"
            >
              <TabsList>
                <TabsTrigger value="daily">يومي</TabsTrigger>
                <TabsTrigger value="weekly">أسبوعي</TabsTrigger>
                <TabsTrigger value="monthly">شهري</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <CardDescription>
            تفاصيل المبيعات والأرباح حسب الفترة المحددة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer className="h-[300px]" config={{
            sales: { label: "المبيعات", theme: { light: "#4f46e5", dark: "#818cf8" } },
            profits: { label: "الأرباح", theme: { light: "#10b981", dark: "#34d399" } },
          }}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="var(--color-sales)" strokeWidth={2} />
              <Line type="monotone" dataKey="profits" stroke="var(--color-profits)" strokeWidth={2} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Provider Balances */}
      <Card>
        <CardHeader>
          <CardTitle>أرصدة مزودي الخدمة</CardTitle>
          <CardDescription>
            الأرصدة المتاحة لدى مزودي الخدمة المختلفين
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingProviders ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
            </div>
          ) : providers.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>لا يوجد مزودي خدمة مضافين</p>
            </div>
          ) : (
            <div className="space-y-6">
              <ChartContainer className="h-[250px]" config={{
                ...providers.reduce((acc, provider) => ({
                  ...acc,
                  [provider.id]: { 
                    label: provider.name,
                    theme: { light: "#4f46e5", dark: "#818cf8" }
                  }
                }), {})
              }}>
                <BarChart data={providers.map(provider => ({
                  name: provider.name,
                  balance: providerBalances[provider.id]?.balance || 0,
                  id: provider.id
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="balance" name="الرصيد" fill="#4f46e5" />
                </BarChart>
              </ChartContainer>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {providers.map(provider => (
                  <Card key={provider.id} className="overflow-hidden">
                    <div className={`h-2 ${provider.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold">{provider.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {provider.isActive ? 'نشط' : 'غير نشط'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {providerBalances[provider.id] 
                              ? `${providerBalances[provider.id]?.balance} ${providerBalances[provider.id]?.currency}`
                              : 'غير متصل'}
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => api.refreshProviderBalance(provider.id).then(() => fetchData())}
                          >
                            تحديث الرصيد
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Prepaid Codes */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>أكواد الشحن المسبق</CardTitle>
            <Dialog open={openGenerateDialog} onOpenChange={setOpenGenerateDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">إنشاء أكواد جديدة</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إنشاء أكواد شحن جديدة</DialogTitle>
                  <DialogDescription>
                    أدخل القيمة وعدد الأكواد المراد إنشاؤها
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="amount" className="text-sm font-medium mb-2 block">
                        القيمة (بالدولار)
                      </label>
                      <select
                        id="amount"
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                        value={newCode.amount}
                        onChange={(e) => setNewCode(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      >
                        <option value={10}>$10</option>
                        <option value={20}>$20</option>
                        <option value={30}>$30</option>
                        <option value={50}>$50</option>
                        <option value={100}>$100</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="count" className="text-sm font-medium mb-2 block">
                        العدد
                      </label>
                      <Input
                        id="count"
                        type="number"
                        min="1"
                        max="100"
                        value={newCode.count}
                        onChange={(e) => setNewCode(prev => ({ ...prev, count: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenGenerateDialog(false)}>
                    إلغاء
                  </Button>
                  <Button onClick={generatePrepaidCodes}>
                    إنشاء
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>
            إدارة أكواد الشحن المسبق للتطبيق
          </CardDescription>
        </CardHeader>
        <CardContent>
          {prepaidCodes.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>لا توجد أكواد شحن متاحة</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-right">الكود</th>
                    <th className="py-2 px-4 text-right">القيمة</th>
                    <th className="py-2 px-4 text-right">الحالة</th>
                    <th className="py-2 px-4 text-right">تاريخ الإنشاء</th>
                    <th className="py-2 px-4 text-right">تاريخ الاستخدام</th>
                    <th className="py-2 px-4 text-right">المستخدم</th>
                    <th className="py-2 px-4 text-right">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {prepaidCodes.map(code => (
                    <tr key={code.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono">{code.code}</td>
                      <td className="py-3 px-4">${code.amount}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          code.isUsed 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {code.isUsed ? 'تم استخدامه' : 'متاح'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {format(new Date(code.createdAt), 'yyyy-MM-dd')}
                      </td>
                      <td className="py-3 px-4">
                        {code.usedAt ? format(new Date(code.usedAt), 'yyyy-MM-dd') : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {code.usedByUsername || '-'}
                      </td>
                      <td className="py-3 px-4">
                        {!code.isUsed && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => deletePrepaidCode(code.id)}
                          >
                            حذف
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
