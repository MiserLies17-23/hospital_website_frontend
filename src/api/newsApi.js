import api from './axios';

export const newsApi = {
    getAllNews: () => api.get('/news/'),
    editNews: (id) => api.post(`/moderator/news/${id}/edit`),
    deleteNews: (id) => api.delete(`/moderator/news/${id}/delete`),
    addNews: () => api.post(`/moderator/news/add`)
};