
import apiClient from './apiClient';
import { toast } from 'sonner';

// Types and interfaces
export interface LoginResponse {
  user: User;
  token: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  balance: number;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
  services: any[];
  available?: boolean;
}

export interface Provider {
  id: string;
  name: string;
  code: string;
  description?: string;
  logo?: string;
  apiKey?: string;
  apiUrl?: string;
  isActive: boolean;
  settings?: Record<string, any>;
  countries?: string[];
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'deposit' | 'purchase' | 'gift_sent' | 'gift_received' | 'redeem';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  paymentMethod?: string;
  createdAt: string;
}

export interface ManualService {
  id: string;
  name: string;
  description?: string;
  price: number;
  processingTime?: string;
  isActive: boolean;
  available?: boolean;
}

export interface ManualRequest {
  id: string;
  userId: string;
  serviceId: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  details: Record<string, any>;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  service?: ManualService;
}

export interface AdminManualRequest extends ManualRequest {
  userName?: string;
  userEmail?: string;
  serviceName?: string;
  verificationCode?: string;
  adminResponse?: string;
  notes?: string;
}

export interface PrepaidCode {
  id: string;
  code: string;
  amount: number;
  isUsed: boolean;
  usedBy?: string;
  usedByUsername?: string;
  usedAt?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: 'open' | 'closed' | 'pending';
  createdAt: string;
  updatedAt: string;
  replies?: SupportTicketReply[];
}

export interface SupportTicketReply {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  isAdmin: boolean;
  createdAt: string;
}

// API function to handle errors
const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error
    const errorMessage = error.response.data?.message || 'Something went wrong';
    toast.error(errorMessage);
    return Promise.reject(errorMessage);
  } else if (error.request) {
    // Request made but no response
    const errorMessage = 'No response from server. Check your connection';
    toast.error(errorMessage);
    return Promise.reject(errorMessage);
  } else {
    // Error setting up request
    const errorMessage = error.message || 'An unexpected error occurred';
    toast.error(errorMessage);
    return Promise.reject(errorMessage);
  }
};

