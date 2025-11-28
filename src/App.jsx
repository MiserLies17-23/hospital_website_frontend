import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import LoginPage from './LoginPage';
import SignupPage from './SignUpPage';
import PatientCabinet from './PatientCabinet';
import HospitalPage from './HospitalPage';
import CurrentTime from './CurrentTime';
import NewsPage from './NewsPage';
import AuthButtons from './AuthButtons';
import VisitorCount from './VisitorCount';
import AdminPanel from './AdminPanel';
import UpdateUser from './UpdateUser';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true
});

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [loading, setLoading] = useState(true);

    // Проверка аутентификации при загрузке приложения
    const checkAuth = async () => {
        try {
            const response = await api.get("/user/checklogin");
            if (response.status === 200) {
                setIsAuthenticated(true);
                // Получаем информацию о пользователе для роли
                const userResponse = await api.get('/user/dashboard');
                setUserRole(userResponse.data.role);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                setIsAuthenticated(false);
                setUserRole('');
            } else {
                console.log("Ошибка проверки авторизации:", error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    function AppContent() {
        const location = useLocation();
        const navigate = useNavigate();

        const handleLogout = async () => {
            try {
                await api.get("/user/logout");
                setIsAuthenticated(false);
                setUserRole('');
                navigate('/');
            } catch (error) {
                console.error("Ошибка при выходе:", error);
            }
        };

        // При изменении маршрута проверяем аутентификацию
        useEffect(() => {
            checkAuth();
        }, [location]);

        if (loading) {
            return <div className="d-flex justify-content-center align-items-center vh-100">Загрузка...</div>;
        }

        return (
            <>
                <div className="header d-flex justify-content-between align-items-center p-3">
                    <div className="d-flex align-items-center">
                        <Link to="/" className="btn btn-secondary">Больница "Здоровье"</Link>
                        <Link to="/news" className="btn btn-secondary mx-2">Новости</Link>
                        {/* Кнопка личного кабинета всегда видна если авторизован */}
                        {isAuthenticated && (
                            <Link to="/dashboard" className="btn btn-primary mx-2">Личный кабинет</Link>
                        )}
                    </div>

                    <div className="center-block">
                        <CurrentTime />
                        <VisitorCount />
                    </div>

                    <div>
                        <AuthButtons
                            isAuthenticated={isAuthenticated}
                            userRole={userRole}
                            onLogout={handleLogout}
                        />
                    </div>
                </div>

                <div className="main-content">
                    <Routes>
                        <Route path="/" element={<HospitalPage />} />
                        <Route path="/news" element={<NewsPage />} />
                        <Route path="/login" element={<LoginPage onLoginSuccess={checkAuth} />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route
                            path="/dashboard"
                            element={
                                isAuthenticated ? (
                                    <PatientCabinet onLogout={handleLogout} />
                                ) : (
                                    <Navigate to="/login" replace />
                                )
                            }
                        />
                        <Route
                            path="/admin-panel"
                            element={
                                isAuthenticated && userRole === 'ADMIN' ? (
                                    <AdminPanel />
                                ) : (
                                    <Navigate to="/dashboard" replace />
                                )
                            }
                        />
                        <Route
                            path="/update/:id"
                            element={
                                isAuthenticated && userRole === 'ADMIN' ? (
                                    <UpdateUser />
                                ) : (
                                    <Navigate to="/dashboard" replace />
                                )
                            }
                        />
                    </Routes>
                </div>
            </>
        );
    }

    return (
        <div className="App">
            <Router>
                <AppContent />
            </Router>
        </div>
    );
}

export default App;