
export interface Transaction {
  id: string;
  userId: string;
  username?: string;
  amount: number;
  description?: string;
  type: 'deposit' | 'withdrawal' | 'purchase' | 'refund' | 'gift' | 'manual' | 'admin';
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
  paymentMethod?: string;
  paymentId?: string;
  createdAt: string;
  updatedAt?: string;
}
