
import { apiClient } from '@/services/apiClient';

export interface BaseApplication {
  id: string;
  name: string;
  description?: string;
}

export interface UserApplication {
  id: string;
  name: string;
  providerName: string;
  countryName: string;
  serverName: string;
  price: number;
  description?: string;
  isAvailable: boolean;
}

export const applicationApi = {
  // إدارة التطبيقات الأساسية (الأسماء فقط)
  async getAllBaseApplications(): Promise<BaseApplication[]> {
    const response = await apiClient.get('/applications');
    return response.data.data;
  },

  async addBaseApplication(name: string, description?: string): Promise<BaseApplication> {
    const response = await apiClient.post('/applications', { name, description });
    return response.data.data;
  },

  async updateBaseApplication(id: string, data: { name: string; description?: string }): Promise<BaseApplication> {
    const response = await apiClient.put(`/applications/${id}`, data);
    return response.data.data;
  },

  async deleteBaseApplication(id: string): Promise<void> {
    await apiClient.delete(`/applications/${id}`);
  },

  // إدارة تطبيقات المستخدمين (مع السيرفرات والأسعار)
  async getUserApplications(): Promise<UserApplication[]> {
    const response = await apiClient.get('/applications/user');
    return response.data.data;
  },

  async addUserApplication(data: {
    applicationName: string;
    providerName: string;
    countryName: string;
    serverName: string;
    price: number;
    description?: string;
  }): Promise<UserApplication> {
    const response = await apiClient.post('/applications/user', data);
    return response.data.data;
  },

  async updateUserApplication(id: string, data: {
    name: string;
    providerName: string;
    countryName: string;
    serverName: string;
    price: number;
    description?: string;
  }): Promise<UserApplication> {
    const response = await apiClient.put(`/applications/${id}`, data);
    return response.data.data;
  },

  async deleteUserApplication(id: string): Promise<void> {
    await apiClient.delete(`/applications/${id}`);
  }
};
