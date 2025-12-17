import React, { useState, useEffect } from 'react';
import {newsApi} from "../../api/newsApi.js";
import './NewsPage.css';

const NewsPage = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const setError = useState('');

    useEffect(() => {
        fetchNews();},
        []);

    const fetchNews = async () => {
        try {
            const response = await newsApi.getAllNews();
            setNews(response.data);
        } catch (error) {
            setError('Не удалось загрузить новости');
        } finally {
            setLoading(false);
        }
    }

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
        <div className="container mt-4">
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
};

export default NewsPage;