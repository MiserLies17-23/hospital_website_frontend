import api from './axios';

export const newsApi = {
    getAllNews: () => api.get('/news'),
    editNews: (id, data) => api.post(`/moderator/news/${id}/edit`, data),
    deleteNews: (id) => api.delete(`/moderator/news/${id}/delete`, id),
    addNews: (data) => api.post(`/moderator/news/add`, data),
    getNewsById: (id) => api.get(`/moderator/news/${id}`)
};