
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, AlertCircle } from 'lucide-react';

export interface Country {
  id: number;
  name: string;
  iso: string;
  prefix: string;
}

interface CountrySelectorProps {
  countries: Country[];
  selectedCountry: Country | null;
  onSelectCountry: (country: Country) => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  countries,
  selectedCountry,
  onSelectCountry,
  isLoading,
  error,
  onRetry,
}) => {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>اختر الدولة</CardTitle>
        <CardDescription>اختر الدولة التي تريد شراء رقم منها</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <p>{error}</p>
            <Button onClick={onRetry} className="mt-4">إعادة المحاولة</Button>
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
              onClick={() => onSelectCountry(country)}
            >
              <span>{country.name}</span>
              <span>({country.prefix})</span>
            </Button>
          ))
        )}
      </CardContent>
    </Card>
  );
};