// API functions
export const api = {
  // Auth
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async register(username: string, email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post('/auth/register', { username, email, password });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // User transactions
  async getUserTransactions(): Promise<Transaction[]> {
    try {
      const response = await apiClient.get('/transactions');
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async createDepositTransaction(amount: number, method: string): Promise<Transaction> {
    try {
      const response = await apiClient.post('/transactions/deposit', { amount, method });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Countries
  async getAllCountries(): Promise<Country[]> {
    try {
      const response = await apiClient.get('/countries');
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getAvailableCountries(): Promise<Country[]> {
    try {
      const response = await apiClient.get('/countries/available');
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getCountry(id: string): Promise<Country> {
    try {
      const response = await apiClient.get(`/countries/${id}`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async addCountries(countries: Partial<Country>[]): Promise<Country[]> {
    try {
      const response = await apiClient.post('/countries', { countries });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Providers
  async getAllProviders(): Promise<Provider[]> {
    try {
      const response = await apiClient.get('/providers');
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getProvider(id: string): Promise<Provider> {
    try {
      const response = await apiClient.get(`/providers/${id}`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async createProvider(provider: Omit<Provider, 'id'>): Promise<Provider> {
    try {
      const response = await apiClient.post('/providers', provider);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async addProvider(provider: Omit<Provider, 'id'>): Promise<Provider> {
    try {
      const response = await apiClient.post('/providers', provider);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateProvider(provider: Provider): Promise<Provider> {
    try {
      const response = await apiClient.put(`/providers/${provider.id}`, provider);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async deleteProvider(id: string): Promise<void> {
    try {
      await apiClient.delete(`/providers/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  async testProviderConnection(id: string): Promise<boolean> {
    try {
      const response = await apiClient.get(`/providers/${id}/test-connection`);
      return response.data.connected;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getProviderBalance(id: string): Promise<{ balance: number; currency: string }> {
    try {
      const response = await apiClient.get(`/providers/${id}/balance`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async refreshProviderBalance(id: string): Promise<{ balance: number; currency: string }> {
    try {
      const response = await apiClient.get(`/providers/${id}/balance?refresh=true`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getProviderCountries(id: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/providers/${id}/countries`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getProviderServices(id: string, countryCode: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/providers/${id}/services/${countryCode}`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Manual Services
  async getManualServices(): Promise<ManualService[]> {
    try {
      const response = await apiClient.get('/manual-services');
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async createManualService(service: Omit<ManualService, 'id'>): Promise<ManualService> {
    try {
      const response = await apiClient.post('/manual-services', service);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateManualService(id: string, service: Partial<ManualService>): Promise<ManualService> {
    try {
      const response = await apiClient.put(`/manual-services/${id}`, service);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async deleteManualService(id: string): Promise<void> {
    try {
      await apiClient.delete(`/manual-services/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Manual Requests
  async getUserManualRequests(): Promise<ManualRequest[]> {
    try {
      const response = await apiClient.get('/manual-requests');
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getAllManualRequests(): Promise<AdminManualRequest[]> {
    try {
      const response = await apiClient.get('/manual-requests/all');
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async createManualRequest(serviceId: string, details: Record<string, any>): Promise<ManualRequest> {
    try {
      const response = await apiClient.post('/manual-requests', { serviceId, details });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateManualRequestStatus(
    id: string, 
    status: ManualRequest['status'], 
    adminNotes?: string
  ): Promise<ManualRequest> {
    try {
      const response = await apiClient.put(`/manual-requests/${id}/status`, { status, adminNotes });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async respondToManualRequest(
    id: string, 
    status: ManualRequest['status'], 
    adminResponse: string,
    verificationCode?: string
  ): Promise<ManualRequest> {
    try {
      const response = await apiClient.put(`/manual-requests/${id}/respond`, { 
        status, 
        adminResponse,
        verificationCode 
      });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async confirmManualRequest(id: string, feedback?: string): Promise<ManualRequest> {
    try {
      const response = await apiClient.put(`/manual-requests/${id}/confirm`, { feedback });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Users Admin
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await apiClient.get('/users');
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async getUsers(): Promise<User[]> {
    try {
      const response = await apiClient.get('/users');
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async addUser(userData: Omit<User, 'id'> & { password: string, isActive?: boolean }): Promise<User> {
    try {
      const response = await apiClient.post('/users', userData);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async createUser(user: Omit<User, 'id'> & { password: string }): Promise<User> {
    try {
      const response = await apiClient.post('/users', user);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateUser(id: string, userData: Partial<User & { isActive?: boolean }>): Promise<User> {
    try {
      const response = await apiClient.put(`/users/${id}`, userData);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async deleteUser(id: string): Promise<void> {
    try {
      await apiClient.delete(`/users/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Prepaid Codes - new functionality
  async getPrepaidCodes(): Promise<PrepaidCode[]> {
    try {
      const response = await apiClient.get('/prepaid-codes');
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async generatePrepaidCodes(amount: number, count: number): Promise<PrepaidCode[]> {
    try {
      const response = await apiClient.post('/prepaid-codes/generate', { amount, count });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async redeemPrepaidCode(code: string): Promise<{ amount: number }> {
    try {
      const response = await apiClient.post('/prepaid-codes/redeem', { code });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async deletePrepaidCode(id: string): Promise<void> {
    try {
      await apiClient.delete(`/prepaid-codes/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Support Tickets
  async createSupportTicket(subject: string, message: string): Promise<SupportTicket> {
    try {
      const response = await apiClient.post('/support', { subject, message });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Balance gift feature - new functionality
  async giftBalance(recipientIdentifier: string, amount: number): Promise<Transaction> {
    try {
      const response = await apiClient.post('/transactions/gift', { recipient: recipientIdentifier, amount });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Dashboard analytics - new functionality
  async getSalesData(period: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/analytics/sales?period=${period}`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getActiveUsersCount(): Promise<{ count: number }> {
    try {
      const response = await apiClient.get('/analytics/active-users');
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Initialize local data
  async initLocalData(): Promise<{ countries: Country[], providers: Provider[] }> {
    try {
      const response = await apiClient.get('/init/data');
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
