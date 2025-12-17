import React from 'react';
import './DoctorCard.css';

const DoctorCard = ({ doctor }) => {
    return (
        <div className="doctor-card card">
            <div className="card-body text-center">
                <h5 className="card-title">{doctor.name}</h5>
                <h6 className="card-subtitle mb-2 text-muted">{doctor.specialization}</h6>
                <p className="card-text">
                    <i className="bi bi-telephone me-1"></i>
                    {doctor.phone}
                </p>
            </div>
        </div>
    );
};

export default DoctorCard;