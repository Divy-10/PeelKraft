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
    const token = localStorage.getItem('peelkraft_token');
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
          window.location.href = '/admin/login';
        }
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject({ message: 'Network error. Please try again.' });
  }
);

export default axiosInstance;
