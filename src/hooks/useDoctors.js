import { useState, useEffect } from 'react';
import { doctorsApi } from '../api/doctorsApi';

export const useDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const response = await doctorsApi.getAll();
            setDoctors(response.data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return { doctors, loading, error, refetch: fetchDoctors };
};