import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { MDBContainer, MDBInput, MDBBtn } from 'mdb-react-ui-kit';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const location = useLocation();
    const message = location.state?.message;

    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            if (!username || !password) {
                setError('Пожалуйста, введите логин и пароль.');
                return;
            }
            const response = await axios.post('http://localhost:8080/login', { username, password },
                {withCredentials: true,
                    headers:{
                        "Content-Type": "application/json"
                    }
                }
            );
            console.log('Login successful:', response.data);
            navigate('/dashboard');
        } catch (error) {
            console.error('Login failed:', error.response ? error.response.data : error.message);
            setError(error.response.data);
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
                <MDBContainer className="p-3">
                    <h2 className="mb-4 text-center">Вход в систему больницы</h2>
                    <ToastContainer/>
                    <MDBInput
                        wrapperClass='mb-4'
                        placeholder='Имя пользователя'
                        id='username'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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
                    <MDBBtn className="w-100 mb-4" size="md" onClick={handleLogin}>Войти</MDBBtn>
                </MDBContainer>
            </div>
        </div>
    );
}

export default LoginPage;