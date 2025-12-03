import React, { useState, useEffect } from 'react';
import api from './Api/Api.jsx';
import './index.css';
import { Link } from 'react-router-dom';

function DoctorAppointment({ isAuthenticated }) {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Загрузка списка врачей с бэкенда
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await api.get('/doctor/doctors', {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                setDoctors(response.data);
            } catch (error) {
                console.error('Ошибка при загрузке врачей:', error);
                const mockDoctors = [
                    { id: 1, name: 'Доктор Иванов', specialization: 'Терапевт', experience: '15 лет' },
                    { id: 2, name: 'Доктор Петрова', specialization: 'Хирург', experience: '12 лет' },
                    { id: 3, name: 'Доктор Сидорова', specialization: 'Стоматолог', experience: '10 лет' },
                    { id: 4, name: 'Доктор Козлов', specialization: 'Кардиолог', experience: '18 лет' },
                    { id: 5, name: 'Доктор Николаев', specialization: 'Невролог', experience: '14 лет' }
                ];
                setDoctors(mockDoctors);
            } finally {
                setLoadingDoctors(false);
            }
        };

        fetchDoctors();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Проверка авторизации
        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }

        if (!selectedDoctor || !appointmentDate || !appointmentTime) {
            setError('Пожалуйста, заполните все обязательные поля');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await api.post(
                '/appointments',
                {
                    doctorId: selectedDoctor,
                    appointmentDate: appointmentDate,
                    appointmentTime: appointmentTime,
                    symptoms: symptoms,
                    status: 'SCHEDULED'
                },
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json; "
                    }
                }
            );

            if (response.data && response.data.id) {
                const selectedDoctorData = doctors.find(doc => doc.id === parseInt(selectedDoctor));
                setSuccess(`Вы успешно записаны на прием к ${selectedDoctorData.name} (${selectedDoctorData.specialization}) на ${appointmentDate} в ${appointmentTime}`);

                setSelectedDoctor('');
                setAppointmentDate('');
                setAppointmentTime('');
                setSymptoms('');
            }
        } catch (err) {
            console.error('Ошибка при создании записи:', err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Произошла ошибка при записи на прием');
            }
        } finally {
            setLoading(false);
        }
    };

    // Генерация доступных временных слотов
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 9; hour <= 18; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push(time);
            }
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    // Минимальная дата - сегодня
    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    // Максимальная дата - через 30 дней
    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30);
        return maxDate.toISOString().split('T')[0];
    };

    return (
        <div className="doctor-appointment">
            <h3 className="text-center mb-4">Запись на прием к врачу</h3>

            {!isAuthenticated && (
                <div className="alert alert-info text-center">
                    Для записи на прием необходимо <Link to="/login">войти</Link> или <Link to="/signup">зарегистрироваться</Link>
                </div>
            )}

            {success && <div className="alert alert-success text-center">{success}</div>}
            {error && <div className="alert alert-danger text-center">{error}</div>}

            {/* Форма для новой записи */}
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">Новая запись</h5>
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Выберите врача *</label>
                                <select
                                    className="form-select"
                                    value={selectedDoctor}
                                    onChange={(e) => setSelectedDoctor(e.target.value)}
                                    required
                                    disabled={loadingDoctors}
                                >
                                    <option value="">-- Выберите врача --</option>
                                    {doctors.map(doctor => (
                                        <option key={doctor.id} value={doctor.id}>
                                            {doctor.name} - {doctor.specialization} ({doctor.phone})
                                        </option>
                                    ))}
                                </select>
                                {loadingDoctors && <small className="text-muted">Загрузка списка врачей...</small>}
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Дата приема *</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={appointmentDate}
                                    onChange={(e) => setAppointmentDate(e.target.value)}
                                    min={getMinDate()}
                                    max={getMaxDate()}
                                    required
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Время приема *</label>
                                <select
                                    className="form-select"
                                    value={appointmentTime}
                                    onChange={(e) => setAppointmentTime(e.target.value)}
                                    required
                                >
                                    <option value="">-- Выберите время --</option>
                                    {timeSlots.map(time => (
                                        <option key={time} value={time}>{time}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Жалобы/Симптомы</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={symptoms}
                                    onChange={(e) => setSymptoms(e.target.value)}
                                    placeholder="Опишите ваши симптомы или причину обращения..."
                                />
                            </div>
                        </div>

                        <div className="text-center">
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={loading || loadingDoctors}
                            >
                                {loading ? 'Запись...' : 'Записаться на прием'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Информация о врачах */}
            <div className="mt-4">
                <h4 className="text-center mb-4">Наши врачи</h4>
                {loadingDoctors ? (
                    <div className="text-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Загрузка...</span>
                        </div>
                    </div>
                ) : (
                    <div className="row">
                        {doctors.map(doctor => (
                            <div key={doctor.id} className="col-md-4 mb-3">
                                <div className="card h-100">
                                    <div className="card-body text-center">
                                        <h5 className="card-title">{doctor.name}</h5>
                                        <h6 className="card-subtitle mb-2 text-muted">{doctor.specialization}</h6>
                                        <p className="card-text">Телефон: {doctor.phone}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showAuthModal && (
                <>
                    <div className="modal-backdrop">
                        <div className="modal-window">
                            {/* Заголовок */}
                            <div className="modal-header">
                                <h4 className="modal-title">
                                    Требуется авторизация
                                </h4>
                                <button
                                    onClick={() => setShowAuthModal(false)}
                                    className="close-btn"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Контент */}
                            <div className="modal-body">
                                <p className="modal-message">
                                    Для записи на прием необходимо войти в систему.
                                </p>
                            </div>

                            {/* Кнопки */}
                            <div className="modal-footer">
                                <Link
                                    to="/login"
                                    className="modal-btn btn-login"
                                    onClick={() => setShowAuthModal(false)}
                                >
                                    Войти
                                </Link>
                                <Link
                                    to="/signup"
                                    className="modal-btn btn-signup"
                                    onClick={() => setShowAuthModal(false)}
                                >
                                    Регистрация
                                </Link>
                                <button
                                    onClick={() => setShowAuthModal(false)}
                                    className="modal-btn btn-cancel"
                                >
                                    Отмена
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default DoctorAppointment;