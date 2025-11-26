import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function UpdateUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/getuser/${id}`, {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                setUser(response.data);
            } catch (error) {
                setError('Не удалось загрузить данные пользователя');
            }
        };
        fetchUser();
    }, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        // Добавить логику для обновления пользователя
        console.log('Update user:', user);
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Редактирование пользователя</h2>
            {error && <p className="text-danger text-center">{error}</p>}
            <form onSubmit={handleUpdate}>
                {/* Добавить поля формы для редактирования */}
                <div className="text-center">
                    <button type="submit" className="btn btn-primary me-2">Сохранить</button>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin-panel')}>Отмена</button>
                </div>
            </form>
        </div>
    );
}

export default UpdateUser;