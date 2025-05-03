
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/services/api';
import { User } from '@/types/User';
import { toast } from 'sonner';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<User>;
  refreshUserData: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  login: async () => {
    throw new Error('login not implemented');
  },
  logout: async () => {
    throw new Error('logout not implemented');
  },
  register: async () => {
    throw new Error('register not implemented');
  },
  refreshUserData: async () => {
    throw new Error('refreshUserData not implemented');
  }
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Function to load user from local storage or API
  const loadUser = async () => {
    setIsLoading(true);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setCurrentUser(null);
      setIsLoading(false);
      return null;
    }
    
    try {
      const user = await api.getCurrentUser();
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('Error loading user:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
    
    return null;
  };
  
  // Function to refresh user data from API
  const refreshUserData = async () => {
    try {
      const user = await api.getCurrentUser();
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return null;
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { token, user } = await api.login(email, password);
      
      // Save token and user to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update state
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const { token, user } = await api.register(username, email, password);
      
      // Save token and user to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update state
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.role === 'admin',
        isLoading,
        login,
        logout,
        register,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
