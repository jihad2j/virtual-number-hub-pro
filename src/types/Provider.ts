
export interface Provider {
  id: string;
  name: string;
  code: string;
  description?: string;
  countries: string[];
  isActive: boolean;
  apiKey: string;
  apiUrl?: string;
}
