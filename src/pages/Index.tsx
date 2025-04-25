
import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { api } from '../services/api';

const Index = () => {
  useEffect(() => {
    // Initialize database
    api.initDatabaseIfEmpty();
  }, []);

  return <Navigate to="/dashboard" replace />;
};

export default Index;
