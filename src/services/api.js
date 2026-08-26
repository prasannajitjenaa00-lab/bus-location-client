import axios from 'axios';
import configEnv from '../config';

const baseURL = configEnv.apiUrl ? `${configEnv.apiUrl}/api` : '/api';

const api = axios.create({
  baseURL,
});

// Intercept request to add JWT bearer token
api.interceptors.request.use((config) => {
  const adminAuth = JSON.parse(localStorage.getItem('adminAuth') || '{}');
  const driverAuth = JSON.parse(localStorage.getItem('driverAuth') || '{}');
  
  // Prioritize token based on whether current route is admin or driver
  let token;
  if (window.location.pathname.startsWith('/admin')) {
    token = adminAuth.token || driverAuth.token;
  } else {
    token = driverAuth.token || adminAuth.token;
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
