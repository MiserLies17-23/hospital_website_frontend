import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { newsApi } from '../../api/newsApi';
import { PERMISSIONS } from '../../utils/constants';
import Loader from '../../components/common/Loader/Loader';
import './NewsPage.css';

const NewsPage = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { isAuthenticated, hasPermission } = useAuth();
    const canManageNews = hasPermission(PERMISSIONS.CREATE_NEWS) ||
        hasPermission(PERMISSIONS.EDIT_NEWS) ||
        hasPermission(PERMISSIONS.DELETE_NEWS);

    const fetchNews = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await newsApi.getAll();
            setNews(response.data || []);
        } catch (error) {
            console.error('Ошибка загрузки новостей:', error);
            setError('Не удалось загрузить новости. Попробуйте позже.');
            setNews([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            weekday: 'long'
        });
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <h2 className="text-center mb-4">Новости больницы</h2>
                <div className="text-center">
                    <Loader text="Загрузка новостей..." />
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Новости больницы</h2>

                {isAuthenticated && canManageNews && (
                    <Link to="/news-management" className="btn btn-primary">
                        <i className="bi bi-gear me-2"></i>
                        Управление новостями
                    </Link>
                )}
            </div>

            {error && (
                <div className="alert alert-danger text-center">
                    {error}
                </div>
            )}

            <div className="news-content">
                {news.length === 0 ? (
                    <div className="text-center py-5">
                        <i className="bi bi-newspaper text-muted" style={{ fontSize: '4rem' }}></i>
                        <h4 className="mt-3">Новостей пока нет</h4>
                        <p className="text-muted">Следите за обновлениями</p>

                        {isAuthenticated && canManageNews && (
                            <Link to="/news-management" className="btn btn-primary mt-3">
                                Добавить первую новость
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="row">
                        {news.map(item => (
                            <div key={item.id} className="col-md-6 col-lg-4 mb-4">
                                <div className="card h-100 news-card">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <h5 className="card-title">{item.title}</h5>
                                            {isAuthenticated && canManageNews && (
                                                <div className="dropdown">
                                                    <button
                                                        className="btn btn-sm btn-outline-secondary border-0"
                                                        type="button"
                                                        data-bs-toggle="dropdown"
                                                        aria-expanded="false"
                                                    >
                                                        <i className="bi bi-three-dots-vertical"></i>
                                                    </button>
                                                    <ul className="dropdown-menu dropdown-menu-end">
                                                        <li>
                                                            <Link
                                                                className="dropdown-item"
                                                                to={`/news/${item.id}`}
                                                            >
                                                                <i className="bi bi-eye me-2"></i>
                                                                Просмотреть
                                                            </Link>
                                                        </li>
                                                        {hasPermission(PERMISSIONS.EDIT_NEWS) && (
                                                            <li>
                                                                <Link
                                                                    className="dropdown-item"
                                                                    to={`/news/${item.id}/edit`}
                                                                >
                                                                    <i className="bi bi-pencil me-2"></i>
                                                                    Редактировать
                                                                </Link>
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                        <p className="card-text text-muted small mb-3">
                                            <i className="bi bi-calendar me-1"></i>
                                            {formatDate(item.date)}
                                        </p>

                                        <p className="card-text">
                                            {item.content.length > 150
                                                ? `${item.content.substring(0, 150)}...`
                                                : item.content
                                            }
                                        </p>

                                        <div className="mt-3">
                                            <Link
                                                to={`/news/${item.id}`}
                                                className="btn btn-outline-primary btn-sm"
                                            >
                                                Читать полностью
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsPage;