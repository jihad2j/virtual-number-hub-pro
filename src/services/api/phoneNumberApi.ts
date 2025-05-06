
import { apiClient } from '@/services/apiClient';
import { PhoneNumber } from '@/types/PhoneNumber';
import { providerService } from '@/services/providerService';

export const phoneNumberApi = {
  async getAllPhoneNumbers(): Promise<PhoneNumber[]> {
    const response = await apiClient.get('/numbers');
    return response.data.data;
  },

  async getUserPhoneNumbers(): Promise<PhoneNumber[]> {
    const response = await apiClient.get('/numbers/my');
    return response.data.data;
  },

  async purchasePhoneNumber(providerId: string, countryCode: string, service: string): Promise<PhoneNumber> {
    return providerService.purchaseNumber(providerId, countryCode, service);
  },

  async checkPhoneNumber(id: string): Promise<PhoneNumber> {
    return providerService.checkNumber(id);
  },

  async cancelPhoneNumber(id: string): Promise<boolean> {
    return providerService.cancelNumber(id);
  }
};
