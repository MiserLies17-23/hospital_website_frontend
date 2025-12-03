import api from './Api/Api.jsx';
import React, { useEffect, useState } from 'react';

function CurrentTime() {
    const [time, setTime] = useState(null);
    const [error, setError] = useState('');

    const fetchInitialTime = async () => {
        try {
            const response = await api.get("/time");
            const parsedTime = parseTime(response.data);
            setTime(parsedTime);
        } catch (error) {
            setError("Ошибка при загрузке времени");
        }
    };

    const parseTime = (timeString) => {
        const [datePart, timePart] = timeString.split(" ");
        const [day, month, year] = datePart.split(".");
        return new Date(`${year}-${month}-${day}T${timePart}`);
    };

    const updateTime = () => {
        if (time) {
            setTime(new Date(time.getTime() + 1000));
        }
    };

    const formatTime = (timeObject) => {
        if (!timeObject) return "";
        return timeObject.toLocaleString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    };

    useEffect(() => {
        fetchInitialTime();
    }, []);

    useEffect(() => {
        if (time) {
            const interval = setInterval(updateTime, 1000);
            return () => clearInterval(interval);
        }
    }, [time, updateTime]);

    return (
        <div>
            {error && <div>{error}</div>}
            <div>{formatTime(time)}</div>
        </div>
    );
}

export default CurrentTime;