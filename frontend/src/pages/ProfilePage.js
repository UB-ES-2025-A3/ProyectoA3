import React, { useState, useEffect } from 'react';
import '../styles/ProfilePage.css';
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaBirthdayCake, FaEdit, FaCheck, FaTimes, FaInfoCircle } from 'react-icons/fa';
import userService from '../services/userService';
import { getMyCreatedEvents } from '../services/eventService';
import MessageBanner from '../components/common/MessageBanner';

// 👇 IMPORTA AQUÍ TUS IMÁGENES DE AVATAR
// Asegúrate de crear estos archivos o adaptar las rutas a las que tú tengas
import avatarDefault from '../assets/avatars/avatar-default.jpg';
// import avatar1 from '../assets/avatars/avatar-1.jpg';
// import avatar2 from '../assets/avatars/avatar-2.jpg';
// import avatar3 from '../assets/avatars/avatar-3.jpg';

import avatar1 from '../assets/avatars/avatar-1.png';
import avatar2 from '../assets/avatars/avatar-2.png';
import avatar3 from '../assets/avatars/avatar-3.png';
import avatar4 from '../assets/avatars/avatar-4.png';
import avatar5 from '../assets/avatars/avatar-5.png';

// 👇 Opciones de avatar disponibles
const AVATAR_OPTIONS = [avatarDefault, avatar1, avatar2, avatar3, avatar4, avatar5];

