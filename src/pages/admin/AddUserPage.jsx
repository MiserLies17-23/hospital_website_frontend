import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../api';
import {getErrorMessage} from "../../utils/errorHandler";

const AddUserPage = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState({
        username: '',
        email: '',
        password: '',
        role: 'USER'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await userApi.addUser(user);
            alert('Пользователь успешно создан!');
            navigate('/admin');
        } catch (error) {
            setError(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="update-user-page">
            <div className="container">
                <h2 className="text-center mb-4">Добавление пользователя</h2>

                {error && <div className="alert alert-danger text-center">{error}</div>}

                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">Логин</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="username"
                                            value={user.username}
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
                                            value={user.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Пароль</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            name="password"
                                            value={user.password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Роль</label>
                                        <select
                                            className="form-select"
                                            name="role"
                                            value={user.role}
                                            onChange={handleChange}
                                            required
                                        >
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
                                            {loading ? 'Создание...' : 'Создать'}
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

export default AddUserPage;