import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { newsApi } from '../../api/newsApi';

const AddNewsPage = () => {
    const navigate = useNavigate();

    const [news, setNews] = useState({
        title: '',
        content: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!news.title.trim() || !news.content.trim()) {
            setError('Заполните все обязательные поля');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Добавляем текущую дату автоматически
            const newsWithDate = {
                ...news,
                date: new Date().toISOString().split('T')[0] // Сегодняшняя дата
            };

            await newsApi.addNews(newsWithDate);
            alert('Новость успешно создана!');
            navigate('/moderator');
        } catch (error) {
            setError('Не удалось создать новость');
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

    return (
        <div className="update-user-page">
            <div className="container">
                <h2 className="text-center mb-4">Добавление новости</h2>

                {error && <div className="alert alert-danger text-center">{error}</div>}

                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">Заголовок *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="title"
                                            value={news.title}
                                            onChange={handleChange}
                                            placeholder="Введите заголовок новости"
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Текст статьи *</label>
                                        <textarea
                                            className="form-control"
                                            name="content"
                                            rows="8"
                                            value={news.content}
                                            onChange={handleChange}
                                            placeholder="Введите текст новости..."
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Дата публикации</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={new Date().toISOString().split('T')[0]}
                                            disabled
                                        />
                                        <small className="text-muted">
                                            Дата устанавливается автоматически (сегодня)
                                        </small>
                                    </div>

                                    <div className="text-center">
                                        <button
                                            type="submit"
                                            className="btn btn-primary me-2"
                                            disabled={loading}
                                        >
                                            {loading ? 'Создание...' : 'Создать новость'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => navigate('/moderator')}
                                            disabled={loading}
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

export default AddNewsPage;