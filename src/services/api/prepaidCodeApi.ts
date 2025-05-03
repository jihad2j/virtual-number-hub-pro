
import { apiClient } from '@/services/apiClient';
import { PrepaidCode } from '@/types/PrepaidCode';

export const prepaidCodeApi = {
  async getAllPrepaidCodes(): Promise<PrepaidCode[]> {
    const response = await apiClient.get('/prepaid-codes');
    return response.data.data;
  },
  
  async generatePrepaidCodes(amount: number, count: number): Promise<PrepaidCode[]> {
    const response = await apiClient.post('/prepaid-codes/generate', { amount, count });
    return response.data.data;
  },
  
  async redeemPrepaidCode(code: string): Promise<{amount: number, message: string}> {
    const response = await apiClient.post('/prepaid-codes/redeem', { code });
    return response.data.data;
  },
  
  async deletePrepaidCode(id: string): Promise<void> {
    await apiClient.delete(`/prepaid-codes/${id}`);
  }
};
