import api from './axios';

export const userApi = {
    updateProfile: (data) => api.post('/user/edit', data),
    uploadAvatar: (formData) => api.post('/user/avatar', formData),
    deleteAvatar: () => api.delete('/user/avatar'),
    getAllUsers: () => api.get('/user/getusers'),
    getUserById: (id) => api.get(`/user/getuser/${id}`),
    updateUser: (id, data) => api.put(`/user/update/${id}`, data),
    deleteUser: (id) => api.delete(`/user/delete/${id}`),
};