
import { apiClient } from '@/services/apiClient';
import { PhoneNumber } from '@/types/PhoneNumber';

export const phoneNumberApi = {
  async getAllPhoneNumbers(countryCode: string): Promise<PhoneNumber[]> {
    const response = await apiClient.get(`/numbers/country/${countryCode}`);
    return response.data.data;
  },
  
  async getUserPhoneNumbers(): Promise<PhoneNumber[]> {
    const response = await apiClient.get('/numbers/user');
    return response.data.data;
  },
  
  async purchasePhoneNumber(providerName: string, countryCode: string, service: string): Promise<PhoneNumber> {
    const response = await apiClient.post('/numbers/purchase', { providerName, countryCode, service });
    return response.data.data;
  },
  
  async checkPhoneNumber(id: string): Promise<PhoneNumber> {
    const response = await apiClient.get(`/numbers/${id}/check`);
    return response.data.data;
  },
  
  async cancelPhoneNumber(id: string): Promise<void> {
    await apiClient.post(`/numbers/${id}/cancel`);
  },

  async getNumbersByCountry(countryCode: string): Promise<PhoneNumber[]> {
    return this.getAllPhoneNumbers(countryCode);
  },
  
  async getNumberByService(providerName: string, countryCode: string, service: string): Promise<PhoneNumber> {
    return this.purchasePhoneNumber(providerName, countryCode, service);
  },
  
  async getActiveNumbers(): Promise<PhoneNumber[]> {
    return this.getUserPhoneNumbers();
  },
  
  async checkActivationStatus(id: string): Promise<PhoneNumber> {
    return this.checkPhoneNumber(id);
  },
  
  async cancelActivation(id: string): Promise<void> {
    return this.cancelPhoneNumber(id);
  }
};
