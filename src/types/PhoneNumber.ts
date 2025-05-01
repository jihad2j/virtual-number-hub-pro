
export interface PhoneNumber {
  id: string;
  number: string;
  countryId: string;
  countryName?: string;
  countryFlag?: string;
  service: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  smsCode?: string;
  expiresAt: string;
  userId: string;
  createdAt: string;
}
