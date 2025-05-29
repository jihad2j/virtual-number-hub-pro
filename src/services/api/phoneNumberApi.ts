
import { apiClient } from '@/services/apiClient';
import { PhoneNumber } from '@/types/PhoneNumber';

export const phoneNumberApi = {
  async getAllPhoneNumbers(): Promise<PhoneNumber[]> {
    const response = await apiClient.get('/numbers');
    return response.data.data;
  },

  async getUserPhoneNumbers(): Promise<PhoneNumber[]> {
    const response = await apiClient.get('/numbers/my');
    return response.data.data;
  },

  async purchasePhoneNumber(data: {
    applicationId: string;
    providerName: string;
    countryName: string;
    applicationName: string;
    serverName: string;
  }): Promise<PhoneNumber> {
    const response = await apiClient.post('/numbers/purchase', data);
    return response.data.data;
  },

  async checkPhoneNumber(id: string): Promise<PhoneNumber> {
    const response = await apiClient.get(`/numbers/${id}/check`);
    return response.data.data;
  },

  async cancelPhoneNumber(id: string): Promise<boolean> {
    const response = await apiClient.post(`/numbers/${id}/cancel`);
    return response.data.success;
  }
};
