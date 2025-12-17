import api from './axios';

export const userApi = {
    updateProfile: (data) => api.post('/user/edit', data),
    uploadAvatar: (formData) => api.post('/user/avatar', formData),
    deleteAvatar: () => api.delete('/user/avatar'),
    getAllUsers: () => api.get('/admin/users'),
    getUserById: (id) => api.get(`/admin/users/${id}`),
    updateUser: (id, data) => api.post(`/admin/users/${id}/edit`, data),
    deleteUser: (id) => api.delete(`/admin/users/${id}/delete`),
};