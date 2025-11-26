import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MDBContainer, MDBInput, MDBBtn } from 'mdb-react-ui-kit';

function SignUpPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignUp = async () => {
        try {
            if (!username || !email || !password) {
                setError('Пожалуйста, заполните все поля.');
                return;
            }
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
            navigate('/login', { state: { message: 'Регистрация прошла успешно! Теперь вы можете войти.' } });
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
                setError('Ошибка сети');
            }
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="border rounded-lg p-4" style={{ width: '500px', height: 'auto' }}>
                <MDBContainer className="p-3">
                    <h2 className="mb-4 text-center">Регистрация в системе больницы</h2>
                    <MDBInput
                        wrapperClass='mb-4'
                        placeholder='Имя пользователя'
                        id='username'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <MDBInput
                        wrapperClass='mb-4'
                        placeholder='Электронная почта'
                        id='email'
                        type='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <MDBInput
                        wrapperClass='mb-4'
                        placeholder='Пароль'
                        id='password'
                        type='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && <div className="text-danger mb-3">{error}</div>}
                    <MDBBtn className="w-100 mb-4" size="md" onClick={handleSignUp}>Зарегистрироваться</MDBBtn>
                </MDBContainer>
            </div>
        </div>
    );
}

export default SignUpPage;