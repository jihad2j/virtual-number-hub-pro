
export interface User {
  id: string;
  _id?: string; // Add _id field to support MongoDB's _id format
  username: string;
  email: string;
  role: 'user' | 'admin';
  balance: number;
  isActive: boolean;
  createdAt?: string;
  lastLogin?: string;
  updatedAt?: string;
}
