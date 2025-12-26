export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

export const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
};

export const formatDateTime = (dateString, timeString) => {
    return `${formatDate(dateString)} ${formatTime(timeString)}`;
};

export const getAvatarUrlWithTimestamp = (avatarUrl) => {
    if (!avatarUrl) return avatarUrl;

    // Убедимся, что добавляем timestamp
    const hasQuery = avatarUrl.includes('?');
    const separator = hasQuery ? '&' : '?';

    // Всегда новый timestamp
    return `${avatarUrl}${separator}t=${Date.now()}`;
};

export const isDefaultAvatar = (avatarUrl) => {
    if (!avatarUrl) return true;

    const defaultAvatarPatterns = [
        'defaultUserImage',
        'default-avatar',
        'placeholder',
        'gravatar',
        '/images/defaultUserImage',
        '//www.gravatar.com/avatar/'
    ];

    return defaultAvatarPatterns.some(pattern => avatarUrl.includes(pattern));
};