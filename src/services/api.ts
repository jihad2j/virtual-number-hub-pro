import { importData, getCollection } from './database';
import { ObjectId } from 'mongodb';
import { toObjectId, getQueryId } from '../config/mongodb';

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
  apiKey?: string;
  apiUrl?: string;
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

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  balance: number;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface ManualService {
  id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
}

export interface ManualRequest {
  id: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  notes: string;
  adminResponse?: string;
  verificationCode?: string;
  createdAt: string;
  updatedAt?: string;
}

interface DbCountry {
  _id: string | ObjectId;
  name: string;
  flag: string;
  code: string;
  available: boolean;
  [key: string]: any;
}

interface DbProvider {
  _id: string | ObjectId;
  name: string;
  logo?: string;
  description?: string;
  countries: string[];
  isActive: boolean;
  apiKey?: string;
  apiUrl?: string;
  [key: string]: any;
}

interface DbPhoneNumber {
  _id: string | ObjectId;
  number: string;
  country: string;
  provider: string;
  status: 'available' | 'sold' | 'expired';
  price: number;
  [key: string]: any;
}

interface DbSupportTicket {
  _id: string | ObjectId;
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
  _id: string | ObjectId;
  userId: string;
  amount: number;
  type: 'deposit' | 'purchase';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: string;
  [key: string]: any;
}

interface DbUser {
  _id: string | ObjectId;
  username: string;
  email: string;
  role: 'admin' | 'user';
  balance: number;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  [key: string]: any;
}

interface DbManualService {
  _id: string | ObjectId;
  name: string;
  description: string;
  price: number;
  available: boolean;
  [key: string]: any;
}

interface DbManualRequest {
  _id: string | ObjectId;
  userId: string;
  serviceId: string;
  serviceName: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  notes: string;
  adminResponse?: string;
  verificationCode?: string;
  createdAt: string;
  updatedAt?: string;
  [key: string]: any;
}

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
    description: 'المزود الرئيس�� للأرقام الافتراضية',
    countries: ['1', '2', '3', '4', '5'], 
    isActive: true,
    apiKey: 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NzUwNzkzNjEsImlhdCI6MTc0MzU0MzM2MSwicmF5IjoiYzViYjRjNWNiZjA0N2U2OTI1OWI0YWUzOTM0MmQ1YjQiLCJzdWIiOjEyODQ5OTF9.b1IL-DlhrrOMhcAnq6pxoucrlboVoSbDbjZAI1kcIV63lAr9Kk0WvmE5KQf8a0WH1nkbGZR71i8sCRxCloIVGp08RFVFGsYpSos7flQtzoZs6_TPbuhwJoJKYgPKjNMZVT1Vi9_ywMGRBuOvsbBn6qcAGOCRLKByGuW8PwS7pxmmJbvsB3HD40ek5vFTHpFTxEwVz4OpAOjbmq-Aj6Vz-bz8ymndpIm6D2yGBhRV9aQ4yRrrG-zHZfA-1ayd6vQz969aQIK6sM2tsXRrPKO-hpbF4f7vtsg-RX41DqcZy3t2BWnlB2JwvTB_lLlrm_al0J4k-pqr6lR9TnjsJ3WXBg',
    apiUrl: 'https://5sim.net/v1'
  },
  { 
    id: '2', 
    name: 'SMSActivate', 
    logo: '/assets/sms-activate-logo.png',
    description: 'خدمة أرقام للتفعيل',
    countries: ['1', '2', '6', '7', '8', '10'], 
    isActive: true,
    apiKey: '89b3e2eeA774ffbcdbe2e4d81fcc4408',
    apiUrl: 'https://api.sms-activate.org/stubs/handler_api.php'
  },
];

const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    balance: 1000,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isActive: true,
  },
  {
    id: '2',
    username: 'user1',
    email: 'user1@example.com',
    role: 'user',
    balance: 50,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  },
  {
    id: '3',
    username: 'user2',
    email: 'user2@example.com',
    role: 'user',
    balance: 25,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  },
];

const mockManualServices: ManualService[] = [
  {
    id: '1',
    name: 'تفعيل واتساب',
    description: 'خدمة تفعيل حساب واتساب برقم افتراضي',
    price: 5,
    available: true,
  },
  {
    id: '2',
    name: 'تفعيل تليجرام',
    description: 'خدمة تفعيل حساب تليجرام برقم افتراضي',
    price: 4,
    available: true,
  },
];

