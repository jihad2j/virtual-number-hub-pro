
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/services/api/authApi';
import { User } from '@/types/User';
import { toast } from 'sonner';

interface AuthContextType {
  currentUser: User | null;
  user: User | null; // Alias for currentUser
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  loadingInitial: boolean; // Alias for isLoading
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<User>;
  refreshUserData: () => Promise<User | null>;
  updateUserData: (userData: Partial<User>) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  loadingInitial: true,
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
  },
  updateUserData: async () => {
    throw new Error('updateUserData not implemented');
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
    if (!token || token === 'undefined' || token === 'null') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
      setIsLoading(false);
      return null;
    }
    
    try {
      const user = await authApi.getCurrentUser();
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
      const user = await authApi.getCurrentUser();
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return null;
    }
  };

  // Function to update user data
  const updateUserData = async (userData: Partial<User>) => {
    try {
      const updatedUser = await authApi.updateUser(userData);
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error updating user data:', error);
      return null;
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { token, user } = await authApi.login(email, password);
      
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
      await authApi.logout();
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
      const { token, user } = await authApi.register(username, email, password);
      
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
        user: currentUser,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.role === 'admin',
        isLoading,
        loadingInitial: isLoading,
        login,
        logout,
        register,
        refreshUserData,
        updateUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
