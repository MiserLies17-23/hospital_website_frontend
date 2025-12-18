import api from './axios';

export const authApi = {
    login: (credentials) => api.post('/user/login', credentials),
    signup: (userData) => api.post('/user/signup', userData),
    logout: () => api.get('/user/logout'),
    checkAuth: () => api.get('/user/checklogin'),
    getProfile: () => api.get('/user/dashboard'),
    // Для администраторов (управление пользователями)
    getAllUsers: () => api.get('/user/getusers'),
    getUserById: (id) => api.get(`/user/getuser/${id}`),
    updateUserRole: (id, role) => api.put(`/user/${id}/role`, { role }),

    // Для модераторов (статистика)
    getModeratorStats: () => api.get('/moderator/stats'),
};