import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { ROLES, ROLE_PERMISSIONS, PERMISSIONS } from '../utils/constants';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [permissions, setPermissions] = useState([]);

    const updatePermissions = useCallback((role) => {
        const userPermissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[ROLES.USER];
        setPermissions(userPermissions);
    }, []);

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (user?.role) {
            updatePermissions(user.role);
        }
    }, [user?.role, updatePermissions]);

    const checkAuth = async () => {
        try {
            const response = await authApi.checkAuth();
            const userData = response.data;
            setUser(userData);
            updatePermissions(userData.role || ROLES.USER);
        } catch {
            setUser(null);
            setPermissions([]);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        const response = await authApi.login(credentials);
        const userData = response.data;
        setUser(userData);
        updatePermissions(userData.role || ROLES.USER);
        localStorage.setItem('token', response.data.token);
        return response;
    };

    const logout = async () => {
        await authApi.logout();
        setUser(null);
        setPermissions([]);
        localStorage.removeItem('token');
    };

    // Проверка прав
    const hasPermission = (permission) => {
        return permissions.includes(permission);
    };

    const hasAnyPermission = (permissionsArray) => {
        return permissionsArray.some(permission => hasPermission(permission));
    };

    const hasAllPermissions = (permissionsArray) => {
        return permissionsArray.every(permission => hasPermission(permission));
    };

    const value = {
        user,
        loading,
        login,
        logout,
        checkAuth,
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isAuthenticated: !!user,
        isAdmin: user?.role === ROLES.ADMIN,
        isModerator: user?.role === ROLES.MODERATOR,
        isUser: user?.role === ROLES.USER,
        role: user?.role || ROLES.VISITOR
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};