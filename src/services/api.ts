import axios, { AxiosResponse } from 'axios';
import { apiClient } from './apiClient';

// Define types
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  balance: number;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
  available: boolean;
}

export interface Provider {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  countries: string[];
  isActive: boolean;
  apiKey?: string;
  apiUrl?: string;
  type?: string;
  config?: Record<string, any>;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'deposit' | 'purchase' | 'gift';
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  createdAt: string;
}

export interface ManualService {
  id: string;
  name: string;
  price: number;
  description: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ManualRequest {
  id: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  notes?: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  adminResponse?: string;
  verificationCode?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: 'open' | 'responded' | 'closed';
  adminResponse?: string;
  createdAt: string;
}

// API Functions
export const api = {
  // Initialization
  async initLocalData(): Promise<void> {
    try {
      console.info('Initializing local data...');
      const response = await apiClient.get('/init/data');
      console.info('Data initialized via API');
      return;
    } catch (error) {
      console.error('Failed to initialize local data:', error);
      throw error;
    } finally {
      console.info('Local data initialized successfully');
    }
  },

  // Authentication
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data && response.data.data) {
        const { user, token } = response.data.data;
        // Save the token to localStorage
        localStorage.setItem('authToken', token);
        return { 
          user: {
            id: user.id || user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            balance: user.balance,
            isActive: user.isActive,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
          },
          token 
        };
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(username: string, email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const response = await apiClient.post('/auth/register', { username, email, password });
      if (response.data && response.data.data) {
        const { user, token } = response.data.data;
        // Save the token to localStorage
        localStorage.setItem('authToken', token);
        return { 
          user: {
            id: user.id || user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            balance: user.balance || 0,
            isActive: user.isActive,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
          },
          token 
        };
      }
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  // User
  async getUsers(): Promise<User[]> {
    try {
      const response = await apiClient.get('/users');
      if (response.data && response.data.data) {
        return response.data.data.map((user: any) => ({
          id: user.id || user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          balance: user.balance,
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        }));
      } else if (Array.isArray(response.data)) {
        return response.data.map((user: any) => ({
          id: user.id || user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          balance: user.balance,
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        }));
      }
      return response.data;
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  },

  async addUser(userData: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.post('/users', userData);
      if (response.data && response.data.data) {
        const user = response.data.data;
        return {
          id: user.id || user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          balance: user.balance,
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        };
      }
      return response.data;
    } catch (error) {
      console.error('Add user error:', error);
      throw error;
    }
  },

  async updateUser(userData: User): Promise<User> {
    try {
      const response = await apiClient.put(`/users/${userData.id}`, userData);
      if (response.data && response.data.data) {
        const user = response.data.data;
        return {
          id: user.id || user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          balance: user.balance,
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        };
      }
      return response.data;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  async deleteUser(userId: string): Promise<void> {
    try {
      await apiClient.delete(`/users/${userId}`);
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  },

  // Gift balance to another user
  async giftBalance(recipientId: string, amount: number): Promise<Transaction> {
    try {
      const response = await apiClient.post(`/transactions/gift`, { recipientId, amount });
      if (response.data && response.data.data) {
        const transaction = response.data.data;
        return {
          id: transaction.id || transaction._id,
          userId: transaction.userId,
          amount: transaction.amount,
          type: transaction.type,
          status: transaction.status,
          description: transaction.description,
          createdAt: transaction.createdAt,
        };
      }
      return response.data;
    } catch (error) {
      console.error('Gift balance error:', error);
      throw error;
    }
  },

  // Countries
  async getCountries(): Promise<Country[]> {
    try {
      const response = await apiClient.get('/countries');
      if (response.data && response.data.data) {
        return response.data.data.map((country: any) => ({
          id: country.id || country._id,
          name: country.name,
          code: country.code,
          flag: country.flag,
          available: country.available,
        }));
      } else if (Array.isArray(response.data)) {
        return response.data.map((country: any) => ({
          id: country.id || country._id,
          name: country.name,
          code: country.code,
          flag: country.flag,
          available: country.available,
        }));
      }
      return response.data;
    } catch (error) {
      console.error('Get countries error:', error);
      throw error;
    }
  },
  
  async getAvailableCountries(): Promise<Country[]> {
    try {
      const response = await apiClient.get('/countries/available');
      if (response.data && response.data.data) {
        return response.data.data.map((country: any) => ({
          id: country.id || country._id,
          name: country.name,
          code: country.code,
          flag: country.flag,
          available: country.available,
        }));
      } else if (Array.isArray(response.data)) {
        return response.data.map((country: any) => ({
          id: country.id || country._id,
          name: country.name,
          code: country.code,
          flag: country.flag,
          available: country.available,
        }));
      }
      return response.data;
    } catch (error) {
      console.error('Get available countries error:', error);
      throw error;
    }
  },

  async addCountries(countries: Country[]): Promise<Country[]> {
    try {
      const response = await apiClient.post('/countries', countries);
      if (response.data && response.data.data) {
        return response.data.data.map((country: any) => ({
          id: country.id || country._id,
          name: country.name,
          code: country.code,
          flag: country.flag,
          available: country.available,
        }));
      } else if (Array.isArray(response.data)) {
        return response.data.map((country: any) => ({
          id: country.id || country._id,
          name: country.name,
          code: country.code,
          flag: country.flag,
          available: country.available,
        }));
      }
      return response.data;
    } catch (error) {
      console.error('Add countries error:', error);
      throw error;
    }
  },

  // Providers
  async getProviders(): Promise<Provider[]> {
    try {
      const response = await apiClient.get('/providers');
      if (response.data && response.data.data) {
        return response.data.data.map((provider: any) => ({
          id: provider.id || provider._id,
          name: provider.name,
          logo: provider.logo,
          description: provider.description,
          countries: provider.countries,
          isActive: provider.isActive,
          apiKey: provider.apiKey,
          apiUrl: provider.apiUrl,
          type: provider.type,
          config: provider.config,
        }));
      } else if (Array.isArray(response.data)) {
        return response.data.map((provider: any) => ({
          id: provider.id || provider._id,
          name: provider.name,
          logo: provider.logo,
          description: provider.description,
          countries: provider.countries,
          isActive: provider.isActive,
          apiKey: provider.apiKey,
          apiUrl: provider.apiUrl,
          type: provider.type,
          config: provider.config,
        }));
      }
      return response.data;
    } catch (error) {
      console.error('Get providers error:', error);
      throw error;
    }
  },

  async addProvider(providerData: Partial<Provider>): Promise<Provider> {
    try {
      const response = await apiClient.post('/providers', providerData);
      if (response.data && response.data.data) {
        const provider = response.data.data;
        return {
          id: provider.id || provider._id,
          name: provider.name,
          logo: provider.logo,
          description: provider.description,
          countries: provider.countries,
          isActive: provider.isActive,
          apiKey: provider.apiKey,
          apiUrl: provider.apiUrl,
          type: provider.type,
          config: provider.config,
        };
      }
      return response.data;
    } catch (error) {
      console.error('Add provider error:', error);
      throw error;
    }
  },

  async updateProvider(providerData: Provider): Promise<Provider> {
    try {
      const response = await apiClient.put(`/providers/${providerData.id}`, providerData);
      if (response.data && response.data.data) {
        const provider = response.data.data;
        return {
          id: provider.id || provider._id,
          name: provider.name,
          logo: provider.logo,
          description: provider.description,
          countries: provider.countries,
          isActive: provider.isActive,
          apiKey: provider.apiKey,
          apiUrl: provider.apiUrl,
          type: provider.type,
          config: provider.config,
        };
      }
      return response.data;
    } catch (error) {
      console.error('Update provider error:', error);
      throw error;
    }
  },

  async deleteProvider(providerId: string): Promise<void> {
    try {
      await apiClient.delete(`/providers/${providerId}`);
    } catch (error) {
      console.error('Delete provider error:', error);
      throw error;
    }
  },

  // Provider server operations
  async getProviderBalance(providerId: string): Promise<{ balance: number; currency: string }> {
    try {
      const response = await apiClient.get(`/providers/${providerId}/balance`);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error('Get provider balance error:', error);
      throw error;
    }
  },

  async getProviderCountries(providerId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/providers/${providerId}/countries`);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error('Get provider countries error:', error);
      throw error;
    }
  },

  async getProviderServices(providerId: string, countryId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/providers/${providerId}/services/${countryId}`);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error('Get provider services error:', error);
      throw error;
    }
  },

  async testProviderConnection(providerId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.get(`/providers/${providerId}/test-connection`);
      if (response.data && response.data.status === 'success') {
        return { success: true, message: response.data.message || 'تم الاتصال بنجاح' };
      }
      return { success: false, message: 'فشل الاتصال بالمزود' };
    } catch (error) {
      console.error('Test provider connection error:', error);
      return { success: false, message: 'فشل الاتصال بالمزود' };
    }
  },

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    try {
      const response = await apiClient.get('/transactions');
      if (response.data && response.data.data) {
        return response.data.data.map((transaction: any) => ({
          id: transaction.id || transaction._id,
          userId: transaction.userId,
          amount: transaction.amount,
          type: transaction.type,
          status: transaction.status,
          description: transaction.description,
          createdAt: transaction.createdAt,
        }));
      } else if (Array.isArray(response.data)) {
        return response.data.map((transaction: any) => ({
          id: transaction.id || transaction._id,
          userId: transaction.userId,
          amount: transaction.amount,
          type: transaction.type,
          status: transaction.status,
          description: transaction.description,
          createdAt: transaction.createdAt,
        }));
      }
      return response.data;
    } catch (error) {
      console.error('Get transactions error:', error);
      throw error;
    }
  },

  async addFunds(amount: number, method: 'card' | 'paypal'): Promise<Transaction> {
    try {
      const response = await apiClient.post('/transactions/deposit', { amount, paymentMethod: method });
      if (response.data && response.data.data) {
        const transaction = response.data.data;
        return {
          id: transaction.id || transaction._id,
          userId: transaction.userId,
          amount: transaction.amount,
          type: transaction.type,
          status: transaction.status,
          description: transaction.description,
          createdAt: transaction.createdAt,
        };
      }
      return response.data;
    } catch (error) {
      console.error('Add funds error:', error);
      throw error;
    }
  },

  // Manual Services
  async getManualServices(): Promise<ManualService[]> {
    try {
      const response = await apiClient.get('/manual-services');
      if (response.data && response.data.data) {
        return response.data.data.map((service: any) => ({
          id: service.id || service._id,
          name: service.name,
          price: service.price,
          description: service.description,
          image: service.image,
          isActive: service.isActive,
          createdAt: service.createdAt,
        }));
      } else if (Array.isArray(response.data)) {
        return response.data.map((service: any) => ({
          id: service.id || service._id,
          name: service.name,
          price: service.price,
          description: service.description,
          image: service.image,
          isActive: service.isActive,
          createdAt: service.createdAt,
        }));
      }
      return response.data;
    } catch (error) {
      console.error('Get manual services error:', error);
      throw error;
    }
  },

  async createManualService(serviceData: Omit<ManualService, 'id' | 'createdAt'>): Promise<ManualService> {
    try {
      const response = await apiClient.post('/manual-services', serviceData);
      if (response.data && response.data.data) {
        const service = response.data.data;
        return {
          id: service.id || service._id,
          name: service.name,
          price: service.price,
          description: service.description,
          image: service.image,
          isActive: service.isActive,
          createdAt: service.createdAt,
        };
      }
      return response.data;
    } catch (error) {
      console.error('Create manual service error:', error);
      throw error;
    }
  },

  async updateManualService(serviceData: ManualService): Promise<ManualService> {
    try {
      const response = await apiClient.put(`/manual-services/${serviceData.id}`, serviceData);
      if (response.data && response.data.data) {
        const service = response.data.data;
        return {
          id: service.id || service._id,
          name: service.name,
          price: service.price,
          description: service.description,
          image: service.image,
          isActive: service.isActive,
          createdAt: service.createdAt,
        };
      }
      return response.data;
    } catch (error) {
      console.error('Update manual service error:', error);
      throw error;
    }
  },

  async deleteManualService(serviceId: string): Promise<void> {
    try {
      await apiClient.delete(`/manual-services/${serviceId}`);
    } catch (error) {
      console.error('Delete manual service error:', error);
      throw error;
    }
  },

  // Manual Requests
  async getUserManualRequests(): Promise<ManualRequest[]> {
    try {
      const response = await apiClient.get('/manual-requests/user');
      if (response.data && response.data.data) {
        return response.data.data.map((request: any) => ({
          id: request.id || request._id,
          userId: request.userId,
          serviceId: request.serviceId,
          serviceName: request.serviceName,
          notes: request.notes,
          status: request.status,
          adminResponse: request.adminResponse,
          verificationCode: request.verificationCode,
          createdAt: request.createdAt,
        }));
      } else if (Array.isArray(response.data)) {
        return response.data.map((request: any) => ({
          id: request.id || request._id,
          userId: request.userId,
          serviceId: request.serviceId,
          serviceName: request.serviceName,
          notes: request.notes,
          status: request.status,
          adminResponse: request.adminResponse,
          verificationCode: request.verificationCode,
          createdAt: request.createdAt,
        }));
      }
      return response.data;
    } catch (error) {
      console.error('Get user manual requests error:', error);
      throw error;
    }
  },

  async getAllManualRequests(): Promise<ManualRequest[]> {
    try {
      const response = await apiClient.get('/manual-requests');
      if (response.data && response.data.data) {
        return response.data.data.map((request: any) => ({
          id: request.id || request._id,
          userId: request.userId,
          serviceId: request.serviceId,
          serviceName: request.serviceName,
          notes: request.notes,
          status: request.status,
          adminResponse: request.adminResponse,
          verificationCode: request.verificationCode,
          createdAt: request.createdAt,
        }));
      } else if (Array.isArray(response.data)) {
        return response.data.map((request: any) => ({
          id: request.id || request._id,
          userId: request.userId,
          serviceId: request.serviceId,
          serviceName: request.serviceName,
          notes: request.notes,
          status: request.status,
          adminResponse: request.adminResponse,
          verificationCode: request.verificationCode,
          createdAt: request.createdAt,
        }));
      }
      return response.data;
    } catch (error) {
      console.error('Get all manual requests error:', error);
      throw error;
    }
  },

  async createManualRequest(requestData: { serviceId: string; notes?: string }): Promise<ManualRequest> {
    try {
      const response = await apiClient.post('/manual-requests', requestData);
      if (response.data && response.data.data) {
        const request = response.data.data;
        return {
          id: request.id || request._id,
          userId: request.userId,
          serviceId: request.serviceId,
          serviceName: request.serviceName,
          notes: request.notes,
          status: request.status,
          adminResponse: request.adminResponse,
          verificationCode: request.verificationCode,
          createdAt: request.createdAt,
        };
      }
      return response.data;
    } catch (error) {
      console.error('Create manual request error:', error);
      throw error;
    }
  },

  async respondToManualRequest(requestId: string, adminResponse: string, verificationCode?: string): Promise<ManualRequest> {
    try {
      const response = await apiClient.put(`/manual-requests/${requestId}/respond`, { adminResponse, verificationCode });
      if (response.data && response.data.data) {
        const request = response.data.data;
        return {
          id: request.id || request._id,
          userId: request.userId,
          serviceId: request.serviceId,
          serviceName: request.serviceName,
          notes: request.notes,
          status: request.status,
          adminResponse: request.adminResponse,
          verificationCode: request.verificationCode,
          createdAt: request.createdAt,
        };
      }
      return response.data;
    } catch (error) {
      console.error('Respond to manual request error:', error);
      throw error;
    }
  },

  async updateManualRequestStatus(requestId: string, status: 'pending' | 'processing' | 'completed' | 'rejected'): Promise<ManualRequest> {
    try {
      const response = await apiClient.put(`/manual-requests/${requestId}/status`, { status });
      if (response.data && response.data.data) {
        const request = response.data.data;
        return {
          id: request.id || request._id,
          userId: request.userId,
          serviceId: request.serviceId,
          serviceName: request.serviceName,
          notes: request.notes,
          status: request.status,
          adminResponse: request.adminResponse,
          verificationCode: request.verificationCode,
          createdAt: request.createdAt,
        };
      }
      return response.data;
    } catch (error) {
      console.error('Update manual request status error:', error);
      throw error;
    }
  },

  // Support Tickets
  async createSupportTicket(ticketData: { subject: string; message: string }): Promise<SupportTicket> {
    try {
      const response = await apiClient.post('/support', ticketData);
      if (response.data && response.data.data) {
        const ticket = response.data.data;
        return {
          id: ticket.id || ticket._id,
          userId: ticket.userId,
          subject: ticket.subject,
          message: ticket.message,
          status: ticket.status,
          adminResponse: ticket.adminResponse,
          createdAt: ticket.createdAt,
        };
      }
      return response.data;
    } catch (error) {
      console.error('Create support ticket error:', error);
      throw error;
    }
  },

  async getUserSupportTickets(): Promise<SupportTicket[]> {
    try {
      const response = await apiClient.get('/support/user');
      if (response.data && response.data.data) {
        return response.data.data.map((ticket: any) => ({
          id: ticket.id || ticket._id,
          userId: ticket.userId,
          subject: ticket.subject,
          message: ticket.message,
          status: ticket.status,
          adminResponse: ticket.adminResponse,
          createdAt: ticket.createdAt,
        }));
      } else if (Array.isArray(response.data)) {
        return response.data.map((ticket: any) => ({
          id: ticket.id || ticket._id,
          userId: ticket.userId,
          subject: ticket.subject,
          message: ticket.message,
          status: ticket.status,
          adminResponse: ticket.adminResponse,
          createdAt: ticket.createdAt,
        }));
      }
      return response.data;
    } catch (error) {
      console.error('Get user support tickets error:', error);
      throw error;
    }
  }
};
