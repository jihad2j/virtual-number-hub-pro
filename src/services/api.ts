
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

// بيانات تجريبية كبديل
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

// طرق API
export const api = {
  // تهيئة البيانات المحلية
  initLocalData: async () => {
    // استيراد البيانات المبدئية
    importData('countries', mockCountries);
    importData('providers', mockProviders);
    console.log('تم تهيئة البيانات المحلية');
  },

  // الدول
  getCountries: async (): Promise<Country[]> => {
    try {
      const collection = await getCollection('countries');
      const countries = await collection.find().toArray();
      
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
      const countries = await collection.find().toArray();
      
      return countries
        .filter(country => country.available)
        .map(country => ({
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

  // مزودي الخدمة
  getProviders: async (): Promise<Provider[]> => {
    try {
      const collection = await getCollection('providers');
      const providers = await collection.find().toArray();
      
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
        { _id: id },
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

  // أرقام الهاتف
  getPhoneNumbers: async (countryId: string): Promise<PhoneNumber[]> => {
    try {
      const collection = await getCollection('phoneNumbers');
      const phoneNumbers = await collection.find().toArray();
      
      const filteredNumbers = phoneNumbers.filter(
        number => number.country === countryId && number.status === 'available'
      );
      
      if (filteredNumbers.length === 0) {
        // إذا لم نجد أرقاماً، نُنشئ بعض البيانات التجريبية
        const mockNumbers = Array(5).fill(null).map((_, index) => ({
          _id: `${countryId}-${index}`,
          number: `+${Math.floor(Math.random() * 100000000000)}`,
          country: countryId,
          provider: Math.random() > 0.5 ? '1' : '2',
          status: 'available',
          price: Math.floor(Math.random() * 5) + 1,
        }));
        
        // حفظ الأرقام التجريبية في قاعدة البيانات المحلية
        for (const number of mockNumbers) {
          await collection.insertOne(number);
        }
        
        return mockNumbers.map(number => ({
          id: number._id,
          number: number.number,
          country: number.country,
          provider: number.provider,
          status: number.status as 'available',
          price: number.price,
        }));
      }
      
      return filteredNumbers.map(number => ({
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
      
      // تحديث حالة الرقم إلى "مباع"
      await phoneCollection.updateOne(
        { _id: numberId },
        { $set: { status: 'sold' } }
      );
      
      // الحصول على بيانات الرقم المحدثة
      const phoneNumber = await phoneCollection.findOne({ _id: numberId });
      
      if (!phoneNumber) {
        throw new Error('رقم الهاتف غير موجود');
      }
      
      // إنشاء سجل عملية شراء
      await transactionCollection.insertOne({
        userId: '1', // استبدل برقم المستخدم الفعلي من سياق المصادقة
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

  // الدعم الفني
  createSupportTicket: async (subject: string, message: string): Promise<SupportTicket> => {
    try {
      const collection = await getCollection('supportTickets');
      
      const ticket = {
        userId: '1', // استبدل برقم المستخدم الفعلي من سياق المصادقة
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

  // المعاملات المالية
  getTransactions: async (): Promise<Transaction[]> => {
    try {
      const collection = await getCollection('transactions');
      const transactions = await collection.find().toArray();
      
      const userTransactions = transactions.filter(tx => tx.userId === '1'); // استبدل برقم المستخدم الفعلي
      
      if (userTransactions.length === 0) {
        // إنشاء بيانات تجريبية للمعاملات
        const mockTxs = Array(10).fill(null).map((_, index) => ({
          _id: index.toString(),
          userId: '1',
          amount: Math.random() * 100,
          type: Math.random() > 0.5 ? 'deposit' : 'purchase',
          status: 'completed',
          description: Math.random() > 0.5 ? 'إيداع رصيد' : 'شراء رقم افتراضي',
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        }));
        
        // حفظ المعاملات التجريبية في قاعدة البيانات المحلية
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
        userId: '1', // استبدل برقم المستخدم الفعلي من سياق المصادقة
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

  // تهيئة قاعدة البيانات
  initDatabaseIfEmpty: async () => {
    try {
      // قم باستدعاء initLocalData لتهيئة البيانات
      await api.initLocalData();
      console.log('تم تهيئة قاعدة البيانات المحلية');
    } catch (error) {
      console.error('خطأ في تهيئة قاعدة البيانات:', error);
    }
  }
};
