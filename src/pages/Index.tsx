
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
    
    // Initialize local data if needed
    const initData = async () => {
      try {
        await api.initLocalData();
      } catch (error) {
        console.error('Failed to initialize data:', error);
      }
    };
    
    initData();
  }, [isAuthenticated, navigate]);

  return <div></div>;
};

export default Index;
