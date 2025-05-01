
import { User } from '../types/User';
import { Country } from '../types/Country';
import { Provider } from '../types/Provider';
import { PhoneNumber } from '../types/PhoneNumber';
import { Transaction } from '../types/Transaction';
import { SupportTicket } from '../types/SupportTicket';
import { ManualService, ManualRequest } from '../types/Manual';
import { PrepaidCode } from '../types/PrepaidCode';
import apiClient from './apiClient';

// Auth Interfaces
export interface LoginResponse {
  token: string;
  user: User;
}

// API Functions
const api = {
  // Auth
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },
  
  async register(username: string, email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/register', { username, email, password });
    return response.data;
  },
  
  async getMe(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
  
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
  
  async updatePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    const response = await apiClient.put('/auth/update-password', { currentPassword, newPassword });
    return response.data.success;
  },
  
  // Countries
  async getAllCountries(): Promise<Country[]> {
    const response = await apiClient.get('/countries');
    return response.data;
  },
  
  async getCountries(): Promise<Country[]> {
    const response = await apiClient.get('/countries');
    return response.data;
  },
  
  async getAvailableCountries(): Promise<Country[]> {
    const response = await apiClient.get('/countries/available');
    return response.data;
  },
  
  async getCountry(id: string): Promise<Country> {
    const response = await apiClient.get(`/countries/${id}`);
    return response.data;
  },
  
  async createCountry(country: Omit<Country, 'id'>): Promise<Country> {
    const response = await apiClient.post('/countries', country);
    return response.data;
  },

  async addCountries(countries: Array<Partial<Country>>): Promise<Country[]> {
    const response = await apiClient.post('/countries/bulk', { countries });
    return response.data;
  },
  
  async updateCountry(id: string, countryData: Partial<Country>): Promise<Country> {
    const response = await apiClient.put(`/countries/${id}`, countryData);
    return response.data;
  },
  
  async deleteCountry(id: string): Promise<boolean> {
    const response = await apiClient.delete(`/countries/${id}`);
    return response.data.success;
  },
  
  // Providers
  async getAllProviders(): Promise<Provider[]> {
    const response = await apiClient.get('/providers');
    return response.data;
  },
  
  async getProvider(id: string): Promise<Provider> {
    const response = await apiClient.get(`/providers/${id}`);
    return response.data;
  },
  
  async createProvider(provider: Omit<Provider, 'id'>): Promise<Provider> {
    const response = await apiClient.post('/providers', provider);
    return response.data;
  },
  
  async updateProvider(provider: Provider): Promise<Provider> {
    const response = await apiClient.put(`/providers/${provider.id}`, provider);
    return response.data;
  },
  
  async deleteProvider(id: string): Promise<boolean> {
    const response = await apiClient.delete(`/providers/${id}`);
    return response.data.success;
  },
  
  async testProviderConnection(providerId: string): Promise<boolean> {
    const response = await apiClient.get(`/providers/${providerId}/test-connection`);
    return response.data.connected;
  },
  
  async getProviderBalance(providerId: string): Promise<{ balance: number; currency: string }> {
    const response = await apiClient.get(`/providers/${providerId}/balance`);
    return response.data.data;
  },
  
  async refreshProviderBalance(providerId: string): Promise<{ balance: number; currency: string }> {
    return await api.getProviderBalance(providerId);
  },
  
  async getProviderCountries(providerId: string): Promise<Country[]> {
    const response = await apiClient.get(`/providers/${providerId}/countries`);
    return response.data.data;
  },
  
  async getProviderServices(providerId: string, countryCode: string): Promise<any[]> {
    const response = await apiClient.get(`/providers/${providerId}/services/${countryCode}`);
    return response.data.data;
  },
  
  // Phone Numbers
  async getNumbersByCountry(countryId: string): Promise<PhoneNumber[]> {
    const response = await apiClient.get(`/numbers/country/${countryId}`);
    return response.data;
  },
  
  async purchaseNumber(numberId: string): Promise<PhoneNumber> {
    const response = await apiClient.post(`/numbers/purchase/${numberId}`);
    return response.data;
  },
  
  async getUserNumbers(): Promise<PhoneNumber[]> {
    const response = await apiClient.get('/numbers/user');
    return response.data;
  },
  
  // Transactions
  async getUserTransactions(): Promise<Transaction[]> {
    const response = await apiClient.get('/transactions');
    return response.data;
  },
  
  async getAllTransactions(): Promise<Transaction[]> {
    const response = await apiClient.get('/transactions/all');
    return response.data;
  },
  
  async createDepositTransaction(amount: number, paymentMethod: string): Promise<Transaction> {
    const response = await apiClient.post('/transactions/deposit', { amount, paymentMethod });
    return response.data;
  },
  
  async updateTransactionStatus(id: string, status: string): Promise<Transaction> {
    const response = await apiClient.put(`/transactions/${id}`, { status });
    return response.data;
  },
  
  async giftBalance(receiverEmail: string, amount: number): Promise<Transaction> {
    const response = await apiClient.post('/transactions/gift', { receiverEmail, amount });
    return response.data;
  },
  
  // Manual Services
  async getManualServices(): Promise<ManualService[]> {
    const response = await apiClient.get('/manual-services');
    return response.data.data || [];
  },
  
  async getManualService(id: string): Promise<ManualService> {
    const response = await apiClient.get(`/manual-services/${id}`);
    return response.data.data;
  },
  
  async createManualService(service: Omit<ManualService, 'id'>): Promise<ManualService> {
    const response = await apiClient.post('/manual-services', service);
    return response.data;
  },
  
  async updateManualService(id: string, serviceData: Partial<ManualService>): Promise<ManualService> {
    const response = await apiClient.put(`/manual-services/${id}`, serviceData);
    return response.data;
  },
  
  async deleteManualService(id: string): Promise<boolean> {
    const response = await apiClient.delete(`/manual-services/${id}`);
    return response.data.success;
  },
  
  // Manual Requests
  async getUserManualRequests(): Promise<ManualRequest[]> {
    const response = await apiClient.get('/manual-requests/user');
    return response.data.data || [];
  },
  
  async getAllManualRequests(): Promise<ManualRequest[]> {
    const response = await apiClient.get('/manual-requests');
    return response.data;
  },
  
  async createManualRequest(requestData: { serviceId: string; notes?: string }): Promise<ManualRequest> {
    const response = await apiClient.post('/manual-requests', requestData);
    return response.data;
  },
  
  async respondToManualRequest(id: string, adminResponse: string, verificationCode?: string): Promise<ManualRequest> {
    const response = await apiClient.put(`/manual-requests/${id}/respond`, { adminResponse, verificationCode });
    return response.data;
  },
  
  async updateManualRequestStatus(id: string, status: string): Promise<ManualRequest> {
    const response = await apiClient.put(`/manual-requests/${id}/status`, { status });
    return response.data;
  },
  
  async confirmManualRequest(id: string): Promise<boolean> {
    const response = await apiClient.put(`/manual-requests/${id}/confirm`);
    return response.data.success;
  },
  
  // Support
  async getUserTickets(): Promise<SupportTicket[]> {
    const response = await apiClient.get('/support/user');
    return response.data;
  },
  
  async getAllTickets(): Promise<SupportTicket[]> {
    const response = await apiClient.get('/support');
    return response.data;
  },
  
  async createSupportTicket(subject: string, message: string): Promise<SupportTicket> {
    const response = await apiClient.post('/support', { subject, message });
    return response.data;
  },
  
  async respondToTicket(id: string, message: string): Promise<SupportTicket> {
    const response = await apiClient.post(`/support/${id}/respond`, { message });
    return response.data;
  },
  
  async updateTicketStatus(id: string, status: 'open' | 'closed'): Promise<SupportTicket> {
    const response = await apiClient.put(`/support/${id}/status`, { status });
    return response.data;
  },
  
  async closeTicket(id: string): Promise<boolean> {
    const response = await apiClient.put(`/support/${id}/close`);
    return response.data.success;
  },
  
  // Users
  async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get('/users');
    return response.data;
  },
  
  async getUsers(): Promise<User[]> {
    const response = await apiClient.get('/users');
    return response.data;
  },
  
  async getActiveUsersCount(): Promise<number> {
    const response = await apiClient.get('/users/active-count');
    return response.data.count;
  },
  
  async getUser(id: string): Promise<User> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },
  
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'> & { password: string }): Promise<User> {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },
  
  async addUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'> & { password: string }): Promise<User> {
    return await api.createUser(userData);
  },
  
  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  },
  
  async deleteUser(id: string): Promise<boolean> {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data.success;
  },
  
  async updateUserBalance(id: string, amount: number, description: string): Promise<User> {
    const response = await apiClient.put(`/users/${id}/balance`, { amount, description });
    return response.data;
  },
  
  // Prepaid Codes
  async redeemPrepaidCode(code: string): Promise<{ amount: number; code: string }> {
    const response = await apiClient.post('/prepaid-codes/redeem', { code });
    return response.data;
  },
  
  async getAllPrepaidCodes(): Promise<PrepaidCode[]> {
    const response = await apiClient.get('/prepaid-codes');
    return response.data;
  },
  
  async getPrepaidCodes(): Promise<PrepaidCode[]> {
    return await api.getAllPrepaidCodes();
  },
  
  async generatePrepaidCodes(count: number, amount: number, expiryDate?: Date): Promise<PrepaidCode[]> {
    const response = await apiClient.post('/prepaid-codes/generate', { count, amount, expiryDate });
    return response.data;
  },
  
  async deletePrepaidCode(id: string): Promise<boolean> {
    const response = await apiClient.delete(`/prepaid-codes/${id}`);
    return response.data.success;
  },
  
  // Initialization
  async initLocalData(): Promise<boolean> {
    try {
      const response = await apiClient.post('/init');
      console.log('Data initialized:', response.data);
      return true;
    } catch (error) {
      console.error('Failed to initialize data:', error);
      return false;
    }
  }
};

export {
  api,
  // Export types for usage in other files
  type User,
  type Country,
  type Provider,
  type PhoneNumber,
  type Transaction,
  type SupportTicket,
  type ManualService,
  type ManualRequest,
  type PrepaidCode,
};

export default api;
