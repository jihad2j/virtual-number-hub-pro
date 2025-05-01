
export interface ManualRequest {
  id: string;
  _id?: string; // Support for MongoDB's _id
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

export interface ManualService {
  id: string;
  _id?: string; // Support for MongoDB's _id
  name: string;
  description: string;
  price: number;
  image?: string;
  available: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
