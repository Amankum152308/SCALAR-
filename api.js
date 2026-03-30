import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error handling parsing
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Safely parse Axios errors propagating custom messages
    const customError = new Error(
      error.response?.data?.error || 
      error.response?.data?.message || 
      'Server Connection Error'
    );
    customError.status = error.response?.status;
    customError.details = error.response?.data?.details;
    
    return Promise.reject(customError);
  }
);

export default api;
