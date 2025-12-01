import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PatientCabinet({ onLogout }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [id, setId] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const navigate = useNavigate();

    // Улучшенная функция для проверки дефолтного аватара
    const isDefaultAvatar = (avatarUrl) => {
        if (!avatarUrl) return true;

        // Более надежная проверка дефолтных аватаров
        const defaultAvatarPatterns = [
            'default-avatar',
            'placeholder',
            'gravatar',
            '/images/default',
            '//www.gravatar.com/avatar/',
            'data:image/svg+xml', // SVG placeholder
            '/img/avatar' // общий паттерн
        ];

        return defaultAvatarPatterns.some(pattern =>
            avatarUrl.toLowerCase().includes(pattern.toLowerCase())
        );
    };

    // Функция для проверки, был ли аватар загружен пользователем
    const isUserUploadedAvatar = (avatarUrl) => {
        if (!avatarUrl) return false;

        // Если URL содержит путь к загруженным файлам или ID пользователя
        return avatarUrl.includes('/uploads/') ||
            avatarUrl.includes('/user-avatars/') ||
            avatarUrl.includes(`/avatar/${id}`) ||
            avatarUrl.startsWith('http://localhost:8080/uploads/');
    };

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await axios.get('http://localhost:8080/user/dashboard', {
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

        fetchUserInfo();
    }, []);

    // Функция для загрузки аватара
    const handleAvatarUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Проверяем тип файла
        if (!file.type.startsWith('image/')) {
            setError('Пожалуйста, выберите файл изображения');
            return;
        }

        // Проверяем размер файла (максимум 5MB)
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
            const response = await axios.post('http://localhost:8080/user/avatar', formData, {
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

            // Обновляем аватар в состоянии
            setAvatar(response.data.avatarUrl);
            setUploadProgress(0);
            alert('Аватар успешно обновлен!');
        } catch (error) {
            console.error('Ошибка при загрузке аватара:', error);
            setError('Не удалось загрузить аватар. Попробуйте еще раз.');
        } finally {
            setLoading(false);
            // Сбрасываем значение input
            event.target.value = '';
        }
    };

    // Функция для удаления аватара
    const handleRemoveAvatar = async () => {
        if (!avatar || isDefaultAvatar(avatar)) return;

        try {
            await axios.delete(`http://localhost:8080/user/avatar/`, {
                withCredentials: true,
            });

            const response = await axios.get('http://localhost:8080/user/dashboard', {
                withCredentials: true
            });

            setAvatar(null);
            alert('Аватар удален!');
        } catch (error) {
            console.error('Ошибка при удалении аватара:', error);
            setError('Не удалось удалить аватар');
        }
    };

    const handleAdminPanelClick = () => {
        navigate('/admin-panel');
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="border rounded-lg p-4" style={{ width: '600px', height: 'auto', minHeight: '500px' }}>
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

                                {/* Кнопка удаления показывается ТОЛЬКО для загруженных пользователем аватаров */}
                                {avatar && isUserUploadedAvatar(avatar) && (
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

                        <p className="text-center"><strong>ID:</strong> {id}</p>
                        <p className="text-center"><strong>Имя пользователя:</strong> {username}</p>
                        <p className="text-center"><strong>Электронная почта:</strong> {email}</p>
                        <p className="text-center"><strong>Роль:</strong> {role}</p>

                        <div className="mt-4 p-3 border rounded">
                            <h4 className="text-center">Функционал записи к врачу</h4>
                            <p className="text-center">В разработке...</p>
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