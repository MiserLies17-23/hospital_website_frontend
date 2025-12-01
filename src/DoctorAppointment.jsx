import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DoctorAppointment() {
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]); // Добавляем состояние для записей
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [loadingAppointments, setLoadingAppointments] = useState(true);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Загрузка списка врачей с бэкенда
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                // Предполагаемый эндпоинт для получения врачей
                const response = await axios.get('http://localhost:8080/api/doctors', {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                setDoctors(response.data);
            } catch (error) {
                console.error('Ошибка при загрузке врачей:', error);
                // Если эндпоинт не настроен, используем mock данные как fallback
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

        const fetchUserAppointments = async () => {
            try {
                // Эндпоинт для получения записей пользователя
                const response = await axios.get('http://localhost:8080/api/appointments', {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                setAppointments(response.data);
            } catch (error) {
                console.error('Ошибка при загрузке записей:', error);
            } finally {
                setLoadingAppointments(false);
            }
        };

        fetchDoctors();
        fetchUserAppointments();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedDoctor || !appointmentDate || !appointmentTime) {
            setError('Пожалуйста, заполните все обязательные поля');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Отправка данных на бэкенд
            const response = await axios.post(
                'http://localhost:8080/api/appointments',
                {
                    doctorId: selectedDoctor,
                    appointmentDate: appointmentDate,
                    appointmentTime: appointmentTime,
                    symptoms: symptoms,
                    status: 'SCHEDULED' // начальный статус записи
                },
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            // Если запись создана успешно
            if (response.data && response.data.id) {
                const selectedDoctorData = doctors.find(doc => doc.id === parseInt(selectedDoctor));
                setSuccess(`Вы успешно записаны на прием к ${selectedDoctorData.name} (${selectedDoctorData.specialization}) на ${appointmentDate} в ${appointmentTime}`);

                // Обновляем список записей
                const updatedAppointments = await axios.get('http://localhost:8080/api/appointments', {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                setAppointments(updatedAppointments.data);

                // Сброс формы
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

    const handleCancelAppointment = async (appointmentId) => {
        if (!window.confirm('Вы уверены, что хотите отменить запись?')) {
            return;
        }

        try {
            await axios.delete(`http://localhost:8080/api/appointments/${appointmentId}`, {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json"
                }
            });

            // Обновляем список записей после отмены
            const updatedAppointments = appointments.filter(app => app.id !== appointmentId);
            setAppointments(updatedAppointments);
            setSuccess('Запись успешно отменена');
        } catch (error) {
            console.error('Ошибка при отмене записи:', error);
            setError('Не удалось отменить запись');
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

    // Форматирование даты для отображения
    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    };

    return (
        <div className="doctor-appointment">
            <h3 className="text-center mb-4">Запись на прием к врачу</h3>

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
                                            {doctor.name} - {doctor.specialization} ({doctor.experience})
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

            {/* Список текущих записей */}
            <div className="card">
                <div className="card-body">
                    <h5 className="card-title">Мои записи</h5>
                    {loadingAppointments ? (
                        <div className="text-center">
                            <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Загрузка...</span>
                            </div>
                            <p>Загрузка записей...</p>
                        </div>
                    ) : appointments.length === 0 ? (
                        <p className="text-muted">У вас нет активных записей к врачам.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                <tr>
                                    <th>Врач</th>
                                    <th>Специализация</th>
                                    <th>Дата</th>
                                    <th>Время</th>
                                    <th>Статус</th>
                                    <th>Действия</th>
                                </tr>
                                </thead>
                                <tbody>
                                {appointments.map(appointment => (
                                    <tr key={appointment.id}>
                                        <td>{appointment.doctorName}</td>
                                        <td>{appointment.doctorSpecialization}</td>
                                        <td>{formatDate(appointment.appointmentDate)}</td>
                                        <td>{appointment.appointmentTime}</td>
                                        <td>
                                                <span className={`badge bg-${appointment.status === 'SCHEDULED' ? 'primary' : 'secondary'}`}>
                                                    {appointment.status === 'SCHEDULED' ? 'Запланировано' :
                                                        appointment.status === 'COMPLETED' ? 'Завершено' : 'Отменено'}
                                                </span>
                                        </td>
                                        <td>
                                            {appointment.status === 'SCHEDULED' && (
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleCancelAppointment(appointment.id)}
                                                >
                                                    Отменить
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
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
                                        <p className="card-text">Опыт работы: {doctor.experience}</p>
                                        <p className="card-text">
                                            <small className="text-muted">
                                                {doctor.available ? '✅ Принимает пациентов' : '⏸️ Не принимает'}
                                            </small>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DoctorAppointment;