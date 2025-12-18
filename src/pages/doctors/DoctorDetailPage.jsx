import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doctorsApi } from '../../api/doctorsApi';
import { PERMISSIONS } from '../../utils/constants';
import Loader from '../../components/common/Loader/Loader';
import './DoctorDetailPage.css';

const DoctorDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);

    const { hasPermission } = useAuth();
    const canEdit = hasPermission(PERMISSIONS.EDIT_DOCTORS);
    const canDelete = hasPermission(PERMISSIONS.DELETE_DOCTORS);

    const fetchDoctor = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await doctorsApi.getById(id);
            setDoctor(response.data);
        } catch (error) {
            console.error('Ошибка загрузки врача:', error);
            setError('Не удалось загрузить информацию о враче');
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchStats = useCallback(async () => {
        setLoadingStats(true);
        try {
            const response = await doctorsApi.getStats(id);
            setStats(response.data);
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
        } finally {
            setLoadingStats(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDoctor();
        fetchStats();
    }, [fetchDoctor, fetchStats]);

    const formatPhone = (phone) => {
        if (!phone) return 'Не указан';
        return phone.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 ($2) $3-$4-$5');
    };

    const handleEdit = () => {
        navigate(`/admin/doctors/${id}/edit`);
    };

    const handleDelete = () => {
        if (window.confirm('Вы уверены, что хотите удалить этого врача? Все записи будут отменены.')) {
            // Здесь будет вызов API для удаления
            console.log('Удаление врача:', id);
        }
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <Loader text="Загрузка информации о враче..." />
            </div>
        );
    }

    if (error && !doctor) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">
                    {error}
                </div>
                <Link to="/doctors" className="btn btn-primary">
                    Вернуться к списку врачей
                </Link>
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning">
                    Врач не найден
                </div>
                <Link to="/doctors" className="btn btn-primary">
                    Вернуться к списку врачей
                </Link>
            </div>
        );
    }

    return (
        <div className="doctor-detail-page">
            <div className="container">
                {/* Хлебные крошки */}
                <nav aria-label="breadcrumb" className="mb-4">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link to="/">Главная</Link>
                        </li>
                        <li className="breadcrumb-item">
                            <Link to="/appointments">Врачи</Link>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">
                            {doctor.name}
                        </li>
                    </ol>
                </nav>

                <div className="row">
                    {/* Левая колонка - информация о враче */}
                    <div className="col-lg-8">
                        <div className="card mb-4">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-4">
                                    <div>
                                        <h1 className="card-title mb-2">{doctor.name}</h1>
                                        <span className="badge bg-info fs-6">
                                            {doctor.specialization}
                                        </span>
                                    </div>

                                    {(canEdit || canDelete) && (
                                        <div className="btn-group">
                                            {canEdit && (
                                                <button
                                                    className="btn btn-outline-primary"
                                                    onClick={handleEdit}
                                                >
                                                    <i className="bi bi-pencil me-2"></i>
                                                    Редактировать
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    className="btn btn-outline-danger"
                                                    onClick={handleDelete}
                                                >
                                                    <i className="bi bi-trash me-2"></i>
                                                    Удалить
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <div className="doctor-info-item mb-3">
                                            <i className="bi bi-telephone text-primary me-2"></i>
                                            <strong>Телефон:</strong>
                                            <span className="ms-2">{formatPhone(doctor.phone)}</span>
                                        </div>

                                        <div className="doctor-info-item mb-3">
                                            <i className="bi bi-envelope text-primary me-2"></i>
                                            <strong>Email:</strong>
                                            <span className="ms-2">
                                                {doctor.email || 'Не указан'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="doctor-info-item mb-3">
                                            <i className="bi bi-door-closed text-primary me-2"></i>
                                            <strong>Кабинет:</strong>
                                            <span className="ms-2">
                                                {doctor.office ? `№${doctor.office}` : 'Не указан'}
                                            </span>
                                        </div>

                                        <div className="doctor-info-item mb-3">
                                            <i className="bi bi-calendar-check text-primary me-2"></i>
                                            <strong>График работы:</strong>
                                            <span className="ms-2">9:00 - 18:00</span>
                                        </div>
                                    </div>
                                </div>

                                {doctor.description && (
                                    <div className="mb-4">
                                        <h5 className="mb-3">О враче</h5>
                                        <div className="doctor-description">
                                            {doctor.description.split('\n').map((paragraph, index) => (
                                                <p key={index} className="mb-3">
                                                    {paragraph}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="text-center">
                                    <Link
                                        to={`/appointments?doctor=${doctor.id}`}
                                        className="btn btn-primary btn-lg"
                                    >
                                        <i className="bi bi-calendar-plus me-2"></i>
                                        Записаться на прием
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Правая колонка - статистика */}
                    <div className="col-lg-4">
                        <div className="card mb-4">
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0">Статистика</h5>
                            </div>
                            <div className="card-body">
                                {loadingStats ? (
                                    <div className="text-center py-3">
                                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                                            <span className="visually-hidden">Загрузка...</span>
                                        </div>
                                    </div>
                                ) : stats ? (
                                    <div className="stats-list">
                                        <div className="stat-item d-flex justify-content-between mb-3">
                                            <span>Всего записей:</span>
                                            <span className="badge bg-primary">
                                                {stats.totalAppointments || 0}
                                            </span>
                                        </div>

                                        <div className="stat-item d-flex justify-content-between mb-3">
                                            <span>Запланировано:</span>
                                            <span className="badge bg-warning">
                                                {stats.scheduledAppointments || 0}
                                            </span>
                                        </div>

                                        <div className="stat-item d-flex justify-content-between mb-3">
                                            <span>Завершено:</span>
                                            <span className="badge bg-success">
                                                {stats.completedAppointments || 0}
                                            </span>
                                        </div>

                                        <div className="stat-item d-flex justify-content-between mb-3">
                                            <span>Отменено:</span>
                                            <span className="badge bg-danger">
                                                {stats.cancelledAppointments || 0}
                                            </span>
                                        </div>

                                        <div className="stat-item d-flex justify-content-between">
                                            <span>Рейтинг:</span>
                                            <span className="badge bg-info">
                                                {stats.rating ? stats.rating.toFixed(1) : 'Н/Д'} / 5
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-muted text-center">
                                        Статистика недоступна
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Быстрые действия для администратора */}
                        {hasPermission(PERMISSIONS.MANAGE_SYSTEM) && (
                            <div className="card">
                                <div className="card-header bg-warning text-dark">
                                    <h5 className="mb-0">Быстрые действия</h5>
                                </div>
                                <div className="card-body">
                                    <div className="d-grid gap-2">
                                        <Link
                                            to="/admin/doctors"
                                            className="btn btn-outline-warning"
                                        >
                                            <i className="bi bi-people me-2"></i>
                                            Все врачи
                                        </Link>

                                        <Link
                                            to="/admin/doctors/add"
                                            className="btn btn-outline-success"
                                        >
                                            <i className="bi bi-person-plus me-2"></i>
                                            Добавить врача
                                        </Link>

                                        <button
                                            className="btn btn-outline-info"
                                            onClick={() => window.print()}
                                        >
                                            <i className="bi bi-printer me-2"></i>
                                            Распечатать
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Кнопка возврата */}
                <div className="mt-4 text-center">
                    <Link to="/appointments" className="btn btn-outline-secondary">
                        <i className="bi bi-arrow-left me-2"></i>
                        Вернуться к списку врачей
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DoctorDetailPage;