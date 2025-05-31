
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api, Country } from '@/services/api';
import { Search, Globe, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Countries = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching available countries for user view...");
      const data = await api.getAvailableCountries();
      console.log("Fetched countries for user:", data);
      setCountries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch countries', error);
      setCountries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCountries = Array.isArray(countries) 
    ? countries.filter(country => 
        country.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 relative">
          <div className="absolute inset-0 bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="w-full h-full flex items-center justify-center">
              <Globe className="w-10 h-10 text-orange-500" />
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">الدول المتاحة</h1>
        <p className="text-gray-600 text-lg">اختر الدولة للحصول على رقم هاتف</p>
      </div>

      <div className="border-gradient-colorful">
        <Card className="bg-white shadow-xl border-0 rounded-2xl">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-xl text-gray-800">
              <MapPin className="h-6 w-6 text-blue-500" />
              جميع الدول المتاحة
            </CardTitle>
            <CardDescription className="text-gray-600 text-base">
              اختر من بين الدول المتاحة لطلب أرقام الهواتف
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="relative mb-8">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="ابحث عن دولة..."
                className="pr-12 h-14 text-lg rounded-xl border-gray-300 focus:border-orange-500 focus:ring-orange-200 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
              </div>
            ) : filteredCountries.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Globe className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">لا توجد دول مطابقة لبحثك</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredCountries.map(country => (
                  <Link 
                    to={`/dashboard/services/${country.code}`} 
                    key={country.id} 
                    className="floating-card p-6 text-center rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer border border-gray-200"
                  >
                    <div className="text-5xl mb-4">{country.flag}</div>
                    <h3 className="font-semibold text-gray-800 text-lg">{country.name}</h3>
                    <p className="text-gray-500 text-sm mt-2">انقر للاختيار</p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Countries;
