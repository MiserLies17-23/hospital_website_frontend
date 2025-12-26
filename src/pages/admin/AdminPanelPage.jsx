import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {authApi, doctorsApi, userApi} from '../../api';
import Loader from '../../components/common/Loader/Loader';
import './AdminPanelPage.css';
import {getErrorMessage} from "../../utils/errorHandler";

const AdminPanelPage = () => {
    const [users, setUsers] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [currentAdminId, setCurrentAdminId] = useState(null); // ID текущего админа
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCurrentAdmin();
        fetchUsers();
        fetchDoctors();
    }, []);

    // Получаем ID текущего админа
    const fetchCurrentAdmin = async () => {
        try {
            const response = await authApi.checkAuth();
            setCurrentAdminId(response.data.id);
        } catch (error) {
            console.error('Не удалось получить ID текущего пользователя:', error);
            setError(getErrorMessage(error))
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await userApi.getAllUsers();
            setUsers(response.data);
        } catch (error) {
            setError(getErrorMessage(error) || 'Не удалось загрузить данные пользователей');
        }
    };

    const fetchDoctors = async () => {
        try {
            const response = await doctorsApi.getAllDoctors();
            setDoctors(response.data);
        } catch (error) {
            setError(getErrorMessage(error) || 'Не удалось загрузить данные врачей');
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id) => {
        if (id === currentAdminId) {
            alert('Вы не можете удалить сами себя!');
            return;
        }

        if (!window.confirm('Вы уверены, что хотите удалить пользователя?')) return;

        try {
            await userApi.deleteUser(id);
            setUsers(users.filter(user => user.id !== id));
        } catch (error) {
            setError(getErrorMessage(error) || 'Не удалось удалить пользователя');
        }
    };

    const deleteDoctor = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить врача?')) return;

        try {
            await doctorsApi.deleteDoctor(id);
            setDoctors(doctors.filter(doctor => doctor.id !== id));
        } catch (error) {
            setError(getErrorMessage(error) || 'Не удалось удалить врача');
        }
    };

    if (loading) {
        return <Loader text="Загрузка..." />;
    }

    return (
        <div className="admin-panel-page">
            <div className="container">
                <h2 className="text-center mb-4">Панель администратора</h2>

                {error && <div className="alert alert-danger text-center">{error}</div>}

                {/* Секция пользователей */}
                <div className="mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="mb-0">Пользователи</h3>
                        <Link
                            to="/admin/users/add"
                            className="btn btn-success"
                        >
                            Добавить
                        </Link>
                    </div>

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
                                                src={user.avatar || '/defaultUserImage.jpg'}
                                                alt="Аватар"
                                                className="admin-avatar"
                                                onError={(e) => {
                                                    e.target.src = '/defaultUserImage.jpg';
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
                                                {/* Показываем кнопку удаления только если это НЕ текущий админ */}
                                                {user.id !== currentAdminId && (
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

                {/* Секция врачей */}
                <div className="mt-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="mb-0">Врачи</h3>
                        <Link
                            to="/admin/doctors/add"
                            className="btn btn-success"
                        >
                            Добавить
                        </Link>
                    </div>

                    {doctors.length === 0 ? (
                        <div className="text-center">
                            <p>Нет врачей</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover">
                                <thead className="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Имя</th>
                                    <th>Специализация</th>
                                    <th>Телефон</th>
                                    <th>Действия</th>
                                </tr>
                                </thead>
                                <tbody>
                                {doctors.map(doctor => (
                                    <tr key={doctor.id}>
                                        <td>{doctor.id}</td>
                                        <td>{doctor.name}</td>
                                        <td>{doctor.specialization}</td>
                                        <td>{doctor.phone}</td>
                                        <td>
                                            <div className="btn-group btn-group-sm">
                                                <Link
                                                    to={`/admin/doctors/${doctor.id}/edit`}
                                                    className="btn btn-primary"
                                                >
                                                    Изменить
                                                </Link>
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() => deleteDoctor(doctor.id)}
                                                >
                                                    Удалить
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
    );
};

export default AdminPanelPage;