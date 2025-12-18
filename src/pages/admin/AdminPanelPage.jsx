import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userApi } from '../../api/userApi';
import { doctorsApi } from '../../api/doctorsApi';
import Loader from '../../components/common/Loader/Loader';
import './AdminPanelPage.css';

const AdminPanelPage = () => {
    const [users, setUsers] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersResponse, doctorsResponse] = await Promise.all([
                userApi.getAllUsers(),
                doctorsApi.getAll()
            ]);

            setUsers(usersResponse.data);
            setDoctors(doctorsResponse.data);
        } catch (error) {
            setError('Не удалось загрузить данные');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loader text="Загрузка данных..." />;
    }

    return (
        <div className="admin-panel-page">
            <div className="container">
                <h2 className="text-center mb-4">Панель администратора</h2>

                {error && <div className="alert alert-danger text-center">{error}</div>}

                {/* Быстрые действия */}
                <div className="row mb-4">
                    <div className="col-md-4 mb-3">
                        <div className="card h-100 text-center">
                            <div className="card-body">
                                <i className="bi bi-people-fill text-primary" style={{ fontSize: '3rem' }}></i>
                                <h4 className="mt-3">Пользователи</h4>
                                <p className="text-muted">Управление пользователями системы</p>
                                <Link to="/admin" className="btn btn-primary">
                                    Управление пользователями
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4 mb-3">
                        <div className="card h-100 text-center">
                            <div className="card-body">
                                <i className="bi bi-person-badge text-success" style={{ fontSize: '3rem' }}></i>
                                <h4 className="mt-3">Врачи</h4>
                                <p className="text-muted">Управление врачами и специалистами</p>
                                <Link to="/admin/doctors" className="btn btn-success">
                                    Управление врачами
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4 mb-3">
                        <div className="card h-100 text-center">
                            <div className="card-body">
                                <i className="bi bi-newspaper text-warning" style={{ fontSize: '3rem' }}></i>
                                <h4 className="mt-3">Новости</h4>
                                <p className="text-muted">Управление новостями и публикациями</p>
                                <Link to="/news-management" className="btn btn-warning">
                                    Управление новостями
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Статистика */}
                <div className="row mb-4">
                    <div className="col-md-3">
                        <div className="card bg-primary text-white">
                            <div className="card-body text-center">
                                <h3 className="card-title">{users.length}</h3>
                                <p className="card-text">Пользователей</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="card bg-success text-white">
                            <div className="card-body text-center">
                                <h3 className="card-title">{doctors.length}</h3>
                                <p className="card-text">Врачей</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="card bg-info text-white">
                            <div className="card-body text-center">
                                <h3 className="card-title">
                                    {users.filter(u => u.role === 'ADMIN').length}
                                </h3>
                                <p className="card-text">Администраторов</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="card bg-warning text-dark">
                            <div className="card-body text-center">
                                <h3 className="card-title">
                                    {users.filter(u => u.role === 'MODERATOR').length}
                                </h3>
                                <p className="card-text">Модераторов</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Быстрые ссылки */}
                <div className="card mb-4">
                    <div className="card-header">
                        <h5 className="mb-0">Быстрые действия</h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <Link to="/admin" className="btn btn-outline-primary w-100">
                                    <i className="bi bi-person-plus me-2"></i>
                                    Добавить пользователя
                                </Link>
                            </div>
                            <div className="col-md-4">
                                <Link to="/admin/doctors" className="btn btn-outline-success w-100">
                                    <i className="bi bi-person-plus me-2"></i>
                                    Добавить врача
                                </Link>
                            </div>
                            <div className="col-md-4">
                                <Link to="/news-management" className="btn btn-outline-warning w-100">
                                    <i className="bi bi-plus-circle me-2"></i>
                                    Добавить новость
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanelPage;