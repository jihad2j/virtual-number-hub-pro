import { apiClient } from '@/services/apiClient';
import { User } from '@/types/User';
import { Country } from '@/types/Country';
import { Provider } from '@/types/Provider';
import { Transaction } from '@/types/Transaction';
import { PhoneNumber } from '@/types/PhoneNumber';
import { PrepaidCode } from '@/types/PrepaidCode';
import { SupportTicket } from '@/types/SupportTicket';
import { ManualService, ManualRequest, AdminManualRequest } from '@/types/ManualRequest';

// Re-export types that other components need
export type { User, Country, Provider, Transaction, PhoneNumber, PrepaidCode, SupportTicket, ManualService, ManualRequest };

interface LoginResponse {
  user: User;
  token: string;
}

interface DashboardStats {
  stats: {
    totalUsers: number;
    totalSales: number;
    totalOrders: number;
    growthRate: number;
  };
  chartData: Array<{name: string; sales: number}>;
  recentTransactions: Transaction[];
}

// Auth API functions
export const api = {
  // Authentication
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', { email, password });
    console.log("Login API response:", response.data);
    
    // Handle both types of API responses
    if (response.data.status === "success") {
      // Backend returns {status: "success", token, data: {user}}
      return {
        user: response.data.data?.user || response.data.user,
        token: response.data.token
      };
    } else {
      // Standard format
      return response.data;
    }
  },

  async register(username: string, email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/register', { username, email, password });
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  // Users
  async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get('/users');
    return response.data.data;
  },

  async getUser(id: string): Promise<User> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data.data;
  },

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'> & { password: string }): Promise<User> {
    const response = await apiClient.post('/users', userData);
    return response.data.data;
  },

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await apiClient.patch(`/users/${id}`, userData);
    return response.data.data;
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  // Countries
  async getAllCountries(): Promise<Country[]> {
    const response = await apiClient.get('/countries');
    return response.data.data;
  },

  async getAvailableCountries(): Promise<Country[]> {
    // This is an alias for getAllCountries to fix the type error
    return this.getAllCountries();
  },

  async createCountry(data: Partial<Country>): Promise<Country> {
    const response = await apiClient.post('/countries', data);
    return response.data.data;
  },

  async deleteCountry(id: string): Promise<void> {
    await apiClient.delete(`/countries/${id}`);
  },

  async getCountry(id: string): Promise<Country> {
    const response = await apiClient.get(`/countries/${id}`);
    return response.data.data;
  },

  async updateCountry(id: string, data: Partial<Country>): Promise<Country> {
    const response = await apiClient.patch(`/countries/${id}`, data);
    return response.data.data;
  },

  async addCountries(countries: Partial<Country>[]): Promise<Country[]> {
    const response = await apiClient.post('/countries/bulk', { countries });
    return response.data.data;
  },

  // Providers
  async getAllProviders(): Promise<Provider[]> {
    const response = await apiClient.get('/providers');
    return response.data.data;
  },

  async getProvider(id: string): Promise<Provider> {
    const response = await apiClient.get(`/providers/${id}`);
    return response.data.data;
  },

  async createProvider(data: Omit<Provider, 'id'>): Promise<Provider> {
    const response = await apiClient.post('/providers', data);
    return response.data.data;
  },

  async updateProvider(provider: Provider): Promise<Provider> {
    const response = await apiClient.patch(`/providers/${provider.id}`, provider);
    return response.data.data;
  },

  async testProviderConnection(providerId: string): Promise<boolean> {
    const response = await apiClient.get(`/providers/${providerId}/test-connection`);
    return response.data.connected;
  },

  async getProviderBalance(providerId: string): Promise<{ balance: number; currency: string }> {
    const response = await apiClient.get(`/providers/${providerId}/balance`);
    return response.data.data;
  },

  async getProviderCountries(providerId: string): Promise<any[]> {
    const response = await apiClient.get(`/providers/${providerId}/countries`);
    return response.data.data;
  },

  async getProviderServices(providerId: string, countryCode: string): Promise<any[]> {
    const response = await apiClient.get(`/providers/${providerId}/services/${countryCode}`);
    return response.data.data;
  },

  // Phone Numbers
  async getAllPhoneNumbers(): Promise<PhoneNumber[]> {
    const response = await apiClient.get('/numbers');
    return response.data.data;
  },

  async getUserPhoneNumbers(): Promise<PhoneNumber[]> {
    const response = await apiClient.get('/numbers/my');
    return response.data.data;
  },

  async purchasePhoneNumber(providerId: string, countryCode: string, service: string): Promise<PhoneNumber> {
    const response = await apiClient.post('/numbers/purchase', { providerId, countryCode, service });
    return response.data.data;
  },

  async checkPhoneNumber(id: string): Promise<PhoneNumber> {
    const response = await apiClient.get(`/numbers/${id}/check`);
    return response.data.data;
  },

  async cancelPhoneNumber(id: string): Promise<boolean> {
    const response = await apiClient.post(`/numbers/${id}/cancel`);
    return response.data.success;
  },

  // Transactions
  async getAllTransactions(): Promise<Transaction[]> {
    const response = await apiClient.get('/transactions');
    return response.data.data;
  },

  async getUserTransactions(): Promise<Transaction[]> {
    const response = await apiClient.get('/transactions/my');
    return response.data.data;
  },

  async createDepositTransaction(amount: number, paymentMethod: string): Promise<Transaction> {
    const response = await apiClient.post('/transactions/deposit', { amount, paymentMethod });
    return response.data.data;
  },

  async giftBalance(userId: string, amount: number, note: string): Promise<Transaction> {
    const response = await apiClient.post('/transactions/gift', { userId, amount, note });
    return response.data.data;
  },

  // Prepaid Codes
  async getAllPrepaidCodes(): Promise<PrepaidCode[]> {
    const response = await apiClient.get('/prepaid-codes');
    return response.data.data;
  },

  async createPrepaidCode(amount: number, expiryDate?: string): Promise<PrepaidCode> {
    const response = await apiClient.post('/prepaid-codes', { amount, expiryDate });
    return response.data.data;
  },

  async redeemPrepaidCode(code: string): Promise<{ success: boolean; amount: number }> {
    const response = await apiClient.post('/prepaid-codes/redeem', { code });
    return response.data;
  },

  // Support Tickets
  async getAllSupportTickets(): Promise<SupportTicket[]> {
    const response = await apiClient.get('/support');
    return response.data.data;
  },

  async getUserSupportTickets(): Promise<SupportTicket[]> {
    const response = await apiClient.get('/support/my');
    return response.data.data;
  },

  async createSupportTicket(subject: string, message: string): Promise<SupportTicket> {
    const response = await apiClient.post('/support', { subject, message });
    return response.data.data;
  },

  async respondToSupportTicket(ticketId: string, message: string): Promise<SupportTicket> {
    const response = await apiClient.post(`/support/${ticketId}/respond`, { message });
    return response.data.data;
  },

  async closeSupportTicket(ticketId: string): Promise<SupportTicket> {
    const response = await apiClient.post(`/support/${ticketId}/close`);
    return response.data.data;
  },

  // Manual Services
  async getManualServices(): Promise<ManualService[]> {
    const response = await apiClient.get('/manual-services');
    return response.data.data;
  },

  async getAllManualServices(): Promise<ManualService[]> {
    const response = await apiClient.get('/manual-services');
    return response.data.data;
  },

  async getManualService(id: string): Promise<ManualService> {
    const response = await apiClient.get(`/manual-services/${id}`);
    return response.data.data;
  },

  async createManualService(data: Omit<ManualService, 'id'>): Promise<ManualService> {
    const response = await apiClient.post('/manual-services', data);
    return response.data.data;
  },

  async updateManualService(id: string, data: Partial<ManualService>): Promise<ManualService> {
    const response = await apiClient.patch(`/manual-services/${id}`, data);
    return response.data.data;
  },

  async deleteManualService(id: string): Promise<void> {
    await apiClient.delete(`/manual-services/${id}`);
  },

  // Manual Requests
  async getUserManualRequests(): Promise<ManualRequest[]> {
    const response = await apiClient.get('/manual-requests/my');
    return response.data.data;
  },

  async getAllManualRequests(): Promise<ManualRequest[]> {
    const response = await apiClient.get('/manual-requests');
    return response.data.data;
  },

  async createManualRequest(data: { serviceId: string, notes?: string }): Promise<ManualRequest> {
    const response = await apiClient.post('/manual-requests', data);
    return response.data.data;
  },

  async deleteManualRequest(id: string): Promise<void> {
    await apiClient.delete(`/manual-requests/${id}`);
  },

  async respondToManualRequest(id: string, data: { adminResponse?: string, verificationCode?: string, status?: string }): Promise<ManualRequest> {
    const response = await apiClient.patch(`/manual-requests/${id}/respond`, data);
    return response.data.data;
  },

  // Admin Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get('/admin/dashboard');
    return response.data.data;
  },

  // System initialization
  async initLocalData(): Promise<{
    countries: Country[];
    providers: Provider[];
  }> {
    const response = await apiClient.get('/init/local-data');
    return response.data.data;
  }
};
