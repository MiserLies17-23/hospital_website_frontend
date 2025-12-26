export const getErrorMessage = (error) => {

    if (!error.response) {
        console.log('Нет response - сетевая ошибка');
        return 'Ошибка сети. Проверьте подключение к интернету';
    }

    const data = error.response.data;

    if (data) {
        // Проверяем разные возможные форматы
        if (typeof data === 'string') {
            return data || `Ошибка ${error.response.status}`;
        }

        if (typeof data === 'object') {

            if (data.message) {
                return data.message;
            }

            if (data.error) {
                return data.error;
            }

            // Если есть другие поля, показываем первое
            const firstKey = Object.keys(data)[0];
            if (firstKey) {
                return String(data[firstKey]);
            }
        }
    }
    // Специальная обработка для 403
    if (error.response.status === 403) {
        return 'Неправильный логин или пароль!';
    }

    // Стандартные сообщения
    const messages = {
        400: 'Некорректный запрос',
        401: 'Требуется авторизация',
        402: 'Требуется оплата',
        403: 'Доступ запрещен',
        404: 'Ресурс не найден',
        405: 'Метод не разрешен',
        408: 'Таймаут запроса',
        409: 'Конфликт данных',
        422: 'Ошибка валидации',
        429: 'Слишком много запросов',
        500: 'Внутренняя ошибка сервера',
        502: 'Плохой шлюз',
        503: 'Сервис недоступен',
        504: 'Таймаут шлюза'
    };

    const message = messages[error.response.status] || `Ошибка ${error.response.status}`;

    return message;
};