
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Index page loaded, authentication status:", isAuthenticated);
    
    const redirectUser = () => {
      if (isAuthenticated) {
        console.log("User is authenticated, redirecting to dashboard");
        navigate('/dashboard', { replace: true });
      } else {
        console.log("User is not authenticated, redirecting to login");
        navigate('/login', { replace: true });
      }
    };
    
    // Add a small delay to ensure auth state is properly loaded
    const timeout = setTimeout(redirectUser, 100);
    
    // Initialize local data when starting the application
    const initData = async () => {
      try {
        console.log("Initializing local data...");
        await api.initLocalData();
        console.log("Local data initialized successfully");
      } catch (error) {
        console.error('Failed to initialize data:', error);
      }
    };
    
    initData();
    
    return () => clearTimeout(timeout);
  }, [isAuthenticated, navigate]);

  return <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
  </div>;
};

export default Index;
