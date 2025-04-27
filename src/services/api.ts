
import apiClient from './apiClient';
import { toast } from 'sonner';
import { getQueryId } from '../config/mongodb';

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
  userName?: string; // Only used in admin interfaces
  userEmail?: string; // Only used in admin interfaces
  serviceId: string;
  serviceName: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  notes: string;
  adminResponse?: string;
  verificationCode?: string;
  createdAt: string;
  updatedAt?: string;
}

export const api = {
  initLocalData: async () => {
    try {
      await apiClient.post('/init');
      console.log('Data initialized via API');
      return true;
    } catch (error) {
      console.error('Failed to initialize data:', error);
      return false;
    }
  },

  getCountries: async (): Promise<Country[]> => {
    try {
      const response = await apiClient.get('/countries');
      // تحقق من هيكل البيانات واستخراج مصفوفة الدول بشكل صحيح
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // إذا كانت البيانات موجودة في حقل data
        return response.data.data.map((country: any) => ({
          id: country.id || country._id,
          name: country.name,
          flag: country.flag,
          code: country.code,
          available: country.available
        }));
      } else if (Array.isArray(response.data)) {
        // إذا كانت البيانات مباشرة في response.data
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching countries:', error);
      toast.error('فشل في جلب الدول');
      return [];
    }
  },

  getAvailableCountries: async (): Promise<Country[]> => {
    try {
      const response = await apiClient.get('/countries/available');
      // تطبيق نفس منطق المعالجة كما في getCountries
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data.map((country: any) => ({
          id: country.id || country._id,
          name: country.name,
          flag: country.flag,
          code: country.code,
          available: country.available
        }));
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching available countries:', error);
      toast.error('فشل في جلب الدول المتاحة');
      return [];
    }
  },
  
  addCountries: async (countries: Omit<Country, 'id'>[]): Promise<Country[]> => {
    try {
      const response = await apiClient.post('/countries', countries);
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error adding countries:', error);
      toast.error('فشل في إضافة الدول');
      return [];
    }
  },

  getProviders: async (): Promise<Provider[]> => {
    try {
      const response = await apiClient.get('/providers');
      return response.data;
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast.error('فشل في جلب مزودي الخدمة');
      return [];
    }
  },

  updateProvider: async (provider: Provider): Promise<Provider> => {
    try {
      const response = await apiClient.put(`/providers/${provider.id}`, provider);
      toast.success('تم تحديث مزود الخدمة بنجاح');
      return response.data;
    } catch (error) {
      console.error('Error updating provider:', error);
      toast.error('فشل في تحديث مزود الخدمة');
      return provider;
    }
  },

  addProvider: async (provider: Omit<Provider, 'id'>): Promise<Provider> => {
    try {
      const response = await apiClient.post('/providers', provider);
      toast.success('تم إضافة مزود الخدمة بنجاح');
      return response.data;
    } catch (error) {
      console.error('Error adding provider:', error);
      toast.error('فشل في إضافة مزود الخدمة');
      return { ...provider, id: Math.random().toString(36).substring(7) };
    }
  },
  
  deleteProvider: async (providerId: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/providers/${providerId}`);
      toast.success('تم حذف مزود الخدمة بنجاح');
      return true;
    } catch (error) {
      console.error('Error deleting provider:', error);
      toast.error('فشل في حذف مزود الخدمة');
      return false;
    }
  },

  getPhoneNumbers: async (countryId: string): Promise<PhoneNumber[]> => {
    try {
      const response = await apiClient.get(`/numbers/country/${countryId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching phone numbers:', error);
      toast.error('فشل في جلب الأرقام');
      return [];
    }
  },

  purchaseNumber: async (numberId: string): Promise<PhoneNumber> => {
    try {
      const response = await apiClient.post(`/numbers/purchase/${numberId}`);
      toast.success('تم شراء الرقم بنجاح');
      return response.data;
    } catch (error) {
      console.error('Error purchasing number:', error);
      toast.error('فشل في شراء الرقم');
      throw error;
    }
  },

  getUsers: async (): Promise<User[]> => {
    try {
      const response = await apiClient.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('فشل في جلب المستخدمين');
      return [];
    }
  },
  
  addUser: async (user: Omit<User, 'id'>): Promise<User> => {
    try {
      const response = await apiClient.post('/users', user);
      toast.success('تم إضافة المستخدم بنجاح');
      return response.data;
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('فشل في إضافة المستخدم');
      return { ...user, id: Math.random().toString(36).substring(7) };
    }
  },
  
  updateUser: async (user: User): Promise<User> => {
    try {
      const response = await apiClient.put(`/users/${user.id}`, user);
      toast.success('تم تحديث المستخدم بنجاح');
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('فشل في تحديث المستخدم');
      return user;
    }
  },
  
  deleteUser: async (userId: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/users/${userId}`);
      toast.success('تم حذف المستخدم بنجاح');
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('فشل في حذف المستخدم');
      return false;
    }
  },

  createSupportTicket: async (subject: string, message: string): Promise<SupportTicket> => {
    try {
      const response = await apiClient.post('/support', { subject, message });
      toast.success('تم إرسال تذكرة الدعم بنجاح');
      return response.data;
    } catch (error) {
      console.error('Error creating support ticket:', error);
      toast.error('فشل في إرسال تذكرة الدعم');
      throw error;
    }
  },

  getTransactions: async (): Promise<Transaction[]> => {
    try {
      const response = await apiClient.get('/transactions');
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('فشل في جلب المعاملات');
      return [];
    }
  },

  addFunds: async (amount: number, method: 'card' | 'paypal'): Promise<Transaction> => {
    try {
      const response = await apiClient.post('/transactions/deposit', { amount, method });
      toast.success('تمت إضافة الرصيد بنجاح');
      return response.data;
    } catch (error) {
      console.error('Error adding funds:', error);
      toast.error('فشل في إضافة الرصيد');
      throw error;
    }
  },

  getManualServices: async (): Promise<ManualService[]> => {
    try {
      const response = await apiClient.get('/manual-services');
      return response.data;
    } catch (error) {
      console.error('Error fetching manual services:', error);
      toast.error('فشل في جلب خدمات التفعيل اليدوي');
      return [];
    }
  },

  createManualService: async (service: Omit<ManualService, 'id'>): Promise<ManualService> => {
    try {
      const response = await apiClient.post('/manual-services', service);
      toast.success('تم إضافة خدمة التفعيل اليدوي بنجاح');
      return response.data;
    } catch (error) {
      console.error('Error creating manual service:', error);
      toast.error('فشل في إضافة خدمة التفعيل اليدوي');
      return { ...service, id: Math.random().toString(36).substring(7) };
    }
  },

  updateManualService: async (service: ManualService): Promise<ManualService> => {
    try {
      const response = await apiClient.put(`/manual-services/${service.id}`, service);
      toast.success('تم تحديث خدمة التفعيل اليدوي بنجاح');
      return response.data;
    } catch (error) {
      console.error('Error updating manual service:', error);
      toast.error('فشل في تحديث خدمة التفعيل اليدوي');
      return service;
    }
  },

  deleteManualService: async (serviceId: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/manual-services/${serviceId}`);
      toast.success('تم حذف خدمة التفعيل اليدوي بنجاح');
      return true;
    } catch (error) {
      console.error('Error deleting manual service:', error);
      toast.error('فشل في حذف خدمة التفعيل اليدوي');
      return false;
    }
  },

  createManualRequest: async (request: { serviceId: string; notes?: string }): Promise<ManualRequest> => {
    try {
      const response = await apiClient.post('/manual-requests', request);
      toast.success('تم إرسال طلب التفعيل اليدوي بنجاح');
      return response.data;
    } catch (error) {
      console.error('Error creating manual request:', error);
      toast.error('فشل في إرسال طلب التفعيل اليدوي');
      throw error;
    }
  },

  getUserManualRequests: async (): Promise<ManualRequest[]> => {
    try {
      const response = await apiClient.get('/manual-requests/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching user manual requests:', error);
      toast.error('فشل في جلب طلبات التفعيل اليدوي');
      return [];
    }
  },

  getAllManualRequests: async (): Promise<ManualRequest[]> => {
    try {
      const response = await apiClient.get('/manual-requests');
      return response.data;
    } catch (error) {
      console.error('Error fetching all manual requests:', error);
      toast.error('فشل في جلب جميع طلبات التفعيل اليدوي');
      return [];
    }
  },

  respondToManualRequest: async (requestId: string, response: {
    adminResponse?: string;
    verificationCode?: string;
    status?: 'pending' | 'processing' | 'completed' | 'cancelled';
  }): Promise<boolean> => {
    try {
      await apiClient.put(`/manual-requests/${requestId}/respond`, response);
      toast.success('تم الرد على طلب التفعيل اليدوي بنجاح');
      return true;
    } catch (error) {
      console.error('Error responding to manual request:', error);
      toast.error('فشل في الرد على طلب التفعيل اليدوي');
      return false;
    }
  },

  updateManualRequestStatus: async (requestId: string, status: 'processing' | 'completed' | 'cancelled'): Promise<boolean> => {
    try {
      await apiClient.put(`/manual-requests/${requestId}/status`, { status });
      toast.success('تم تحديث حالة طلب التفعيل اليدوي بنجاح');
      return true;
    } catch (error) {
      console.error('Error updating manual request status:', error);
      toast.error('فشل في تحديث حالة طلب التفعيل اليدوي');
      return false;
    }
  },

  confirmManualRequest: async (requestId: string): Promise<boolean> => {
    try {
      await apiClient.put(`/manual-requests/${requestId}/confirm`);
      toast.success('تم تأكيد اكتمال طلب التفعيل اليدوي بنجاح');
      return true;
    } catch (error) {
      console.error('Error confirming manual request:', error);
      toast.error('فشل في تأكيد اكتمال طلب التفعيل اليدوي');
      return false;
    }
  },
};
