
// This is a mock implementation - in a real app, you'd connect to your backend
// which would then securely connect to 5Sim and other provider APIs

export interface Country {
  id: string;
  name: string;
  flag: string;
  code: string;
  available: boolean;
}

export interface Provider {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  countries: string[]; // Country IDs
  isActive: boolean;
}

export interface PhoneNumber {
  id: string;
  number: string;
  country: string;
  provider: string;
  status: 'available' | 'sold' | 'expired';
  price: number;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: 'open' | 'closed';
  createdAt: string;
  responses: {
    id: string;
    message: string;
    fromAdmin: boolean;
    createdAt: string;
  }[];
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'deposit' | 'purchase';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: string;
}

// Mock data
const mockCountries: Country[] = [
  { id: '1', name: 'المملكة العربية السعودية', flag: '🇸🇦', code: 'sa', available: true },
  { id: '2', name: 'الإمارات العربية المتحدة', flag: '🇦🇪', code: 'ae', available: true },
  { id: '3', name: 'مصر', flag: '🇪🇬', code: 'eg', available: true },
  { id: '4', name: 'قطر', flag: '🇶🇦', code: 'qa', available: true },
  { id: '5', name: 'الكويت', flag: '🇰🇼', code: 'kw', available: true },
  { id: '6', name: 'عمان', flag: '🇴🇲', code: 'om', available: true },
  { id: '7', name: 'البحرين', flag: '🇧🇭', code: 'bh', available: true },
  { id: '8', name: 'الأردن', flag: '🇯🇴', code: 'jo', available: true },
  { id: '9', name: 'لبنان', flag: '🇱🇧', code: 'lb', available: false },
  { id: '10', name: 'المغرب', flag: '🇲🇦', code: 'ma', available: true },
];

const mockProviders: Provider[] = [
  { 
    id: '1', 
    name: '5Sim', 
    logo: '/assets/5sim-logo.png', 
    description: 'المزود الرئيسي للأرقام الافتراضية',
    countries: ['1', '2', '3', '4', '5'], 
    isActive: true 
  },
  { 
    id: '2', 
    name: 'SMSActivate', 
    logo: '/assets/sms-activate-logo.png',
    description: 'خدمة أرقام للتفعيل',
    countries: ['1', '2', '6', '7', '8', '10'], 
    isActive: true 
  },
];

// API Methods
export const api = {
  // Countries
  getCountries: async (): Promise<Country[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockCountries;
  },

  getAvailableCountries: async (): Promise<Country[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockCountries.filter(country => country.available);
  },

  // Providers
  getProviders: async (): Promise<Provider[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockProviders;
  },

  updateProvider: async (provider: Provider): Promise<Provider> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return provider;
  },

  addProvider: async (provider: Omit<Provider, 'id'>): Promise<Provider> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...provider, id: Math.random().toString(36).substring(7) };
  },

  // Phone Numbers
  getPhoneNumbers: async (countryId: string): Promise<PhoneNumber[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock phone numbers for the selected country
    return Array(5).fill(null).map((_, index) => ({
      id: `${countryId}-${index}`,
      number: `+${Math.floor(Math.random() * 100000000000)}`,
      country: countryId,
      provider: Math.random() > 0.5 ? '1' : '2',
      status: 'available',
      price: Math.floor(Math.random() * 5) + 1,
    }));
  },

  purchaseNumber: async (numberId: string): Promise<PhoneNumber> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      id: numberId,
      number: `+${Math.floor(Math.random() * 100000000000)}`,
      country: '1',
      provider: '1',
      status: 'sold',
      price: Math.floor(Math.random() * 5) + 1,
    };
  },

  // Support
  createSupportTicket: async (subject: string, message: string): Promise<SupportTicket> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id: Math.random().toString(36).substring(7),
      userId: '1',
      subject,
      message,
      status: 'open',
      createdAt: new Date().toISOString(),
      responses: [],
    };
  },

  // Transactions
  getTransactions: async (): Promise<Transaction[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return Array(10).fill(null).map((_, index) => ({
      id: index.toString(),
      userId: '1',
      amount: Math.random() * 100,
      type: Math.random() > 0.5 ? 'deposit' : 'purchase',
      status: 'completed',
      description: Math.random() > 0.5 ? 'إيداع رصيد' : 'شراء رقم افتراضي',
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    }));
  },

  addFunds: async (amount: number, method: 'card' | 'paypal'): Promise<Transaction> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      id: Math.random().toString(36).substring(7),
      userId: '1',
      amount,
      type: 'deposit',
      status: 'completed',
      description: `إيداع رصيد عبر ${method === 'card' ? 'بطاقة الائتمان' : 'PayPal'}`,
      createdAt: new Date().toISOString(),
    };
  },
};
