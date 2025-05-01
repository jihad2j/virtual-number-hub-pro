
export interface TicketResponse {
  id: string;
  message: string;
  fromAdmin: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: 'open' | 'closed';
  createdAt: string;
  updatedAt?: string;
  responses: TicketResponse[];
}
