
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, AlertCircle, Globe, Package } from 'lucide-react';

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
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>نظام الشراء الجديد</CardTitle>
        <CardDescription>تم استبدال نظام الشراء القديم بنظام جديد يعتمد على التطبيقات</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-gray-500">
          <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p>يرجى استخدام النظام الجديد لشراء الأرقام من خلال التطبيقات المتاحة</p>
        </div>
      </CardContent>
    </Card>
  );
};
