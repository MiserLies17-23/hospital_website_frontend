import React from 'react';
import { Link } from 'react-router-dom';
import './AuthButtons.css';

const AuthButtons = ({ isAuthenticated, isAdmin, isModerator, onLogout }) => {
    return (
        <div className="auth-buttons">
            {isAuthenticated ? (
                <div className="d-flex align-items-center gap-2">
                    {/* Бейдж роли */}
                    <div className="role-badge">
                        {isAdmin ? (
                            <span className="badge bg-warning">ADMIN</span>
                        ) : isModerator ? (
                            <span className="badge bg-info">MODERATOR</span>
                        ) : (
                            <span className="badge bg-secondary">USER</span>
                        )}
                    </div>

                    {isAdmin && (
                        <Link to="/admin" className="btn btn-warning btn-sm">
                            Админ панель
                        </Link>
                    )}
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={onLogout}
                    >
                        Выйти
                    </button>
                </div>
            ) : (
                <div className="d-flex gap-2">
                    <Link to="/login" className="btn btn-primary btn-sm">Вход</Link>
                    <Link to="/signup" className="btn btn-success btn-sm">Регистрация</Link>
                </div>
            )}
        </div>
    );
};

export default AuthButtons;