import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userApi } from '../../api/userApi';
import Loader from '../../components/common/Loader/Loader';
import './AdminPanelPage.css';

const AdminPanelPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await userApi.getAllUsers();
            setUsers(response.data);
        } catch (error) {
            setError('Не удалось загрузить данные пользователей');
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить пользователя?')) return;

        try {
            await userApi.deleteUser(id);
            setUsers(users.filter(user => user.id !== id));
        } catch (error) {
            setError('Не удалось удалить пользователя');
        }
    };

    if (loading) {
        return <Loader text="Загрузка пользователей..." />;
    }

    return (
        <div className="admin-panel-page">
            <div className="container">
                <h2 className="text-center mb-4">Панель администратора</h2>

                {error && <div className="alert alert-danger text-center">{error}</div>}

                {users.length === 0 ? (
                    <div className="text-center">
                        <p>Нет пользователей</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover">
                            <thead className="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Имя</th>
                                <th>Email</th>
                                <th>Роль</th>
                                <th>Аватар</th>
                                <th>Действия</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>
                                            <span className={`badge ${user.role === 'ADMIN' ? 'bg-warning' : 'bg-info'}`}>
                                                {user.role}
                                            </span>
                                    </td>
                                    <td>
                                        <img
                                            src={user.avatar || '/default-avatar.png'}
                                            alt="Аватар"
                                            className="admin-avatar"
                                            onError={(e) => {
                                                e.target.src = '/default-avatar.png';
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <div className="btn-group btn-group-sm">
                                            <Link
                                                to={`/admin/users/${user.id}/edit`}
                                                className="btn btn-primary"
                                            >
                                                Изменить
                                            </Link>
                                            {user.id !== 1 && ( // Не даем удалить главного админа
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() => deleteUser(user.id)}
                                                >
                                                    Удалить
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
    );
};

export default AdminPanelPage;