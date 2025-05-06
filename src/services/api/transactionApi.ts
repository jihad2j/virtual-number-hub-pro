
import { apiClient } from '@/services/apiClient';
import { Transaction } from '@/types/Transaction';

export const transactionApi = {
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

  async giftBalance(recipient: string, amount: number, note: string): Promise<Transaction> {
    const response = await apiClient.post('/transactions/gift', { recipient, amount, note });
    return response.data.data;
  }
};
