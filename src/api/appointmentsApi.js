import api from './axios';

export const appointmentsApi = {
    create: (data) => api.post('/appointments/add', data),
    getUserAppointments: () => api.get('/appointments/user'),
    getDoctorBusySlots: (doctorId, date) =>
        api.get(`/appointments/doctor/${doctorId}/busy-slots`, { params: { date } }),
    cancel: (id) => api.post(`/appointments/${id}/cancel`),
    delete: (id) => api.delete(`/appointments/${id}/delete`),
};