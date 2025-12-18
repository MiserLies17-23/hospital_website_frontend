import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import CurrentTime from '../../common/CurrentTime/CurrentTime';
import AuthButtons from '../../common/AuthButtons/AuthButtons';
import './Header.css';

const Header = () => {
    const { isAuthenticated, isAdmin, isModerator, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <header className="header bg-dark text-white">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3">
                        <Link to="/" className="btn btn-secondary">
                            Больница "Здоровье"
                        </Link>
                        <Link to="/news" className="btn btn-outline-light">
                            Новости
                        </Link>
                        <Link to="/appointments" className="btn btn-primary">
                            Запись к врачу
                        </Link>
                        {isAuthenticated && (
                            <Link to="/dashboard" className="btn btn-outline-light">
                                Личный кабинет
                            </Link>
                        )}

                        {/* Кнопка управления новостями для модераторов и админов */}
                        {(isModerator || isAdmin) && (
                            <Link to="/news-management" className="btn btn-warning">
                                <i className="bi bi-newspaper me-1"></i>
                                Новости
                            </Link>
                        )}

                        {/* Кнопка управления врачами для админов */}
                        {isAdmin && (
                            <Link to="/admin/doctors" className="btn btn-info">
                                <i className="bi bi-people me-1"></i>
                                Врачи
                            </Link>
                        )}
                    </div>

                    <div className="text-center">
                        <CurrentTime />
                    </div>

                    <div>
                        <AuthButtons
                            isAuthenticated={isAuthenticated}
                            isAdmin={isAdmin}
                            isModerator={isModerator}
                            onLogout={handleLogout}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;