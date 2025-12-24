import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../api';
import { authApi} from "../../api";
import { useAppointments } from '../../hooks/useAppointments';
import { getAvatarUrlWithTimestamp, isDefaultAvatar } from '../../utils/formatters';
import Loader from '../../components/common/Loader/Loader';
import './PatientCabinetPage.css';

const PatientCabinetPage = () => {
    const [user, setUser] = useState(null);
    const [avatar, setAvatar] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loadingUser, setLoadingUser] = useState(true);
    const [loadingAvatar, setLoadingAvatar] = useState(false);
    const [activeTab, setActiveTab] = useState('scheduled');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        username: '',
        email: '',
    });
    const [editError, setEditError] = useState('');
    const [editLoading, setEditLoading] = useState(false);

    const { user: authUser, logout } = useAuth();
    const navigate = useNavigate();

    const {
        appointments,
        loading: loadingAppointments,
        fetchUserAppointments,
        cancelAppointment,
        deleteAppointment
    } = useAppointments();

    useEffect(() => {
        fetchUserData();
        fetchUserAppointments();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await authApi.getProfile();
            const userData = response.data;
            setUser(userData);
            setEditForm({
                username: userData.username || '',
                email: userData.email || '',
            });

            if (userData.avatar) {
                setAvatar(getAvatarUrlWithTimestamp(userData.avatar));
            }
        } catch (error) {
            console.error('Ошибка загрузки данных пользователя:', error);
            navigate('/login');
        } finally {
            setLoadingUser(false);
        }
    };

    const getFilteredAppointments = () => {
        if (!Array.isArray(appointments)) return [];

        switch (activeTab) {
            case 'scheduled':
                return appointments.filter(app => app.status === 'SCHEDULED');
            case 'completed':
                return appointments.filter(app => app.status === 'COMPLETED');
            case 'cancelled':
                return appointments.filter(app => app.status === 'CANCELLED');
            default:
                return appointments;
        }
    };

    const getAppointmentStats = () => {
        if (!Array.isArray(appointments)) {
            return { scheduled: 0, completed: 0, cancelled: 0, total: 0 };
        }

        const scheduled = appointments.filter(app => app.status === 'SCHEDULED').length;
        const completed = appointments.filter(app => app.status === 'COMPLETED').length;
        const cancelled = appointments.filter(app => app.status === 'CANCELLED').length;

        return { scheduled, completed, cancelled, total: appointments.length };
    };

    const handleAvatarUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Пожалуйста, выберите файл изображения');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Размер файла не должен превышать 5MB');
            return;
        }

        setLoadingAvatar(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', file);

        try {
            await userApi.uploadAvatar(formData, {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percentCompleted);
                },
            });

            const userResponse = await authApi.getProfile();
            const newAvatarUrl = getAvatarUrlWithTimestamp(userResponse.data.avatar);
            setAvatar(newAvatarUrl);
            alert('Аватар успешно обновлен!');
        } catch (error) {
            console.error('Ошибка при загрузке аватара:', error);
            alert('Не удалось загрузить аватар');
        } finally {
            setLoadingAvatar(false);
            setUploadProgress(0);
            event.target.value = '';
        }
    };

    const handleRemoveAvatar = async () => {
        if (!avatar || isDefaultAvatar(avatar)) return;

        try {
            await userApi.deleteAvatar();

            const userResponse = await authApi.getProfile();
            const updatedUser = userResponse.data;

            if (updatedUser.avatar) {
                const newAvatarUrl = getAvatarUrlWithTimestamp(updatedUser.avatar);
                setAvatar(newAvatarUrl);
            } else {
                setAvatar(null);
            }

            setUser(prev => ({ ...prev, avatar: updatedUser.avatar }));

            alert('Аватар удален!');
        } catch (error) {
            console.error('Ошибка при удалении аватара:', error);
            alert('Не удалось удалить аватар');
        }
    };

    const handleCancelAppointment = async (appointmentId) => {
        if (!window.confirm('Вы уверены, что хотите отменить запись?')) return;

        try {
            await cancelAppointment(appointmentId);
            alert('Запись успешно отменена!');
        } catch (error) {
            alert('Ошибка при отмене записи');
        }
    };

    const handleDeleteAppointment = async (appointmentId) => {
        if (!window.confirm('Вы уверены, что хотите удалить запись?')) return;

        try {
            await deleteAppointment(appointmentId);
            alert('Запись успешно удалена!');
        } catch (error) {
            alert('Ошибка при удалении записи');
        }
    };

    const handleEditUser = async () => {
        if (!editForm.username.trim() || !editForm.email.trim()) {
            setEditError('Имя и email обязательны для заполнения');
            return;
        }

        setEditLoading(true);
        setEditError('');

        try {
            await userApi.updateProfile({
                id: user.id,
                username: editForm.username,
                password: editForm.password,
                email: editForm.email,
            });

            setUser(prev => ({ ...prev, ...editForm }));
            setIsEditing(false);
            alert('Данные успешно обновлены!');
        } catch (error) {
            setEditError('Ошибка при обновлении данных');
        } finally {
            setEditLoading(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'SCHEDULED':
                return 'bg-primary';
            case 'COMPLETED':
                return 'bg-success';
            case 'CANCELLED':
                return 'bg-secondary';
            default:
                return 'bg-light text-dark';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'SCHEDULED':
                return 'Запланировано';
            case 'COMPLETED':
                return 'Завершено';
            case 'CANCELLED':
                return 'Отменено';
            default:
                return status;
        }
    };

    if (loadingUser) {
        return <Loader text="Загрузка данных..." />;
    }

    const stats = getAppointmentStats();
    const filteredAppointments = getFilteredAppointments();

    return (
        <div className="patient-cabinet-page">
            <div className="container">
                <h2 className="text-center mb-4">Кабинет пациента</h2>

                <div className="row">
                    {/* Левая колонка - профиль */}
                    <div className="col-md-4 mb-4">
                        <div className="card">
                            <div className="card-body text-center">
                                {/* Аватар */}
                                <div className="mb-3">
                                    <div className="avatar-container position-relative d-inline-block">
                                        {avatar ? (
                                            <img
                                                src={avatar}
                                                alt="User Avatar"
                                                className="avatar-image"
                                                style={{
                                                    width: '120px',
                                                    height: '120px',
                                                    borderRadius: '50%',
                                                    objectFit: 'cover',
                                                    border: '3px solid #007bff'
                                                }}
                                            />
                                        ) : (
                                            <div
                                                className="avatar-placeholder"
                                                style={{
                                                    width: '120px',
                                                    height: '120px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#f8f9fa',
                                                    border: '3px dashed #dee2e6',
                                                    color: '#6c757d',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <span>Нет аватара</span>
                                            </div>
                                        )}

                                        {loadingAvatar && (
                                            <div className="position-absolute top-50 start-50 translate-middle">
                                                <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                    <span className="visually-hidden">Загрузка...</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-3">
                                        {isEditing && (
                                            <>
                                                <input
                                                    type="file"
                                                    id="avatar-upload"
                                                    accept="image/*"
                                                    onChange={handleAvatarUpload}
                                                    style={{ display: 'none' }}
                                                    disabled={loadingAvatar}
                                                />
                                                <label
                                                    htmlFor="avatar-upload"
                                                    className={`btn btn-primary btn-sm ${loadingAvatar ? 'disabled' : ''}`}
                                                >
                                                    {avatar ? 'Изменить' : 'Загрузить'}
                                                </label>
                                            </>
                                        )}

                                        {avatar && !isDefaultAvatar(avatar) && isEditing && (
                                            <button
                                                className="btn btn-outline-danger btn-sm ms-2"
                                                onClick={handleRemoveAvatar}
                                                disabled={loadingAvatar}
                                            >
                                                Удалить
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Информация о пользователе */}
                                <div className="mb-3">
                                    <p><strong>ID:</strong> {user.id}</p>
                                    <p><strong>Количество посещений:</strong> {user.visitsCount || 0}</p>

                                    {isEditing ? (
                                        <div className="mb-3">
                                            <div className="mb-2">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={editForm.username}
                                                    onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                                                    placeholder="Имя пользователя"
                                                />
                                            </div>
                                            <div className="mb-2">
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    value={editForm.email}
                                                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                                    placeholder="Email"
                                                />
                                            </div>
                                            <div className="mb-2">
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    value={editForm.password}
                                                    onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                                                    placeholder="Новый пароль (оставьте пустым если не менять)"
                                                />
                                            </div>
                                            {editError && <div className="text-danger small">{editError}</div>}
                                        </div>
                                    ) : (
                                        <>
                                            <p><strong>Имя:</strong> {user.username}</p>
                                            <p><strong>Email:</strong> {user.email}</p>
                                        </>
                                    )}

                                    <p><strong>Роль:</strong> {user.role}</p>
                                </div>

                                {/* Кнопки редактирования */}
                                <div className="mb-3">
                                    {isEditing ? (
                                        <div>
                                            <button
                                                className="btn btn-success btn-sm me-2"
                                                onClick={handleEditUser}
                                                disabled={editLoading}
                                            >
                                                {editLoading ? 'Сохранение...' : 'Сохранить'}
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setEditForm({ username: user.username, email: user.email });
                                                    setEditError('');
                                                }}
                                                disabled={editLoading}
                                            >
                                                Отмена
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            Редактировать профиль
                                        </button>
                                    )}
                                </div>

                                {/* Статистика */}
                                <div className="mb-3">
                                    <h6>Статистика записей:</h6>
                                    <div className="d-flex flex-wrap gap-1 justify-content-center">
                                        <span className="badge bg-primary">Запланировано: {stats.scheduled}</span>
                                        <span className="badge bg-success">Завершено: {stats.completed}</span>
                                        <span className="badge bg-secondary">Отменено: {stats.cancelled}</span>
                                    </div>
                                </div>

                                {/* Кнопки действий */}
                                <div className="d-grid gap-2">
                                    <button
                                        className="btn btn-success"
                                        onClick={() => navigate('/appointments')}
                                    >
                                        Новая запись
                                    </button>

                                    {user.role === "ADMIN" && (
                                        <button
                                            className="btn btn-warning"
                                            onClick={() => navigate('/admin')}
                                        >
                                            Админ панель
                                        </button>
                                    )}

                                    {user.role === "MODERATOR" && (
                                        <button
                                            className="btn btn-info"
                                            onClick={() => navigate('/moderator')}
                                        >
                                            Панель модератора
                                        </button>
                                    )}

                                    <button
                                        className="btn btn-danger"
                                        onClick={logout}
                                    >
                                        Выйти
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Правая колонка - записи */}
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-body">
                                <h4 className="card-title mb-3">Мои записи</h4>

                                {/* Вкладки */}
                                <nav className="mb-3">
                                    <div className="nav nav-tabs">
                                        <button
                                            className={`nav-link ${activeTab === 'scheduled' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('scheduled')}
                                        >
                                            Запланированные
                                            {stats.scheduled > 0 && (
                                                <span className="badge bg-primary ms-2">{stats.scheduled}</span>
                                            )}
                                        </button>
                                        <button
                                            className={`nav-link ${activeTab === 'completed' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('completed')}
                                        >
                                            Завершенные
                                            {stats.completed > 0 && (
                                                <span className="badge bg-success ms-2">{stats.completed}</span>
                                            )}
                                        </button>
                                        <button
                                            className={`nav-link ${activeTab === 'cancelled' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('cancelled')}
                                        >
                                            Отмененные
                                            {stats.cancelled > 0 && (
                                                <span className="badge bg-secondary ms-2">{stats.cancelled}</span>
                                            )}
                                        </button>
                                    </div>
                                </nav>

                                {loadingAppointments ? (
                                    <Loader text="Загрузка записей..." />
                                ) : filteredAppointments.length === 0 ? (
                                    <div className="text-center py-4">
                                        <p className="text-muted">
                                            {activeTab === 'scheduled' && 'Нет запланированных записей'}
                                            {activeTab === 'completed' && 'Нет завершенных записей'}
                                            {activeTab === 'cancelled' && 'Нет отмененных записей'}
                                        </p>
                                        {activeTab === 'scheduled' && (
                                            <button
                                                className="btn btn-sm btn-outline-primary mt-2"
                                                onClick={() => navigate('/appointments')}
                                            >
                                                Записаться на прием
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead>
                                            <tr>
                                                <th>Врач</th>
                                                <th>Дата</th>
                                                <th>Время</th>
                                                <th>Статус</th>
                                                <th>Действия</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {filteredAppointments.map(appointment => (
                                                <tr key={appointment.id}>
                                                    <td>
                                                        <div>
                                                            <strong>{appointment.doctorName}</strong>
                                                            <div className="small text-muted">{appointment.specialization}</div>
                                                        </div>
                                                    </td>
                                                    <td>{appointment.appointmentDate}</td>
                                                    <td>{appointment.appointmentTime}</td>
                                                    <td>
                                                            <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
                                                                {getStatusText(appointment.status)}
                                                            </span>
                                                    </td>
                                                    <td>
                                                        <div className="btn-group btn-group-sm">
                                                            {appointment.status === 'SCHEDULED' && (
                                                                <button
                                                                    className="btn btn-outline-danger"
                                                                    onClick={() => handleCancelAppointment(appointment.id)}
                                                                >
                                                                    Отменить
                                                                </button>
                                                            )}
                                                            {(appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') && (
                                                                <button
                                                                    className="btn btn-outline-danger"
                                                                    onClick={() => handleDeleteAppointment(appointment.id)}
                                                                >
                                                                    Удалить
                                                                </button>
                                                            )}
                                                            <button
                                                                className="btn btn-outline-info"
                                                                onClick={() => alert(`Симптомы: ${appointment.symptoms || 'Не указаны'}`)}
                                                            >
                                                                Подробнее
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientCabinetPage;