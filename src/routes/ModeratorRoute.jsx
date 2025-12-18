import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/constants';
import Loader from '../components/common/Loader/Loader';

const ModeratorRoute = () => {
    const { isAuthenticated, role, loading } = useAuth();

    if (loading) {
        return <Loader text="Проверка прав доступа..." />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (role !== ROLES.MODERATOR && role !== ROLES.ADMIN) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default ModeratorRoute;