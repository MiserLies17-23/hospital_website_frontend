import api from './axios';

export const newsApi = {
    // Получить все новости
    getAll: () => api.get('/news'),

    // Получить новость по ID
    getById: (id) => api.get(`/news/${id}`),

    // Создать новость
    create: (newsData) => api.post('/news', newsData),

    // Обновить новость
    update: (id, newsData) => api.put(`/news/${id}`, newsData),

    // Удалить новость
    delete: (id) => api.delete(`/news/${id}`),

    // Получить мои новости (для модератора)
    getMyNews: () => api.get('/news/my'),

    // Получить последние новости
    getLatest: (limit = 5) => api.get(`/news/latest?limit=${limit}`)
};