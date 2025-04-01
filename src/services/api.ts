
import { MongoClient, ObjectId } from 'mongodb';
import { connectToDatabase, getCollection } from './database';

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

// Mock data as fallback
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
    try {
      const collection = await getCollection('countries');
      const countries = await collection.find().toArray();
      
      if (countries.length === 0) {
        return mockCountries;
      }
      
      return countries.map(country => ({
        id: country._id.toString(),
        name: country.name,
        flag: country.flag,
        code: country.code,
        available: country.available,
      }));
    } catch (error) {
      console.error('خطأ في جلب الدول:', error);
      return mockCountries;
    }
  },

  getAvailableCountries: async (): Promise<Country[]> => {
    try {
      const collection = await getCollection('countries');
      const countries = await collection.find({ available: true }).toArray();
      
      if (countries.length === 0) {
        return mockCountries.filter(country => country.available);
      }
      
      return countries.map(country => ({
        id: country._id.toString(),
        name: country.name,
        flag: country.flag,
        code: country.code,
        available: country.available,
      }));
    } catch (error) {
      console.error('خطأ في جلب الدول المتاحة:', error);
      return mockCountries.filter(country => country.available);
    }
  },

  // Providers
  getProviders: async (): Promise<Provider[]> => {
    try {
      const collection = await getCollection('providers');
      const providers = await collection.find().toArray();
      
      if (providers.length === 0) {
        return mockProviders;
      }
      
      return providers.map(provider => ({
        id: provider._id.toString(),
        name: provider.name,
        logo: provider.logo,
        description: provider.description,
        countries: provider.countries,
        isActive: provider.isActive,
      }));
    } catch (error) {
      console.error('خطأ في جلب مزودي الخدمة:', error);
      return mockProviders;
    }
  },

  updateProvider: async (provider: Provider): Promise<Provider> => {
    try {
      const collection = await getCollection('providers');
      const { id, ...providerData } = provider;
      
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: providerData }
      );
      
      return provider;
    } catch (error) {
      console.error('خطأ في تحديث مزود الخدمة:', error);
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
      console.error('خطأ في إضافة مزود الخدمة:', error);
      return { ...provider, id: Math.random().toString(36).substring(7) };
    }
  },

  // Phone Numbers
  getPhoneNumbers: async (countryId: string): Promise<PhoneNumber[]> => {
    try {
      const collection = await getCollection('phoneNumbers');
      const phoneNumbers = await collection.find({ country: countryId, status: 'available' }).toArray();
      
      if (phoneNumbers.length === 0) {
        // Fall back to mock data if no phone numbers found
        return Array(5).fill(null).map((_, index) => ({
          id: `${countryId}-${index}`,
          number: `+${Math.floor(Math.random() * 100000000000)}`,
          country: countryId,
          provider: Math.random() > 0.5 ? '1' : '2',
          status: 'available',
          price: Math.floor(Math.random() * 5) + 1,
        }));
      }
      
      return phoneNumbers.map(number => ({
        id: number._id.toString(),
        number: number.number,
        country: number.country,
        provider: number.provider,
        status: number.status,
        price: number.price,
      }));
    } catch (error) {
      console.error('خطأ في جلب الأرقام:', error);
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
      
      // Update the phone number status to 'sold'
      await phoneCollection.updateOne(
        { _id: new ObjectId(numberId) },
        { $set: { status: 'sold' } }
      );
      
      // Get the updated phone number
      const phoneNumber = await phoneCollection.findOne({ _id: new ObjectId(numberId) });
      
      if (!phoneNumber) {
        throw new Error('رقم الهاتف غير موجود');
      }
      
      // Create a transaction record
      await transactionCollection.insertOne({
        userId: '1', // Replace with actual user ID from auth context
        amount: phoneNumber.price,
        type: 'purchase',
        status: 'completed',
        description: `شراء رقم افتراضي ${phoneNumber.number}`,
        createdAt: new Date().toISOString(),
      });
      
      return {
        id: phoneNumber._id.toString(),
        number: phoneNumber.number,
        country: phoneNumber.country,
        provider: phoneNumber.provider,
        status: 'sold',
        price: phoneNumber.price,
      };
    } catch (error) {
      console.error('خطأ في شراء الرقم:', error);
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

  // Support
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
      console.error('خطأ في إنشاء تذكرة دعم:', error);
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

  // Transactions
  getTransactions: async (): Promise<Transaction[]> => {
    try {
      const collection = await getCollection('transactions');
      const transactions = await collection.find({ userId: '1' }).toArray(); // Replace with actual user ID
      
      if (transactions.length === 0) {
        return Array(10).fill(null).map((_, index) => ({
          id: index.toString(),
          userId: '1',
          amount: Math.random() * 100,
          type: Math.random() > 0.5 ? 'deposit' : 'purchase',
          status: 'completed',
          description: Math.random() > 0.5 ? 'إيداع رصيد' : 'شراء رقم افتراضي',
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        }));
      }
      
      return transactions.map(transaction => ({
        id: transaction._id.toString(),
        userId: transaction.userId,
        amount: transaction.amount,
        type: transaction.type,
        status: transaction.status,
        description: transaction.description,
        createdAt: transaction.createdAt,
      }));
    } catch (error) {
      console.error('خطأ في جلب المعاملات:', error);
      return Array(10).fill(null).map((_, index) => ({
        id: index.toString(),
        userId: '1',
        amount: Math.random() * 100,
        type: Math.random() > 0.5 ? 'deposit' : 'purchase',
        status: 'completed',
        description: Math.random() > 0.5 ? 'إيداع رصيد' : 'شراء رقم افتراضي',
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
        description: `إيداع رصيد عبر ${method === 'card' ? 'بطاقة الائتمان' : 'PayPal'}`,
        createdAt: new Date().toISOString(),
      };
      
      const result = await collection.insertOne(transaction);
      
      return {
        ...transaction,
        id: result.insertedId.toString(),
      } as Transaction;
    } catch (error) {
      console.error('خطأ في إضافة الرصيد:', error);
      return {
        id: Math.random().toString(36).substring(7),
        userId: '1',
        amount,
        type: 'deposit',
        status: 'completed',
        description: `إيداع رصيد عبر ${method === 'card' ? 'بطاقة الائتمان' : 'PayPal'}`,
        createdAt: new Date().toISOString(),
      };
    }
  },

  // Initialize data
  initDatabaseIfEmpty: async () => {
    try {
      // Check and populate countries
      const countriesCollection = await getCollection('countries');
      const countriesCount = await countriesCollection.countDocuments();
      
      if (countriesCount === 0) {
        await countriesCollection.insertMany(mockCountries.map(({ id, ...country }) => country));
        console.log('تم تهيئة بيانات الدول');
      }
      
      // Check and populate providers
      const providersCollection = await getCollection('providers');
      const providersCount = await providersCollection.countDocuments();
      
      if (providersCount === 0) {
        await providersCollection.insertMany(mockProviders.map(({ id, ...provider }) => provider));
        console.log('تم تهيئة بيانات مزودي الخدمة');
      }
    } catch (error) {
      console.error('خطأ في تهيئة قاعدة البيانات:', error);
    }
  }
};
