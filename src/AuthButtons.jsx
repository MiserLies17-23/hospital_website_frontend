import React from 'react';
import { Link } from 'react-router-dom';

const AuthButtons = ({ isAuthenticated, userRole, onLogout }) => {
    return (
        <div>
            {isAuthenticated ? (
                <div className="d-flex align-items-center">
                    {userRole === 'ADMIN' && (
                        <Link to="/admin-panel" className="btn btn-warning mx-2">
                            Админ панель
                        </Link>
                    )}
                    <button
                        className="btn btn-danger"
                        onClick={onLogout}
                    >
                        Выйти
                    </button>
                </div>
            ) : (
                <div>
                    <Link to="/login" className="btn btn-primary mx-2">Вход</Link>
                    <Link to="/signup" className="btn btn-primary">Регистрация</Link>
                </div>
            )}
        </div>
    );
};

export default AuthButtons;