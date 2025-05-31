
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  
  try {
    const { isAuthenticated } = useAuth();

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
      
      return () => clearTimeout(timeout);
    }, [isAuthenticated, navigate]);

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-shamcash-light via-white to-shamcash-primary/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-shamcash-primary border-t-transparent mx-auto mb-4"></div>
          <div className="shamcash-card p-6 text-shamcash-primary">
            <h3 className="text-lg font-semibold mb-2">ShamCash</h3>
            <p className="text-shamcash-gray-600">جاري تحميل المنصة...</p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in Index component:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-shamcash-light via-white to-shamcash-primary/5">
        <div className="text-center">
          <div className="shamcash-card p-6 text-red-600">
            <h3 className="text-lg font-semibold mb-2">خطأ في التحميل</h3>
            <p className="text-shamcash-gray-600">حدث خطأ أثناء تحميل المنصة</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-shamcash-primary text-white rounded-lg"
            >
              إعادة تحميل
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default Index;
