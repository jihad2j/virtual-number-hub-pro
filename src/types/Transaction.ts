
export interface Transaction {
  id: string;
  userId: string;
  userName?: string;
  type: 'deposit' | 'purchase' | 'gift' | 'admin';
  amount: number;
  serviceName?: string;
  serviceId?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
  details?: Record<string, any>;
}
