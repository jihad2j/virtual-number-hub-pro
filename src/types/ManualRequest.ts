
export interface ManualRequest {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  serviceId: string;
  serviceName: string;
  phoneNumber: string;
  message: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  notes?: string;
  adminResponse?: string;
  verificationCode?: string;
  createdAt: string;
  updatedAt?: string;
}
