
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  balance: number;
  isActive?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  lastLogin?: Date | string;
  profilePicture?: string;
  name?: string;
  avatar?: string;
  phoneNumber?: string;
  country?: string;
  settings?: {
    notifications?: boolean;
    theme?: 'light' | 'dark' | 'system';
    language?: string;
  };
}
