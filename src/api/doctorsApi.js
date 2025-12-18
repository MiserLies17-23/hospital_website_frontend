import api from './axios';

export const doctorsApi = {
    // Получить всех врачей (публичный)
    getAll: () => api.get('/doctors'),

    // Получить врача по ID (публичный)
    getById: (id) => api.get(`/doctors/${id}`),

    // Административные методы
    create: (doctorData) => api.post('/admin/doctors', doctorData),
    update: (id, doctorData) => api.put(`/admin/doctors/${id}`, doctorData),
    delete: (id) => api.delete(`/admin/doctors/${id}`),

    // Получить статистику врача
    getStats: (id) => api.get(`/doctors/${id}/stats`),

    // Получить расписание врача
    getSchedule: (id, date) => api.get(`/doctors/${id}/schedule`, { params: { date } }),

    // Получить доступные слоты
    getAvailableSlots: (id, date) => api.get(`/doctors/${id}/available-slots`, { params: { date } }),

    // Поиск врачей
    search: (query) => api.get('/doctors/search', { params: { query } }),

    // Фильтрация по специализации
    filterBySpecialization: (specialization) => api.get('/doctors/filter', { params: { specialization } })
};