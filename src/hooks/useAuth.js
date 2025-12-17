import { useAuth } from '../context/AuthContext';

export const useAuthHook = () => {
    const auth = useAuth();

    return {
        user: auth.user,
        loading: auth.loading,
        isAuthenticated: auth.isAuthenticated,
        isAdmin: auth.isAdmin,
        login: auth.login,
        logout: auth.logout,
        checkAuth: auth.checkAuth,
    };
};