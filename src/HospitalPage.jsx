// HospitalPage.js
import React from 'react';

function HospitalPage() {
    return (
        <div className="hospital-page d-flex justify-content-center align-items-center vh-100">
            <div className="text-center" style={{ maxWidth: '600px' }}>
                <h1>Больница "Здоровье"</h1>
                <p>Добро пожаловать в больницу "Здоровье" — место, где заботятся о вашем здоровье.</p>
                <p>Наши услуги: терапия, хирургия, стоматология, диагностика.</p>
                <p>Врачи: Доктор Иванов (терапевт), Доктор Петрова (хирург).</p>
            </div>
        </div>
    );
}

export default HospitalPage;