import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medislot_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Friendly error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired, clear and trigger custom event
    if (error.response && error.response.status === 401) {
      const isLoginRequest = error.config.url.includes('/auth/login');
      if (!isLoginRequest) {
        localStorage.removeItem('medislot_token');
        localStorage.removeItem('medislot_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
