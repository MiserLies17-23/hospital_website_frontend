import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function UpdateUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('avatar', file);
        formData.append('userId', id);

        try {
            const response = await axios.post('http://localhost:8080/user/upload-avatar', formData, {
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
            setLoading(false);
            event.target.value = '';
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        // Логика для обновления пользователя
        console.log('Update user:', user);
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Редактирование пользователя</h2>
            {error && <p className="text-danger text-center">{error}</p>}

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
                                </div>

                                <div className="mt-3">
                                    <input
                                        type="file"
                                        id="admin-avatar-upload"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        style={{ display: 'none' }}
                                        disabled={loading}
                                    />
                                    <label
                                        htmlFor="admin-avatar-upload"
                                        className={`btn btn-primary btn-sm ${loading ? 'disabled' : ''}`}
                                    >
                                        {loading ? 'Загрузка...' : 'Изменить аватар'}
                                    </label>
                                </div>
                            </div>

                            <form onSubmit={handleUpdate}>
                                <div className="mb-3">
                                    <label className="form-label">Имя пользователя</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={user.username || ''}
                                        onChange={(e) => setUser({...user, username: e.target.value})}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={user.email || ''}
                                        onChange={(e) => setUser({...user, email: e.target.value})}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Роль</label>
                                    <select
                                        className="form-select"
                                        value={user.role || ''}
                                        onChange={(e) => setUser({...user, role: e.target.value})}
                                    >
                                        <option value="USER">USER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>

                                <div className="text-center">
                                    <button type="submit" className="btn btn-primary me-2" disabled={loading}>
                                        Сохранить
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin-panel')}>
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