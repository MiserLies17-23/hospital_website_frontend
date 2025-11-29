import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function SignUpPage({ onSignupSuccess }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignUp = async () => {
        try {
            if (!username || !email || !password) {
                setError('Пожалуйста, заполните все поля.');
                return;
            }

            // Валидация email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setError('Пожалуйста, введите корректный email адрес.');
                return;
            }

            // Валидация пароля (минимум 6 символов)
            if (password.length < 6) {
                setError('Пароль должен содержать минимум 6 символов.');
                return;
            }

            setLoading(true);
            setError('');

            const response = await axios.post('http://localhost:8080/user/signup',
                { username, email, password },
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
            console.log('Sign up successful:', response.data);

            // После успешной регистрации автоматически входим
            try {
                const loginResponse = await axios.post('http://localhost:8080/user/login',
                    { username, password },
                    {
                        withCredentials: true,
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );
                console.log('Auto-login after signup successful');

                // Вызываем колбэк при успешной регистрации
                if (onSignupSuccess) {
                    onSignupSuccess();
                }

                // Перенаправляем сразу в личный кабинет
                navigate('/dashboard');
            } catch (loginError) {
                console.error('Auto-login failed:', loginError);
                // Если авто-вход не удался, перенаправляем на страницу входа
                navigate('/login', {
                    state: {
                        message: 'Регистрация прошла успешно! Теперь вы можете войти.'
                    }
                });
            }

        } catch (error) {
            console.error('Sign up failed:', error.response ? error.response.data : error.message);
            if (error.response) {
                const errorData = error.response.data;
                if (typeof errorData === 'string') {
                    setError(errorData);
                } else if (errorData.error) {
                    setError(errorData.error);
                } else {
                    setError('Ошибка при регистрации');
                }
            } else {
                setError('Ошибка сети. Проверьте подключение к интернету.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSignUp();
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="border rounded-lg p-4 bg-white shadow-sm" style={{ width: '500px', height: 'auto' }}>
                <div className="p-3">
                    <h2 className="mb-4 text-center text-primary">Регистрация в системе больницы</h2>

                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">Имя пользователя</label>
                        <input
                            id="username"
                            type="text"
                            className="form-control"
                            placeholder='Введите имя пользователя'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Электронная почта</label>
                        <input
                            id="email"
                            type="email"
                            className="form-control"
                            placeholder='example@mail.com'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Пароль</label>
                        <input
                            id="password"
                            type="password"
                            className="form-control"
                            placeholder='Введите пароль (мин. 6 символов)'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="alert alert-danger mb-3" role="alert">
                            {error}
                        </div>
                    )}

                    <button
                        className="btn btn-primary w-100 mb-4 custom-btn"
                        onClick={handleSignUp}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Регистрация...
                            </>
                        ) : (
                            'Зарегистрироваться'
                        )}
                    </button>

                    <div className="text-center">
                        <span>Уже есть аккаунт? </span>
                        <Link to="/login" className="text-decoration-none text-primary fw-semibold">
                            Войти
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUpPage;