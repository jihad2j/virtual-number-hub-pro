
import { apiClient } from '@/services/apiClient';

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  category?: string;
  attachments?: string[];
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  message: string;
  isAdmin: boolean;
  createdAt: string;
  attachments?: string[];
}

export const supportApi = {
  async createTicket(data: {
    subject: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
    category?: string;
  }): Promise<SupportTicket> {
    const response = await apiClient.post('/support', data);
    return response.data.data;
  },

  async getUserTickets(): Promise<SupportTicket[]> {
    const response = await apiClient.get('/support');
    return response.data.data;
  },

  async getAllSupportTickets(): Promise<SupportTicket[]> {
    const response = await apiClient.get('/admin/support');
    return response.data.data;
  },

  async getTicketMessages(ticketId: string): Promise<TicketMessage[]> {
    const response = await apiClient.get(`/support/${ticketId}/messages`);
    return response.data.data;
  },

  async replyToTicket(ticketId: string, message: string): Promise<TicketMessage> {
    const response = await apiClient.post(`/support/${ticketId}/reply`, { message });
    return response.data.data;
  },

  async updateTicketStatus(ticketId: string, status: string): Promise<SupportTicket> {
    const response = await apiClient.put(`/support/${ticketId}/status`, { status });
    return response.data.data;
  }
};
