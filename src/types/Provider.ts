
export interface Provider {
  id: string;
  name: string;
  code: string;
  description?: string;
  countries: string[];
  isActive: boolean;
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
}
