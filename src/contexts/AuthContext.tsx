
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  balance: number;
  isActive: boolean;
  createdAt: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadingInitial: boolean;
  updateUserData: (userData: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const currentUser = await api.getCurrentUser();
          setUser(currentUser);
          setIsAuthenticated(true);
          setIsAdmin(currentUser.role === 'admin');
        } catch (error) {
          console.error('Failed to fetch current user:', error);
          localStorage.removeItem('authToken');
          setIsAuthenticated(false);
          setIsAdmin(false);
          setUser(null);
        }
      }
      setLoadingInitial(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
      setIsAuthenticated(true);
      setIsAdmin(response.user.role === 'admin');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await api.register(username, email, password);
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
      setIsAuthenticated(true);
      setIsAdmin(response.user.role === 'admin');
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    navigate('/login');
  };

  const updateUserData = async (userData: Partial<AuthUser>) => {
    if (!user || !user.id) return;
    
    try {
      const updatedUser = await api.updateUser(user.id, userData);
      setUser({
        ...user,
        ...updatedUser,
      });
    } catch (error) {
      console.error('Failed to update user data:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    loadingInitial,
    updateUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
