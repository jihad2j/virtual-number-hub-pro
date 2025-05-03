
import { apiClient } from '@/services/apiClient';
import { User } from '@/types/User';

export interface LoginResponse {
  token: string;
  user: User;
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data.data;
  },
  
  async logout() {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
  
  async register(username: string, email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/register', { username, email, password });
    return response.data.data;
  },
  
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data.data;
  },
  
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },
  
  async updateUser(user: Partial<User>): Promise<User> {
    const response = await apiClient.patch('/auth/update', user);
    return response.data.data;
  }
};
