import api from './Api/Api.jsx';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PatientCabinet({ onLogout }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [id, setId] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loadingAppointments, setLoadingAppointments] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const navigate = useNavigate();

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
                console.log(response.data);
                setUsername(response.data.username);
                setEmail(response.data.email);
                setRole(response.data.role);
                setId(response.data.id);
                setAvatar(response.data.avatar);
            } catch (error) {
                setError('Не удалось загрузить информацию о пользователе');
                console.error(error);
            }
        };

        const fetchUserAppointments = async () => {
            try {
                const response = await api.get('/appointment/appointments', {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" }
                });
                setAppointments(response.data);
            } catch (error) {
                console.error('Ошибка при загрузке записей:', error);
            } finally {
                setLoadingAppointments(false);
            }
        };

        fetchUserInfo();
        fetchUserAppointments();
    }, []);

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
            const response = await api.post('/user/avatar', formData, {
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

            const userResponse = await api.get('/user/dashboard', {
                withCredentials: true
            });
            setAvatar(userResponse.data.avatar);
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
            setAvatar(response.data.avatar);
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
            await api.delete(`/user/appointments/${appointmentId}`, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" }
            });

            const updatedAppointments = appointments.filter(app => app.id !== appointmentId);
            setAppointments(updatedAppointments);
            alert('Запись успешно отменена!');
        } catch (error) {
            console.error('Ошибка при отмене записи:', error);
            setError('Не удалось отменить запись');
        }
    };

    // Форматирование даты
    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    };

    const handleAdminPanelClick = () => navigate('/admin-panel');
    const handleNewAppointmentClick = () => navigate('/appointment');

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="border rounded-lg p-4" style={{ width: '800px', height: 'auto', minHeight: '600px' }}>
                <h2 className="text-center">Кабинет пациента</h2>
                {error ? (
                    <p className="text-danger text-center">{error}</p>
                ) : (
                    <>
                        {/* Блок аватара (старый дизайн) */}
                        <div className="text-center mb-4">
                            <div className="avatar-container position-relative d-inline-block">
                                {avatar ? (
                                    <img
                                        src={avatar}
                                        alt="User Avatar"
                                        className="avatar-image"
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
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    style={{ display: 'none' }}
                                    disabled={loading}
                                />
                                <label
                                    htmlFor="avatar-upload"
                                    className={`btn btn-primary btn-sm ${loading ? 'disabled' : ''}`}
                                >
                                    {avatar ? 'Изменить аватар' : 'Загрузить аватар'}
                                </label>

                                {avatar && !isDefaultAvatar(avatar) && (
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

                        {/* Информация о пользователе (старый дизайн) */}
                        <div className="text-center mb-4">
                            <p><strong>ID:</strong> {id}</p>
                            <p><strong>Имя пользователя:</strong> {username}</p>
                            <p><strong>Электронная почта:</strong> {email}</p>
                            <p><strong>Роль:</strong> {role}</p>
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

                            {loadingAppointments ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                                        <span className="visually-hidden">Загрузка...</span>
                                    </div>
                                    <p className="mt-2">Загрузка записей...</p>
                                </div>
                            ) : appointments.length === 0 ? (
                                <div className="text-center py-3">
                                    <i className="bi bi-calendar-x text-muted" style={{ fontSize: '3rem' }}></i>
                                    <p className="mt-2 text-muted">У вас нет активных записей</p>
                                    <button
                                        className="btn btn-sm btn-outline-primary mt-2"
                                        onClick={handleNewAppointmentClick}
                                    >
                                        Записаться на прием
                                    </button>
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
                                            <th>Действия</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {appointments.map(appointment => (
                                            <tr key={appointment.id}>
                                                <td>{appointment.doctorName}</td>
                                                <td>{appointment.doctorSpecialization}</td>
                                                <td>{formatDate(appointment.appointmentDate)}</td>
                                                <td>{appointment.appointmentTime}</td>
                                                <td>
                                                        <span className={`badge bg-${appointment.status === 'SCHEDULED' ? 'primary' :
                                                            appointment.status === 'COMPLETED' ? 'success' : 'secondary'}`}>
                                                            {appointment.status === 'SCHEDULED' ? 'Запланировано' :
                                                                appointment.status === 'COMPLETED' ? 'Завершено' : 'Отменено'}
                                                        </span>
                                                </td>
                                                <td>
                                                    {appointment.status === 'SCHEDULED' && (
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleCancelAppointment(appointment.id)}
                                                        >
                                                            Отменить
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}

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
            </div>
        </div>
    );
}

export default PatientCabinet;