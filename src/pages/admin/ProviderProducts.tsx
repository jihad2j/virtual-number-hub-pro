
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Search, Filter, Save, RefreshCw } from "lucide-react";
import { api } from "@/services/api";
import { Country } from "@/types/Country";
import { Provider } from "@/types/Provider";
import { ProductVisibility, ProviderProduct } from "@/types/ProductVisibility";

const ProviderProducts: React.FC = () => {
  const { toast } = useToast();
  
  // States
  const [countries, setCountries] = useState<Country[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [products, setProducts] = useState<ProviderProduct | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [visibilitySettings, setVisibilitySettings] = useState<Map<string, ProductVisibility>>(new Map());
  
  // Loading states
  const [isLoadingCountries, setIsLoadingCountries] = useState<boolean>(false);
  const [isLoadingProviders, setIsLoadingProviders] = useState<boolean>(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Fetch providers and countries on mount
  useEffect(() => {
    fetchProviders();
    fetchCountries();
  }, []);

  // Fetch product visibility settings when provider and country are selected
  useEffect(() => {
    if (selectedProvider && selectedCountry) {
      fetchProducts(selectedProvider, selectedCountry);
    }
  }, [selectedProvider, selectedCountry]);

  const fetchProviders = async () => {
    try {
      setIsLoadingProviders(true);
      const providersData = await api.getAllProviders();
      setProviders(providersData);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب قائمة المزودين",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProviders(false);
    }
  };

  const fetchCountries = async () => {
    try {
      setIsLoadingCountries(true);
      const countriesData = await api.getAllCountries();
      setCountries(countriesData);
    } catch (error) {
      console.error('Error fetching countries:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب قائمة الدول",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCountries(false);
    }
  };

  const fetchProducts = async (providerId: string, countryCode: string) => {
    try {
      setIsLoadingProducts(true);
      // First, get all services from the provider
      const servicesData = await api.getProviderServices(providerId, countryCode);
      
      // Get the provider and country info
      const provider = providers.find(p => p.id === providerId);
      const country = countries.find(c => c.code === countryCode);
      
      if (!provider || !country) return;
      
      // Create provider products data
      const providerProductsData: ProviderProduct = {
        countryId: country.id,
        countryName: country.name,
        products: servicesData.map(service => ({
          ...service,
          available: true
        })),
        provider: {
          id: provider.id,
          name: provider.name,
          code: provider.code
        }
      };
      
      setProducts(providerProductsData);
      
      // Now fetch the visibility settings for these products
      try {
        const visibilityData = await api.getProductVisibilitySettings(providerId, country.id);
        const visibilityMap = new Map<string, ProductVisibility>();
        
        // Create a map with product IDs as keys for quick lookup
        visibilityData.forEach((item: ProductVisibility) => {
          visibilityMap.set(item.productId, item);
        });
        
        setVisibilitySettings(visibilityMap);
      } catch (error) {
        console.error('Error fetching visibility settings:', error);
        
        // If no visibility settings exist yet, create default ones in memory
        const newVisibilityMap = new Map<string, ProductVisibility>();
        
        providerProductsData.products.forEach(product => {
          newVisibilityMap.set(product.id, {
            id: '',
            productId: product.id,
            productName: product.name,
            countryId: country.id,
            countryName: country.name,
            providerId: provider.id,
            providerName: provider.name,
            originalPrice: product.price,
            displayPrice: product.price,
            isVisible: false,
            count: product.count,
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          });
        });
        
        setVisibilitySettings(newVisibilityMap);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب قائمة المنتجات",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleToggleVisibility = (productId: string) => {
    setVisibilitySettings(prev => {
      const newMap = new Map(prev);
      if (newMap.has(productId)) {
        const product = newMap.get(productId);
        if (product) {
          newMap.set(productId, { ...product, isVisible: !product.isVisible });
        }
      }
      return newMap;
    });
  };

  const handlePriceChange = (productId: string, price: number) => {
    setVisibilitySettings(prev => {
      const newMap = new Map(prev);
      if (newMap.has(productId)) {
        const product = newMap.get(productId);
        if (product) {
          newMap.set(productId, { ...product, displayPrice: price });
        }
      }
      return newMap;
    });
  };

  const saveVisibilitySettings = async () => {
    try {
      setIsSaving(true);
      
      const settingsToSave = Array.from(visibilitySettings.values()).map(setting => ({
        productId: setting.productId,
        countryId: setting.countryId,
        providerId: setting.providerId,
        displayPrice: setting.displayPrice,
        isVisible: setting.isVisible,
      }));
      
      await api.updateProductVisibilitySettings({ products: settingsToSave });
      
      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات عرض المنتجات بنجاح",
      });
    } catch (error) {
      console.error('Error saving visibility settings:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ إعدادات عرض المنتجات",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = products?.products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">إدارة منتجات المزودين</h1>
        <Button 
          onClick={saveVisibilitySettings} 
          className="flex items-center gap-2"
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          حفظ التغييرات
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>تصفية المنتجات</CardTitle>
          <CardDescription>اختر المزود والدولة لعرض المنتجات المتاحة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="provider">المزود</Label>
              <select 
                id="provider" 
                className="w-full mt-1 p-2 border border-gray-200 rounded-md"
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
              >
                <option value="">اختر المزود</option>
                {providers.map(provider => (
                  <option key={provider.id} value={provider.id}>{provider.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="country">الدولة</Label>
              <select 
                id="country" 
                className="w-full mt-1 p-2 border border-gray-200 rounded-md"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                disabled={!selectedProvider || isLoadingProviders}
              >
                <option value="">اختر الدولة</option>
                {countries.map(country => (
                  <option key={country.id} value={country.code}>{country.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="search">بحث</Label>
              <div className="relative mt-1">
                <Input 
                  id="search"
                  placeholder="البحث عن منتج..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>قائمة المنتجات</CardTitle>
          <CardDescription>
            {products ? `عرض ${filteredProducts?.length || 0} منتج من ${products.provider.name} في ${products.countryName}` : 'اختر مزود ودولة لعرض المنتجات'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingProducts ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
            </div>
          ) : products && filteredProducts && filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-right">رمز المنتج</th>
                    <th className="px-4 py-3 text-right">اسم المنتج</th>
                    <th className="px-4 py-3 text-right">السعر الأصلي</th>
                    <th className="px-4 py-3 text-right">سعر العرض</th>
                    <th className="px-4 py-3 text-right">العدد المتوفر</th>
                    <th className="px-4 py-3 text-center">الظهور للمستخدمين</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => {
                    const visibilitySetting = visibilitySettings.get(product.id);
                    return (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">{product.id}</td>
                        <td className="px-4 py-3">{product.name}</td>
                        <td className="px-4 py-3 text-gray-500">{product.price.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <Input 
                            type="number" 
                            value={visibilitySetting?.displayPrice || product.price}
                            onChange={(e) => handlePriceChange(product.id, Number(e.target.value))}
                            className="w-24"
                            min={0}
                            step={0.01}
                          />
                        </td>
                        <td className="px-4 py-3">{product.count || 'غير معروف'}</td>
                        <td className="px-4 py-3 text-center">
                          <Switch 
                            checked={visibilitySetting?.isVisible || false}
                            onCheckedChange={() => handleToggleVisibility(product.id)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : products ? (
            <div className="text-center py-12 text-gray-500">
              <Filter className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>لم يتم العثور على منتجات مطابقة</p>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <RefreshCw className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>الرجاء اختيار مزود ودولة لعرض المنتجات</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderProducts;
