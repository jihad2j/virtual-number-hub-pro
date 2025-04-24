
import { importData, getCollection } from './database';

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

// Define the database item interfaces with the same fields as the export interfaces
interface DbCountry {
  _id: string;
  name: string;
  flag: string;
  code: string;
  available: boolean;
  [key: string]: any;
}

interface DbProvider {
  _id: string;
  name: string;
  logo?: string;
  description?: string;
  countries: string[];
  isActive: boolean;
  [key: string]: any;
}

interface DbPhoneNumber {
  _id: string;
  number: string;
  country: string;
  provider: string;
  status: 'available' | 'sold' | 'expired';
  price: number;
  [key: string]: any;
}

interface DbSupportTicket {
  _id: string;
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
  [key: string]: any;
}

interface DbTransaction {
  _id: string;
  userId: string;
  amount: number;
  type: 'deposit' | 'purchase';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: string;
  [key: string]: any;
}

// Mock data as alternative
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

// API methods
export const api = {
  // Initialize local data
  initLocalData: async () => {
    // Import initial data
    importData('countries', mockCountries);
    importData('providers', mockProviders);
    console.log('Local data initialized');
  },

  // Countries
  getCountries: async (): Promise<Country[]> => {
    try {
      const collection = await getCollection('countries');
      const countries = await collection.find().toArray() as DbCountry[];
      
      return countries.map(country => ({
        id: country._id.toString(),
        name: country.name || '',
        flag: country.flag || '',
        code: country.code || '',
        available: country.available || false,
      }));
    } catch (error) {
      console.error('Error fetching countries:', error);
      return mockCountries;
    }
  },

  getAvailableCountries: async (): Promise<Country[]> => {
    try {
      const collection = await getCollection('countries');
      const countries = await collection.find().toArray() as DbCountry[];
      
      return countries
        .filter(country => country.available)
        .map(country => ({
          id: country._id.toString(),
          name: country.name || '',
          flag: country.flag || '',
          code: country.code || '',
          available: country.available || false,
        }));
    } catch (error) {
      console.error('Error fetching available countries:', error);
      return mockCountries.filter(country => country.available);
    }
  },

  // Service providers
  getProviders: async (): Promise<Provider[]> => {
    try {
      const collection = await getCollection('providers');
      const providers = await collection.find().toArray() as DbProvider[];
      
      return providers.map(provider => ({
        id: provider._id.toString(),
        name: provider.name || '',
        logo: provider.logo || '',
        description: provider.description || '',
        countries: provider.countries || [],
        isActive: provider.isActive || false,
      }));
    } catch (error) {
      console.error('Error fetching service providers:', error);
      return mockProviders;
    }
  },

  updateProvider: async (provider: Provider): Promise<Provider> => {
    try {
      const collection = await getCollection('providers');
      const { id, ...providerData } = provider;
      
      await collection.updateOne(
        { _id: id },
        { $set: providerData }
      );
      
      return provider;
    } catch (error) {
      console.error('Error updating service provider:', error);
      return provider;
    }
  },

  addProvider: async (provider: Omit<Provider, 'id'>): Promise<Provider> => {
    try {
      const collection = await getCollection('providers');
      const result = await collection.insertOne(provider);
      
      return { 
        ...provider, 
        id: result.insertedId.toString() 
      };
    } catch (error) {
      console.error('Error adding service provider:', error);
      return { ...provider, id: Math.random().toString(36).substring(7) };
    }
  },

  // Phone numbers
  getPhoneNumbers: async (countryId: string): Promise<PhoneNumber[]> => {
    try {
      const collection = await getCollection('phoneNumbers');
      const phoneNumbers = await collection.find().toArray() as DbPhoneNumber[];
      
      const filteredNumbers = phoneNumbers.filter(
        number => (number.country === countryId && number.status === 'available')
      );
      
      if (filteredNumbers.length === 0) {
        // If no numbers found, create some mock data
        const mockNumbers = Array(5).fill(null).map((_, index) => ({
          _id: `${countryId}-${index}`,
          number: `+${Math.floor(Math.random() * 100000000000)}`,
          country: countryId,
          provider: Math.random() > 0.5 ? '1' : '2',
          status: 'available' as const,
          price: Math.floor(Math.random() * 5) + 1,
        }));
        
        // Save mock numbers in local database
        for (const number of mockNumbers) {
          await collection.insertOne(number);
        }
        
        return mockNumbers.map(number => ({
          id: number._id,
          number: number.number,
          country: number.country,
          provider: number.provider,
          status: number.status,
          price: number.price,
        }));
      }
      
      return filteredNumbers.map(number => ({
        id: number._id.toString(),
        number: number.number || '',
        country: number.country || '',
        provider: number.provider || '',
        status: number.status || 'available',
        price: number.price || 0,
      }));
    } catch (error) {
      console.error('Error fetching numbers:', error);
      return Array(5).fill(null).map((_, index) => ({
        id: `${countryId}-${index}`,
        number: `+${Math.floor(Math.random() * 100000000000)}`,
        country: countryId,
        provider: Math.random() > 0.5 ? '1' : '2',
        status: 'available',
        price: Math.floor(Math.random() * 5) + 1,
      }));
    }
  },

  purchaseNumber: async (numberId: string): Promise<PhoneNumber> => {
    try {
      const phoneCollection = await getCollection('phoneNumbers');
      const transactionCollection = await getCollection('transactions');
      
      // Update number status to "sold"
      await phoneCollection.updateOne(
        { _id: numberId },
        { $set: { status: 'sold' } }
      );
      
      // Get updated number details
      const phoneNumber = await phoneCollection.findOne({ _id: numberId }) as DbPhoneNumber;
      
      if (!phoneNumber) {
        throw new Error('Phone number not found');
      }
      
      // Create purchase transaction record
      await transactionCollection.insertOne({
        userId: '1', // Replace with actual user ID from auth context
        amount: phoneNumber.price || 0,
        type: 'purchase',
        status: 'completed',
        description: `Purchase of virtual number ${phoneNumber.number || ''}`,
        createdAt: new Date().toISOString(),
      });
      
      return {
        id: phoneNumber._id.toString(),
        number: phoneNumber.number || '',
        country: phoneNumber.country || '',
        provider: phoneNumber.provider || '',
        status: 'sold',
        price: phoneNumber.price || 0,
      };
    } catch (error) {
      console.error('Error purchasing number:', error);
      return {
        id: numberId,
        number: `+${Math.floor(Math.random() * 100000000000)}`,
        country: '1',
        provider: '1',
        status: 'sold',
        price: Math.floor(Math.random() * 5) + 1,
      };
    }
  },

  // Support tickets
  createSupportTicket: async (subject: string, message: string): Promise<SupportTicket> => {
    try {
      const collection = await getCollection('supportTickets');
      
      const ticket = {
        userId: '1', // Replace with actual user ID from auth context
        subject,
        message,
        status: 'open',
        createdAt: new Date().toISOString(),
        responses: [],
      };
      
      const result = await collection.insertOne(ticket);
      
      return {
        ...ticket,
        id: result.insertedId.toString(),
      } as SupportTicket;
    } catch (error) {
      console.error('Error creating support ticket:', error);
      return {
        id: Math.random().toString(36).substring(7),
        userId: '1',
        subject,
        message,
        status: 'open',
        createdAt: new Date().toISOString(),
        responses: [],
      };
    }
  },

  // Financial transactions
  getTransactions: async (): Promise<Transaction[]> => {
    try {
      const collection = await getCollection('transactions');
      const transactions = await collection.find().toArray() as DbTransaction[];
      
      const userTransactions = transactions.filter(tx => tx.userId === '1'); // Replace with actual user ID
      
      if (userTransactions.length === 0) {
        // Create mock transaction data
        const mockTxs = Array(10).fill(null).map((_, index) => ({
          _id: index.toString(),
          userId: '1',
          amount: Math.random() * 100,
          type: Math.random() > 0.5 ? 'deposit' : 'purchase',
          status: 'completed',
          description: Math.random() > 0.5 ? 'Balance deposit' : 'Virtual number purchase',
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        } as DbTransaction));
        
        // Save mock transactions to local database
        for (const tx of mockTxs) {
          await collection.insertOne(tx);
        }
        
        return mockTxs.map(tx => ({
          id: tx._id,
          userId: tx.userId,
          amount: tx.amount,
          type: tx.type as 'deposit' | 'purchase',
          status: tx.status as 'completed',
          description: tx.description,
          createdAt: tx.createdAt,
        }));
      }
      
      return userTransactions.map(transaction => ({
        id: transaction._id.toString(),
        userId: transaction.userId || '1',
        amount: transaction.amount || 0,
        type: transaction.type || 'deposit',
        status: transaction.status || 'completed',
        description: transaction.description || '',
        createdAt: transaction.createdAt || new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return Array(10).fill(null).map((_, index) => ({
        id: index.toString(),
        userId: '1',
        amount: Math.random() * 100,
        type: Math.random() > 0.5 ? 'deposit' : 'purchase',
        status: 'completed',
        description: Math.random() > 0.5 ? 'Balance deposit' : 'Virtual number purchase',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      }));
    }
  },

  addFunds: async (amount: number, method: 'card' | 'paypal'): Promise<Transaction> => {
    try {
      const collection = await getCollection('transactions');
      
      const transaction = {
        userId: '1', // Replace with actual user ID from auth context
        amount,
        type: 'deposit',
        status: 'completed',
        description: `Balance deposit via ${method === 'card' ? 'credit card' : 'PayPal'}`,
        createdAt: new Date().toISOString(),
      };
      
      const result = await collection.insertOne(transaction);
      
      return {
        ...transaction,
        id: result.insertedId.toString(),
      } as Transaction;
    } catch (error) {
      console.error('Error adding funds:', error);
      return {
        id: Math.random().toString(36).substring(7),
        userId: '1',
        amount,
        type: 'deposit',
        status: 'completed',
        description: `Balance deposit via ${method === 'card' ? 'credit card' : 'PayPal'}`,
        createdAt: new Date().toISOString(),
      };
    }
  },

  // Initialize database
  initDatabaseIfEmpty: async () => {
    try {
      // Call initLocalData to initialize data
      await api.initLocalData();
      console.log('Local database initialized');
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }
};
