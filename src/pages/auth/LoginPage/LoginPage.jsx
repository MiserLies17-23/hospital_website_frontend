import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getErrorMessage } from '../../../utils/errorHandler';
import Loader from '../../../components/common/Loader/Loader';
import './LoginPage.css';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const message = location.state?.message;

    const { login } = useAuth();

    const handleLogin = async () => {
        if (!username || !password) {
            setError('Пожалуйста, введите логин и пароль.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await login({ username, password });
            navigate('/dashboard');
        } catch (error) {
            setError(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="login-page d-flex justify-content-center align-items-center">
            <div className="login-container">
                <div className="login-card">
                    <h2 className="text-center mb-4">Вход в систему больницы</h2>

                    {message && (
                        <div className="alert alert-success text-center">
                            {message}
                        </div>
                    )}

                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder='Имя пользователя'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                        />
                    </div>

                    <div className="mb-3">
                        <input
                            type="password"
                            className="form-control"
                            placeholder='Пароль'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                        />
                    </div>

                    {error && <div className="alert alert-danger mb-3">{error}</div>}

                    <button
                        className="btn btn-primary w-100 mb-3"
                        onClick={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Вход...
                            </>
                        ) : (
                            'Войти'
                        )}
                    </button>

                    <div className="text-center">
                        <span>Нет аккаунта? </span>
                        <a href="/signup" className="text-decoration-none">Зарегистрироваться</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;