import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { newsApi } from '../../api/newsApi';
import { PERMISSIONS } from '../../utils/constants';
import Loader from '../../components/common/Loader/Loader';
import Modal from '../../components/common/Modal/Modal';
import './NewsDetailPage.css';

const NewsDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Состояния для редактирования
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        date: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const { hasPermission } = useAuth();
    const canEdit = hasPermission(PERMISSIONS.EDIT_NEWS);
    const canDelete = hasPermission(PERMISSIONS.DELETE_NEWS);

    const fetchNews = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await newsApi.getById(id);
            setNews(response.data);
            setFormData({
                title: response.data.title,
                content: response.data.content,
                date: response.data.date
            });
        } catch (error) {
            console.error('Ошибка загрузки новости:', error);
            setError('Не удалось загрузить новость');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.content.trim()) {
            setError('Заголовок и содержание обязательны');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await newsApi.update(id, formData);

            setSuccess('Новость успешно обновлена!');
            setIsEditing(false);

            // Обновляем данные
            await fetchNews();

            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Ошибка обновления новости:', error);
            setError(error.response?.data?.message || 'Не удалось обновить новость');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        setError('');

        try {
            await newsApi.delete(id);

            setSuccess('Новость успешно удалена!');
            setShowDeleteModal(false);

            // Перенаправляем на страницу новостей через 1.5 секунды
            setTimeout(() => {
                navigate('/news');
            }, 1500);
        } catch (error) {
            console.error('Ошибка удаления новости:', error);
            setError(error.response?.data?.message || 'Не удалось удалить новость');
            setDeleting(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            weekday: 'long',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <Loader text="Загрузка новости..." />
            </div>
        );
    }

    if (error && !news) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">
                    {error}
                </div>
                <Link to="/news" className="btn btn-primary">
                    Вернуться к новостям
                </Link>
            </div>
        );
    }

    if (!news) {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning">
                    Новость не найдена
                </div>
                <Link to="/news" className="btn btn-primary">
                    Вернуться к новостям
                </Link>
            </div>
        );
    }

    return (
        <div className="news-detail-page">
            <div className="container">
                {/* Хлебные крошки */}
                <nav aria-label="breadcrumb" className="mb-4">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link to="/">Главная</Link>
                        </li>
                        <li className="breadcrumb-item">
                            <Link to="/news">Новости</Link>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">
                            {isEditing ? 'Редактирование' : news.title}
                        </li>
                    </ol>
                </nav>

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        {success}
                    </div>
                )}

                <div className="card">
                    <div className="card-body">
                        {/* Заголовок и кнопки управления */}
                        <div className="d-flex justify-content-between align-items-start mb-4">
                            {isEditing ? (
                                <div className="w-100">
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Заголовок новости"
                                    />
                                </div>
                            ) : (
                                <h1 className="card-title mb-0">{news.title}</h1>
                            )}

                            {(canEdit || canDelete) && !isEditing && (
                                <div className="btn-group">
                                    {canEdit && (
                                        <button
                                            className="btn btn-outline-primary"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            <i className="bi bi-pencil me-2"></i>
                                            Редактировать
                                        </button>
                                    )}
                                    {canDelete && (
                                        <button
                                            className="btn btn-outline-danger"
                                            onClick={() => setShowDeleteModal(true)}
                                        >
                                            <i className="bi bi-trash me-2"></i>
                                            Удалить
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Информация о новости */}
                        <div className="mb-4">
                            <div className="d-flex align-items-center text-muted">
                                <i className="bi bi-calendar me-2"></i>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        className="form-control form-control-sm w-auto d-inline"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                    />
                                ) : (
                                    <span>{formatDate(news.date)}</span>
                                )}
                            </div>
                        </div>

                        {/* Содержание */}
                        <div className="mb-4">
                            {isEditing ? (
                                <textarea
                                    className="form-control"
                                    name="content"
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    rows={15}
                                    placeholder="Содержание новости"
                                />
                            ) : (
                                <div className="news-content">
                                    {news.content.split('\n').map((paragraph, index) => (
                                        <p key={index} className="mb-3">
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Кнопки для режима редактирования */}
                        {isEditing && (
                            <div className="d-flex justify-content-end gap-2">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            title: news.title,
                                            content: news.content,
                                            date: news.date
                                        });
                                    }}
                                    disabled={submitting}
                                >
                                    Отмена
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleSave}
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Сохранение...
                                        </>
                                    ) : 'Сохранить изменения'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Кнопка возврата */}
                <div className="mt-4 text-center">
                    <Link to="/news" className="btn btn-outline-secondary">
                        <i className="bi bi-arrow-left me-2"></i>
                        Вернуться к списку новостей
                    </Link>
                </div>
            </div>

            {/* Модальное окно подтверждения удаления */}
            <Modal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Подтверждение удаления"
            >
                <div className="text-center">
                    <div className="mb-4">
                        <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '3rem' }}></i>
                    </div>
                    <h5>Вы уверены, что хотите удалить эту новость?</h5>
                    <p className="text-muted">
                        "{news.title.substring(0, 50)}..."
                    </p>
                    <p className="text-muted">Это действие нельзя будет отменить.</p>

                    <div className="d-flex justify-content-center gap-3 mt-4">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowDeleteModal(false)}
                            disabled={deleting}
                        >
                            Отмена
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Удаление...
                                </>
                            ) : 'Удалить новость'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default NewsDetailPage;