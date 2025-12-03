// src/pages/ProfilePage.js
import React, { useState, useEffect } from 'react';
import '../styles/ProfilePage.css';
import {
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaEdit,
  FaCheck,
  FaTimes,
  FaInfoCircle
} from 'react-icons/fa';
import userService from '../services/userService';
import { getMyCreatedEvents } from '../services/eventService';
import MessageBanner from '../components/common/MessageBanner';
import { useTranslation } from 'react-i18next';

import avatarDefault from '../assets/avatars/avatar-default.jpg';
import avatar1 from '../assets/avatars/avatar-1.png';
import avatar2 from '../assets/avatars/avatar-2.png';
import avatar3 from '../assets/avatars/avatar-3.png';
import avatar4 from '../assets/avatars/avatar-4.png';
import avatar5 from '../assets/avatars/avatar-5.png';

// Opciones de avatar disponibles
const AVATAR_OPTIONS = [avatarDefault, avatar1, avatar2, avatar3, avatar4, avatar5];

export default function ProfilePage() {
  const { t, i18n } = useTranslation();

  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [banner, setBanner] = useState({ type: 'success', message: '' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Estado para el avatar seleccionado
  const [avatar, setAvatar] = useState(avatarDefault);

  // Color de fondo por defecto
  const DEFAULT_BG = '#f3f3f3';
  const [bgColor, setBgColor] = useState(DEFAULT_BG);

  // Helper para locale de fechas según idioma
  const getLocale = () => {
    if (i18n.language === 'en') return 'en-GB';
    if (i18n.language === 'ca' || i18n.language === 'cat') return 'ca-ES';
    return 'es-ES';
  };

  // Cargar datos del usuario + avatar desde localStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId');

        // Color de fondo desde localStorage
        const storedColor = localStorage.getItem('profileBgColor');
        if (storedColor) {
          setBgColor(storedColor);
        } else {
          localStorage.setItem('profileBgColor', DEFAULT_BG);
        }

        if (!userId) {
          setBanner({ type: 'error', message: t('profile.noUserLogged') });
          return;
        }

        // Carga de datos en paralelo
        const [profileResult, statsResult, createdEventsData] = await Promise.all([
          userService.getUserProfile(userId),
          userService.getUserStats(userId),
          getMyCreatedEvents()
        ]);

        // 1. Perfil
        if (profileResult.success) {
          const user = profileResult.data?.data ?? profileResult.data;
          setUserData(user);
          setEditData(user);
        } else {
          setBanner({ type: 'error', message: profileResult.error });
        }

        // 2. Estadísticas
        if (statsResult.success) {
          setStats(statsResult.data);
        }

        // 3. Eventos Creados
        setUserEvents(createdEventsData);

        // 4. Avatar desde localStorage
        const storedAvatar = localStorage.getItem('profileAvatar');
        if (storedAvatar) {
          setAvatar(storedAvatar);
        } else {
          setAvatar(avatarDefault);
          localStorage.setItem('profileAvatar', avatarDefault);
        }
      } catch (error) {
        console.error('Error cargando datos del usuario:', error);
        setBanner({
          type: 'error',
          message: t('profile.loadErrorWithMessage', {
            error: error.message || t('profile.unknownError')
          })
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...userData });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar nombre
    if (!editData.nombre?.trim()) {
      newErrors.nombre = t('profile.validation.firstNameRequired');
    } else if (editData.nombre.length < 2) {
      newErrors.nombre = t('profile.validation.firstNameMin');
    } else if (editData.nombre.length > 50) {
      newErrors.nombre = t('profile.validation.firstNameMax');
    }

    // Validar apellidos
    if (!editData.apellidos?.trim()) {
      newErrors.apellidos = t('profile.validation.lastNameRequired');
    } else if (editData.apellidos.length < 2) {
      newErrors.apellidos = t('profile.validation.lastNameMin');
    } else if (editData.apellidos.length > 100) {
      newErrors.apellidos = t('profile.validation.lastNameMax');
    }

    // Validar correo
    if (!editData.correo?.trim()) {
      newErrors.correo = t('profile.validation.emailRequired');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editData.correo)) {
        newErrors.correo = t('profile.validation.emailInvalid');
      }
    }

    // Validar fecha de nacimiento
    if (editData.fechaNacimiento) {
      const birthDate = new Date(editData.fechaNacimiento);
      const today = new Date();

      if (isNaN(birthDate.getTime())) {
        newErrors.fechaNacimiento = t('profile.validation.birthDateInvalid');
      } else {
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }

        if (age < 13) {
          newErrors.fechaNacimiento = t('profile.validation.tooYoung');
        } else if (age > 120) {
          newErrors.fechaNacimiento = t('profile.validation.tooOld');
        }

        if (birthDate > today) {
          newErrors.fechaNacimiento = t('profile.validation.birthDateFuture');
        }
      }
    }

    // Validar ciudad
    if (editData.ciudad && editData.ciudad.length > 100) {
      newErrors.ciudad = t('profile.validation.cityMax');
    }

    // Validar descripción
    if (editData.descripcion && editData.descripcion.length > 500) {
      newErrors.descripcion = t('profile.validation.descriptionMax');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setBanner({
        type: 'error',
        message: t('profile.validation.fixErrors')
      });
      setTimeout(() => setBanner({ type: 'success', message: '' }), 5000);
      return;
    }

    try {
      setSaving(true);
      const userId = localStorage.getItem('userId');

      const result = await userService.updateUserProfile(userId, editData);

      if (result.success) {
        const updated = result.data?.data ?? result.data;
        setUserData(updated);
        setEditData(updated);
        setIsEditing(false);

        if (updated.username) {
          localStorage.setItem('username', updated.username);
        }

        setBanner({ type: 'success', message: t('profile.updateSuccess') });
        setTimeout(() => setBanner({ type: 'success', message: '' }), 3000);
      } else {
        setBanner({ type: 'error', message: result.error });
        setTimeout(() => setBanner({ type: 'success', message: '' }), 5000);
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      setBanner({ type: 'error', message: t('profile.updateError') });
      setTimeout(() => setBanner({ type: 'success', message: '' }), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(userData);
    setIsEditing(false);
    setErrors({});
  };

  const handleChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Cambio de avatar (sólo entre opciones predefinidas)
  const handleAvatarChange = newAvatar => {
    setAvatar(newAvatar);
    localStorage.setItem('profileAvatar', newAvatar);
  };

  // Cambio de color de fondo
  const handleBgColorChange = newColor => {
    setBgColor(newColor);
    if (newColor === 'none') {
      localStorage.removeItem('profileBgColor');
    } else {
      localStorage.setItem('profileBgColor', newColor);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container" style={{ textAlign: 'center', padding: '50px' }}>
          <p>{t('profile.loading')}</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-page">
        <div className="profile-container" style={{ textAlign: 'center', padding: '50px' }}>
          <p>{t('profile.loadError')}</p>
        </div>
      </div>
    );
  }

  const fullName = `${userData.nombre} ${userData.apellidos}`;

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header con foto de perfil */}
        <div className="profile-header">
          <div className="profile-avatar-container">
            <div
              className="profile-avatar"
              style={{
                backgroundColor: bgColor === 'none' ? 'transparent' : bgColor,
                backgroundImage: 'none'
              }}
            >
              <img
                src={avatar}
                alt={t('profile.header.avatarAlt', { fullName })}
                className="profile-avatar-img"
              />
            </div>
          </div>
          <div className="profile-header-info">
            <h1>{fullName}</h1>
            <p className="profile-role">
              {t('profile.header.usernameLabel')}: {userData.username}
            </p>
            {!isEditing && (
              <button className="edit-profile-btn" onClick={handleEdit}>
                <FaEdit /> {t('profile.header.edit')}
              </button>
            )}
            {isEditing && (
              <div className="edit-actions">
                <button className="save-btn" onClick={handleSave} disabled={saving}>
                  <FaCheck /> {saving ? t('profile.header.saving') : t('profile.header.save')}
                </button>
                <button className="cancel-btn" onClick={handleCancel} disabled={saving}>
                  <FaTimes /> {t('profile.header.cancel')}
                </button>
              </div>
            )}

            {isEditing && (
              <div className="profile-section">
                <h2 className="section-title">{t('profile.header.bgColorTitle')}</h2>

                <div className="color-options">
                  {['none', '#f3f3f3', '#ffffff', '#d3e5ff', '#ef8325ff', '#4ee8f9ff', '#ca3593ff'].map(
                    (color, index) => (
                      <button
                        key={index}
                        type="button"
                        className="color-option-btn"
                        style={{
                          backgroundColor: color === 'none' ? 'transparent' : color,
                          border: bgColor === color ? '3px solid #007bff' : '2px solid #ccc'
                        }}
                        onClick={() => handleBgColorChange(color)}
                      />
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selector de avatar sólo en edición */}
        {isEditing && (
          <div className="profile-section">
            <h2 className="section-title">{t('profile.header.changeAvatarTitle')}</h2>
            <div className="avatar-options">
              {AVATAR_OPTIONS.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  className={`avatar-option-btn ${avatar === option ? 'selected' : ''}`}
                  onClick={() => handleAvatarChange(option)}
                >
                  <img
                    src={option}
                    alt={`Avatar ${index + 1}`}
                    className="avatar-option-img"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <div className="profile-content">
          {/* Información Personal */}
          <div className="profile-section">
            <h2 className="section-title">{t('profile.sections.personalInfo')}</h2>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-icon">
                  <FaUser />
                </div>
                <div className="info-content">
                  <label>{t('profile.fields.firstName')}</label>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={editData.nombre || ''}
                        onChange={e => handleChange('nombre', e.target.value)}
                        className={`input-field ${errors.nombre ? 'error' : ''}`}
                      />
                      {errors.nombre && <span className="error-message">{errors.nombre}</span>}
                    </>
                  ) : (
                    <p>{userData.nombre}</p>
                  )}
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <FaUser />
                </div>
                <div className="info-content">
                  <label>{t('profile.fields.lastName')}</label>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={editData.apellidos || ''}
                        onChange={e => handleChange('apellidos', e.target.value)}
                        className={`input-field ${errors.apellidos ? 'error' : ''}`}
                      />
                      {errors.apellidos && (
                        <span className="error-message">{errors.apellidos}</span>
                      )}
                    </>
                  ) : (
                    <p>{userData.apellidos}</p>
                  )}
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <FaEnvelope />
                </div>
                <div className="info-content">
                  <label>{t('profile.fields.email')}</label>
                  {isEditing ? (
                    <>
                      <input
                        type="email"
                        value={editData.correo || ''}
                        onChange={e => handleChange('correo', e.target.value)}
                        className={`input-field ${errors.correo ? 'error' : ''}`}
                      />
                      {errors.correo && <span className="error-message">{errors.correo}</span>}
                    </>
                  ) : (
                    <p>{userData.correo}</p>
                  )}
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <FaMapMarkerAlt />
                </div>
                <div className="info-content">
                  <label>{t('profile.fields.city')}</label>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={editData.ciudad || ''}
                        onChange={e => handleChange('ciudad', e.target.value)}
                        className={`input-field ${errors.ciudad ? 'error' : ''}`}
                      />
                      {errors.ciudad && <span className="error-message">{errors.ciudad}</span>}
                    </>
                  ) : (
                    <p>
                      {userData.ciudad || t('profile.fields.cityNotSpecified')}
                    </p>
                  )}
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <FaBirthdayCake />
                </div>
                <div className="info-content">
                  <label>{t('profile.fields.birthDate')}</label>
                  {isEditing ? (
                    <>
                      <input
                        type="date"
                        value={editData.fechaNacimiento || ''}
                        onChange={e => handleChange('fechaNacimiento', e.target.value)}
                        className={`input-field ${errors.fechaNacimiento ? 'error' : ''}`}
                        max={new Date().toISOString().split('T')[0]}
                        min={new Date(
                          new Date().getFullYear() - 120,
                          0,
                          1
                        )
                          .toISOString()
                          .split('T')[0]}
                      />
                      {errors.fechaNacimiento && (
                        <span className="error-message">
                          {errors.fechaNacimiento}
                        </span>
                      )}
                    </>
                  ) : (
                    <p>
                      {userData.fechaNacimiento
                        ? new Date(userData.fechaNacimiento).toLocaleDateString(
                            getLocale(),
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }
                          )
                        : t('profile.fields.birthDateNotSpecified')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="profile-section">
            <h2 className="section-title">
              <FaInfoCircle style={{ marginRight: '8px' }} />
              {t('profile.sections.description')}
            </h2>
            <div className="bio-section">
              {isEditing ? (
                <>
                  <textarea
                    value={editData.descripcion || ''}
                    onChange={e => handleChange('descripcion', e.target.value)}
                    className={`bio-textarea ${errors.descripcion ? 'error' : ''}`}
                    rows="6"
                    placeholder={t('profile.fields.descriptionPlaceholder')}
                    maxLength="500"
                  />
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '8px'
                    }}
                  >
                    {errors.descripcion && (
                      <span className="error-message">{errors.descripcion}</span>
                    )}
                    <span
                      style={{
                        fontSize: '12px',
                        color: '#666',
                        marginLeft: 'auto'
                      }}
                    >
                      {(editData.descripcion || '').length} / 500
                    </span>
                  </div>
                </>
              ) : (
                <p className="bio-text">
                  {userData.descripcion || t('profile.fields.noDescription')}
                </p>
              )}
            </div>
          </div>

          {/* Idiomas */}
          {userData.languages && userData.languages.length > 0 && (
            <div className="profile-section">
              <h2 className="section-title">{t('profile.sections.languages')}</h2>
              <div className="tags-section">
                {userData.languages.map((language, index) => (
                  <span key={index} className="tag tag-language">
                    {language}
                  </span>
                ))}
                {isEditing && (
                  <button
                    className="add-tag-btn"
                    title={t('profile.languages.addLanguage')}
                  >
                    + {t('profile.languages.add')}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Eventos Creados */}
          {userEvents && userEvents.length > 0 && (
            <div className="profile-section">
              <h2 className="section-title">
                {t('profile.sections.createdEvents', {
                  count: userEvents.length
                })}
              </h2>
              <div className="user-events-grid">
                {userEvents.map(event => (
                  <div key={event.id} className="user-event-card">
                    {event.imageUrl && (
                      <div className="event-image">
                        <img src={event.imageUrl} alt={event.name} />
                      </div>
                    )}
                    <div className="event-content">
                      <h3 className="event-title">{event.name}</h3>
                      <p className="event-location">{event.location}</p>
                      <div className="event-info">
                        <span className="event-date">
                          {(() => {
                            if (!event.startDate)
                              return t('profile.events.dateNotAvailable');
                            const date = new Date(event.startDate);
                            if (isNaN(date.getTime()))
                              return t('profile.events.dateNotAvailable');
                            return date.toLocaleDateString(getLocale(), {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            });
                          })()}
                        </span>
                        <span className="event-participants">
                          {t('profile.events.participants', {
                            current: event.participants.length,
                            capacity: event.capacity
                          })}
                        </span>
                      </div>
                      <p className="event-description">{event.description}</p>
                      {event.languages && event.languages.length > 0 && (
                        <div className="event-languages">
                          {event.languages.map(lang => (
                            <span key={lang} className="language-tag">
                              {lang.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          {stats && (
            <div className="profile-stats">
              <div className="stat-item">
                <div className="stat-number">{stats.enrolledEvents}</div>
                <div className="stat-label">
                  {t('profile.stats.enrolledEvents')}
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.organizedEvents}</div>
                <div className="stat-label">
                  {t('profile.stats.organizedEvents')}
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.ratings}</div>
                <div className="stat-label">
                  {t('profile.stats.ratings')}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {banner.message && (
        <MessageBanner type={banner.type} message={banner.message} />
      )}
    </div>
  );
}
