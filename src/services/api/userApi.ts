
import { apiClient } from '@/services/apiClient';
import { User } from '@/types/User';

export const userApi = {
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
  }
};
