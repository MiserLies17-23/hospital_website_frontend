import React from 'react';
import { Link } from 'react-router-dom';

const AuthButtons = ({ buttonsStatus }) => {
    return (
        <div>
            {buttonsStatus === 200 ? (
                <Link to="/dashboard" className="btn btn-primary mx-2">Личный кабинет</Link>
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