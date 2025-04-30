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

// API Functions
export const api = {
  // Authentication
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data && response.data.data) {
        return response.data.data;
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
        return response.data.data;
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

  // ... Add other API functions as needed
};
