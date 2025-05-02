
import { apiClient } from '@/services/apiClient';
import { Transaction } from '@/types/Transaction';

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

export const adminApi = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get('/admin/dashboard');
    return response.data.data;
  }
};
