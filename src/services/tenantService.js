import api from './api';

export const tenantService = {
  getTenants: (params = {}) => api.get('/tenants', { params }),
  getTenant: (id) => api.get(`/tenants/${id}`),
  createTenant: (data) => api.post('/tenants', data),
  updateTenant: (id, data) => api.put(`/tenants/${id}`, data),
  deleteTenant: (id) => api.delete(`/tenants/${id}`),
};
