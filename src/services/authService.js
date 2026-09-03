import api from './api';
import axios from 'axios';

const getBackendRootUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  return apiUrl.replace(/\/api\/?$/, '');
};

export const authService = {
  getCsrfCookie: async () => {
    try {
      await axios.get(`${getBackendRootUrl()}/sanctum/csrf-cookie`, {
        withCredentials: true,
        headers: { 'Accept': 'application/json' },
      });
    } catch {
      // Ignore if endpoint fails
    }
  },
  login: async (credentials) => {
    await authService.getCsrfCookie();
    return api.post('/auth/login', credentials);
  },
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};
