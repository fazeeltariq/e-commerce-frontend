import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,  // ✅ This MUST be true
});


// ✅ Add request interceptor to verify cookies are being sent
api.interceptors.request.use(
  (config) => {
    console.log('🚀 Request URL:', config.url);
    console.log('🔑 With Credentials:', config.withCredentials);
    console.log('🍪 Cookies:', document.cookie);
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('🔒 Unauthorized! Please login again.');
      // Optionally redirect to login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;