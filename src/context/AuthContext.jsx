import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await authApi.checkAuth();
            setUser(response.data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        const response = await authApi.login(credentials);
        setUser(response.data);
        localStorage.setItem('token', response.data.token);
        return response;
    };

    const logout = async () => {
        await authApi.logout();
        setUser(null);
        localStorage.removeItem('token');
    };

    const value = {
        user,
        loading,
        login,
        logout,
        checkAuth,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN'
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};