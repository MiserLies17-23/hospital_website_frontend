// HospitalPage.js
import React from 'react';

function HospitalPage() {
    return (
        <div className="hospital-page">
            <div className="hospital-page-overlay"></div>

            <div className="hospital-content">
                <h1 className="hospital-title">Больница "Здоровье"</h1>
                <p className="hospital-lead">
                    Добро пожаловать в больницу "Здоровье" — современный медицинский центр,
                    где заботятся о вашем здоровье и благополучии.
                </p>
                <p className="hospital-text">
                    Наши услуги включают: терапию, хирургию, стоматологию, диагностику,
                    педиатрию, кардиологию и неврологию.
                </p>
                <p className="hospital-text">
                    Наши специалисты: Доктор Иванов (терапевт), Доктор Петрова (хирург),
                    Доктор Сидорова (стоматолог), Доктор Козлов (кардиолог).
                </p>
                <div className="hospital-hours">
                    <h5>Режим работы:</h5>
                    <p className="hospital-hours-item">Пн-Пт: 8:00 - 20:00</p>
                    <p className="hospital-hours-item">Сб: 9:00 - 18:00</p>
                    <p className="hospital-hours-item">Вс: 9:00 - 15:00</p>
                </div>
            </div>
        </div>
    );
}

export default HospitalPage;