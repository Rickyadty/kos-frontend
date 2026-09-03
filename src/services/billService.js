import api from './api';

export const billService = {
  getBills: (params = {}) => api.get('/room-bills', { params }),
  getBill: (id) => api.get(`/room-bills/${id}`),
  generateBills: (data) => api.post('/room-bills/generate', data),
};
