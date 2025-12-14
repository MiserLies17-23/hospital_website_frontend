import React, { useState, useEffect } from 'react';
import api from '../../api/Api.jsx';
import { getErrorMessage } from "../../utils/errorHandler";
import '../../index.css';
import { Link } from 'react-router-dom';

function DoctorAppointment({ isAuthenticated }) {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Новые состояния для занятых/свободных слотов
    const [busySlots, setBusySlots] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);

    // Загрузка списка врачей с бэкенда
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await api.get('/doctor/');
                console.log('Врачи загружены:', response.data); // Лог успеха
                setDoctors(response.data);
            } catch (error) {
                console.error('Ошибка загрузки врачей (детально):', error); // Детальный лог ошибки
                setError(getErrorMessage(error));
                setDoctors([]);
            } finally {
                setLoadingDoctors(false);
            }
        };
        fetchDoctors();
    }, []);

    useEffect(() => {
        const fetchBusySlots = async () => {
            if (selectedDoctor && appointmentDate) {
                setLoadingSlots(true);
                try {
                    const response = await api.get(`/appointments/doctor/${selectedDoctor}/busy-slots`, {
                        params: {date: appointmentDate},
                        withCredentials: true
                    });

                    const busy = Array.isArray(response.data) ? response.data : [];
                    setBusySlots(busy);
                    const allSlots = generateTimeSlots();
                    const available = allSlots.filter(slot => !busy.includes(slot));
                    setAvailableSlots(available);
                    if (busy.includes(appointmentTime)) {
                        setAppointmentTime('');
                    }
                } catch (error) {
                    // Если не удалось загрузить занятые слоты, показываем все как доступные
                    const allSlots = generateTimeSlots();
                    setAvailableSlots(allSlots);
                    setBusySlots([]);
                } finally {
                    setLoadingSlots(false);
                }
            } else {
                const allSlots = generateTimeSlots();
                setAvailableSlots(allSlots);
                setBusySlots([]);
            }
        };
        fetchBusySlots();
    }, [selectedDoctor, appointmentDate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }

        if (!selectedDoctor || selectedDoctor === '' || selectedDoctor === '0') {
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

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await api.post(
                'appointments/add',
                {
                    doctorId: Number(selectedDoctor),
                    appointmentDate: appointmentDate,
                    appointmentTime: appointmentTime,
                    symptoms: symptoms,
                    status: 'SCHEDULED'
                },
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            if (response.data && response.data.id) {
                const selectedDoctorData = doctors.find(doc => doc.id === parseInt(selectedDoctor));
                setSuccess(`Вы успешно записаны на прием к ${selectedDoctorData.name} (${selectedDoctorData.specialization}) на ${appointmentDate} в ${appointmentTime}`);

                // Очищаем форму
                setSelectedDoctor('');
                setAppointmentDate('');
                setAppointmentTime('');
                setSymptoms('');
                setBusySlots([]);
                setAvailableSlots(generateTimeSlots());
            }
        } catch (error) {
            const status = error.response?.status;
            const errorData = error.response?.data;

            console.error('Ошибка при создании записи:', errorData || error.message);

            if (status === 409) {
                setError('Выбранное время уже занято. Пожалуйста, выберите другое время.');

                if (selectedDoctor && appointmentDate) {
                    try {
                        const response = await api.get(`/appointments/doctor/${selectedDoctor}/busy-slots`, {
                            params: { date: appointmentDate },
                            withCredentials: true
                        });
                        setBusySlots(response.data || []);

                        const allSlots = generateTimeSlots();
                        const available = allSlots.filter(slot => !response.data?.includes(slot));
                        setAvailableSlots(available);

                        if (response.data?.includes(appointmentTime)) {
                            setAppointmentTime('');
                        }
                    } catch (refreshError) {
                        console.error('Ошибка обновления слотов:', refreshError);
                    }
                }
            } else if (status === 404) {
                setError('Врач не найден. Пожалуйста, выберите другого врача.');
            } else if (errorData?.message) {
                const errorMessage = typeof errorData.message === 'string'
                    ? errorData.message
                    : 'Неизвестная ошибка';
                setError(errorMessage);
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
        const today = new Date().toISOString().split('T')[0]; // Получаем сегодняшнюю дату в формате "2025-01-15"

        // Если выбранная дата - сегодня
        const isToday = appointmentDate === today;

        // Текущее время
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        for (let hour = 9; hour <= 18; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                // Пропускаем слоты после 18:00
                if (hour === 18 && minute > 0) break;

                // Если дата сегодня, проверяем не прошедшее ли время
                if (isToday) {
                    // Сравниваем час и минуту
                    if (hour < currentHour || (hour === currentHour && minute <= currentMinute)) {
                        continue; // Пропускаем прошедшее время
                    }
                }

                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push(time);
            }
        }
        return slots;
    };

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

    // Вспомогательная функция для форматирования времени
    const formatTimeDisplay = (time) => {
        return time; // Можно добавить форматирование, например "10:00 → 10:00 AM"
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
                                    onChange={(e) => {
                                        setSelectedDoctor(e.target.value);
                                        setAppointmentTime(''); // Сбрасываем время при смене врача
                                    }}
                                    required
                                    disabled={loadingDoctors}
                                >
                                    <option value="">-- Выберите врача --</option>
                                    <option value="0" disabled hidden>Не выбрано</option>
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
                                        setAppointmentTime(''); // Сбрасываем время при смене даты
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
                                <div className="position-relative">
                                    <select
                                        className="form-select"
                                        value={appointmentTime}
                                        onChange={(e) => setAppointmentTime(e.target.value)}
                                        required
                                        disabled={!selectedDoctor || !appointmentDate || loadingSlots}
                                    >
                                        <option value="">-- Выберите время --</option>

                                        {/* Свободные слоты с уникальными ключами */}
                                        {availableSlots.map((time, index) => (
                                            <option
                                                key={`available-${index}-${time}`}
                                                value={time}
                                                style={{ color: '#28a745', fontWeight: '500' }}
                                            >
                                                {formatTimeDisplay(time)} ✓
                                            </option>
                                        ))}

                                        {/* Разделитель */}
                                        {availableSlots.length > 0 && busySlots.length > 0 && (
                                            <option key="separator" disabled>───────────</option>
                                        )}

                                        {/* Занятые слоты с уникальными ключами */}
                                        {busySlots.map((time, index) => (
                                            <option
                                                key={`busy-${index}-${time}`}
                                                value={time}
                                                disabled
                                                style={{ color: '#6c757d', fontStyle: 'italic' }}
                                            >
                                                {formatTimeDisplay(time)} (занято)
                                            </option>
                                        ))}

                                        {/* Сообщение если нет свободных слотов */}
                                        {availableSlots.length === 0 && busySlots.length > 0 && (
                                            <option key="no-slots" disabled>
                                                Нет свободного времени на выбранную дату
                                            </option>
                                        )}
                                    </select>

                                    {loadingSlots && (
                                        <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                                            <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                <span className="visually-hidden">Загрузка...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Подсказки под селектом */}
                                <div className="mt-2">
                                    {!selectedDoctor && (
                                        <small className="text-muted">Выберите врача, чтобы увидеть доступное время</small>
                                    )}
                                    {selectedDoctor && !appointmentDate && (
                                        <small className="text-muted">Выберите дату, чтобы увидеть доступное время</small>
                                    )}
                                    {selectedDoctor && appointmentDate && loadingSlots && (
                                        <small className="text-muted">Загружаем расписание...</small>
                                    )}
                                    {selectedDoctor && appointmentDate && !loadingSlots && availableSlots.length > 0 && (
                                        <small className="text-success">Доступно {availableSlots.length} временных слотов</small>
                                    )}
                                    {selectedDoctor && appointmentDate && !loadingSlots && availableSlots.length === 0 && (
                                        <small className="text-danger">На выбранную дату нет свободного времени</small>
                                    )}
                                </div>
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
                                disabled={loading || loadingDoctors || loadingSlots || !availableSlots.length}
                            >
                                {loading ? 'Запись...' : 'Записаться на прием'}
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