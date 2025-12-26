import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorsApi } from '../../api';
import {getErrorMessage} from "../../utils/errorHandler";

const AddDoctorPage = () => {
    const navigate = useNavigate();

    const [doctor, setDoctor] = useState({
        name: '',
        specialization: '',
        phone: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await doctorsApi.addDoctor(doctor);
            alert('Врач успешно создан!');
            navigate('/admin');
        } catch (error) {
            setError(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDoctor(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="update-user-page">
            <div className="container">
                <h2 className="text-center mb-4">Добавление врача</h2>

                {error && <div className="alert alert-danger text-center">{error}</div>}

                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">Имя врача</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="name"
                                            value={doctor.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Специализация</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="specialization"
                                            value={doctor.specialization}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Телефон</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            name="phone"
                                            value={doctor.phone}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="text-center">
                                        <button
                                            type="submit"
                                            className="btn btn-primary me-2"
                                            disabled={loading}
                                        >
                                            {loading ? 'Создание...' : 'Создать'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => navigate('/admin')}
                                        >
                                            Отмена
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddDoctorPage;