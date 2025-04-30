
import axios, { AxiosResponse } from 'axios';
import { apiClient } from './apiClient';

// Define types
export interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
  available: boolean;
  services: Array<any>;
}

export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  role: 'user' | 'admin';
  isActive?: boolean;
  createdAt?: string;
  lastLogin?: string;
}

export interface LoginResponse {
  status: string;
  token: string;
  user: User;
}

export interface Provider {
  id: string;
  name: string;
  slug: string;
  apiKey: string;
  baseUrl: string;
  settings: Record<string, any>;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
  // Add the missing properties
  apiUrl?: string;
  description?: string;
  countries: string[];
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'purchase' | 'gift' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod?: string;
  receipt?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: 'open' | 'closed' | 'pending';
  createdAt: string;
  updatedAt: string;
  responses: Array<{
    id: string;
    message: string;
    isAdmin: boolean;
    createdAt: string;
  }>;
}

export interface ManualService {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ManualRequest {
  id: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  notes?: string;
  adminResponse?: string;
  verificationCode?: string;
  createdAt: string;
  updatedAt?: string;
}

// API functions
export const api = {
  // Auth endpoints
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },
  
  register: async (username: string, email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/register', { username, email, password });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },
  
  // Country endpoints
  getAvailableCountries: async (): Promise<Country[]> => {
    const response = await apiClient.get('/countries/available');
    return response.data.data;
  },
  
  getAllCountries: async (): Promise<Country[]> => {
    const response = await apiClient.get('/countries');
    return response.data.data;
  },
  
  createCountry: async (country: Omit<Country, 'id'>): Promise<Country> => {
    const response = await apiClient.post('/countries', country);
    return response.data.data;
  },
  
  updateCountry: async (id: string, data: Partial<Country>): Promise<Country> => {
    const response = await apiClient.put(`/countries/${id}`, data);
    return response.data.data;
  },
  
  deleteCountry: async (id: string): Promise<void> => {
    await apiClient.delete(`/countries/${id}`);
  },

  // Add missing countries function
  addCountries: async (countries: Partial<Country>[]): Promise<Country[]> => {
    const response = await apiClient.post('/countries/batch', countries);
    return response.data.data;
  },
  
  // Provider endpoints
  getAllProviders: async (): Promise<Provider[]> => {
    const response = await apiClient.get('/providers');
    return response.data.data;
  },

  // Alias for getAllProviders to fix naming mismatch
  getProviders: async (): Promise<Provider[]> => {
    return api.getAllProviders();
  },
  
  // Alias for getAllCountries to fix naming mismatch
  getCountries: async (): Promise<Country[]> => {
    return api.getAllCountries();
  },
  
  createProvider: async (provider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>): Promise<Provider> => {
    const response = await apiClient.post('/providers', provider);
    return response.data.data;
  },
  
  updateProvider: async (id: string, data: Partial<Provider>): Promise<Provider> => {
    const response = await apiClient.put(`/providers/${id}`, data);
    return response.data.data;
  },

  // Fix the expected 2 arguments issue
  updateProvider: async (provider: Provider): Promise<Provider> => {
    const response = await apiClient.put(`/providers/${provider.id}`, provider);
    return response.data.data;
  },

  // Add missing addProvider function
  addProvider: async (provider: Partial<Provider>): Promise<Provider> => {
    const response = await apiClient.post('/providers', provider);
    return response.data.data;
  },
  
  deleteProvider: async (id: string): Promise<void> => {
    await apiClient.delete(`/providers/${id}`);
  },
  
  // Support ticket endpoints
  createSupportTicket: async (subject: string, message: string): Promise<SupportTicket> => {
    const response = await apiClient.post('/support', { subject, message });
    return response.data.data;
  },
  
  getUserSupportTickets: async (): Promise<SupportTicket[]> => {
    const response = await apiClient.get('/support/user');
    return response.data.data;
  },
  
  getAllSupportTickets: async (): Promise<SupportTicket[]> => {
    const response = await apiClient.get('/support');
    return response.data.data;
  },
  
  respondToTicket: async (ticketId: string, message: string): Promise<SupportTicket> => {
    const response = await apiClient.post(`/support/${ticketId}/respond`, { message });
    return response.data.data;
  },
  
  closeTicket: async (ticketId: string): Promise<SupportTicket> => {
    const response = await apiClient.put(`/support/${ticketId}/close`);
    return response.data.data;
  },
  
  // Transaction endpoints
  getUserTransactions: async (): Promise<Transaction[]> => {
    const response = await apiClient.get('/transactions');
    return response.data.data;
  },
  
  // Alias for getUserTransactions to fix naming mismatch
  getTransactions: async (): Promise<Transaction[]> => {
    return api.getUserTransactions();
  },
  
  createDepositTransaction: async (amount: number, paymentMethod: string, receipt?: string): Promise<Transaction> => {
    const response = await apiClient.post('/transactions/deposit', { amount, paymentMethod, receipt });
    return response.data.data;
  },

  // Add missing addFunds function
  addFunds: async (amount: number, paymentMethod: string, receipt?: string): Promise<Transaction> => {
    return api.createDepositTransaction(amount, paymentMethod, receipt);
  },
  
  giftBalance: async (recipientId: string, amount: number): Promise<Transaction> => {
    const response = await apiClient.post('/transactions/gift', { recipientId, amount });
    return response.data.data;
  },
  
  // Manual services endpoints
  getManualServices: async (): Promise<ManualService[]> => {
    const response = await apiClient.get('/manual-services');
    return response.data.data;
  },
  
  getManualService: async (id: string): Promise<ManualService> => {
    const response = await apiClient.get(`/manual-services/${id}`);
    return response.data.data;
  },
  
  createManualService: async (service: Omit<ManualService, 'id' | 'createdAt'>): Promise<ManualService> => {
    const response = await apiClient.post('/manual-services', service);
    return response.data.data;
  },
  
  updateManualService: async (service: ManualService): Promise<ManualService> => {
    const response = await apiClient.put(`/manual-services/${service.id}`, service);
    return response.data.data;
  },
  
  deleteManualService: async (id: string): Promise<void> => {
    await apiClient.delete(`/manual-services/${id}`);
  },
  
  // Manual requests endpoints
  getUserManualRequests: async (): Promise<ManualRequest[]> => {
    const response = await apiClient.get('/manual-requests/user');
    return response.data.data;
  },
  
  getAllManualRequests: async (): Promise<ManualRequest[]> => {
    const response = await apiClient.get('/manual-requests');
    return response.data.data;
  },
  
  createManualRequest: async (data: { serviceId: string, notes?: string }): Promise<ManualRequest> => {
    const response = await apiClient.post('/manual-requests', data);
    return response.data.data;
  },
  
  respondToManualRequest: async (requestId: string, data: { adminResponse?: string, verificationCode?: string, status?: string }): Promise<ManualRequest> => {
    const response = await apiClient.put(`/manual-requests/${requestId}/respond`, data);
    return response.data.data;
  },
  
  updateManualRequestStatus: async (requestId: string, status: 'pending' | 'processing' | 'completed' | 'rejected'): Promise<ManualRequest> => {
    const response = await apiClient.put(`/manual-requests/${requestId}/status`, { status });
    return response.data.data;
  },
  
  confirmManualRequest: async (requestId: string): Promise<ManualRequest> => {
    const response = await apiClient.put(`/manual-requests/${requestId}/confirm`);
    return response.data.data;
  },
  
  // User management endpoints
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get('/users');
    return response.data.data;
  },
  
  addUser: async (userData: Partial<User>): Promise<User> => {
    const response = await apiClient.post('/users', userData);
    return response.data.data;
  },
  
  updateUser: async (user: User): Promise<User> => {
    const response = await apiClient.put(`/users/${user.id}`, user);
    return response.data.data;
  },
  
  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/users/${userId}`);
  },

  // Application initialization
  initLocalData: async () => {
    try {
      const response = await apiClient.get('/init/data');
      return response.data;
    } catch (error) {
      console.error('Failed to initialize local data:', error);
      throw error;
    }
  }
};
