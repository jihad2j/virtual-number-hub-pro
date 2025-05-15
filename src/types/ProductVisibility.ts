
import { Service } from './Country';

export interface ProductVisibility {
  id: string;
  productId: string;
  productName: string;
  countryId: string;
  countryName: string;
  providerId: string;
  providerName: string;
  originalPrice: number;
  displayPrice: number;
  isVisible: boolean;
  count?: number;
  updatedAt: string;
  createdAt: string;
}

export interface ProductVisibilityRequest {
  productId: string;
  countryId: string;
  providerId: string;
  displayPrice: number;
  isVisible: boolean;
}

export interface BulkUpdateProductsRequest {
  products: ProductVisibilityRequest[];
}

export interface ProviderProduct {
  countryId: string;
  countryName: string;
  products: Service[];
  provider: {
    id: string;
    name: string;
    code: string;
  };
}
