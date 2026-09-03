import api from './api';

export const rentalService = {
  getRentals: (params = {}) => api.get('/rentals', { params }),
  getRental: (id) => api.get(`/rentals/${id}`),
  createRental: (data) => api.post('/rentals', data),
  updateRental: (id, data) => api.put(`/rentals/${id}`, data),
  deleteRental: (id) => api.delete(`/rentals/${id}`),
  checkoutRental: (id, data) => api.put(`/rentals/${id}/checkout`, data),
};
