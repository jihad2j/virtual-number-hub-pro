
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  balance: number;
  isActive?: boolean;
  createdAt?: string;
  lastLogin?: string;
}
