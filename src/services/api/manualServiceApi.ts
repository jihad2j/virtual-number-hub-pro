
import { apiClient } from '@/services/apiClient';
import { ManualService, ManualRequest, AdminManualRequest } from '@/types/ManualRequest';

export const manualServiceApi = {
  // Manual Services
  async getManualServices(): Promise<ManualService[]> {
    const response = await apiClient.get('/manual-services');
    return response.data.data;
  },

  async getAllManualServices(): Promise<ManualService[]> {
    const response = await apiClient.get('/manual-services');
    return response.data.data;
  },

  async getManualService(id: string): Promise<ManualService> {
    const response = await apiClient.get(`/manual-services/${id}`);
    return response.data.data;
  },

  async createManualService(data: Omit<ManualService, 'id'>): Promise<ManualService> {
    const response = await apiClient.post('/manual-services', data);
    return response.data.data;
  },

  async updateManualService(id: string, data: Partial<ManualService>): Promise<ManualService> {
    const response = await apiClient.patch(`/manual-services/${id}`, data);
    return response.data.data;
  },

  async deleteManualService(id: string): Promise<void> {
    await apiClient.delete(`/manual-services/${id}`);
  },

  // Manual Requests
  async getUserManualRequests(): Promise<ManualRequest[]> {
    const response = await apiClient.get('/manual-requests/my');
    return response.data.data;
  },

  async getAllManualRequests(): Promise<AdminManualRequest[]> {
    const response = await apiClient.get('/manual-requests');
    return response.data.data;
  },

  async createManualRequest(data: { serviceId: string, notes?: string }): Promise<ManualRequest> {
    const response = await apiClient.post('/manual-requests', data);
    return response.data.data;
  },

  async deleteManualRequest(id: string): Promise<void> {
    await apiClient.delete(`/manual-requests/${id}`);
  },

  async respondToManualRequest(id: string, data: { adminResponse?: string, verificationCode?: string, status?: string }): Promise<ManualRequest> {
    const response = await apiClient.put(`/manual-requests/${id}/respond`, data);
    return response.data.data;
  }
};
