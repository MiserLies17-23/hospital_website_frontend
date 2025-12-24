import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userApi } from '../../api';
import { getAvatarUrlWithTimestamp, isDefaultAvatar } from '../../utils/formatters';
import Loader from '../../components/common/Loader/Loader';
import './UpdatePage.css';

const UpdateUserPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState({
        username: '',
        password: '',
        email: '',
        role: '',
        avatar: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);

    useEffect(() => {
        fetchUser();
    }, [id]);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const response = await userApi.getUserById(id);
            const userData = response.data;

            if (userData.avatar) {
                userData.avatar = getAvatarUrlWithTimestamp(userData.avatar);
            }

            setUser(userData);
        } catch (error) {
            setError('Не удалось загрузить данные пользователя');
        } finally {
            setLoading(false);
        }
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

        setAvatarLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('avatar', file);
        formData.append('userId', id);

        try {
            const response = await userApi.uploadAvatar(formData);
            let newAvatarUrl = response.data.avatarUrl;
            if (newAvatarUrl) {
                newAvatarUrl = getAvatarUrlWithTimestamp(newAvatarUrl);
            }
            setUser(prev => ({ ...prev, avatar: newAvatarUrl }));
            alert('Аватар успешно обновлен!');
        } catch (error) {
            setError('Не удалось загрузить аватар');
        } finally {
            setAvatarLoading(false);
            event.target.value = '';
        }
    };

    const handleRemoveAvatar = async () => {
        if (!user.avatar || isDefaultAvatar(user.avatar)) return;

        try {
            await userApi.deleteAvatar();
            setUser(prev => ({ ...prev, avatar: null }));
            alert('Аватар удален!');
        } catch (error) {
            setError('Не удалось удалить аватар');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await userApi.updateUser(id, user);
            alert('Данные пользователя успешно обновлены!');
            navigate('/admin');
        } catch (error) {
            setError('Не удалось обновить данные пользователя');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    if (loading && !user.username) {
        return <Loader text="Загрузка данных пользователя..." />;
    }

    return (
        <div className="update-user-page">
            <div className="container">
                <h2 className="text-center mb-4">Редактирование пользователя</h2>

                {error && <div className="alert alert-danger text-center">{error}</div>}

                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-body">
                                {/* Аватар */}
                                <div className="text-center mb-4">
                                    <div className="avatar-container position-relative d-inline-block">
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt="Аватар"
                                                className="admin-update-avatar"
                                            />
                                        ) : (
                                            <div className="admin-update-avatar-placeholder">
                                                Нет аватара
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

                                {/* Форма */}
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
                                            <option value="USER">Пользователь</option>
                                            <option value="MODERATOR">Модератор</option>
                                            <option value="ADMIN">Администратор</option>
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
                                            onClick={() => navigate('/admin')}
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
        </div>
    );
};

export default UpdateUserPage;