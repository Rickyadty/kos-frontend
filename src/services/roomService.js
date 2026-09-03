import api from './api';

export const roomService = {
  getRooms: (params = {}) => api.get('/rooms', { params }),
  getRoom: (id) => api.get(`/rooms/${id}`),
  createRoom: (data) => api.post('/rooms', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateRoom: (id, data) => {
    // Karena Laravel kurang optimal membaca FormData via PUT, 
    // kita ubah menjadi POST dengan _method=PUT di dalamnya
    data.append('_method', 'PUT');
    return api.post(`/rooms/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteRoom: (id) => api.delete(`/rooms/${id}`),
};
