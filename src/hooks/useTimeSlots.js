import { useState, useEffect } from 'react';
import { appointmentsApi } from '../api';

export const useTimeSlots = (doctorId, date) => {
    const [busySlots, setBusySlots] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(false);

    const generateTimeSlots = () => {
        const slots = [];
        const today = new Date().toISOString().split('T')[0];
        const isToday = date === today;
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        for (let hour = 9; hour <= 18; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                if (hour === 18 && minute > 0) break;

                if (isToday) {
                    if (hour < currentHour || (hour === currentHour && minute <= currentMinute)) {
                        continue;
                    }
                }

                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push(time);
            }
        }
        return slots;
    };

    useEffect(() => {
        const fetchBusySlots = async () => {
            if (doctorId && date) {
                setLoading(true);
                try {
                    const response = await appointmentsApi.getDoctorBusySlots(doctorId, date);
                    const busy = Array.isArray(response.data) ? response.data : [];
                    setBusySlots(busy);

                    const allSlots = generateTimeSlots();
                    const available = allSlots.filter(slot => !busy.includes(slot));
                    setAvailableSlots(available);
                } catch (error) {
                    const allSlots = generateTimeSlots();
                    setAvailableSlots(allSlots);
                    setBusySlots([]);
                } finally {
                    setLoading(false);
                }
            } else {
                const allSlots = generateTimeSlots();
                setAvailableSlots(allSlots);
                setBusySlots([]);
            }
        };

        fetchBusySlots();
    }, [doctorId, date]);

    return { busySlots, availableSlots, loading };
};