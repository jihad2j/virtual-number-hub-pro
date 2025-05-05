
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { DollarSign, Phone, Globe, ShoppingCart, AlertCircle, RefreshCw, Search } from 'lucide-react';
import { api } from '@/services/api';
import { PhoneNumber } from '@/types/PhoneNumber';
import { Input } from '@/components/ui/input';
import { ProductVisibility } from '@/types/ProductVisibility';

interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
}

interface UserProfile {
  id?: string;
  email?: string;
  balance: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // States
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [visibleProducts, setVisibleProducts] = useState<ProductVisibility[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [balance, setBalance] = useState<number | null>(null);
  const [purchasedNumber, setPurchasedNumber] = useState<PhoneNumber | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Loading states
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Error states
  const [countriesError, setCountriesError] = useState<string | null>(null);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Fetch countries and profile on mount
  useEffect(() => {
    fetchCountries();
    fetchUserProfile();
  }, []);

  // Fetch products when a country is selected
  useEffect(() => {
    if (selectedCountry) {
      fetchVisibleProducts(selectedCountry.id);
    }
  }, [selectedCountry]);

  // Fetch available countries
  const fetchCountries = async () => {
    setIsLoadingCountries(true);
    setCountriesError(null);
    
    try {
      const countriesData = await api.getAvailableCountries();
      setCountries(countriesData);
      
      // Select the first country by default
      if (countriesData.length > 0 && !selectedCountry) {
        setSelectedCountry(countriesData[0]);
      }
    } catch (error) {
      console.error('Failed to fetch countries', error);
      setCountriesError('فشل في جلب قائمة الدول، يرجى المحاولة مرة أخرى.');
      toast({
        title: "خطأ",
        description: "فشل في جلب قائمة الدول، يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingCountries(false);
    }
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    setIsLoadingProfile(true);
    setProfileError(null);
    
    try {
      const userData = await api.getCurrentUser();
      setUserProfile({
        id: userData.id,
        email: userData.email,
        balance: userData.balance
      });
      setBalance(userData.balance);
    } catch (error) {
      console.error('Failed to fetch user profile', error);
      setProfileError('فشل في جلب بيانات المستخدم، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchCountries(),
        fetchUserProfile(),
        selectedCountry ? fetchVisibleProducts(selectedCountry.id) : Promise.resolve(),
        purchasedNumber ? checkNumber(purchasedNumber.id) : Promise.resolve()
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

  // Handle country selection
  const handleSelectCountry = async (country: Country) => {
    setSelectedCountry(country);
  };

  // Fetch visible products for a specific country
  const fetchVisibleProducts = async (countryId: string) => {
    setIsLoadingProducts(true);
    setProductsError(null);
    
    try {
      const productsData = await api.getVisibleProducts(countryId);
      setVisibleProducts(productsData);
    } catch (error) {
      console.error(`Failed to fetch products for country ${countryId}`, error);
      setProductsError('فشل في جلب قائمة المنتجات، يرجى المحاولة مرة أخرى.');
      toast({
        title: "خطأ",
        description: "فشل في جلب قائمة المنتجات، يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Purchase a phone number
  const handlePurchaseNumber = async (product: ProductVisibility) => {
    setIsPurchasing(product.productId);
    
    try {
      const phoneNumber = await api.purchasePhoneNumber(product.providerId, selectedCountry!.code, product.productId);
      setPurchasedNumber(phoneNumber);
      toast({
        title: "تم الشراء بنجاح",
        description: `تم شراء الرقم ${phoneNumber.number} بنجاح.`,
        variant: "default"
      });
      
      // Refresh user profile to update balance
      fetchUserProfile();
    } catch (error) {
      console.error('Failed to purchase number', error);
      toast({
        title: "خطأ",
        description: "فشل في شراء الرقم، يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setIsPurchasing(null);
    }
  };
  
  // Check number for updates
  const checkNumber = async (id: string) => {
    try {
      const updatedNumber = await api.checkPhoneNumber(id);
      setPurchasedNumber(updatedNumber);
      return updatedNumber;
    } catch (error) {
      console.error('Failed to check number status', error);
      toast({
        title: "خطأ",
        description: "فشل في التحقق من حالة الرقم.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Filter products by search term
  const filteredProducts = visibleProducts.filter(product => 
    product.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.productId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="البحث عن خدمة..." 
              className="pl-10 pr-4 min-w-[220px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            onClick={refreshData} 
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="dashboard-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="icon-container bg-blue-100">
              <DollarSign className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">رصيدك</p>
              {isLoadingProfile ? (
                <p className="font-bold text-2xl">جاري التحميل...</p>
              ) : profileError ? (
                <p className="text-red-500">خطأ في جلب الرصيد</p>
              ) : (
                <p className="font-bold text-2xl">{balance !== null ? balance.toFixed(2) : '0.00'} RUB</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="icon-container bg-green-100">
              <Globe className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">الدول المتاحة</p>
              {isLoadingCountries ? (
                <p className="font-bold text-2xl">جاري التحميل...</p>
              ) : countriesError ? (
                <p className="text-red-500">خطأ</p>
              ) : (
                <p className="font-bold text-2xl">{countries.length}</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="icon-container bg-purple-100">
              <Phone className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">الأرقام المشتراة</p>
              <p className="font-bold text-2xl">{purchasedNumber ? '1' : '0'}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="icon-container bg-orange-100">
              <ShoppingCart className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">الطلبات النشطة</p>
              <p className="font-bold text-2xl">{isPurchasing ? '1' : '0'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>اختر الدولة</CardTitle>
          <CardDescription>اختر الدولة التي تريد شراء رقم منها</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {isLoadingCountries ? (
              <div className="w-full flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
              </div>
            ) : countriesError ? (
              <div className="w-full text-center py-4 text-red-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>{countriesError}</p>
                <Button onClick={fetchCountries} className="mt-2">إعادة المحاولة</Button>
              </div>
            ) : countries.length === 0 ? (
              <div className="w-full text-center py-4 text-gray-500">
                <Globe className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>لا توجد دول متاحة حالياً</p>
              </div>
            ) : (
              countries.map(country => (
                <Button
                  key={country.id}
                  variant={selectedCountry?.id === country.id ? "default" : "outline"}
                  className="min-w-[120px]"
                  onClick={() => handleSelectCountry(country)}
                >
                  <span>{country.name}</span>
                </Button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>المنتجات المتاحة</CardTitle>
          <CardDescription>
            {selectedCountry 
              ? `المنتجات المتاحة في ${selectedCountry.name}` 
              : 'اختر دولة لعرض المنتجات المتاحة'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedCountry ? (
            <div className="text-center py-12 text-gray-500">
              <Globe className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>الرجاء اختيار دولة لعرض المنتجات المتاحة</p>
            </div>
          ) : isLoadingProducts ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
            </div>
          ) : productsError ? (
            <div className="text-center py-12 text-red-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-4" />
              <p>{productsError}</p>
              <Button 
                onClick={() => fetchVisibleProducts(selectedCountry.id)} 
                className="mt-4"
              >
                إعادة المحاولة
              </Button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Phone className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>لا توجد منتجات متاحة حالياً لهذه الدولة</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div 
                  key={product.productId} 
                  className="dashboard-card flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium">{product.productName || product.productId}</h3>
                      <p className="text-sm text-gray-500">مزود الخدمة: {product.providerName}</p>
                    </div>
                    <div className="bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-sm font-medium">
                      {product.displayPrice.toFixed(2)} RUB
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4">
                    <Button 
                      className="w-full"
                      onClick={() => handlePurchaseNumber(product)}
                      disabled={isPurchasing === product.productId}
                    >
                      {isPurchasing === product.productId ? 'جاري الشراء...' : 'شراء الآن'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {purchasedNumber && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>الرقم المشترى</CardTitle>
            <CardDescription>تفاصيل الرقم الذي تم شراؤه</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-lg bg-green-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">الرقم</p>
                  <p className="font-bold text-xl">{purchasedNumber.number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">البلد</p>
                  <p className="font-bold">{purchasedNumber.countryName || purchasedNumber.countryId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">الخدمة</p>
                  <p className="font-bold">{purchasedNumber.service}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">تاريخ الشراء</p>
                  <p className="font-bold">{new Date(purchasedNumber.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">الحالة</p>
                  <p className="font-bold">{purchasedNumber.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">تاريخ الانتهاء</p>
                  <p className="font-bold">{new Date(purchasedNumber.expiresAt).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <p className="font-bold">الرسائل المستلمة</p>
                {purchasedNumber.smsCode ? (
                  <div className="border p-3 rounded-lg">
                    <p className="font-bold text-green-600">الكود: {purchasedNumber.smsCode}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">لم يتم استلام أي رسائل بعد</p>
                )}
              </div>
              
              <div className="mt-4 space-x-2 flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={async () => {
                    try {
                      await api.cancelPhoneNumber(purchasedNumber.id);
                      setPurchasedNumber(null);
                      toast({
                        title: "تم الإلغاء",
                        description: "تم إلغاء الرقم بنجاح",
                      });
                      fetchUserProfile();
                    } catch (error) {
                      toast({
                        title: "خطأ",
                        description: "فشل في إلغاء الرقم",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  إلغاء الرقم
                </Button>
                <Button 
                  onClick={async () => {
                    try {
                      const updatedNumber = await api.checkPhoneNumber(purchasedNumber.id);
                      setPurchasedNumber(updatedNumber);
                      toast({
                        title: "تم التحديث",
                        description: "تم تحديث بيانات الرقم بنجاح",
                      });
                    } catch (error) {
                      toast({
                        title: "خطأ",
                        description: "فشل في تحديث بيانات الرقم",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  تحديث البيانات
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
