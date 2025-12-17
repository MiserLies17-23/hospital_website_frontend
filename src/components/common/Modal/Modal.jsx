import React from 'react';
import './Modal.css';

const Modal = ({ title, message, onClose, show }) => {
    if (!show) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-window">
                <div className="modal-header">
                    <h4 className="modal-title">{title}</h4>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>
                <div className="modal-body">
                    <p className="modal-message">{message}</p>
                </div>
            </div>
        </div>
    );
};

export default Modal;