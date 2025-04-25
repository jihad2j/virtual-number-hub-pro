
import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { api } from '../services/api';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  useEffect(() => {
    // Initialize database
    api.initDatabaseIfEmpty()
      .then(() => {
        console.log('Database initialized successfully');
      })
      .catch((error) => {
        console.error('Error initializing database:', error);
        toast({
          title: "Database Error",
          description: "Failed to initialize database. Using local storage mode.",
          variant: "destructive"
        });
      });
  }, []);

  return <Navigate to="/dashboard" replace />;
};

export default Index;
