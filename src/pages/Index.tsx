
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Index page loaded, authentication status:", isAuthenticated);
    
    if (isAuthenticated) {
      console.log("User is authenticated, redirecting to dashboard");
      navigate('/dashboard');
    } else {
      console.log("User is not authenticated, redirecting to login");
      navigate('/login');
    }
    
    // تهيئة البيانات المحلية عند بدء التطبيق
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
  }, [isAuthenticated, navigate]);

  return <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
  </div>;
};

export default Index;
