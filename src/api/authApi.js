import api from './axios';

export const authApi = {
    login: (credentials) => api.post('/user/login', credentials),
    signup: (userData) => api.post('/user/signup', userData),
    logout: () => api.get('/user/logout'),
    checkAuth: () => api.get('/user/checklogin'),
    getProfile: () => api.get('/user/dashboard'),
};