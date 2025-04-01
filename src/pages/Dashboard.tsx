
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { api, Country, PhoneNumber } from '@/services/api';
import { DollarSign, Phone, Globe, ShoppingCart } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [purchasingNumber, setPurchasingNumber] = useState<string | null>(null);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const data = await api.getAvailableCountries();
      setCountries(data);
    } catch (error) {
      console.error('Failed to fetch countries', error);
    }
  };

  const handleSelectCountry = async (country: Country) => {
    setSelectedCountry(country);
    setIsLoading(true);
    
    try {
      const numbers = await api.getPhoneNumbers(country.id);
      setPhoneNumbers(numbers);
    } catch (error) {
      console.error('Failed to fetch phone numbers', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseNumber = async (numberId: string) => {
    setPurchasingNumber(numberId);
    
    try {
      await api.purchaseNumber(numberId);
      // In a real app, you'd update the user's balance and show the purchased number details
      // For demo, we'll just remove the number from the list
      setPhoneNumbers(phoneNumbers.filter(n => n.id !== numberId));
    } catch (error) {
      console.error('Failed to purchase number', error);
    } finally {
      setPurchasingNumber(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">رصيدك</p>
              <p className="font-bold text-2xl">${user?.balance.toFixed(2)}</p>
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
              <p className="font-bold text-2xl">{countries.length}</p>
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
              <p className="font-bold text-2xl">0</p>
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
              <p className="font-bold text-2xl">0</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>اختر الدولة</CardTitle>
            <CardDescription>اختر الدولة التي تريد شراء رقم منها</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 h-[400px] overflow-y-auto">
            {countries.map(country => (
              <Button
                key={country.id}
                variant={selectedCountry?.id === country.id ? "default" : "outline"}
                className="w-full justify-start gap-2 mb-2"
                onClick={() => handleSelectCountry(country)}
              >
                <span className="text-2xl">{country.flag}</span>
                <span>{country.name}</span>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>الأرقام المتاحة</CardTitle>
            <CardDescription>
              {selectedCountry 
                ? `الأرقام المتاحة في ${selectedCountry.name}` 
                : 'اختر دولة لعرض الأرقام المتاحة'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
              </div>
            ) : !selectedCountry ? (
              <div className="text-center py-12 text-gray-500">
                <Globe className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>الرجاء اختيار دولة لعرض الأرقام المتاحة</p>
              </div>
            ) : phoneNumbers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Phone className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>لا توجد أرقام متاحة حاليًا لهذه الدولة</p>
              </div>
            ) : (
              <div className="space-y-4">
                {phoneNumbers.map(number => (
                  <div 
                    key={number.id} 
                    className="border rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium text-lg">{number.number}</p>
                      <p className="text-sm text-gray-500">
                        المزود: {number.provider === '1' ? '5Sim' : 'SMSActivate'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-brand-600">${number.price.toFixed(2)}</p>
                      <Button 
                        onClick={() => handlePurchaseNumber(number.id)}
                        disabled={purchasingNumber === number.id}
                      >
                        {purchasingNumber === number.id ? 'جاري الشراء...' : 'شراء الآن'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
