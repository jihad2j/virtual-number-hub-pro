
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { RefreshCw } from 'lucide-react';
import { providerService } from '@/services/providerService';
import { PhoneNumber } from '@/types/PhoneNumber';

// Import our new components
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { UserProfileCard, UserProfileData } from '@/components/dashboard/UserProfileCard';
import { CountrySelector, Country } from '@/components/dashboard/CountrySelector';
import { ProductsList, Product } from '@/components/dashboard/ProductsList';
import { PhoneNumberDetails } from '@/components/dashboard/PhoneNumberDetails';

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
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  
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
  
  // Fetch user profile
  const fetchUserProfile = async () => {
    setIsLoadingProfile(true);
    setProfileError(null);
    
    try {
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

  // Cancel a purchased number
  const handleCancelNumber = async (id: string) => {
    try {
      await providerService.cancelNumber(id);
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
  };

  // Update phone number details
  const handleUpdateNumber = async (id: string) => {
    try {
      const updatedNumber = await providerService.checkNumber(id);
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

      <DashboardStats 
        balance={balance}
        countriesCount={countries.length}
        purchasedNumbersCount={purchasedNumber ? 1 : 0}
        activePurchasesCount={isPurchasing}
        isLoadingBalance={isLoadingBalance}
        isLoadingCountries={isLoadingCountries}
        balanceError={balanceError}
        countriesError={countriesError}
      />
      
      <UserProfileCard userProfile={userProfile} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CountrySelector 
          countries={countries}
          selectedCountry={selectedCountry}
          onSelectCountry={handleSelectCountry}
          isLoading={isLoadingCountries}
          error={countriesError}
          onRetry={fetchCountries}
        />

        <ProductsList 
          products={products}
          selectedCountry={selectedCountry}
          onPurchase={handlePurchaseNumber}
          isLoading={isLoadingProducts}
          error={productsError}
          onRetry={fetchProducts}
          isPurchasing={isPurchasing}
        />
      </div>

      <PhoneNumberDetails 
        purchasedNumber={purchasedNumber}
        onCancel={handleCancelNumber}
        onUpdate={handleUpdateNumber}
      />
    </div>
  );
};

export default Dashboard;
