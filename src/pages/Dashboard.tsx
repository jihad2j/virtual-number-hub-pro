import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { api } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Star, ShoppingCart, Phone, AlertCircle, RefreshCw } from 'lucide-react';
import { ProductVisibility } from '@/types/ProductVisibility';
import { PhoneNumber } from '@/types/PhoneNumber';

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
    <div className="space-y-5">
      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
        <Input 
          placeholder="البحث هنا..." 
          className="pl-4 pr-10 py-2 rounded-full bg-white shadow-sm border-gray-100"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Balance and Points Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="orange-card">
          <div className="flex justify-between items-start mb-1">
            <Star className="h-6 w-6 text-white" />
            <div className="text-left">
              <h3 className="text-lg font-semibold">النقاط</h3>
              <p className="text-2xl font-bold">1,850 نقطة</p>
            </div>
          </div>
          <div className="mt-3 text-center">
            <Button className="bg-white text-orange-500 hover:bg-gray-100 rounded-full py-1 px-4 text-sm font-medium">
              استبدال النقاط
            </Button>
          </div>
        </div>
        
        <div className="blue-card">
          <div className="flex justify-between items-start mb-1">
            <div className="text-left">
              <h3 className="text-lg font-semibold">الرصيد</h3>
              <p className="text-2xl font-bold">{balance !== null ? balance.toFixed(0) : '0'} ر.س</p>
            </div>
          </div>
          <div className="mt-3 text-center">
            <Button className="bg-white text-brand-500 hover:bg-gray-100 rounded-full py-1 px-4 text-sm font-medium">
              عرض التفاصيل
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold mb-4">أدوات سريعة</h2>
        <div className="grid grid-cols-4 gap-2">
          <div className="quick-action-item">
            <div className="quick-action-icon bg-yellow-50">
              <ShoppingCart className="h-6 w-6 text-yellow-500" />
            </div>
            <span className="text-xs">مسح</span>
          </div>
          
          <div className="quick-action-item">
            <div className="quick-action-icon bg-purple-50">
              <AlertCircle className="h-6 w-6 text-purple-500" />
            </div>
            <span className="text-xs">فواتير</span>
          </div>
          
          <div className="quick-action-item">
            <div className="quick-action-icon bg-green-50">
              <Phone className="h-6 w-6 text-green-500" />
            </div>
            <span className="text-xs">شحن</span>
          </div>
          
          <div className="quick-action-item">
            <div className="quick-action-icon bg-blue-50">
              <RefreshCw className="h-6 w-6 text-blue-500" />
            </div>
            <span className="text-xs">تحويل</span>
          </div>
        </div>
        <div className="mt-2 text-right">
          <a href="#" className="text-brand-500 text-sm">عرض الكل</a>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h2 className="text-xl font-bold mb-4">آخر العمليات</h2>
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-3 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-full">
                <ShoppingCart className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="font-semibold">متجر إلكترونيات</p>
                <p className="text-xs text-gray-500">اليوم 10:45 ص</p>
              </div>
            </div>
            <p className="text-red-500 font-semibold">- 250 ر.س</p>
          </div>
          
          <div className="bg-white rounded-lg p-3 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <RefreshCw className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="font-semibold">تحويل من صديق</p>
                <p className="text-xs text-gray-500">بالأمس 3:20 م</p>
              </div>
            </div>
            <p className="text-green-500 font-semibold">+ 500 ر.س</p>
          </div>
          
          <div className="bg-white rounded-lg p-3 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Phone className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-semibold">شحن رصيد</p>
                <p className="text-xs text-gray-500">بالأمس 11:15 ص</p>
              </div>
            </div>
            <p className="text-red-500 font-semibold">- 100 ر.س</p>
          </div>
        </div>
      </div>

      {/* Original content - Countries and Products (hidden but kept for functionality) */}
      <div className="hidden">
        {/* ... keep existing code for Countries selection, Products display, etc. */}
        
        {/* Countries selection */}
        {countries.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {countries.map(country => (
              <Button
                key={country.id}
                variant={selectedCountry?.id === country.id ? "default" : "outline"}
                className="min-w-[120px]"
                onClick={() => handleSelectCountry(country)}
              >
                <span>{country.name}</span>
              </Button>
            ))}
          </div>
        )}
        
        {/* Products */}
        {selectedCountry && filteredProducts.length > 0 && (
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
        
        {/* Purchased number display */}
        {purchasedNumber && (
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
        )}
      </div>
    </div>
  );
};

export default Dashboard;
