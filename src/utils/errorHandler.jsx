// Компонент для обработки исключений
// utils/errorHandler.jsx
export const getErrorMessage = (error) => {
    if (!error.response) {
        return 'Нет подключения к серверу';
    }

    const { data } = error.response;

    // Если сервер вернул сообщение об ошибке
    if (data && data.message) {
        return data.message;
    }

    // Если пришла просто строка
    if (typeof data === 'string') {
        return data;
    }

    return 'Произошла ошибка';
};