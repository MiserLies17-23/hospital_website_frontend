import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { newsApi } from '../../api/newsApi';
import Loader from '../../components/common/Loader/Loader';

const ModeratorPanelPage = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const response = await newsApi.getAllNews();
            setNews(response.data);
        } catch (error) {
            setError('Не удалось загрузить новости');
        } finally {
            setLoading(false);
        }
    };

    const deleteNews = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить новость?')) return;

        try {
            await newsApi.deleteNews(id);
            setNews(news.filter(item => item.id !== id));
        } catch (error) {
            setError('Не удалось удалить новость');
        }
    };

    if (loading) {
        return <Loader text="Загрузка новостей..." />;
    }

    return (
        <div className="admin-panel-page"> {/* Используем те же стили */}
            <div className="container">
                <h2 className="text-center mb-4">Панель модератора новостей</h2>

                {error && <div className="alert alert-danger text-center">{error}</div>}

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="mb-0">Управление новостями</h3>
                    <Link
                        to="/moderator/news/add"
                        className="btn btn-success"
                    >
                        Добавить новость
                    </Link>
                </div>

                {news.length === 0 ? (
                    <div className="text-center">
                        <p>Нет новостей</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover">
                            <thead className="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Заголовок</th>
                                <th>Дата</th>
                                <th>Действия</th>
                            </tr>
                            </thead>
                            <tbody>
                            {news.map(item => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.title}</td>
                                    <td>{item.date}</td>
                                    <td>
                                        <div className="btn-group btn-group-sm">
                                            <Link
                                                to={`/moderator/news/${item.id}/edit`}
                                                className="btn btn-primary"
                                            >
                                                Изменить
                                            </Link>

                                            <button
                                                className="btn btn-danger"
                                                onClick={() => deleteNews(item.id)}
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModeratorPanelPage;