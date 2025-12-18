import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { newsApi } from '../../api/newsApi';
import { PERMISSIONS } from '../../utils/constants';
import Loader from '../../components/common/Loader/Loader';
import Modal from '../../components/common/Modal/Modal';
import './NewsManagementPage.css';

const NewsManagementPage = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Состояние для формы
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        date: new Date().toISOString().split('T')[0]
    });

    // Состояния для модальных окон
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingNews, setEditingNews] = useState(null);
    const [deletingNewsId, setDeletingNewsId] = useState(null);

    // Состояния для операций
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const { hasPermission } = useAuth();
    const navigate = useNavigate();

    // Проверка прав
    const canCreate = hasPermission(PERMISSIONS.CREATE_NEWS);
    const canEdit = hasPermission(PERMISSIONS.EDIT_NEWS);
    const canDelete = hasPermission(PERMISSIONS.DELETE_NEWS);

    // Загрузка новостей
    const fetchNews = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await newsApi.getAll();
            setNews(response.data || []);
        } catch (error) {
            console.error('Ошибка загрузки новостей:', error);
            setError('Не удалось загрузить новости');
            setNews([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    // Обработчики форм
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Создание новости
    const handleCreateNews = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.content.trim()) {
            setError('Заголовок и содержание обязательны');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await newsApi.create({
                ...formData,
                date: formData.date || new Date().toISOString().split('T')[0]
            });

            setSuccess('Новость успешно создана!');
            setFormData({
                title: '',
                content: '',
                date: new Date().toISOString().split('T')[0]
            });
            setShowCreateModal(false);

            // Обновляем список
            await fetchNews();

            // Автоматически скрываем успешное сообщение через 3 секунды
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Ошибка создания новости:', error);
            setError(error.response?.data?.message || 'Не удалось создать новость');
        } finally {
            setSubmitting(false);
        }
    };

    // Редактирование новости
    const handleEditNews = async (e) => {
        e.preventDefault();

        if (!editingNews || !formData.title.trim() || !formData.content.trim()) {
            setError('Заголовок и содержание обязательны');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await newsApi.update(editingNews.id, {
                ...formData,
                date: formData.date || editingNews.date
            });

            setSuccess('Новость успешно обновлена!');
            setShowEditModal(false);
            setEditingNews(null);

            // Обновляем список
            await fetchNews();

            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Ошибка обновления новости:', error);
            setError(error.response?.data?.message || 'Не удалось обновить новость');
        } finally {
            setSubmitting(false);
        }
    };

    // Удаление новости
    const handleDeleteNews = async () => {
        if (!deletingNewsId) return;

        setDeleting(true);
        setError('');

        try {
            await newsApi.delete(deletingNewsId);

            setSuccess('Новость успешно удалена!');
            setShowDeleteModal(false);
            setDeletingNewsId(null);

            // Обновляем список
            await fetchNews();

            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Ошибка удаления новости:', error);
            setError(error.response?.data?.message || 'Не удалось удалить новость');
        } finally {
            setDeleting(false);
        }
    };

    // Открытие модальных окон
    const openCreateModal = () => {
        setFormData({
            title: '',
            content: '',
            date: new Date().toISOString().split('T')[0]
        });
        setShowCreateModal(true);
        setError('');
    };

    const openEditModal = (newsItem) => {
        setEditingNews(newsItem);
        setFormData({
            title: newsItem.title,
            content: newsItem.content,
            date: newsItem.date
        });
        setShowEditModal(true);
        setError('');
    };

    const openDeleteModal = (newsId) => {
        setDeletingNewsId(newsId);
        setShowDeleteModal(true);
        setError('');
    };

    // Форматирование даты
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (loading) {
        return <Loader text="Загрузка новостей..." />;
    }

    return (
        <div className="news-management-page">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Управление новостями</h2>

                    {canCreate && (
                        <button
                            className="btn btn-primary"
                            onClick={openCreateModal}
                            disabled={submitting}
                        >
                            <i className="bi bi-plus-circle me-2"></i>
                            Добавить новость
                        </button>
                    )}
                </div>

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
                        {news.length === 0 ? (
                            <div className="text-center py-4">
                                <p className="text-muted">Новостей пока нет</p>
                                {canCreate && (
                                    <button
                                        className="btn btn-primary mt-2"
                                        onClick={openCreateModal}
                                    >
                                        Создать первую новость
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Заголовок</th>
                                        <th>Дата</th>
                                        <th>Статус</th>
                                        <th>Действия</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {news.map(newsItem => (
                                        <tr key={newsItem.id}>
                                            <td>{newsItem.id}</td>
                                            <td>
                                                <div className="fw-semibold">{newsItem.title}</div>
                                                <div className="text-muted small">
                                                    {newsItem.content.substring(0, 100)}...
                                                </div>
                                            </td>
                                            <td>{formatDate(newsItem.date)}</td>
                                            <td>
                                                    <span className="badge bg-success">
                                                        Опубликовано
                                                    </span>
                                            </td>
                                            <td>
                                                <div className="btn-group btn-group-sm">
                                                    <button
                                                        className="btn btn-outline-info"
                                                        onClick={() => navigate(`/news/${newsItem.id}`)}
                                                        title="Просмотреть"
                                                    >
                                                        <i className="bi bi-eye"></i>
                                                    </button>

                                                    {canEdit && (
                                                        <button
                                                            className="btn btn-outline-primary"
                                                            onClick={() => openEditModal(newsItem)}
                                                            title="Редактировать"
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </button>
                                                    )}

                                                    {canDelete && (
                                                        <button
                                                            className="btn btn-outline-danger"
                                                            onClick={() => openDeleteModal(newsItem.id)}
                                                            title="Удалить"
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    )}
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
            </div>

            {/* Модальное окно создания новости */}
            <Modal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Создание новости"
            >
                <form onSubmit={handleCreateNews}>
                    <div className="mb-3">
                        <label className="form-label">Заголовок *</label>
                        <input
                            type="text"
                            className="form-control"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            maxLength={200}
                            placeholder="Введите заголовок новости"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Дата публикации</label>
                        <input
                            type="date"
                            className="form-control"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Содержание *</label>
                        <textarea
                            className="form-control"
                            name="content"
                            value={formData.content}
                            onChange={handleInputChange}
                            required
                            rows={6}
                            placeholder="Введите содержание новости"
                        />
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowCreateModal(false)}
                            disabled={submitting}
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Создание...
                                </>
                            ) : 'Создать новость'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Модальное окно редактирования новости */}
            <Modal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Редактирование новости"
            >
                {editingNews && (
                    <form onSubmit={handleEditNews}>
                        <div className="mb-3">
                            <label className="form-label">Заголовок *</label>
                            <input
                                type="text"
                                className="form-control"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                maxLength={200}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Дата публикации</label>
                            <input
                                type="date"
                                className="form-control"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Содержание *</label>
                            <textarea
                                className="form-control"
                                name="content"
                                value={formData.content}
                                onChange={handleInputChange}
                                required
                                rows={6}
                            />
                        </div>

                        <div className="d-flex justify-content-end gap-2">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowEditModal(false)}
                                disabled={submitting}
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
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
                    </form>
                )}
            </Modal>

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
                            onClick={handleDeleteNews}
                            disabled={deleting}
                        >
                            {deleting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Удаление...
                                </>
                            ) : 'Удалить'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default NewsManagementPage;