import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function LoginPage({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const message = location.state?.message;
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            if (!username || !password) {
                setError('Пожалуйста, введите логин и пароль.');
                return;
            }

            setLoading(true);
            const response = await axios.post('http://localhost:8080/user/login', { username, password },
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
            console.log('Login successful:', response.data);

            if (onLoginSuccess) {
                onLoginSuccess();
            }

            navigate('/dashboard');
        } catch (error) {
            console.error('Login failed:', error.response ? error.response.data : error.message);
            setError(error.response?.data || 'Ошибка при входе');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    useEffect(() => {
        if (message) {
            toast.success(message, {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    }, [message]);

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="border rounded-lg p-4" style={{ width: '500px', height: 'auto' }}>
                <div className="p-3">
                    <h2 className="mb-4 text-center">Вход в систему больницы</h2>
                    <ToastContainer/>

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
                        className="btn btn-primary w-100 mb-4 custom-btn"
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
}

export default LoginPage;