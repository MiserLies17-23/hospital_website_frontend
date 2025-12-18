import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';
import ModeratorRoute from './ModeratorRoute';

// Публичные страницы
import HospitalPage from '../pages/hospital/HospitalPage';
import NewsPage from '../pages/news/NewsPage';
import NewsDetailPage from '../pages/news/NewsDetailPage';
import LoginPage from '../pages/auth/LoginPage/LoginPage';
import SignUpPage from '../pages/auth/SignUpPage/SignUpPage';
import DoctorAppointmentPage from '../pages/appointments/DoctorAppointmentPage';
import DoctorDetailPage from '../pages/doctors/DoctorDetailPage';

// Защищенные страницы
import PatientCabinetPage from '../pages/patient/PatientCabinetPage';

// Админ страницы
import AdminPanelPage from '../pages/admin/AdminPanelPage';
import UpdateUserPage from '../pages/admin/UpdateUserPage';
import DoctorsManagementPage from '../pages/admin/DoctorsManagementPage';

// Модератор страницы
import NewsManagementPage from '../pages/news/NewsManagementPage';

const AppRoutes = () => {
    return (
        <Routes>
            {/* Публичные маршруты */}
            <Route path="/" element={<HospitalPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:id" element={<NewsDetailPage />} />
            <Route path="/appointments" element={<DoctorAppointmentPage />} />
            <Route path="/doctors/:id" element={<DoctorDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Защищенные маршруты (требуют авторизации) */}
            <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<PatientCabinetPage />} />
            </Route>

            {/* Админ маршруты (требуют роль ADMIN) */}
            <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminPanelPage />} />
                <Route path="/admin/users/:id/edit" element={<UpdateUserPage />} />
                <Route path="/admin/doctors" element={<DoctorsManagementPage />} />
            </Route>

            {/* Модератор маршруты (требуют роль MODERATOR или ADMIN) */}
            <Route element={<ModeratorRoute />}>
                <Route path="/news-management" element={<NewsManagementPage />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;