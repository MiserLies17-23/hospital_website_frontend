import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDoctors } from '../../hooks/useDoctors';
import { useTimeSlots } from '../../hooks/useTimeSlots';
import { useAppointments } from '../../hooks/useAppointments';
import TimeSlotSelector from '../../components/features/TimeSlotSelector/TimeSlotSelector';
import DoctorCard from '../../components/features/DoctorCard/DoctorCard';
import Modal from '../../components/common/Modal/Modal';
import './DoctorAppointmentPage.css';

const DoctorAppointmentPage = () => {
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [showAuthModal, setShowAuthModal] = useState(false);

    const { isAuthenticated } = useAuth();

    const { doctors, loading: loadingDoctors } = useDoctors();
    const { busySlots, availableSlots, loading: loadingSlots } = useTimeSlots(selectedDoctor, appointmentDate);
    const { createAppointment, loading: creatingAppointment } = useAppointments();

    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30);
        return maxDate.toISOString().split('T')[0];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }

        if (!selectedDoctor) {
            setError('Пожалуйста, выберите врача');
            return;
        }

        if (!appointmentDate || !appointmentTime) {
            setError('Пожалуйста, заполните все обязательные поля');
            return;
        }

        if (busySlots.includes(appointmentTime)) {
            setError('Выбранное время уже занято. Пожалуйста, выберите другое время.');
            return;
        }

        setError('');
        setSuccess('');

        try {
            const selectedDoctorData = doctors.find(doc => doc.id === parseInt(selectedDoctor));
            await createAppointment({
                doctorId: Number(selectedDoctor),
                appointmentDate,
                appointmentTime,
                symptoms,
                status: 'SCHEDULED'
            });

            setSuccess(`Вы успешно записаны на прием к ${selectedDoctorData.name} (${selectedDoctorData.specialization}) на ${appointmentDate} в ${appointmentTime}`);

            // Очистка формы
            setSelectedDoctor('');
            setAppointmentDate('');
            setAppointmentTime('');
            setSymptoms('');
        } catch (error) {
            setError(error.response?.data?.message || 'Ошибка при создании записи');
        }
    };

    return (
        <div className="doctor-appointment-page">
            <h2 className="text-center mb-4">Запись на прием к врачу</h2>

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
                                    onChange={(e) => {
                                        setSelectedDoctor(e.target.value);
                                        setAppointmentTime('');
                                    }}
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
                                    onChange={(e) => {
                                        setAppointmentDate(e.target.value);
                                        setAppointmentTime('');
                                    }}
                                    min={getMinDate()}
                                    max={getMaxDate()}
                                    required
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Время приема *</label>
                                <TimeSlotSelector
                                    availableSlots={availableSlots}
                                    busySlots={busySlots}
                                    selectedTime={appointmentTime}
                                    onSelectTime={setAppointmentTime}
                                    loading={loadingSlots}
                                />
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
                                disabled={creatingAppointment || loadingDoctors || loadingSlots || !availableSlots.length}
                            >
                                {creatingAppointment ? 'Запись...' : 'Записаться на прием'}
                            </button>

                            {(loadingSlots || !availableSlots.length) && (
                                <div className="mt-2">
                                    <small className="text-muted">
                                        {loadingSlots ? 'Проверяем доступность...' : 'Нет доступного времени для записи'}
                                    </small>
                                </div>
                            )}
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
                ) : doctors.length === 0 ? (
                    <div className="text-center">
                        <p className="text-muted">Нет доступных врачей</p>
                    </div>
                ) : (
                    <div className="row">
                        {doctors.map(doctor => (
                            <div key={doctor.id} className="col-md-4 mb-3">
                                <DoctorCard doctor={doctor} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal
                show={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                title="Требуется авторизация"
                message="Для записи на прием необходимо войти в систему."
            />
        </div>
    );
};

export default DoctorAppointmentPage;