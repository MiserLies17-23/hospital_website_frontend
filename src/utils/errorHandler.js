export const getErrorMessage = (error) => {
    if (!error.response) {
        return 'Ошибка сети. Проверьте подключение к интернету';
    }

    const { status, data } = error.response;
    let message = 'Произошла ошибка';

    if (typeof data === 'string') {
        message = data;
    } else if (data?.message) {
        message = data.message;
    } else if (data?.error) {
        message = data.error;
    }

    if (status === 404) {
        if (message.includes('Пользователь')) return 'Пользователь не найден';
        if (message.includes('Врач')) return 'Врач не найден';
        if (message.includes('Запись')) return 'Запись не найдена';
        return 'Не найдено';
    }

    if (status === 409) {
        if (message.includes('email')) return 'Пользователь с таким email уже существует';
        if (message.includes('username')) return 'Пользователь с таким именем уже существует';
        if (message.includes('время')) return 'Выбранное время уже занято';
        return 'Конфликт данных';
    }

    if (status === 401) return 'Неверный пароль или логин';
    if (status === 403) return 'Доступ запрещен';
    if (status === 500) return 'Ошибка сервера';

    return message;
};