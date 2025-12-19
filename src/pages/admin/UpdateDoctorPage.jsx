import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorsApi } from '../../api';
import Loader from '../../components/common/Loader/Loader';

const UpdateDoctorPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [doctor, setDoctor] = useState({
        name: '',
        specialization: '',
        phone: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDoctor();
    }, [id]);

    const fetchDoctor = async () => {
        try {
            setLoading(true);
            const response = await doctorsApi.getDoctorById(id);
            setDoctor(response.data);
        } catch (error) {
            setError('Не удалось загрузить данные врача');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await doctorsApi.updateDoctor(id, doctor);
            alert('Данные врача успешно обновлены!');
            navigate('/admin');
        } catch (error) {
            setError('Не удалось обновить данные врача');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDoctor(prev => ({ ...prev, [name]: value }));
    };

    if (loading && !doctor.name) {
        return <Loader text="Загрузка данных врача..." />;
    }

    return (
        <div className="update-user-page">
            <div className="container">
                <h2 className="text-center mb-4">Редактирование врача</h2>

                {error && <div className="alert alert-danger text-center">{error}</div>}

                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-body">
                                <form onSubmit={handleUpdate}>
                                    <div className="mb-3">
                                        <label className="form-label">Имя врача</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="name"
                                            value={doctor.name || ''}
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
                                            value={doctor.specialization || ''}
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
                                            value={doctor.phone || ''}
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
                                            {loading ? 'Сохранение...' : 'Сохранить'}
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

export default UpdateDoctorPage;