export default function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [banner, setBanner] = useState({ type: "success", message: "" });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // 👇 Estado para el avatar seleccionado
  const [avatar, setAvatar] = useState(avatarDefault);

  // *** NUEVO: COLOR DE FONDO ***
  const DEFAULT_BG = "#f3f3f3";
  const [bgColor, setBgColor] = useState(DEFAULT_BG);

  // Cargar datos del usuario + avatar desde localStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId');

        // *** NUEVO: COLOR DE FONDO ***
        const storedColor = localStorage.getItem('profileBgColor');
        if (storedColor) {
          setBgColor(storedColor);
        } else {
          localStorage.setItem('profileBgColor', DEFAULT_BG);
        }

        
        if (!userId) {
          setBanner({ type: "error", message: "No hay usuario logueado" });
          return;
        }

        // --- Carga de datos en paralelo ---
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
          setBanner({ type: "error", message: profileResult.error });
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
          // si no había nada guardado, dejamos el avatar por defecto y lo guardamos
          setAvatar(avatarDefault);
          localStorage.setItem('profileAvatar', avatarDefault);
        }

      } catch (error) {
        console.error('Error cargando datos del usuario:', error);
        setBanner({ type: "error", message: `Error al cargar los datos: ${error.message || 'Error desconocido'}` });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
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
      newErrors.nombre = 'El nombre es requerido';
    } else if (editData.nombre.length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    } else if (editData.nombre.length > 50) {
      newErrors.nombre = 'El nombre no puede tener más de 50 caracteres';
    }

    // Validar apellidos
    if (!editData.apellidos?.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos';
    } else if (editData.apellidos.length < 2) {
      newErrors.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
    } else if (editData.apellidos.length > 100) {
      newErrors.apellidos = 'Los apellidos no pueden tener más de 100 caracteres';
    }

    // Validar correo
    if (!editData.correo?.trim()) {
      newErrors.correo = 'El correo electrónico es requerido';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editData.correo)) {
        newErrors.correo = 'El correo electrónico no es válido';
      }
    }

    // Validar fecha de nacimiento
    if (editData.fechaNacimiento) {
      const birthDate = new Date(editData.fechaNacimiento);
      const today = new Date();
      
      // Verificar que la fecha es válida
      if (isNaN(birthDate.getTime())) {
        newErrors.fechaNacimiento = 'La fecha de nacimiento no es válida';
      } else {
        // Calcular edad
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }

        // Validar edad mínima (13 años) y máxima (120 años)
        if (age < 13) {
          newErrors.fechaNacimiento = 'Debes tener al menos 13 años para usar esta plataforma';
        } else if (age > 120) {
          newErrors.fechaNacimiento = 'La fecha de nacimiento no parece válida';
        }

        // Validar que no sea una fecha futura
        if (birthDate > today) {
          newErrors.fechaNacimiento = 'La fecha de nacimiento no puede ser en el futuro';
        }
      }
    }

    // Validar ciudad (opcional pero con límite)
    if (editData.ciudad && editData.ciudad.length > 100) {
      newErrors.ciudad = 'El nombre de la ciudad no puede tener más de 100 caracteres';
    }

    // Validar descripción (opcional pero con límite)
    if (editData.descripcion && editData.descripcion.length > 500) {
      newErrors.descripcion = 'La descripción no puede tener más de 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    // Validar formulario antes de guardar
    if (!validateForm()) {
      setBanner({ type: "error", message: "Por favor, corrige los errores en el formulario" });
      setTimeout(() => setBanner({ type: "success", message: "" }), 5000);
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

        setBanner({ type: "success", message: "Perfil actualizado correctamente" });
        setTimeout(() => setBanner({ type: "success", message: "" }), 3000);
      } else {
        setBanner({ type: "error", message: result.error });
        setTimeout(() => setBanner({ type: "success", message: "" }), 5000);
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      setBanner({ type: "error", message: "Error al actualizar el perfil" });
      setTimeout(() => setBanner({ type: "success", message: "" }), 5000);
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
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // 👇 Cambio de avatar (sólo entre opciones predefinidas)
  const handleAvatarChange = (newAvatar) => {
    setAvatar(newAvatar);
    localStorage.setItem('profileAvatar', newAvatar);
  };
  
  // *** NUEVO: COLOR DE FONDO ***
const handleBgColorChange = (newColor) => {
  setBgColor(newColor);
  if (newColor === "none") {
    localStorage.removeItem("profileBgColor"); // quitar valor
  } else {
    localStorage.setItem("profileBgColor", newColor);
  }
};



  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container" style={{ textAlign: 'center', padding: '50px' }}>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-page">
        <div className="profile-container" style={{ textAlign: 'center', padding: '50px' }}>
          <p>No se pudo cargar el perfil del usuario</p>
        </div>
      </div>
    );
  }

  const fullName = `${userData.nombre} ${userData.apellidos}`;

  return (
    <div className="profile-page">
      <div className="profile-container" >
        {/* Header with Profile Picture */}
        <div className="profile-header" >
          <div className="profile-avatar-container" >
            {/* 👇 AQUÍ CAMBIAMOS LA LETRA POR LA IMAGEN */}
            <div
              className="profile-avatar"
              style={{
                backgroundColor: bgColor === "none" ? "transparent" : bgColor,
                backgroundImage: "none"
              }}
            >
              <img
                src={avatar}
                alt={`Avatar de ${fullName}`}
                className="profile-avatar-img"
              />
            </div>


          </div>
          <div className="profile-header-info" >
            <h1>{fullName}</h1>
            <p className="profile-role">Usuario: {userData.username}</p>
            {!isEditing && (
              <button className="edit-profile-btn" onClick={handleEdit}>
                <FaEdit /> Editar Perfil
              </button>
            )}
            {isEditing && (
              <div className="edit-actions">
                <button className="save-btn" onClick={handleSave} disabled={saving}>
                  <FaCheck /> {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button className="cancel-btn" onClick={handleCancel} disabled={saving}>
                  <FaTimes /> Cancelar
                </button>
              </div>
            )}

            {isEditing && (
        <div className="profile-section" >
          <h2 className="section-title">Color de fondo</h2>

          <div className="color-options">
            {["none","#f3f3f3", "#ffffff", "#d3e5ff", "#ef8325ff", "#4ee8f9ff", "#ca3593ff"].map((color, index) => (
              <button
                key={index}
                type="button"
                className="color-option-btn"
                style={{
                  backgroundColor: color === "none" ? "transparent" : color,
                  border: bgColor === color ? "3px solid #007bff" : "2px solid #ccc"
                }}
                onClick={() => handleBgColorChange(color)}
              />

            ))}
          </div>
        </div>
      )}

          </div>
        </div>

        {/* 👇 Selector de avatar sólo cuando está en modo edición */}
        {isEditing && (
          <div className="profile-section">
            <h2 className="section-title">Cambiar avatar</h2>
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

        {/* Main Profile Content */}
        <div className="profile-content">
          {/* Información Personal */}
          <div className="profile-section">
            <h2 className="section-title">Información Personal</h2>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-icon">
                  <FaUser />
                </div>
                <div className="info-content">
                  <label>Nombre</label>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={editData.nombre || ''}
                        onChange={(e) => handleChange('nombre', e.target.value)}
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
                  <label>Apellidos</label>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={editData.apellidos || ''}
                        onChange={(e) => handleChange('apellidos', e.target.value)}
                        className={`input-field ${errors.apellidos ? 'error' : ''}`}
                      />
                      {errors.apellidos && <span className="error-message">{errors.apellidos}</span>}
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
                  <label>Correo Electrónico</label>
                  {isEditing ? (
                    <>
                      <input
                        type="email"
                        value={editData.correo || ''}
                        onChange={(e) => handleChange('correo', e.target.value)}
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
                  <label>Ciudad</label>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={editData.ciudad || ''}
                        onChange={(e) => handleChange('ciudad', e.target.value)}
                        className={`input-field ${errors.ciudad ? 'error' : ''}`}
                      />
                      {errors.ciudad && <span className="error-message">{errors.ciudad}</span>}
                    </>
                  ) : (
                    <p>{userData.ciudad || 'No especificada'}</p>
                  )}
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <FaBirthdayCake />
                </div>
                <div className="info-content">
                  <label>Fecha de Nacimiento</label>
                  {isEditing ? (
                    <>
                      <input
                        type="date"
                        value={editData.fechaNacimiento || ''}
                        onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
                        className={`input-field ${errors.fechaNacimiento ? 'error' : ''}`}
                        max={new Date().toISOString().split('T')[0]}
                        min={new Date(new Date().getFullYear() - 120, 0, 1).toISOString().split('T')[0]}
                      />
                      {errors.fechaNacimiento && <span className="error-message">{errors.fechaNacimiento}</span>}
                    </>
                  ) : (
                    <p>{userData.fechaNacimiento ? new Date(userData.fechaNacimiento).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'No especificada'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="profile-section">
            <h2 className="section-title">
              <FaInfoCircle style={{ marginRight: '8px' }} />
              Descripción
            </h2>
            <div className="bio-section">
              {isEditing ? (
                <>
                  <textarea
                    value={editData.descripcion || ''}
                    onChange={(e) => handleChange('descripcion', e.target.value)}
                    className={`bio-textarea ${errors.descripcion ? 'error' : ''}`}
                    rows="6"
                    placeholder="Cuéntanos un poco sobre ti..."
                    maxLength="500"
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                    {errors.descripcion && <span className="error-message">{errors.descripcion}</span>}
                    <span style={{ fontSize: '12px', color: '#666', marginLeft: 'auto' }}>
                      {(editData.descripcion || '').length} / 500
                    </span>
                  </div>
                </>
              ) : (
                <p className="bio-text">{userData.descripcion || 'No hay descripción disponible'}</p>
              )}
            </div>
          </div>

          {/* Idiomas */}
          {userData.languages && userData.languages.length > 0 && (
            <div className="profile-section">
              <h2 className="section-title">Idiomas</h2>
              <div className="tags-section">
                {userData.languages.map((language, index) => (
                  <span key={index} className="tag tag-language">
                    {language}
                  </span>
                ))}
                {isEditing && (
                  <button className="add-tag-btn" title="Agregar idioma">
                    + Agregar
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Eventos Creados */}
          {userEvents && userEvents.length > 0 && (
            <div className="profile-section">
              <h2 className="section-title">Mis Eventos Creados ({userEvents.length})</h2>
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
                            if (!event.startDate) return "Fecha no disponible";
                            const date = new Date(event.startDate);
                            if (isNaN(date.getTime())) return "Fecha no disponible";
                            return date.toLocaleDateString('es-ES', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            });
                          })()}
                        </span>
                        <span className="event-participants">
                          {event.participants.length} / {event.capacity} participantes
                        </span>
                      </div>
                      <p className="event-description">{event.description}</p>
                      {event.languages && event.languages.length > 0 && (
                        <div className="event-languages">
                          {event.languages.map(lang => (
                            <span key={lang} className="language-tag">{lang.toUpperCase()}</span>
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
                <div className="stat-label">Eventos Apuntados</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.organizedEvents}</div>
                <div className="stat-label">Eventos Organizados</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.ratings}</div>
                <div className="stat-label">Valoraciones</div>
              </div>
            </div>
          )}
        </div>
      </div>
      {banner.message && <MessageBanner type={banner.type} message={banner.message} />}
    </div>
  );
}
