import React from 'react';
import './TimeSlotSelector.css';

const TimeSlotSelector = ({
                              availableSlots = [],
                              busySlots = [],
                              selectedTime,
                              onSelectTime,
                              loading = false
                          }) => {
    if (loading) {
        return (
            <div className="time-slots-loading">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </div>
                <small className="text-muted ms-2">Загружаем расписание...</small>
            </div>
        );
    }

    return (
        <div className="time-slots-selector">
            <select
                className="form-select"
                value={selectedTime || ''}
                onChange={(e) => onSelectTime(e.target.value)}
                disabled={availableSlots.length === 0}
            >
                <option value="">-- Выберите время --</option>
                {availableSlots.map((time) => (
                    <option key={`available-${time}`} value={time}>
                        {time} ✓
                    </option>
                ))}
                {busySlots.length > 0 && (
                    <>
                        <option disabled>───────────</option>
                        {busySlots.map((time) => (
                            <option key={`busy-${time}`} value={time} disabled>
                                {time} ✗
                            </option>
                        ))}
                    </>
                )}
            </select>

            {availableSlots.length === 0 && busySlots.length > 0 && (
                <div className="mt-2 text-danger small">
                    На выбранную дату нет свободного времени
                </div>
            )}
            {availableSlots.length > 0 && (
                <div className="mt-2 text-success small">
                    Доступно {availableSlots.length} временных слотов
                </div>
            )}
        </div>
    );
};

export default TimeSlotSelector;