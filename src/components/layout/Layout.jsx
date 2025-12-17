import React from 'react';
import Header from './Header/Header';
import '../../assets/styles/components/cards.css';

const Layout = ({ children }) => {
    return (
        <div className="app d-flex flex-column" style={{ minHeight: '100vh' }}>
            <Header />
            <main className="main-content flex-grow-1">
                <div className="container py-4">
                    {children}
                </div>
            </main>
            <footer className="bg-dark text-white py-3 mt-auto">
                <div className="container text-center">
                    <p className="mb-0">Больница "Здоровье" © {new Date().getFullYear()}</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;