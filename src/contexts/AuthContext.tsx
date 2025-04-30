import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { api } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  role: 'user' | 'admin';
}

type AuthContextType = {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  loading: true,
  user: null,
  isAdmin: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

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

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Use the API to login with backend authentication
      const userData = await api.login(email, password);
      
      const user: User = {
        id: userData.id || userData._id,
        name: userData.username,
        email: userData.email,
        balance: userData.balance,
        role: userData.role,
      };

      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setLoading(true);
    try {
      // Use the API to register with backend
      const userData = await api.register(username, email, password);
      
      const user: User = {
        id: userData.id || userData._id,
        name: userData.username,
        email: userData.email,
        balance: userData.balance || 0,
        role: userData.role || 'user',
      };

      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    toast.success('تم تسجيل الخروج بنجاح');
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  const refreshUser = async () => {
    if (!isAuthenticated) return;
    
    try {
      const user = await api.getCurrentUser();
      setUser(user);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        loading, 
        user, 
        isAdmin: user?.role === 'admin', 
        login, 
        register, 
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
