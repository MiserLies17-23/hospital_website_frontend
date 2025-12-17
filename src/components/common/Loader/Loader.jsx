import React from 'react';
import './Loader.css';

const Loader = ({ size = 'md', text = 'Загрузка...' }) => {
    const sizeClass = {
        sm: 'spinner-border-sm',
        md: '',
        lg: 'spinner-border-lg'
    }[size];

    return (
        <div className="loader-container text-center">
            <div className={`spinner-border text-primary ${sizeClass}`} role="status">
                <span className="visually-hidden">{text}</span>
            </div>
            {text && <div className="mt-2 text-muted">{text}</div>}
        </div>
    );
};

export default Loader;