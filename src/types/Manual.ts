
export interface ManualService {
  id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  image?: string;
}

export interface ManualRequest {
  id: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  notes?: string;
  adminResponse?: string;
  verificationCode?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminManualRequest extends ManualRequest {
  userName?: string;
  userEmail?: string;
  details?: Record<string, any>;
  adminNotes?: string;
  service?: ManualService;
}
