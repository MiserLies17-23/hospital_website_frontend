import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function UpdateUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState({
        username: '',
        email: '',
        role: '',
        avatar: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);

    // Функция для проверки, является ли аватар дефолтным
    const isDefaultAvatar = (avatarUrl) => {
        if (!avatarUrl) return true;

        const defaultAvatarPatterns = [
            'default-avatar',
            'placeholder',
            'gravatar',
            '/images/default',
            '//www.gravatar.com/avatar/'
        ];

        return defaultAvatarPatterns.some(pattern =>
            avatarUrl.includes(pattern)
        );
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/getuser/${id}`, {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                setUser(response.data);
            } catch (error) {
                setError('Не удалось загрузить данные пользователя');
            }
        };
        fetchUser();
    }, [id]);

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

        setAvatarLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('avatar', file);
        formData.append('userId', id);

        try {
            const response = await axios.post('http://localhost:8080/user/avatar', formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Обновляем аватар пользователя
            setUser(prev => ({ ...prev, avatar: response.data.avatarUrl }));
            alert('Аватар успешно обновлен!');
        } catch (error) {
            console.error('Ошибка при загрузке аватара:', error);
            setError('Не удалось загрузить аватар');
        } finally {
            setAvatarLoading(false);
            event.target.value = '';
        }
    };

    // Функция для удаления аватара
    const handleRemoveAvatar = async () => {
        if (!user.avatar || isDefaultAvatar(user.avatar)) return;

        try {
            await axios.delete(`http://localhost:8080/user/avatar/${id}`, {
                withCredentials: true,
            });

            setUser(prev => ({ ...prev, avatar: null }));
            alert('Аватар удален!');
        } catch (error) {
            console.error('Ошибка при удалении аватара:', error);
            setError('Не удалось удалить аватар');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.put(`http://localhost:8080/update/${id}`, user, {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json"
                }
            });
            alert('Данные пользователя успешно обновлены!');
            navigate('/admin-panel');
        } catch (error) {
            console.error('Ошибка при обновлении:', error);
            setError('Не удалось обновить данные пользователя');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Редактирование пользователя</h2>
            {error && <div className="alert alert-danger text-center">{error}</div>}

            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-body">
                            {/* Блок аватара */}
                            <div className="text-center mb-4">
                                <div className="avatar-container position-relative d-inline-block">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
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
                                            className="avatar-placeholder d-flex align-items-center justify-content-center"
                                            style={{
                                                width: '120px',
                                                height: '120px',
                                                borderRadius: '50%',
                                                backgroundColor: '#f8f9fa',
                                                border: '3px dashed #dee2e6',
                                                color: '#6c757d'
                                            }}
                                        >
                                            <span>Нет аватара</span>
                                        </div>
                                    )}

                                    {avatarLoading && (
                                        <div className="position-absolute top-50 start-50 translate-middle">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Загрузка...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-3">
                                    <input
                                        type="file"
                                        id="admin-avatar-upload"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        style={{ display: 'none' }}
                                        disabled={avatarLoading}
                                    />
                                    <label
                                        htmlFor="admin-avatar-upload"
                                        className={`btn btn-primary btn-sm ${avatarLoading ? 'disabled' : ''}`}
                                    >
                                        {avatarLoading ? 'Загрузка...' : 'Изменить аватар'}
                                    </label>

                                    {/* Кнопка удаления показывается только для НЕ дефолтных аватаров */}
                                    {user.avatar && !isDefaultAvatar(user.avatar) && (
                                        <button
                                            className="btn btn-outline-danger btn-sm ms-2"
                                            onClick={handleRemoveAvatar}
                                            disabled={avatarLoading}
                                        >
                                            Удалить
                                        </button>
                                    )}
                                </div>
                            </div>

                            <form onSubmit={handleUpdate}>
                                <div className="mb-3">
                                    <label className="form-label">Имя пользователя</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="username"
                                        value={user.username || ''}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        value={user.email || ''}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Роль</label>
                                    <select
                                        className="form-select"
                                        name="role"
                                        value={user.role || ''}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Выберите роль</option>
                                        <option value="USER">USER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>

                                <div className="text-center">
                                    <button
                                        type="submit"
                                        className="btn btn-primary me-2"
                                        disabled={loading}
                                    >
                                        {loading ? 'Сохранение...' : 'Сохранить'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => navigate('/admin-panel')}
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
    );
}

export default UpdateUser;