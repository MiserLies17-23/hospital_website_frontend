import api from './Api/Api.jsx';
import { getErrorMessage } from "./utils/errorHandler";
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PatientCabinet({ onLogout }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [id, setId] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [visitsCount, setVisitsCount] = useState(0);
    const [appointments, setAppointments] = useState([]);
    const [loadingAppointments, setLoadingAppointments] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [activeTab, setActiveTab] = useState('scheduled');
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        username: '',
        email: '',
    });
    const [editError, setEditError] = useState('');
    const [editLoading, setEditLoading] = useState(false);

    // Функция для добавления временной метки к URL аватара
    const getAvatarUrlWithTimestamp = (avatarUrl) => {
        if (!avatarUrl) return null;
        const baseUrl = avatarUrl.split('?')[0];
        const timestamp = Date.now();
        return `${baseUrl}?t=${timestamp}`;
    };

    // Функция для проверки, является ли аватар дефолтным
    const isDefaultAvatar = (avatarUrl) => {
        if (!avatarUrl) return true;

        const defaultAvatarPatterns = [
            'default',
            'placeholder',
            'gravatar',
            '/images/default',
            '//www.gravatar.com/avatar/'
        ];

        return defaultAvatarPatterns.some(pattern =>
            avatarUrl.includes(pattern)
        );
    };

    // Загрузка информации о пользователе и записях
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await api.get('/user/dashboard', {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                console.log('User data:', response.data);

                // Безопасно устанавливаем данные
                setUsername(response.data.username || '');
                setEmail(response.data.email || '');
                setRole(response.data.role || 'USER');
                setId(response.data.id || '');

                // Добавляем временную метку для предотвращения кэширования
                const avatarUrl = response.data.avatar;
                if (avatarUrl) {
                    setAvatar(getAvatarUrlWithTimestamp(avatarUrl));
                } else {
                    setAvatar(null);
                }

                setVisitsCount(response.data.visitsCount || 0);

                setEditForm({
                    username: response.data.username || '',
                    email: response.data.email || '',
                });
            } catch (error) {
                const errorMessage = getErrorMessage(error);
                setError(errorMessage);

                // Редирект только для 404/401
                if (error.response?.status === 404 || error.response?.status === 401) {
                    navigate('/login');
                }
            }
        };

        const fetchUserAppointments = async () => {
            try {
                const response = await api.get('/appointments/user', {
                    withCredentials: true,
                    headers: {"Content-Type": "application/json"}
                });
                setAppointments(response.data || []);
            } catch (error) {
                console.error('Ошибка при загрузке записей:', getErrorMessage(error));
                setAppointments([]);
            } finally {
                setLoadingAppointments(false);
            }
        };

        fetchUserInfo();
        fetchUserAppointments();
    }, [navigate]);

    // Фильтрация записей по статусу
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

    // Получение статистики по записям
    const getAppointmentStats = () => {
        if (!Array.isArray(appointments)) {
            return { scheduled: 0, completed: 0, cancelled: 0, total: 0 };
        }

        const scheduled = appointments.filter(app => app.status === 'SCHEDULED').length;
        const completed = appointments.filter(app => app.status === 'COMPLETED').length;
        const cancelled = appointments.filter(app => app.status === 'CANCELLED').length;

        return {
            scheduled,
            completed,
            cancelled,
            total: appointments.length
        };
    };

    // Функция для загрузки аватара
    const handleAvatarUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Пожалуйста, выберите файл изображения');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Размер файла не должен превышать 5MB');
            return;
        }

        setLoading(true);
        setError('');
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post('/user/avatar', formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percentCompleted);
                },
            });

            setUploadProgress(0);
            alert('Аватар успешно обновлен!');

            // Обновляем URL аватара с временной меткой
            const timestamp = Date.now();

            // Получаем обновленные данные с сервера
            try {
                const userResponse = await api.get('/user/dashboard', {
                    withCredentials: true
                });

                if (userResponse.data.avatar) {
                    const newAvatarUrl = getAvatarUrlWithTimestamp(userResponse.data.avatar);
                    setAvatar(newAvatarUrl);
                } else {
                    setAvatar(null);
                }
            } catch (dashboardError) {
                console.log('Не удалось обновить данные с сервера, обновляем локально');
                // Если не удалось получить с сервера, добавляем параметр к текущему URL
                if (avatar) {
                    const newAvatarUrl = getAvatarUrlWithTimestamp(avatar);
                    setAvatar(newAvatarUrl);
                }
            }

        } catch (error) {
            console.error('Ошибка при загрузке аватара:', error);
            setError('Не удалось загрузить аватар. Попробуйте еще раз.');
        } finally {
            setLoading(false);
            event.target.value = '';
        }
    };

    // Функция для удаления аватара
    const handleRemoveAvatar = async () => {
        if (!avatar || isDefaultAvatar(avatar)) return;

        try {
            await api.delete(`/user/avatar`, {
                withCredentials: true,
            });

            const response = await api.get('/user/dashboard', {
                withCredentials: true
            });

            const avatarUrl = response.data.avatar;
            if (avatarUrl) {
                setAvatar(getAvatarUrlWithTimestamp(avatarUrl));
            } else {
                setAvatar(null);
            }

            alert('Аватар удален!');

        } catch (error) {
            console.error('Ошибка при удалении аватара:', error);
            setError('Не удалось удалить аватар');
        }
    };

    // Функция для отмены записи
    const handleCancelAppointment = async (appointmentId) => {
        if (!window.confirm('Вы уверены, что хотите отменить запись?')) return;

        try {
            await api.post(`/appointments/${appointmentId}/cancel`, {
                withCredentials: true,
                headers: {"Content-Type": "application/json"}
            });

            // Обновляем статус записи на клиенте
            setAppointments(prev => prev.map(app =>
                app.id === appointmentId
                    ? {...app, status: 'CANCELLED'}
                    : app
            ));

            alert('Запись успешно отменена!');
        } catch (error) {
            alert(getErrorMessage(error));
        }
    };

    const handleDeleteAppointment = async (appointmentId) => {
        if (!window.confirm('Вы уверены, что хотите удалить запись? Это действие необратимо.')) return;

        try {
            await api.delete(`/appointments/${appointmentId}/delete`, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" }
            });

            // Удаляем запись из списка
            setAppointments(prev => prev.filter(app => app.id !== appointmentId));
            alert('Запись успешно удалена!');
        } catch (error) {
            alert(getErrorMessage(error));
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
            await api.post('/user/edit', {
                id: id,
                username: editForm.username,
                email: editForm.email,
            }, {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json"
                }
            });

            setUsername(editForm.username);
            setEmail(editForm.email);
            setIsEditing(false);
            alert('Данные успешно обновлены!');
        } catch (error) {
            setEditError(getErrorMessage(error));
        } finally {
            setEditLoading(false);
        }
    };

    // Функция для просмотра деталей завершенной записи
    const handleViewAppointmentDetails = (appointment) => {
        alert(`Детали записи:\nВрач: ${appointment.doctorName}\nДата: ${appointment.appointmentDate}\nСимптомы: ${appointment.symptoms || 'Не указаны'}`);
    };

    // Получение класса для бейджа статуса
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

    // Получение текста статуса
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

    const handleAdminPanelClick = () => navigate('/admin-panel');
    const handleNewAppointmentClick = () => navigate('/appointment');

    const stats = getAppointmentStats();
    const filteredAppointments = getFilteredAppointments();

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="border rounded-lg p-4" style={{width: '1200px', height: 'auto', minHeight: '600px'}}>
                <h2 className="text-center">Кабинет пациента</h2>
                {error ? (
                    <p className="text-danger text-center">{error}</p>
                ) : (
                    <>
                        {/* Блок аватара */}
                        <div className="text-center mb-4">
                            <div className="avatar-container position-relative d-inline-block">
                                {avatar ? (
                                    <img
                                        src={avatar}
                                        alt="User Avatar"
                                        className="avatar-image"
                                        onError={(e) => {
                                            // Если изображение не загрузилось, пробуем без параметра запроса
                                            const baseUrl = avatar.split('?')[0];
                                            if (e.target.src !== baseUrl) {
                                                e.target.src = baseUrl;
                                            }
                                        }}
                                        style={{
                                            width: '150px',
                                            height: '150px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            border: '3px solid #007bff'
                                        }}
                                    />
                                ) : (
                                    <div
                                        className="avatar-placeholder d-flex align-items-center justify-content-center"
                                        style={{
                                            width: '150px',
                                            height: '150px',
                                            borderRadius: '50%',
                                            backgroundColor: '#f8f9fa',
                                            border: '3px dashed #dee2e6',
                                            color: '#6c757d'
                                        }}
                                    >
                                        <span>Нет аватара</span>
                                    </div>
                                )}

                                {loading && (
                                    <div className="position-absolute top-50 start-50 translate-middle">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Загрузка...</span>
                                        </div>
                                        {uploadProgress > 0 && (
                                            <div className="mt-2">
                                                <small>{uploadProgress}%</small>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="mt-3">
                                {/* Кнопка изменения аватара (показывается только в режиме редактирования) */}
                                {isEditing && (
                                    <>
                                        <input
                                            type="file"
                                            id="avatar-upload"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            style={{display: 'none'}}
                                            disabled={loading}
                                        />
                                        <label
                                            htmlFor="avatar-upload"
                                            className={`btn btn-primary btn-sm ${loading ? 'disabled' : ''}`}
                                        >
                                            {avatar ? 'Изменить аватар' : 'Загрузить аватар'}
                                        </label>
                                    </>
                                )}

                                {avatar && !isDefaultAvatar(avatar) && isEditing && (
                                    <button
                                        className="btn btn-outline-danger btn-sm ms-2"
                                        onClick={handleRemoveAvatar}
                                        disabled={loading}
                                    >
                                        Удалить
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Информация о пользователе */}
                        <div className="text-center mb-4">
                            <p><strong>ID:</strong> {id}</p>

                            {isEditing ? (
                                <div className="mb-3">
                                    <div className="mb-2">
                                        <label className="form-label"><strong>Имя пользователя:</strong></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editForm.username}
                                            onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label"><strong>Электронная почта:</strong></label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={editForm.email}
                                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                        />
                                    </div>
                                    {editError && <div className="text-danger small">{editError}</div>}
                                </div>
                            ) : (
                                <>
                                    <p><strong>Имя пользователя:</strong> {username}</p>
                                    <p><strong>Электронная почта:</strong> {email}</p>
                                </>
                            )}

                            <p><strong>Роль:</strong> {role}</p>
                        </div>

                        {/* Статистика записей */}
                        <div className="text-center mb-4">
                            <div className="d-flex justify-content-center flex-wrap" style={{ gap: '10px' }}>
                                <span className="badge bg-primary p-2">
                                    Запланировано: {stats.scheduled}
                                </span>
                                <span className="badge bg-success p-2">
                                    Завершено: {stats.completed}
                                </span>
                                <span className="badge bg-secondary p-2">
                                    Отменено: {stats.cancelled}
                                </span>
                                <span className="badge bg-light text-dark p-2">
                                    Всего: {stats.total}
                                </span>
                            </div>
                        </div>

                        {/* Кнопка для новой записи */}
                        <div className="text-center mb-4">
                            <button
                                className="btn btn-success"
                                onClick={handleNewAppointmentClick}
                            >
                                <i className="bi bi-calendar-plus me-2"></i>
                                Новая запись к врачу
                            </button>
                        </div>

                        {/* Блок с записями пользователя */}
                        <div className="mt-4 p-3 border rounded">
                            <h4 className="text-center mb-3">Мои записи</h4>

                            {/* Вкладки */}
                            <nav className="mb-4">
                                <div className="nav nav-tabs justify-content-center" id="appointments-tab"
                                     role="tablist">
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
                                <div className="text-center py-4">
                                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                                        <span className="visually-hidden">Загрузка...</span>
                                    </div>
                                    <p className="mt-2">Загрузка записей...</p>
                                </div>
                            ) : filteredAppointments.length === 0 ? (
                                <div className="text-center py-3">
                                    <i className={`bi ${activeTab === 'scheduled' ? 'bi-calendar-x' :
                                        activeTab === 'completed' ? 'bi-calendar-check' :
                                            'bi-calendar-x'
                                    } text-muted`} style={{fontSize: '3rem'}}></i>
                                    <p className="mt-2 text-muted">
                                        {activeTab === 'scheduled' && 'Нет запланированных записей'}
                                        {activeTab === 'completed' && 'Нет завершенных записей'}
                                        {activeTab === 'cancelled' && 'Нет отмененных записей'}
                                    </p>
                                    {activeTab === 'scheduled' && (
                                        <button
                                            className="btn btn-sm btn-outline-primary mt-2"
                                            onClick={handleNewAppointmentClick}
                                        >
                                            Записаться на прием
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover table-sm">
                                        <thead>
                                        <tr>
                                            <th>Врач</th>
                                            <th>Специализация</th>
                                            <th>Дата</th>
                                            <th>Время</th>
                                            <th>Статус</th>
                                            <th>Симптомы</th>
                                            <th>Действия</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredAppointments.map(appointment => (
                                            <tr key={appointment.id}>
                                                <td>{appointment.doctorName || 'Не указан'}</td>
                                                <td>{appointment.specialization || 'Не указана'}</td>
                                                <td>{appointment.appointmentDate || 'Не указана'}</td>
                                                <td>{appointment.appointmentTime || 'Не указано'}</td>
                                                <td>
                                                    <span
                                                        className={`badge ${getStatusBadgeClass(appointment.status)}`}>
                                                        {getStatusText(appointment.status)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <small>{appointment.symptoms || 'Не указаны'}</small>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        {appointment.status === 'SCHEDULED' && (
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => handleCancelAppointment(appointment.id)}
                                                                title="Отменить запись"
                                                            >
                                                                Отменить
                                                            </button>
                                                        )}
                                                        {(appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') && (
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => handleDeleteAppointment(appointment.id)}
                                                                title="Удалить запись"
                                                            >
                                                                Удалить
                                                            </button>
                                                        )}
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary"
                                                            onClick={() => handleViewAppointmentDetails(appointment)}
                                                            title="Подробнее"
                                                        >
                                                            <i className="bi bi-info-circle"></i>
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
                        {/* Кнопки управления редактированием */}
                        <div className="text-center mb-4">
                            {isEditing ? (
                                <div>
                                    <button
                                        className="btn btn-success me-2"
                                        onClick={handleEditUser}
                                        disabled={editLoading}
                                    >
                                        {editLoading ? 'Сохранение...' : 'Сохранить изменения'}
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditForm({ username, email });
                                            setEditError('');
                                        }}
                                        disabled={editLoading}
                                    >
                                        Отмена
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <i className="bi bi-pencil me-2"></i>
                                    Редактировать профиль
                                </button>
                            )}
                        </div>

                        <div className="text-center mt-4">
                            {role === "ADMIN" && (
                                <button type="button" className="btn btn-primary" onClick={handleAdminPanelClick}>
                                    Панель администратора
                                </button>
                            )}
                        </div>

                        <div className="text-center">
                            <button type="button" className="btn btn-danger mt-3" onClick={onLogout}>
                                Выйти
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default PatientCabinet;