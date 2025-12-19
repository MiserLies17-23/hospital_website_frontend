import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';
import ModeratorRoute from "./ModeratorRoute";

// Публичные страницы
import HospitalPage from '../pages/hospital/HospitalPage';
import NewsPage from '../pages/news/NewsPage';
import LoginPage from '../pages/auth/LoginPage/LoginPage';
import SignUpPage from '../pages/auth/SignUpPage/SignUpPage';
import DoctorAppointmentPage from '../pages/appointments/DoctorAppointmentPage';

// Защищенные страницы
import PatientCabinetPage from '../pages/patient/PatientCabinetPage';

// Админ страницы
import AdminPanelPage from '../pages/admin/AdminPanelPage';
import UpdateUserPage from '../pages/admin/UpdateUserPage';
import UpdateDoctorPage from '../pages/admin/UpdateDoctorPage';
import AddUserPage from "../pages/admin/AddUserPage";
import AddDoctorPage from "../pages/admin/AddDoctorPage";
import UpdateNewsPage from "../pages/moderator/UpdateNewsPage";
import AddNewsPage from "../pages/moderator/AddNewsPage";
import ModeratorPanelPage from "../pages/moderator/ModeratorPanelPage";

const AppRoutes = () => {
    return (
        <Routes>
            {/* Публичные маршруты */}
            <Route path="/" element={<HospitalPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/appointments" element={<DoctorAppointmentPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Защищенные маршруты (требуют авторизации) */}
            <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<PatientCabinetPage />} />
            </Route>

            {/* Админ маршруты (требуют авторизации и роль ADMIN) */}
            <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminPanelPage />} />
                <Route path="/admin/users/:id/edit" element={<UpdateUserPage />} />
                <Route path="/admin/users/add" element={<AddUserPage/>} />
                <Route path="/admin/doctors/:id/edit" element={<UpdateDoctorPage />} />
                <Route path="/admin/doctors/add" element={<AddDoctorPage />} />
            </Route>

            {/* Модератор маршруты (только для MODERATOR) */}
            <Route element={<ModeratorRoute />}>
                <Route path="/moderator" element={<ModeratorPanelPage />} />
                <Route path="/moderator/news/add" element={<AddNewsPage />} />
                <Route path="/moderator/news/:id/edit" element={<UpdateNewsPage />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;