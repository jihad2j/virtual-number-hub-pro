
import { apiClient } from '@/services/apiClient';
import { SupportTicket } from '@/types/SupportTicket';

export const supportApi = {
  async getAllSupportTickets(): Promise<SupportTicket[]> {
    const response = await apiClient.get('/support');
    return response.data.data;
  },

  async getUserSupportTickets(): Promise<SupportTicket[]> {
    const response = await apiClient.get('/support/user');
    return response.data.data;
  },

  async createSupportTicket(subject: string, message: string): Promise<SupportTicket> {
    const response = await apiClient.post('/support', { subject, message });
    return response.data.data;
  },

  async respondToSupportTicket(ticketId: string, message: string): Promise<SupportTicket> {
    const response = await apiClient.post(`/support/${ticketId}/respond`, { message });
    return response.data.data;
  },

  async closeSupportTicket(ticketId: string): Promise<SupportTicket> {
    const response = await apiClient.put(`/support/${ticketId}/close`);
    return response.data.data;
  }
};
