
export interface PhoneNumber {
  id: string;
  providerId?: string;
  userId?: string;
  number: string;
  countryCode: string;
  countryName?: string;
  countryId?: string;
  service: string;
  status: string;
  providerNumberId?: string;
  expiresAt: string | Date;
  price?: number;
  smsCode?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
