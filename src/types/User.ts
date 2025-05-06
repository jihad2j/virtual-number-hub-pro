
export interface User {
  id: string;
  _id?: string; // Add _id field to support MongoDB's _id format
  username: string;
  email: string;
  role: 'user' | 'admin';
  balance: number;
  isActive: boolean;
  createdAt: string; // Changed from optional to required to match usage
  lastLogin?: string;
  updatedAt?: string;
}
