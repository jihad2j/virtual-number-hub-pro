
import axios from 'axios';

// Create an Axios instance with custom configs
export const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  allowAbsoluteUrls: true,
});

// Add a request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Check if we're not already on the login page to avoid redirect loop
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);
