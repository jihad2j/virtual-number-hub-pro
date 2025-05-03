
import { apiClient } from '@/services/apiClient';
import { SupportTicket } from '@/types/SupportTicket';

export const supportApi = {
  async createSupportTicket(data: { subject: string; message: string }): Promise<SupportTicket> {
    const response = await apiClient.post('/support', data);
    return response.data.data;
  },
  
  async getUserSupportTickets(): Promise<SupportTicket[]> {
    const response = await apiClient.get('/support/user');
    return response.data.data;
  },
  
  async getAllSupportTickets(): Promise<SupportTicket[]> {
    const response = await apiClient.get('/support');
    return response.data.data;
  },
  
  async getSupportTicket(id: string): Promise<SupportTicket> {
    const response = await apiClient.get(`/support/${id}`);
    return response.data.data;
  },
  
  async respondToSupportTicket(ticketId: string, response: string): Promise<SupportTicket> {
    const resp = await apiClient.post(`/support/${ticketId}/reply`, { response });
    return resp.data.data;
  },
  
  async closeSupportTicket(ticketId: string): Promise<SupportTicket> {
    const response = await apiClient.patch(`/support/${ticketId}/close`);
    return response.data.data;
  }
};
