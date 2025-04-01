
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // In a real app, these would connect to your backend API
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock API call - replace with actual API call
      // const response = await fetch('/api/login', ...);
      
      // Mock successful login for demo purposes
      const mockUser: User = {
        id: '1',
        name: 'Ahmed Mohammed',
        email,
        balance: 100.0,
        role: email.includes('admin') ? 'admin' : 'user',
      };

      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      toast.success('تم تسجيل الدخول بنجاح');
    } catch (error) {
      console.error('Login failed', error);
      toast.error('فشل تسجيل الدخول');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      // Mock API call - replace with actual API call
      // const response = await fetch('/api/register', ...);
      
      // Mock successful registration
      const mockUser: User = {
        id: '1',
        name,
        email,
        balance: 0.0,
        role: 'user',
      };

      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      toast.success('تم إنشاء الحساب بنجاح');
    } catch (error) {
      console.error('Registration failed', error);
      toast.error('فشل إنشاء الحساب');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.success('تم تسجيل الخروج بنجاح');
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        login, 
        register, 
        logout, 
        isAuthenticated, 
        isAdmin 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
