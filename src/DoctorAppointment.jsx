import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DoctorAppointment() {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Mock данные врачей (в приложении будут с бэкенда)
    const mockDoctors = [
        { id: 1, name: 'Доктор Иванов', specialization: 'Терапевт', experience: '15 лет' },
        { id: 2, name: 'Доктор Петрова', specialization: 'Хирург', experience: '12 лет' },
        { id: 3, name: 'Доктор Сидорова', specialization: 'Стоматолог', experience: '10 лет' },
        { id: 4, name: 'Доктор Козлов', specialization: 'Кардиолог', experience: '18 лет' },
        { id: 5, name: 'Доктор Николаев', specialization: 'Невролог', experience: '14 лет' }
    ];

    useEffect(() => {
        // В реальном приложении здесь будет запрос к API
        setDoctors(mockDoctors);
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
            // В реальном приложении здесь будет запрос к API
            await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация запроса

            const selectedDoctorData = doctors.find(doc => doc.id === parseInt(selectedDoctor));

            setSuccess(`Вы успешно записаны на прием к ${selectedDoctorData.name} (${selectedDoctorData.specialization}) на ${appointmentDate} в ${appointmentTime}`);

            // Сброс формы
            setSelectedDoctor('');
            setAppointmentDate('');
            setAppointmentTime('');
            setSymptoms('');
        } catch (err) {
            setError('Произошла ошибка при записи на прием');
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

            {success && <div className="alert alert-success text-center">{success}</div>}
            {error && <div className="alert alert-danger text-center">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Выберите врача *</label>
                        <select
                            className="form-select"
                            value={selectedDoctor}
                            onChange={(e) => setSelectedDoctor(e.target.value)}
                            required
                        >
                            <option value="">-- Выберите врача --</option>
                            {doctors.map(doctor => (
                                <option key={doctor.id} value={doctor.id}>
                                    {doctor.name} - {doctor.specialization} ({doctor.experience})
                                </option>
                            ))}
                        </select>
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
                        disabled={loading}
                    >
                        {loading ? 'Запись...' : 'Записаться на прием'}
                    </button>
                </div>
            </form>

            {/* Информация о врачах */}
            <div className="mt-5">
                <h4 className="text-center mb-4">Наши врачи</h4>
                <div className="row">
                    {doctors.map(doctor => (
                        <div key={doctor.id} className="col-md-4 mb-3">
                            <div className="card h-100">
                                <div className="card-body text-center">
                                    <h5 className="card-title">{doctor.name}</h5>
                                    <h6 className="card-subtitle mb-2 text-muted">{doctor.specialization}</h6>
                                    <p className="card-text">Опыт работы: {doctor.experience}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default DoctorAppointment;