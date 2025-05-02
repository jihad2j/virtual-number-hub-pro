
import { apiClient } from '@/services/apiClient';
import { User } from '@/types/User';

interface LoginResponse {
  user: User;
  token: string;
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', { email, password });
    console.log("Login API response:", response.data);
    
    // Handle both types of API responses
    if (response.data.status === "success") {
      // Backend returns {status: "success", token, data: {user}}
      return {
        user: response.data.data?.user || response.data.user,
        token: response.data.token
      };
    } else {
      // Standard format
      return response.data;
    }
  },

  async register(username: string, email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/register', { username, email, password });
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await apiClient.post('/auth/change-password', { 
      currentPassword, 
      newPassword 
    });
    return response.data;
  }
};
