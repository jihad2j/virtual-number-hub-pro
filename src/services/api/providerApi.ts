
import { apiClient } from '@/services/apiClient';
import { Provider } from '@/types/Provider';
import { providerService } from '@/services/providerService';

export const providerApi = {
  async getProviders(): Promise<Provider[]> {
    const response = await apiClient.get('/providers');
    return response.data.data;
  },
  
  async getAllProviders(): Promise<Provider[]> {
    const response = await apiClient.get('/providers');
    return response.data.data;
  },

  async getAvailableProviders(): Promise<Provider[]> {
    const response = await apiClient.get('/providers/available');
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

  async deleteProvider(providerId: string): Promise<void> {
    await apiClient.delete(`/providers/${providerId}`);
  },

  async toggleProviderStatus(providerId: string): Promise<Provider> {
    const response = await apiClient.patch(`/providers/${providerId}/toggle-status`);
    return response.data.data;
  },
  
  async setDefaultProvider(providerId: string): Promise<Provider> {
    const response = await apiClient.patch(`/providers/${providerId}/set-default`);
    return response.data.data;
  },

  async getActiveProviders(): Promise<Provider[]> {
    const response = await apiClient.get('/providers/active');
    return response.data.data;
  },

  // Provider functions now delegate to the providerService
  async testProviderConnection(providerId: string): Promise<boolean> {
    return providerService.testConnection(providerId);
  },

  async getProviderBalance(providerId: string): Promise<{ balance: number; currency: string }> {
    return providerService.getBalance(providerId);
  },

  async getProviderCountries(providerId: string): Promise<any[]> {
    return providerService.getCountries(providerId);
  },

  async getProviderServices(providerId: string, countryCode: string): Promise<any[]> {
    return providerService.getServices(providerId, countryCode);
  },

  // New method for getting all providers' balances
  async getAllProvidersBalances(): Promise<Array<{
    id: string;
    name: string;
    code: string;
    balance?: { balance: number; currency: string };
    error?: string;
  }>> {
    const response = await apiClient.get('/providers/admin/all-balances');
    return response.data.data;
  }
};