const mockManualRequests: ManualRequest[] = [
  {
    id: '1',
    userId: '1',
    serviceId: '1',
    serviceName: 'تفعيل واتساب',
    status: 'pending',
    notes: 'أريد تفعيل رقم واتساب جديد',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    userId: '1',
    serviceId: '2',
    serviceName: 'تفعيل تليجرام',
    status: 'processing',
    notes: '',
    adminResponse: 'سيتم إرسال رمز التفعيل خلال دقائق',
    verificationCode: '123456',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    userId: '1',
    serviceId: '1',
    serviceName: 'تفعيل واتساب',
    status: 'completed',
    notes: '',
    adminResponse: 'تم تفعيل الرقم بنجاح',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const api = {
  initLocalData: async () => {
    importData('countries', mockCountries);
    importData('providers', mockProviders);
    importData('users', mockUsers);
    importData('manualServices', mockManualServices);
    importData('manualRequests', mockManualRequests);
    console.log('Local data initialized');
  },

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
  
  addCountries: async (countries: Omit<Country, 'id'>[]): Promise<Country[]> => {
    try {
      const collection = await getCollection('countries');
      
      const addedCountries: Country[] = [];
      for (const country of countries) {
        const result = await collection.insertOne(country as any);
        addedCountries.push({
          ...country,
          id: result.insertedId.toString()
        });
      }
      
      return addedCountries;
    } catch (error) {
      console.error('Error adding countries:', error);
      return countries.map((country, index) => ({
        ...country,
        id: `temp-${Date.now()}-${index}`
      }));
    }
  },

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
        apiKey: provider.apiKey || '',
        apiUrl: provider.apiUrl || '',
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
        { _id: getQueryId(id) },
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
      const result = await collection.insertOne(provider as any);
      
      return { 
        ...provider, 
        id: result.insertedId.toString() 
      };
    } catch (error) {
      console.error('Error adding service provider:', error);
      return { ...provider, id: Math.random().toString(36).substring(7) };
    }
  },
  
  deleteProvider: async (providerId: string): Promise<boolean> => {
    try {
      const collection = await getCollection('providers');
      const result = await collection.deleteOne({ _id: getQueryId(providerId) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting service provider:', error);
      return false;
    }
  },

  getPhoneNumbers: async (countryId: string): Promise<PhoneNumber[]> => {
    try {
      const collection = await getCollection('phoneNumbers');
      const phoneNumbers = await collection.find().toArray() as DbPhoneNumber[];
      
      const filteredNumbers = phoneNumbers.filter(
        number => (number.country === countryId && number.status === 'available')
      );
      
      if (filteredNumbers.length === 0) {
        const mockNumbers = Array(5).fill(null).map((_, index) => ({
          number: `+${Math.floor(Math.random() * 100000000000)}`,
          country: countryId,
          provider: Math.random() > 0.5 ? '1' : '2',
          status: 'available' as const,
          price: Math.floor(Math.random() * 5) + 1,
        }));
        
        for (const number of mockNumbers) {
          await collection.insertOne(number as any);
        }
        
        const savedNumbers = await collection.find().toArray() as DbPhoneNumber[];
        const filteredSavedNumbers = savedNumbers.filter(
          number => (number.country === countryId && number.status === 'available')
        );
        
        return filteredSavedNumbers.map(number => ({
          id: number._id.toString(),
          number: number.number || '',
          country: number.country || '',
          provider: number.provider || '',
          status: number.status || 'available',
          price: number.price || 0,
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
      
      await phoneCollection.updateOne(
        { _id: getQueryId(numberId) },
        { $set: { status: 'sold' } }
      );
      
      const phoneNumber = await phoneCollection.findOne({ _id: getQueryId(numberId) }) as DbPhoneNumber;
      
      if (!phoneNumber) {
        throw new Error('Phone number not found');
      }
      
      await transactionCollection.insertOne({
        userId: '1',
        amount: phoneNumber.price || 0,
        type: 'purchase',
        status: 'completed',
        description: `Purchase of virtual number ${phoneNumber.number || ''}`,
        createdAt: new Date().toISOString(),
      } as any);
      
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

  getUsers: async (): Promise<User[]> => {
    try {
      const collection = await getCollection('users');
      const users = await collection.find().toArray() as DbUser[];
      
      return users.map(user => ({
        id: user._id.toString(),
        username: user.username || '',
        email: user.email || '',
        role: user.role || 'user',
        balance: user.balance || 0,
        createdAt: user.createdAt || new Date().toISOString(),
        lastLogin: user.lastLogin,
        isActive: user.isActive || false,
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return mockUsers;
    }
  },
  
  addUser: async (user: Omit<User, 'id'>): Promise<User> => {
    try {
      const collection = await getCollection('users');
      const result = await collection.insertOne({
        ...user,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      } as any);
      
      return { 
        ...user, 
        id: result.insertedId.toString() 
      };
    } catch (error) {
      console.error('Error adding user:', error);
      return { ...user, id: Math.random().toString(36).substring(7) };
    }
  },
  
  updateUser: async (user: User): Promise<User> => {
    try {
      const collection = await getCollection('users');
      const { id, ...userData } = user;
      
      await collection.updateOne(
        { _id: getQueryId(id) },
        { $set: userData }
      );
      
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      return user;
    }
  },
  
  deleteUser: async (userId: string): Promise<boolean> => {
    try {
      const collection = await getCollection('users');
      const result = await collection.deleteOne({ _id: getQueryId(userId) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  },

  createSupportTicket: async (subject: string, message: string): Promise<SupportTicket> => {
    try {
      const collection = await getCollection('supportTickets');
      
      const ticket = {
        userId: '1',
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

  getTransactions: async (): Promise<Transaction[]> => {
    try {
      const collection = await getCollection('transactions');
      const transactions = await collection.find().toArray() as DbTransaction[];
      
      const userTransactions = transactions.filter(tx => tx.userId === '1');
      
      if (userTransactions.length === 0) {
        const mockTxs = Array(10).fill(null).map((_, index) => ({
          userId: '1',
          amount: Math.random() * 100,
          type: Math.random() > 0.5 ? 'deposit' : 'purchase',
          status: 'completed',
          description: Math.random() > 0.5 ? 'Balance deposit' : 'Virtual number purchase',
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        }));
        
        for (const tx of mockTxs) {
          await collection.insertOne(tx as any);
        }
        
        const savedTxs = await collection.find().toArray() as DbTransaction[];
        const filteredTxs = savedTxs.filter(tx => tx.userId === '1');
        
        return filteredTxs.map(transaction => ({
          id: transaction._id.toString(),
          userId: transaction.userId || '1',
          amount: transaction.amount || 0,
          type: transaction.type || 'deposit',
          status: transaction.status || 'completed',
          description: transaction.description || '',
          createdAt: transaction.createdAt || new Date().toISOString(),
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
        userId: '1',
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

  initDatabaseIfEmpty: async () => {
    try {
      await api.initLocalData();
      console.log('Local database initialized');
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  },

  getManualServices: async (): Promise<ManualService[]> => {
    try {
      const collection = await getCollection('manualServices');
      const services = await collection.find().toArray();
      
      return services.map(service => ({
        id: service._id.toString(),
        name: service.name || '',
        description: service.description || '',
        price: service.price || 0,
        available: service.available !== false,
      }));
    } catch (error) {
      console.error('Error fetching manual services:', error);
      return [
        {
          id: '1',
          name: 'تفعيل واتساب',
          description: 'خدمة تفعيل حساب واتساب برقم افتراضي',
          price: 5,
          available: true,
        },
        {
          id: '2',
          name: 'تفعيل تليجرام',
          description: 'خدمة تفعيل حساب تليجرام برقم افتراضي',
          price: 4,
          available: true,
        },
      ];
    }
  },

  createManualService: async (service: Omit<ManualService, 'id'>): Promise<ManualService> => {
    try {
      const collection = await getCollection('manualServices');
      const result = await collection.insertOne(service as any);
      
      return { 
        ...service, 
        id: result.insertedId.toString() 
      };
    } catch (error) {
      console.error('Error creating manual service:', error);
      return { 
        ...service, 
        id: Math.random().toString(36).substring(7) 
      };
    }
  },

  updateManualService: async (service: ManualService): Promise<ManualService> => {
    try {
      const collection = await getCollection('manualServices');
      const { id, ...serviceData } = service;
      
      await collection.updateOne(
        { _id: getQueryId(id) },
        { $set: serviceData }
      );
      
      return service;
    } catch (error) {
      console.error('Error updating manual service:', error);
      return service;
    }
  },

  deleteManualService: async (serviceId: string): Promise<boolean> => {
    try {
      const collection = await getCollection('manualServices');
      const result = await collection.deleteOne({ _id: getQueryId(serviceId) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting manual service:', error);
      return false;
    }
  },

  createManualRequest: async (request: { serviceId: string; notes?: string }): Promise<ManualRequest> => {
    try {
      const collection = await getCollection('manualRequests');
      const servicesCollection = await getCollection('manualServices');
      
      const service = await servicesCollection.findOne({ _id: getQueryId(request.serviceId) });
      
      if (!service) {
        throw new Error('Service not found');
      }
      
      const newRequest = {
        userId: '1',
        serviceId: request.serviceId,
        serviceName: service.name,
        status: 'pending',
        notes: request.notes || '',
        createdAt: new Date().toISOString(),
      };
      
      const result = await collection.insertOne(newRequest as any);
      
      return {
        ...newRequest,
        id: result.insertedId.toString(),
      } as ManualRequest;
    } catch (error) {
      console.error('Error creating manual request:', error);
      
      return {
        id: Math.random().toString(36).substring(7),
        userId: '1',
        serviceId: request.serviceId,
        serviceName: 'خدمة التفعيل',
        status: 'pending',
        notes: request.notes || '',
        createdAt: new Date().toISOString(),
      } as ManualRequest;
    }
  },

  getUserManualRequests: async (): Promise<ManualRequest[]> => {
    try {
      const collection = await getCollection('manualRequests');
      const userId = '1';
      
      const requests = await collection.find({ userId }).toArray();
      
      return requests.map(request => ({
        id: request._id.toString(),
        userId: request.userId,
        serviceId: request.serviceId,
        serviceName: request.serviceName,
        status: request.status,
        notes: request.notes || '',
        adminResponse: request.adminResponse,
        verificationCode: request.verificationCode,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
      }));
    } catch (error) {
      console.error('Error fetching user manual requests:', error);
      
      return [
        {
          id: '1',
          userId: '1',
          serviceId: '1',
          serviceName: 'تفعيل واتساب',
          status: 'pending',
          notes: 'أريد تفعيل رقم واتساب جديد',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          userId: '1',
          serviceId: '2',
          serviceName: 'تفعيل تليجرام',
          status: 'processing',
          notes: '',
          adminResponse: 'سيتم إرسال رمز التفعيل خلال دقائق',
          verificationCode: '123456',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          userId: '1',
          serviceId: '1',
          serviceName: 'تفعيل واتساب',
          status: 'completed',
          notes: '',
          adminResponse: 'تم تفعيل الرقم بنجاح',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
    }
  },

  getAllManualRequests: async (): Promise<ManualRequest[]> => {
    try {
      const collection = await getCollection('manualRequests');
      const requests = await collection.find().toArray();
      
      const usersCollection = await getCollection('users');
      const users = await usersCollection.find().toArray();
      
      return requests.map(request => {
        const user = users.find(u => u._id.toString() === request.userId);
        
        return {
          id: request._id.toString(),
          userId: request.userId,
          userName: user?.username || '',
          userEmail: user?.email || '',
          serviceId: request.serviceId,
          serviceName: request.serviceName,
          status: request.status,
          notes: request.notes || '',
          adminResponse: request.adminResponse,
          verificationCode: request.verificationCode,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt,
        };
      });
    } catch (error) {
      console.error('Error fetching all manual requests:', error);
      
      return [
        {
          id: '1',
          userId: '1',
          userName: 'user1',
          userEmail: 'user1@example.com',
          serviceId: '1',
          serviceName: 'تفعيل واتساب',
          status: 'pending',
          notes: 'أريد تفعيل رقم واتساب جديد',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          userId: '2',
          userName: 'user2',
          userEmail: 'user2@example.com',
          serviceId: '2',
          serviceName: 'تفعيل تليجرام',
          status: 'processing',
          notes: '',
          adminResponse: 'سيتم إرسال رمز التفعيل خلال دقائق',
          verificationCode: '123456',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        },
      ];
    }
  },

  respondToManualRequest: async (requestId: string, response: {
    adminResponse?: string;
    verificationCode?: string;
    status?: 'pending' | 'processing' | 'completed' | 'cancelled';
  }): Promise<boolean> => {
    try {
      const collection = await getCollection('manualRequests');
      
      const updateData = {
        ...response,
        updatedAt: new Date().toISOString()
      };
      
      const result = await collection.updateOne(
        { _id: getQueryId(requestId) },
        { $set: updateData }
      );
      
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error responding to manual request:', error);
      return true;
    }
  },

  updateManualRequestStatus: async (requestId: string, status: 'processing' | 'completed' | 'cancelled'): Promise<boolean> => {
    try {
      const collection = await getCollection('manualRequests');
      
      const result = await collection.updateOne(
        { _id: getQueryId(requestId) },
        { $set: { 
          status,
          updatedAt: new Date().toISOString()
        }}
      );
      
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error updating manual request status:', error);
      return true;
    }
  },

  confirmManualRequest: async (requestId: string): Promise<boolean> => {
    try {
      const collection = await getCollection('manualRequests');
      
      const result = await collection.updateOne(
        { _id: getQueryId(requestId) },
        { $set: { 
          status: 'completed',
          updatedAt: new Date().toISOString()
        }}
      );
      
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error confirming manual request:', error);
      return true;
    }
  },
};
