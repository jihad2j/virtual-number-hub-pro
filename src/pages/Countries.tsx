
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api, Country } from '@/services/api';
import { Search } from 'lucide-react';

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
      console.log("Fetching countries for user view...");
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>الدول المتاحة</CardTitle>
          <CardDescription>جميع الدول المتاحة على المنصة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="ابحث عن دولة..."
              className="pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
            </div>
          ) : filteredCountries.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>لا توجد دول مطابقة لبحثك</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredCountries.map(country => (
                <div 
                  key={country.id} 
                  className="border rounded-lg p-4 text-center card-hover bg-white hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="text-4xl mb-2">{country.flag}</div>
                  <h3 className="font-medium">{country.name}</h3>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Countries;
