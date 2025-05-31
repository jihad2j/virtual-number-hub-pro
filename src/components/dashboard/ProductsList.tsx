
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, AlertCircle, Globe, Package, Smartphone } from 'lucide-react';

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

export const ProductsList: React.FC<ProductsListProps> = () => {
  return (
    <div className="border-gradient-colorful">
      <Card className="bg-white shadow-xl border-0 rounded-2xl lg:col-span-2">
        <CardHeader className="pb-6">
          <div className="text-center mb-4">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-orange-50 rounded-2xl border border-orange-200">
                <div className="w-full h-full flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>
            <CardTitle className="text-xl text-gray-800 mb-2">نظام الشراء الجديد</CardTitle>
            <CardDescription className="text-gray-600 text-base">
              تم استبدال نظام الشراء القديم بنظام جديد يعتمد على التطبيقات
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-10 h-10 text-gray-400" />
                </div>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">النظام الجديد متاح الآن</h3>
            <p className="text-gray-500 text-lg max-w-md mx-auto leading-relaxed">
              يرجى استخدام النظام الجديد لشراء الأرقام من خلال التطبيقات المتاحة
            </p>
            <Button className="orange-button mt-6 px-8 py-3 text-base font-semibold">
              <Globe className="w-5 h-5 mr-2" />
              استكشاف التطبيقات
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
