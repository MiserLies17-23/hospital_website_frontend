import api from './axios';

export const doctorsApi = {
    getAllDoctors: () => api.get('/doctors'),
    getDoctorById: (id) => api.get(`/admin/doctors/${id}`),
    deleteDoctor: (id) => api.delete(`/admin/doctors/${id}/delete`),
    updateDoctor: (id, data) => api.post(`/admin/doctors/${id}/edit`, data),
    addDoctor: (data) => api.post(`/admin/doctors/add`, data)
};