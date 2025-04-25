
import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { api } from '../services/api';
import { toast } from '@/components/ui/use-toast';
import { IS_BROWSER } from '../config/mongodb';

const Index = () => {
  useEffect(() => {
    // Check if we're in a browser environment
    if (IS_BROWSER) {
      console.log('Running in browser environment. Using local storage database.');
      toast({
        title: "Browser Environment Detected",
        description: "Using local storage mode for database operations.",
      });
    }

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
