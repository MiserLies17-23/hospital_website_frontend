import React, { useState, useEffect } from 'react';
import {Link} from 'react-router-dom';
import axios from 'axios';

function AdminPanel() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:8080/getusers', {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                setUsers(response.data);
            } catch (error) {
                setError('Не удалось загрузить данные пользователей');
            }
        };
        fetchUsers();
    }, []);

    const deleteUser = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/delete/${id}`, {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json"
                }
            });
            setUsers(users.filter(user => user.id !== id));
        } catch (e) {
            setError('Не удалось удалить пользователя');
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Панель администратора больницы</h2>
            {error && <p className="text-danger text-center">{error}</p>}
            {!error && users.length > 0 ? (
                <table className="table table-bordered">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Имя пользователя</th>
                        <th>Электронная почта</th>
                        <th>Роль</th>
                        <th>Аватар</th>
                        <th>Действия</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <img
                                    src={user.avatar || '/default-avatar.png'}
                                    alt="User Avatar"
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        objectFit: 'cover'
                                    }}
                                />
                            </td>
                            <td>
                                {user.id === 1 ? (
                                    <div className='d-flex flex-column'>
                                        <Link
                                            to={`/update/${user.id}`}
                                            className="btn btn-primary"
                                        >
                                            Изменить
                                        </Link>
                                    </div>
                                ) : (
                                    <div className='d-flex flex-column gap-2'>
                                        <Link
                                            to={`/update/${user.id}`}
                                            className="btn btn-primary"
                                        >
                                            Изменить
                                        </Link>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => deleteUser(user.id)}
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-center">Нет данных для отображения</p>
            )}
        </div>
    );
}

export default AdminPanel;