import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const rawUrl = config.url || '';
    // Normalize URL path by stripping domain and /api prefix if present
    const urlPath = rawUrl.replace(/^https?:\/\/[^\/]+/, '').replace(/^\/api/, '');

    const isAdminRequest = 
      window.location.pathname.startsWith('/admin') ||
      urlPath.startsWith('/auth') ||
      urlPath.startsWith('/dashboard') ||
      urlPath.includes('/admin');

    const token = isAdminRequest 
      ? (localStorage.getItem('peelkraft_token') || localStorage.getItem('pk_user_token'))
      : localStorage.getItem('pk_user_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Token expired or invalid
      if (error.response.status === 401) {
        const isAdminRoute = window.location.pathname.startsWith('/admin');
        if (isAdminRoute) {
          localStorage.removeItem('peelkraft_token');
          localStorage.removeItem('peelkraft_admin');
        } else {
          localStorage.removeItem('pk_user_token');
        }
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject({ message: 'Network error. Please try again.' });
  }
);

export default axiosInstance;
