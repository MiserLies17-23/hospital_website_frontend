import { useState, useEffect } from 'react';
import { appointmentsApi } from '../api/appointmentsApi';

export const useAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchUserAppointments = async () => {
        setLoading(true);
        try {
            const response = await appointmentsApi.getUserAppointments();
            setAppointments(response.data);
        } catch (error) {
            setError(error.response?.data?.message || 'Ошибка загрузки записей');
        } finally {
            setLoading(false);
        }
    };

    const createAppointment = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await appointmentsApi.create(data);
            await fetchUserAppointments();
            return response.data;
        } catch (error) {
            setError(error.response?.data?.message || 'Ошибка создания записи');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const cancelAppointment = async (id) => {
        try {
            await appointmentsApi.cancel(id);
            await fetchUserAppointments();
        } catch (error) {
            setError(error.response?.data?.message || 'Ошибка отмены записи');
            throw error;
        }
    };

    const deleteAppointment = async (id) => {
        try {
            await appointmentsApi.delete(id);
            await fetchUserAppointments();
        } catch (error) {
            setError(error.response?.data?.message || 'Ошибка удаления записи');
            throw error;
        }
    };

    return {
        appointments,
        loading,
        error,
        fetchUserAppointments,
        createAppointment,
        cancelAppointment,
        deleteAppointment,
    };
};