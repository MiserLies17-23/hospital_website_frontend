export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email обязателен';
    if (!re.test(email)) return 'Некорректный email';
    return null;
};

export const validateUsername = (username) => {
    if (!username) return 'Имя пользователя обязательно';
    if (username.length < 3) return 'Имя пользователя должно содержать минимум 3 символа';
    if (username.length > 30) return 'Имя пользователя не должно превышать 30 символов';
    return null;
};

export const validatePassword = (password) => {
    if (!password) return 'Пароль обязателен';
    if (password.length < 6) return 'Пароль должен содержать минимум 6 символов';
    return null;
};