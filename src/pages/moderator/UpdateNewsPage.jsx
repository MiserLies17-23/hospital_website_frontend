import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { newsApi } from '../../api/newsApi';
import Loader from '../../components/common/Loader/Loader';

const UpdateNewsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [news, setNews] = useState({
        title: '',
        content: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchNews();
    }, [id]);

    const fetchNews = async () => {
        try {
            setLoading(true);
            const response = await newsApi.getNewsById(id);
            const newsData = response.data;

            // Если дата старая, оставляем оригинальную, иначе сегодняшнюю
            const originalDate = newsData.date || new Date().toISOString().split('T')[0];

            setNews({
                title: newsData.title || '',
                content: newsData.content || '',
                author: newsData.author || 'unknow',
                date: originalDate,
            });
        } catch (error) {
            setError('Не удалось загрузить данные новости');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await newsApi.editNews(id, news);
            alert('Новость успешно обновлена!');
            navigate('/moderator');
        } catch (error) {
            setError('Не удалось обновить новость');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNews(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    if (loading && !news.title) {
        return <Loader text="Загрузка данных новости..." />;
    }

    return (
        <div className="update-user-page">
            <div className="container">
                <h2 className="text-center mb-4">Редактирование новости</h2>

                {error && <div className="alert alert-danger text-center">{error}</div>}

                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-body">
                                <form onSubmit={handleUpdate}>
                                    <div className="mb-3">
                                        <label className="form-label">Заголовок</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="title"
                                            value={news.title}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Текст статьи</label>
                                        <textarea
                                            className="form-control"
                                            name="content"
                                            rows="8"
                                            value={news.content}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Автор</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="author"
                                            value={news.author}
                                            onChange={handleChange}
                                            required
                                            disabled
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Дата публикации</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="date"
                                            value={news.date}
                                            onChange={handleChange}
                                            required
                                            disabled // Дата фиксируется при создании
                                        />
                                        <small className="text-muted">
                                            Дата фиксируется при создании новости
                                        </small>
                                    </div>

                                    <div className="text-center">
                                        <button
                                            type="submit"
                                            className="btn btn-primary me-2"
                                            disabled={loading}
                                        >
                                            {loading ? 'Сохранение...' : 'Сохранить'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => navigate('/moderator')}
                                        >
                                            Отмена
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateNewsPage;