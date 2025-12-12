import React, { useState, useEffect } from 'react';

function NewsPage() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Симулируем загрузку новостей
        const mockNews = [
            {
                id: 1,
                title: 'Открытие нового отделения',
                date: '2024-01-15',
                content: 'Мы рады сообщить об открытии нового отделения кардиологии, оснащенного современным оборудованием.'
            },
            {
                id: 2,
                title: 'Новое медицинское оборудование',
                date: '2024-01-10',
                content: 'Больница получила новое современное оборудование для точной диагностики и лечения.'
            },
            {
                id: 3,
                title: 'Акция для пенсионеров',
                date: '2024-01-05',
                content: 'Скидки 20% на все услуги для пенсионеров в течение января 2024 года.'
            },
            {
                id: 4,
                title: 'Профилактические осмотры',
                date: '2024-01-01',
                content: 'Приглашаем на бесплатные профилактические осмотры всех желающих.'
            },
        ];

        setTimeout(() => {
            setNews(mockNews);
            setLoading(false);
        }, 500);
    }, []);

    if (loading) {
        return (
            <div className="container mt-5">
                <h2 className="text-center mb-4">Новости больницы</h2>
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Загрузка...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Новости больницы</h2>
            <div className="news-content">
                {news.length === 0 ? (
                    <p className="text-center">Новостей пока нет</p>
                ) : (
                    <div className="row">
                        {news.map(item => (
                            <div key={item.id} className="col-md-6 col-lg-4 mb-4">
                                <div className="card h-100">
                                    <div className="card-body">
                                        <h5 className="card-title">{item.title}</h5>
                                        <p className="card-text text-muted small">
                                            <i className="bi bi-calendar me-1"></i>
                                            {item.date}
                                        </p>
                                        <p className="card-text">{item.content}</p>
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

export default NewsPage;