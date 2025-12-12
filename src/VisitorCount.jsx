import React, { useState, useEffect } from 'react';

function VisitorCount() {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Симулируем подсчет посетителей
        const today = new Date().toDateString();
        const storedCount = localStorage.getItem(`visitors_${today}`);

        if (storedCount) {
            setCount(parseInt(storedCount));
        } else {
            // Можно добавить вызов API для реального подсчета
            localStorage.setItem(`visitors_${today}`, '1');
            setCount(1);
        }

        setLoading(false);
    }, []);

    // Увеличиваем счетчик при посещении страницы
    useEffect(() => {
        const timer = setTimeout(() => {
            const today = new Date().toDateString();
            const newCount = count + 1;
            setCount(newCount);
            localStorage.setItem(`visitors_${today}`, newCount.toString());
        }, 1000);

        return () => clearTimeout(timer);
    }, [count]);

    if (loading) {
        return <div className="visitor-count">Загрузка...</div>;
    }

    return (
        <div className="visitor-count">
            <p>Посетителей сегодня: {count}</p>
        </div>
    );
}

export default VisitorCount;