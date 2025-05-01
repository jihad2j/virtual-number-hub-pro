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
  image?: string;
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
        return response.data.data.map((country: any) => ({
          id: country.id || country._id,
          name: country.name,
          flag: country.flag,
          code: country.code,
          available: country.available
        }));
      } else if (Array.isArray(response.data)) {
        return response.data.map((country: any) => ({
          id: country.id || country._id,
          name: country.name,
          flag: country.flag,
          code: country.code,
          available: country.available
        }));
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
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data.map((country: any) => ({
          id: country.id || country._id,
          name: country.name,
          flag: country.flag,
          code: country.code,
          available: country.available
        }));
      } else if (Array.isArray(response.data)) {
        return response.data.map((country: any) => ({
          id: country.id || country._id,
          name: country.name,
          flag: country.flag,
          code: country.code,
          available: country.available
        }));
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
        return response.data.data.map((country: any) => ({
          id: country.id || country._id,
          name: country.name,
          flag: country.flag,
          code: country.code,
          available: country.available
        }));
      } else if (Array.isArray(response.data)) {
        return response.data.map((country: any) => ({
          id: country.id || country._id,
          name: country.name,
          flag: country.flag,
          code: country.code,
          available: country.available
        }));
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
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data.map((provider: any) => ({
          id: provider.id || provider._id,
          name: provider.name,
          logo: provider.logo,
          description: provider.description,
          countries: Array.isArray(provider.countries) ? provider.countries : [],
          isActive: provider.isActive,
          apiKey: provider.apiKey,
          apiUrl: provider.apiUrl,
        }));
      } else if (Array.isArray(response.data)) {
        return response.data.map((provider: any) => ({
          id: provider.id || provider._id,
          name: provider.name,
          logo: provider.logo,
          description: provider.description,
          countries: Array.isArray(provider.countries) ? provider.countries : [],
          isActive: provider.isActive,
          apiKey: provider.apiKey,
          apiUrl: provider.apiUrl,
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast.error('فشل في جلب مزودي الخدمة');
      return [];
    }
  },

  updateProvider: async (provider: Provider): Promise<Provider> => {
    try {
      const response = await apiClient.put(`/providers/${provider.id}`, provider);
      if (response.data && response.data.data) {
        const updatedProvider = response.data.data;
        toast.success('تم تحديث مزود الخدمة بنجاح');
        return {
          id: updatedProvider.id || updatedProvider._id,
          name: updatedProvider.name,
          logo: updatedProvider.logo,
          description: updatedProvider.description,
          countries: Array.isArray(updatedProvider.countries) ? updatedProvider.countries : [],
          isActive: updatedProvider.isActive,
          apiKey: updatedProvider.apiKey,
          apiUrl: updatedProvider.apiUrl
        };
      }
      toast.success('تم تحديث مزود الخدمة بنجاح');
      return provider;
    } catch (error) {
      console.error('Error updating provider:', error);
      toast.error('فشل في تحديث مزود الخدمة');
      return provider;
    }
  },

  addProvider: async (provider: Omit<Provider, 'id'>): Promise<Provider> => {
    try {
      const response = await apiClient.post('/providers', provider);
      if (response.data && response.data.data) {
        const newProvider = response.data.data;
        toast.success('تم إضافة مزود الخدمة بنجاح');
        return {
          id: newProvider.id || newProvider._id,
          name: newProvider.name,
          logo: newProvider.logo,
          description: newProvider.description,
          countries: Array.isArray(newProvider.countries) ? newProvider.countries : [],
          isActive: newProvider.isActive,
          apiKey: newProvider.apiKey,
          apiUrl: newProvider.apiUrl
        };
      }
      toast.success('تم إضافة مزود الخدمة بنجاح');
      return { ...provider, id: Math.random().toString(36).substring(7) };
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
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data.map((number: any) => ({
          id: number.id || number._id,
          number: number.number,
          country: number.country,
          provider: number.provider,
          status: number.status,
          price: number.price
        }));
      } else if (Array.isArray(response.data)) {
        return response.data.map((number: any) => ({
          id: number.id || number._id,
          number: number.number,
          country: number.country,
          provider: number.provider,
          status: number.status,
          price: number.price
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching phone numbers:', error);
      toast.error('فشل في جلب الأرقام');
      return [];
    }
  },

  purchaseNumber: async (numberId: string): Promise<PhoneNumber> => {
    try {
      const response = await apiClient.post(`/numbers/purchase/${numberId}`);
      if (response.data && response.data.data) {
        const purchasedNumber = response.data.data;
        toast.success('تم شراء الرقم بنجاح');
        return {
          id: purchasedNumber.id || purchasedNumber._id,
          number: purchasedNumber.number,
          country: purchasedNumber.country,
          provider: purchasedNumber.provider,
          status: purchasedNumber.status,
          price: purchasedNumber.price
        };
      }
      toast.success('تم شراء الرقم بنجاح');
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error purchasing number:', error);
      toast.error('فشل في شراء الرقم');
      throw error;
    }
  },

  getUsers: async (): Promise<User[]> => {
    try {
      const response = await apiClient.get('/users');
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data.map((user: any) => ({
          id: user.id || user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          balance: user.balance,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          isActive: user.isActive
        }));
      } else if (Array.isArray(response.data)) {
        return response.data.map((user: any) => ({
          id: user.id || user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          balance: user.balance,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          isActive: user.isActive
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('فشل في جلب المستخدمين');
      return [];
    }
  },
  
  addUser: async (user: Omit<User, 'id'>): Promise<User> => {
    try {
      const response = await apiClient.post('/users', user);
      if (response.data && response.data.data) {
        const newUser = response.data.data;
        toast.success('تم إضافة المستخدم بنجاح');
        return {
          id: newUser.id || newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          balance: newUser.balance,
          createdAt: newUser.createdAt,
          lastLogin: newUser.lastLogin,
          isActive: newUser.isActive
        };
      }
      toast.success('تم إضافة المستخدم بنجاح');
      return { ...user, id: Math.random().toString(36).substring(7) };
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('فشل في إضافة المستخدم');
      return { ...user, id: Math.random().toString(36).substring(7) };
    }
  },
  
  updateUser: async (user: User): Promise<User> => {
    try {
      const response = await apiClient.put(`/users/${user.id}`, user);
      if (response.data && response.data.data) {
        const updatedUser = response.data.data;
        toast.success('تم تحديث المستخدم بنجاح');
        return {
          id: updatedUser.id || updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role,
          balance: updatedUser.balance,
          createdAt: updatedUser.createdAt,
          lastLogin: updatedUser.lastLogin,
          isActive: updatedUser.isActive
        };
      }
      toast.success('تم تحديث المستخدم بنجاح');
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('فشل في تح��يث المستخدم');
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
      if (response.data && response.data.data) {
        const ticket = response.data.data;
        toast.success('تم إرسال تذكرة الدعم بنجاح');
        return {
          id: ticket.id || ticket._id,
          userId: ticket.userId,
          subject: ticket.subject,
          message: ticket.message,
          status: ticket.status,
          createdAt: ticket.createdAt,
          responses: ticket.responses || []
        };
      }
      toast.success('تم إرسال تذكرة الدعم بنجاح');
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error creating support ticket:', error);
      toast.error('فشل في إرسال تذكرة الدعم');
      throw error;
    }
  },

  getTransactions: async (): Promise<Transaction[]> => {
    try {
      const response = await apiClient.get('/transactions');
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data.map((transaction: any) => ({
          id: transaction.id || transaction._id,
          userId: transaction.userId,
          amount: transaction.amount,
          type: transaction.type,
          status: transaction.status,
          description: transaction.description,
          createdAt: transaction.createdAt
        }));
      } else if (Array.isArray(response.data)) {
        return response.data.map((transaction: any) => ({
          id: transaction.id || transaction._id,
          userId: transaction.userId,
          amount: transaction.amount,
          type: transaction.type,
          status: transaction.status,
          description: transaction.description,
          createdAt: transaction.createdAt
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('فشل في جلب المعاملات');
      return [];
    }
  },

  addFunds: async (amount: number, method: 'card' | 'paypal'): Promise<Transaction> => {
    try {
      const response = await apiClient.post('/transactions/deposit', { amount, method });
      if (response.data && response.data.data) {
        const transaction = response.data.data;
        toast.success('تمت إضافة الرصيد بنجاح');
        return {
          id: transaction.id || transaction._id,
          userId: transaction.userId,
          amount: transaction.amount,
          type: transaction.type,
          status: transaction.status,
          description: transaction.description,
          createdAt: transaction.createdAt
        };
      }
      toast.success('تمت إضافة الرصيد بنجاح');
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error adding funds:', error);
      toast.error('فشل في إضافة الرصيد');
      throw error;
    }
  },

  getManualServices: async (): Promise<ManualService[]> => {
    try {
      const response = await apiClient.get('/manual-services');
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data.map((service: any) => ({
          id: service.id || service._id,
          name: service.name,
          description: service.description,
          price: service.price,
          available: service.available,
          image: service.image
        }));
      } else if (Array.isArray(response.data)) {
        return response.data.map((service: any) => ({
          id: service.id || service._id,
          name: service.name,
          description: service.description,
          price: service.price,
          available: service.available,
          image: service.image
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching manual services:', error);
      toast.error('فشل في جلب خدمات التفعيل اليدوي');
      return [];
    }
  },

  createManualService: async (service: Omit<ManualService, 'id'>): Promise<ManualService> => {
    try {
      const response = await apiClient.post('/manual-services', service);
      if (response.data && response.data.data) {
        const newService = response.data.data;
        toast.success('تم إضافة خدمة التفعيل اليدوي بنجاح');
        return {
          id: newService.id || newService._id,
          name: newService.name,
          description: newService.description,
          price: newService.price,
          available: newService.available,
          image: newService.image
        };
      }
      toast.success('تم إضافة خدمة التفعيل اليدوي بنجاح');
      return { ...service, id: Math.random().toString(36).substring(7) };
    } catch (error) {
      console.error('Error creating manual service:', error);
      toast.error('فشل في إضافة خدمة التفعيل اليدوي');
      return { ...service, id: Math.random().toString(36).substring(7) };
    }
  },

  updateManualService: async (service: ManualService): Promise<ManualService> => {
    try {
      const response = await apiClient.put(`/manual-services/${service.id}`, service);
      if (response.data && response.data.data) {
        const updatedService = response.data.data;
        toast.success('تم تحديث خدمة التفعيل اليدوي بنجاح');
        return {
          id: updatedService.id || updatedService._id,
          name: updatedService.name,
          description: updatedService.description,
          price: updatedService.price,
          available: updatedService.available,
          image: updatedService.image
        };
      }
      toast.success('تم تحديث خدمة التفعيل اليدوي بنجاح');
      return service;
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
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data.map((request: any) => ({
          id: request.id || request._id,
          userId: request.userId,
          userName: request.userName,
          userEmail: request.userEmail,
          serviceId: request.serviceId,
          serviceName: request.serviceName,
          status: request.status,
          notes: request.notes,
          adminResponse: request.adminResponse,
          verificationCode: request.verificationCode,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt
        }));
      } else if (Array.isArray(response.data)) {
        return response.data.map((request: any) => ({
          id: request.id || request._id,
          userId: request.userId,
          userName: request.userName,
          userEmail: request.userEmail,
          serviceId: request.serviceId,
          serviceName: request.serviceName,
          status: request.status,
          notes: request.notes,
          adminResponse: request.adminResponse,
          verificationCode: request.verificationCode,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching user manual requests:', error);
      toast.error('فشل في جلب طلبات التفعيل اليدوي');
      return [];
    }
  },

  getAllManualRequests: async (): Promise<ManualRequest[]> => {
    try {
      const response = await apiClient.get('/manual-requests');
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data.map((request: any) => ({
          id: request.id || request._id,
          userId: request.userId,
          userName: request.userName,
          userEmail: request.userEmail,
          serviceId: request.serviceId,
          serviceName: request.serviceName,
          status: request.status,
          notes: request.notes,
          adminResponse: request.adminResponse,
          verificationCode: request.verificationCode,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt
        }));
      } else if (Array.isArray(response.data)) {
        return response.data.map((request: any) => ({
          id: request.id || request._id,
          userId: request.userId,
          userName: request.userName,
          userEmail: request.userEmail,
          serviceId: request.serviceId,
          serviceName: request.serviceName,
          status: request.status,
          notes: request.notes,
          adminResponse: request.adminResponse,
          verificationCode: request.verificationCode,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt
        }));
      }
      return [];
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

  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      if (response.data && response.data.token && response.data.data && response.data.data.user) {
        // Store the token for authenticated requests
        localStorage.setItem('authToken', response.data.token);
        
        const user = response.data.data.user;
        // Store user data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify({
          id: user.id || user._id,
          name: user.username,
          email: user.email,
          role: user.role,
          balance: user.balance
        }));
        
        toast.success('تم تسجيل الدخول بنجاح');
        return response.data.data.user;
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('فشل تسجيل الدخول. تأكد من صحة البريد الإلكتروني وكلمة المرور');
      throw error;
    }
  },

  register: async (username: string, email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/register', {
        username,
        email,
        password
      });
      
      if (response.data && response.data.token && response.data.data && response.data.data.user) {
        // Store the token for authenticated requests
        localStorage.setItem('authToken', response.data.token);
        
        const user = response.data.data.user;
        // Store user data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify({
          id: user.id || user._id,
          name: user.username,
          email: user.email,
          role: user.role,
          balance: user.balance
        }));
        
        toast.success('تم إنشاء الحساب بنجاح');
        return response.data.data.user;
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('فشل إنشاء الحساب');
      throw error;
    }
  },
};
