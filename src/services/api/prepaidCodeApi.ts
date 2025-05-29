
import { apiClient } from '@/services/apiClient';
import { PrepaidCode } from '@/types/PrepaidCode';

export const prepaidCodeApi = {
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
  }
};
