
import { Country } from './Country';

export interface Provider {
  id: string;
  name: string;
  code: string;
  description?: string;
  // Support both string IDs and full Country objects, and allow null values
  countries: (string | Country | null)[];
  isActive: boolean;
  isDefault?: boolean;
  apiKey: string;
  apiUrl?: string;
  endpoints?: {
    balance?: string;
    countries?: string;
    products?: string;
    purchase?: string;
    status?: string;
    cancel?: string;
  };
  settings?: Record<string, any>;
  rateLimit?: {
    requestsPerMinute: number;
  };
  stats?: {
    successRate: number;
    totalRequests: number;
    lastCheck: string;
  };
}

export type ProviderCode = '5sim' | 'smsactivate' | 'getsmscode' | 'smsman' | 'onlinesims';

export interface ProviderBalance {
  balance: number;
  currency: string;
}
