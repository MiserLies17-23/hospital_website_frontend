import React, { useState } from 'react';
import api from './Api/Api.jsx';
import { getErrorMessage } from "./utils/errorHandler";
import { useNavigate } from 'react-router-dom';

function SignUpPage() {
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

            setLoading(true);
            await api.post('/user/signup',
                { username, email, password },
                {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" }
                }
            );

            navigate('/login', {
                state: { message: 'Регистрация прошла успешно!' }
            });

        } catch (error) {
            setError(getErrorMessage(error));
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
            <div className="border rounded-lg p-4" style={{ width: '500px', height: 'auto' }}>
                <div className="p-3">
                    <h2 className="mb-4 text-center">Регистрация в системе больницы</h2>

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
                            type="email"
                            className="form-control"
                            placeholder='Электронная почта'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                        <a href="/login" className="text-decoration-none">Войти</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUpPage;