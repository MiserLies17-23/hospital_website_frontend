import api from './axios';

export const doctorsApi = {
    getAll: () => api.get('/doctor/'),
    getById: (id) => api.get(`/doctor/${id}`),
};