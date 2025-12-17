import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../../api';
import { getErrorMessage } from '../../../utils/errorHandler';
import { validateUsername, validateEmail, validatePassword } from '../../../utils/validators';
import Loader from '../../../components/common/Loader/Loader';
import './SignUpPage.css';

const SignUpPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};

        const usernameError = validateUsername(username);
        if (usernameError) newErrors.username = usernameError;

        const emailError = validateEmail(email);
        if (emailError) newErrors.email = emailError;

        const passwordError = validatePassword(password);
        if (passwordError) newErrors.password = passwordError;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignUp = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setErrors({});

        try {
            await authApi.signup({ username, email, password });
            navigate('/login', {
                state: { message: 'Регистрация прошла успешно!' }
            });
        } catch (error) {
            setErrors({ form: getErrorMessage(error) });
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
        <div className="signup-page d-flex justify-content-center align-items-center">
            <div className="signup-container">
                <div className="signup-card">
                    <h2 className="text-center mb-4">Регистрация в системе больницы</h2>

                    <div className="mb-3">
                        <input
                            type="text"
                            className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                            placeholder='Имя пользователя'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                        />
                        {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                    </div>

                    <div className="mb-3">
                        <input
                            type="email"
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            placeholder='Электронная почта'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>

                    <div className="mb-3">
                        <input
                            type="password"
                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                            placeholder='Пароль'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                        />
                        {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    </div>

                    {errors.form && <div className="alert alert-danger mb-3">{errors.form}</div>}

                    <button
                        className="btn btn-primary w-100 mb-3"
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
};

export default SignUpPage;