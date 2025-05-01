
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { DollarSign, Phone, Globe, ShoppingCart, AlertCircle, RefreshCw } from 'lucide-react';
import { providerService } from '@/services/providerService';
import { api } from '@/services/api';
import { PhoneNumber } from '@/types/PhoneNumber';

interface Country {
  id: number;
  name: string;
  iso: string;
  prefix: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  count: number;
  available: boolean;
}

interface UserProfile {
  id?: number;
  email?: string;
  balance: number;
  rating?: number;
  default_country?: {
    name: string;
    iso: string;
    prefix: string;
  };
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Provider ID - in a real app this might come from user settings or be configurable
  const providerId = '5sim'; // This would be the actual ID from the database
  
  // States
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [balance, setBalance] = useState<number | null>(null);
  const [purchasedNumber, setPurchasedNumber] = useState<PhoneNumber | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Loading states
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Error states
  const [countriesError, setCountriesError] = useState<string | null>(null);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Fetch countries and balance on mount
  useEffect(() => {
    fetchCountries();
    fetchBalance();
    fetchUserProfile();
  }, []);

  // Fetch countries from provider API via backend
  const fetchCountries = async () => {
    setIsLoadingCountries(true);
    setCountriesError(null);
    
    try {
      const countriesData = await providerService.getCountries(providerId);
      setCountries(countriesData);
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

  // Fetch balance from provider API via backend
  const fetchBalance = async () => {
    setIsLoadingBalance(true);
    setBalanceError(null);
    
    try {
      const balanceData = await providerService.getBalance(providerId);
      setBalance(balanceData.balance);
    } catch (error) {
      console.error('Failed to fetch balance', error);
      setBalanceError('فشل في جلب الرصيد، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoadingBalance(false);
    }
  };
  
  // Fetch user profile - we'll use a simplified version since the provider service
  // doesn't have a direct method for this - in a real app, we might add one
  const fetchUserProfile = async () => {
    setIsLoadingProfile(true);
    setProfileError(null);
    
    try {
      // Use the balance as a basic profile for now
      const balanceData = await providerService.getBalance(providerId);
      setUserProfile({
        balance: balanceData.balance,
        email: user?.email || ""
      });
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
        selectedCountry ? fetchProducts(selectedCountry.iso) : Promise.resolve(),
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
    fetchProducts(country.iso);
  };

  // Fetch products for a specific country
  const fetchProducts = async (countryCode: string) => {
    setIsLoadingProducts(true);
    setProductsError(null);
    
    try {
      const productsData = await providerService.getServices(providerId, countryCode);
      // Convert array to Record<string, Product> format
      const productsRecord: Record<string, Product> = {};
      productsData.forEach((product: Product) => {
        productsRecord[product.id] = product;
      });
      setProducts(productsRecord);
    } catch (error) {
      console.error(`Failed to fetch products for ${countryCode}`, error);
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
  const handlePurchaseNumber = async (country: string, product: string) => {
    setIsPurchasing(product);
    
    try {
      const phoneNumber = await providerService.purchaseNumber(providerId, country, product);
      setPurchasedNumber(phoneNumber);
      toast({
        title: "تم الشراء بنجاح",
        description: `تم شراء الرقم ${phoneNumber.number} بنجاح.`,
        variant: "default"
      });
      
      // Refresh balance after purchase
      fetchBalance();
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
      const updatedNumber = await providerService.checkNumber(id);
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">رصيدك</p>
              {isLoadingBalance ? (
                <p className="font-bold text-2xl">جاري التحميل...</p>
              ) : balanceError ? (
                <p className="text-red-500">خطأ في جلب الرصيد</p>
              ) : (
                <p className="font-bold text-2xl">{balance !== null ? balance.toFixed(2) : '0.00'} RUB</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
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
        
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Phone className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">الأرقام المشتراة</p>
              <p className="font-bold text-2xl">{purchasedNumber ? '1' : '0'}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">الطلبات النشطة</p>
              <p className="font-bold text-2xl">{isPurchasing ? '1' : '0'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {userProfile && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>معلومات الحساب</CardTitle>
            <CardDescription>بيانات حساب المزود</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {userProfile.email && (
                <div>
                  <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                  <p className="font-bold">{userProfile.email}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">الرصيد</p>
                <p className="font-bold">{userProfile.balance.toFixed(2)} RUB</p>
              </div>
              {userProfile.rating !== undefined && (
                <div>
                  <p className="text-sm text-gray-500">التقييم</p>
                  <p className="font-bold">{userProfile.rating} / 96</p>
                </div>
              )}
              {userProfile.default_country && (
                <div>
                  <p className="text-sm text-gray-500">الدولة الافتراضية</p>
                  <p className="font-bold">{userProfile.default_country.name} ({userProfile.default_country.prefix})</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>اختر الدولة</CardTitle>
            <CardDescription>اختر الدولة التي تريد شراء رقم منها</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 h-[400px] overflow-y-auto">
            {isLoadingCountries ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
              </div>
            ) : countriesError ? (
              <div className="text-center py-12 text-red-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                <p>{countriesError}</p>
                <Button onClick={fetchCountries} className="mt-4">إعادة المحاولة</Button>
              </div>
            ) : countries.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Globe className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>لا توجد دول متاحة حالياً</p>
              </div>
            ) : (
              countries.map(country => (
                <Button
                  key={country.id}
                  variant={selectedCountry?.id === country.id ? "default" : "outline"}
                  className="w-full justify-start gap-2 mb-2"
                  onClick={() => handleSelectCountry(country)}
                >
                  <span>{country.name}</span>
                  <span>({country.prefix})</span>
                </Button>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
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
                  onClick={() => fetchProducts(selectedCountry.iso)} 
                  className="mt-4"
                >
                  إعادة المحاولة
                </Button>
              </div>
            ) : Object.keys(products).length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Phone className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>لا توجد منتجات متاحة حالياً لهذه الدولة</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(products).map(([productKey, product]) => (
                  <div 
                    key={productKey} 
                    className="border rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium text-lg">{productKey}</p>
                      <p className="text-sm text-gray-500">
                        عدد الأرقام المتاحة: {product.count}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-brand-600">{product.price.toFixed(2)} RUB</p>
                      <Button 
                        onClick={() => handlePurchaseNumber(selectedCountry.iso, productKey)}
                        disabled={isPurchasing === productKey || product.count === 0}
                      >
                        {isPurchasing === productKey ? 'جاري الشراء...' : 'شراء الآن'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {purchasedNumber && (
        <Card>
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
                      await providerService.cancelNumber(purchasedNumber.id);
                      setPurchasedNumber(null);
                      toast({
                        title: "تم الإلغاء",
                        description: "تم إلغاء الرقم بنجاح",
                      });
                      fetchBalance();
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
                      const updatedNumber = await providerService.checkNumber(purchasedNumber.id);
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
