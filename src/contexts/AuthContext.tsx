
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { api, User } from '../services/api';

type AuthContextType = {
  isAuthenticated: boolean;
  loading: boolean;
  user: AuthUser | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

// Local user type that includes name field needed by UI
interface AuthUser {
  id: string;
  name: string;  // This is mapped from username
  email: string;
  balance: number;
  role: 'user' | 'admin';
}

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
  const [user, setUser] = useState<AuthUser | null>(null);
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
      const response = await api.login(email, password);
      
      const authUser: AuthUser = {
        id: response.user.id,
        name: response.user.username,
        email: response.user.email,
        balance: response.user.balance,
        role: response.user.role,
      };

      setUser(authUser);
      localStorage.setItem('user', JSON.stringify(authUser));
      localStorage.setItem('authToken', response.token);
      
      toast.success('تم تسجيل الدخول بنجاح');
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
      const response = await api.register(username, email, password);
      
      const authUser: AuthUser = {
        id: response.user.id,
        name: response.user.username,
        email: response.user.email,
        balance: response.user.balance || 0,
        role: response.user.role || 'user',
      };

      setUser(authUser);
      localStorage.setItem('user', JSON.stringify(authUser));
      localStorage.setItem('authToken', response.token);
      
      toast.success('تم إنشاء الحساب بنجاح');
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
      const userData = await api.getCurrentUser();
      
      // Convert API User to AuthUser
      const authUser: AuthUser = {
        id: userData.id,
        name: userData.username,
        email: userData.email,
        balance: userData.balance,
        role: userData.role,
      };
      
      setUser(authUser);
      localStorage.setItem('user', JSON.stringify(authUser));
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
        isAdmin, 
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
