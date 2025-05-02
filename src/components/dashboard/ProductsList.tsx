
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, AlertCircle, Globe } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  price: number;
  count: number;
  available: boolean;
}

interface ProductsListProps {
  products: Record<string, Product>;
  selectedCountry: { name: string; iso: string } | null;
  onPurchase: (countryCode: string, productKey: string) => void;
  isLoading: boolean;
  error: string | null;
  onRetry: (countryCode: string) => void;
  isPurchasing: string | null;
}

export const ProductsList: React.FC<ProductsListProps> = ({
  products,
  selectedCountry,
  onPurchase,
  isLoading,
  error,
  onRetry,
  isPurchasing,
}) => {
  return (
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
        ) : isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <p>{error}</p>
            <Button 
              onClick={() => selectedCountry && onRetry(selectedCountry.iso)} 
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
                    onClick={() => selectedCountry && onPurchase(selectedCountry.iso, productKey)}
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
  );
};
