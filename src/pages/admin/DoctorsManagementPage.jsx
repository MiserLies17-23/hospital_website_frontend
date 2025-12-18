import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doctorsApi } from '../../api/doctorsApi';
import { DOCTOR_SPECIALIZATIONS } from '../../utils/constants';
import { PERMISSIONS } from '../../utils/constants';
import Loader from '../../components/common/Loader/Loader';
import Modal from '../../components/common/Modal/Modal';
import './DoctorsManagementPage.css';

const DoctorsManagementPage = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSpecialization, setFilterSpecialization] = useState('');

    // Состояния для форм
    const [formData, setFormData] = useState({
        name: '',
        specialization: '',
        phone: '',
        email: '',
        office: '',
        description: '',
        photo: ''
    });

    // Модальные окна
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [deletingDoctorId, setDeletingDoctorId] = useState(null);

    // Состояния операций
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const { hasPermission } = useAuth();
    const navigate = useNavigate();

    // Проверка прав
    const canCreate = hasPermission(PERMISSIONS.CREATE_DOCTORS);
    const canEdit = hasPermission(PERMISSIONS.EDIT_DOCTORS);
    const canDelete = hasPermission(PERMISSIONS.DELETE_DOCTORS);

    // Загрузка врачей
    const fetchDoctors = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await doctorsApi.getAll();
            setDoctors(response.data || []);
        } catch (error) {
            console.error('Ошибка загрузки врачей:', error);
            setError('Не удалось загрузить список врачей');
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    // Обработчики форм
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Валидация телефона
    const validatePhone = (phone) => {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
        return phoneRegex.test(phone);
    };

    // Валидация email
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Создание врача
    const handleCreateDoctor = async (e) => {
        e.preventDefault();

        // Валидация
        if (!formData.name.trim()) {
            setError('Имя врача обязательно');
            return;
        }

        if (!formData.specialization) {
            setError('Специализация обязательна');
            return;
        }

        if (formData.phone && !validatePhone(formData.phone)) {
            setError('Некорректный номер телефона');
            return;
        }

        if (formData.email && !validateEmail(formData.email)) {
            setError('Некорректный email');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await doctorsApi.create(formData);

            setSuccess('Врач успешно добавлен!');
            setFormData({
                name: '',
                specialization: '',
                phone: '',
                email: '',
                office: '',
                description: '',
                photo: ''
            });
            setShowCreateModal(false);

            // Обновляем список
            await fetchDoctors();

            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Ошибка создания врача:', error);
            setError(error.response?.data?.message || 'Не удалось добавить врача');
        } finally {
            setSubmitting(false);
        }
    };

    // Редактирование врача
    const handleEditDoctor = async (e) => {
        e.preventDefault();

        if (!editingDoctor) {
            setError('Врач не выбран');
            return;
        }

        if (!formData.name.trim()) {
            setError('Имя врача обязательно');
            return;
        }

        if (!formData.specialization) {
            setError('Специализация обязательна');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await doctorsApi.update(editingDoctor.id, formData);

            setSuccess('Данные врача успешно обновлены!');
            setShowEditModal(false);
            setEditingDoctor(null);

            // Обновляем список
            await fetchDoctors();

            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Ошибка обновления врача:', error);
            setError(error.response?.data?.message || 'Не удалось обновить данные врача');
        } finally {
            setSubmitting(false);
        }
    };

    // Удаление врача
    const handleDeleteDoctor = async () => {
        if (!deletingDoctorId) return;

        setDeleting(true);
        setError('');

        try {
            await doctorsApi.delete(deletingDoctorId);

            setSuccess('Врач успешно удален!');
            setShowDeleteModal(false);
            setDeletingDoctorId(null);

            // Обновляем список
            await fetchDoctors();

            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Ошибка удаления врача:', error);
            setError(error.response?.data?.message || 'Не удалось удалить врача');
        } finally {
            setDeleting(false);
        }
    };

    // Открытие модальных окон
    const openCreateModal = () => {
        setFormData({
            name: '',
            specialization: '',
            phone: '',
            email: '',
            office: '',
            description: '',
            photo: ''
        });
        setShowCreateModal(true);
        setError('');
    };

    const openEditModal = (doctor) => {
        setEditingDoctor(doctor);
        setFormData({
            name: doctor.name,
            specialization: doctor.specialization,
            phone: doctor.phone || '',
            email: doctor.email || '',
            office: doctor.office || '',
            description: doctor.description || '',
            photo: doctor.photo || ''
        });
        setShowEditModal(true);
        setError('');
    };

    const openDeleteModal = (doctorId) => {
        setDeletingDoctorId(doctorId);
        setShowDeleteModal(true);
        setError('');
    };

    // Поиск и фильтрация
    const filteredDoctors = doctors.filter(doctor => {
        const matchesSearch = searchTerm === '' ||
            doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (doctor.phone && doctor.phone.includes(searchTerm));

        const matchesFilter = filterSpecialization === '' ||
            doctor.specialization === filterSpecialization;

        return matchesSearch && matchesFilter;
    });

    // Форматирование телефона
    const formatPhone = (phone) => {
        if (!phone) return 'Не указан';
        return phone.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 ($2) $3-$4-$5');
    };

    if (loading) {
        return <Loader text="Загрузка списка врачей..." />;
    }

    return (
        <div className="doctors-management-page">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Управление врачами</h2>

                    {canCreate && (
                        <button
                            className="btn btn-primary"
                            onClick={openCreateModal}
                            disabled={submitting}
                        >
                            <i className="bi bi-person-plus me-2"></i>
                            Добавить врача
                        </button>
                    )}
                </div>

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        {success}
                    </div>
                )}

                {/* Панель поиска и фильтрации */}
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <i className="bi bi-search"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Поиск по имени, специализации или телефону..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <select
                                    className="form-select"
                                    value={filterSpecialization}
                                    onChange={(e) => setFilterSpecialization(e.target.value)}
                                >
                                    <option value="">Все специализации</option>
                                    {DOCTOR_SPECIALIZATIONS.map(spec => (
                                        <option key={spec} value={spec}>
                                            {spec}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        {doctors.length === 0 ? (
                            <div className="text-center py-4">
                                <i className="bi bi-person-x text-muted" style={{ fontSize: '3rem' }}></i>
                                <p className="text-muted mt-3">Врачи не найдены</p>
                                {canCreate && (
                                    <button
                                        className="btn btn-primary mt-2"
                                        onClick={openCreateModal}
                                    >
                                        Добавить первого врача
                                    </button>
                                )}
                            </div>
                        ) : filteredDoctors.length === 0 ? (
                            <div className="text-center py-4">
                                <p className="text-muted">По вашему запросу ничего не найдено</p>
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setFilterSpecialization('');
                                    }}
                                >
                                    Сбросить фильтры
                                </button>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>ФИО</th>
                                        <th>Специализация</th>
                                        <th>Телефон</th>
                                        <th>Кабинет</th>
                                        <th>Записей</th>
                                        <th>Действия</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredDoctors.map(doctor => (
                                        <tr key={doctor.id}>
                                            <td>{doctor.id}</td>
                                            <td>
                                                <div className="fw-semibold">{doctor.name}</div>
                                                {doctor.email && (
                                                    <div className="text-muted small">{doctor.email}</div>
                                                )}
                                            </td>
                                            <td>
                                                    <span className="badge bg-info">
                                                        {doctor.specialization}
                                                    </span>
                                            </td>
                                            <td>{formatPhone(doctor.phone)}</td>
                                            <td>
                                                {doctor.office ? (
                                                    <span className="badge bg-secondary">
                                                            №{doctor.office}
                                                        </span>
                                                ) : (
                                                    <span className="text-muted">Не указан</span>
                                                )}
                                            </td>
                                            <td>
                                                    <span className="badge bg-light text-dark">
                                                        {doctor.appointmentCount || 0}
                                                    </span>
                                            </td>
                                            <td>
                                                <div className="btn-group btn-group-sm">
                                                    <button
                                                        className="btn btn-outline-info"
                                                        onClick={() => navigate(`/doctors/${doctor.id}`)}
                                                        title="Просмотреть"
                                                    >
                                                        <i className="bi bi-eye"></i>
                                                    </button>

                                                    {canEdit && (
                                                        <button
                                                            className="btn btn-outline-primary"
                                                            onClick={() => openEditModal(doctor)}
                                                            title="Редактировать"
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </button>
                                                    )}

                                                    {canDelete && (
                                                        <button
                                                            className="btn btn-outline-danger"
                                                            onClick={() => openDeleteModal(doctor.id)}
                                                            title="Удалить"
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Статистика */}
                <div className="row mt-4">
                    <div className="col-md-3">
                        <div className="card bg-primary text-white">
                            <div className="card-body text-center">
                                <h3 className="card-title">{doctors.length}</h3>
                                <p className="card-text">Всего врачей</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="card bg-success text-white">
                            <div className="card-body text-center">
                                <h3 className="card-title">
                                    {DOCTOR_SPECIALIZATIONS.length}
                                </h3>
                                <p className="card-text">Специализаций</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="card bg-info text-white">
                            <div className="card-body text-center">
                                <h3 className="card-title">
                                    {doctors.filter(d => d.phone).length}
                                </h3>
                                <p className="card-text">С телефоном</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="card bg-warning text-dark">
                            <div className="card-body text-center">
                                <h3 className="card-title">
                                    {doctors.filter(d => d.email).length}
                                </h3>
                                <p className="card-text">С email</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Модальное окно создания врача */}
            <Modal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Добавление нового врача"
                size="lg"
            >
                <form onSubmit={handleCreateDoctor}>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">ФИО врача *</label>
                            <input
                                type="text"
                                className="form-control"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                maxLength={100}
                                placeholder="Иванов Иван Иванович"
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">Специализация *</label>
                            <select
                                className="form-select"
                                name="specialization"
                                value={formData.specialization}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Выберите специализацию</option>
                                {DOCTOR_SPECIALIZATIONS.map(spec => (
                                    <option key={spec} value={spec}>
                                        {spec}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Телефон</label>
                            <input
                                type="tel"
                                className="form-control"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="+7 (999) 123-45-67"
                            />
                            <div className="form-text">
                                Формат: +7 (XXX) XXX-XX-XX
                            </div>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="doctor@hospital.ru"
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Номер кабинета</label>
                            <input
                                type="text"
                                className="form-control"
                                name="office"
                                value={formData.office}
                                onChange={handleInputChange}
                                placeholder="101"
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">Фото (URL)</label>
                            <input
                                type="url"
                                className="form-control"
                                name="photo"
                                value={formData.photo}
                                onChange={handleInputChange}
                                placeholder="https://example.com/photo.jpg"
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Описание</label>
                        <textarea
                            className="form-control"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            placeholder="Образование, опыт работы, достижения..."
                        />
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowCreateModal(false)}
                            disabled={submitting}
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Добавление...
                                </>
                            ) : 'Добавить врача'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Модальное окно редактирования врача */}
            <Modal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Редактирование врача"
                size="lg"
            >
                {editingDoctor && (
                    <form onSubmit={handleEditDoctor}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">ФИО врача *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Специализация *</label>
                                <select
                                    className="form-select"
                                    name="specialization"
                                    value={formData.specialization}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Выберите специализацию</option>
                                    {DOCTOR_SPECIALIZATIONS.map(spec => (
                                        <option key={spec} value={spec}>
                                            {spec}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Телефон</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Номер кабинета</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="office"
                                    value={formData.office}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Фото (URL)</label>
                                <input
                                    type="url"
                                    className="form-control"
                                    name="photo"
                                    value={formData.photo}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Описание</label>
                            <textarea
                                className="form-control"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                            />
                        </div>

                        <div className="d-flex justify-content-end gap-2">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowEditModal(false)}
                                disabled={submitting}
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Сохранение...
                                    </>
                                ) : 'Сохранить изменения'}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Модальное окно подтверждения удаления */}
            <Modal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Подтверждение удаления"
            >
                <div className="text-center">
                    <div className="mb-4">
                        <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '3rem' }}></i>
                    </div>
                    <h5>Вы уверены, что хотите удалить этого врача?</h5>
                    <p className="text-muted">
                        Все связанные записи на прием будут отменены.
                    </p>
                    <p className="text-danger fw-semibold">
                        Это действие нельзя будет отменить!
                    </p>

                    <div className="d-flex justify-content-center gap-3 mt-4">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowDeleteModal(false)}
                            disabled={deleting}
                        >
                            Отмена
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={handleDeleteDoctor}
                            disabled={deleting}
                        >
                            {deleting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Удаление...
                                </>
                            ) : 'Удалить врача'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DoctorsManagementPage;