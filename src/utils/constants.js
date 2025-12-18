export const ROLES = {
    USER: 'USER',
    MODERATOR: 'MODERATOR',
    ADMIN: 'ADMIN',
    VISITOR: 'VISITOR'
};

export const PERMISSIONS = {
    // Новости
    VIEW_NEWS: 'VIEW_NEWS',
    CREATE_NEWS: 'CREATE_NEWS',
    EDIT_NEWS: 'EDIT_NEWS',
    DELETE_NEWS: 'DELETE_NEWS',

    // Пользователи
    VIEW_USERS: 'VIEW_USERS',
    EDIT_USERS: 'EDIT_USERS',
    DELETE_USERS: 'DELETE_USERS',

    // Записи
    VIEW_APPOINTMENTS: 'VIEW_APPOINTMENTS',
    CREATE_APPOINTMENTS: 'CREATE_APPOINTMENTS',
    EDIT_APPOINTMENTS: 'EDIT_APPOINTMENTS',
    DELETE_APPOINTMENTS: 'DELETE_APPOINTMENTS',

    // Врачи
    VIEW_DOCTORS: 'VIEW_DOCTORS',
    CREATE_DOCTORS: 'CREATE_DOCTORS',
    EDIT_DOCTORS: 'EDIT_DOCTORS',
    DELETE_DOCTORS: 'DELETE_DOCTORS',

    // Администрирование
    MANAGE_SYSTEM: 'MANAGE_SYSTEM'
};

export const ROLE_PERMISSIONS = {
    [ROLES.USER]: [
        PERMISSIONS.VIEW_NEWS,
        PERMISSIONS.VIEW_DOCTORS,
        PERMISSIONS.CREATE_APPOINTMENTS,
        PERMISSIONS.VIEW_APPOINTMENTS,
        PERMISSIONS.EDIT_APPOINTMENTS,
        PERMISSIONS.DELETE_APPOINTMENTS
    ],

    [ROLES.MODERATOR]: [
        PERMISSIONS.VIEW_NEWS,
        PERMISSIONS.CREATE_NEWS,
        PERMISSIONS.EDIT_NEWS,
        PERMISSIONS.DELETE_NEWS,
        PERMISSIONS.VIEW_DOCTORS,
        PERMISSIONS.VIEW_APPOINTMENTS,
        PERMISSIONS.CREATE_APPOINTMENTS,
        PERMISSIONS.EDIT_APPOINTMENTS,
        PERMISSIONS.DELETE_APPOINTMENTS
    ],

    [ROLES.ADMIN]: Object.values(PERMISSIONS)
};

// Специализации врачей
export const DOCTOR_SPECIALIZATIONS = [
    'Терапевт',
    'Хирург',
    'Стоматолог',
    'Педиатр',
    'Кардиолог',
    'Невролог',
    'Офтальмолог',
    'Отоларинголог',
    'Гинеколог',
    'Уролог',
    'Дерматолог',
    'Эндокринолог',
    'Ортопед',
    'Психиатр',
    'Психолог',
    'Диетолог',
    'Физиотерапевт'
];

// График работы
export const WORKING_HOURS = {
    START: 9,
    END: 18
};