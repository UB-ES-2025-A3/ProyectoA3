import React, { useState, useEffect } from 'react';
import '../styles/ProfilePage.css';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBirthdayCake, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import userService from '../services/userService';
import MessageBanner from '../components/common/MessageBanner';

export default function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [banner, setBanner] = useState({ type: "success", message: "" });
  const [saving, setSaving] = useState(false);

  // Cargar datos del usuario
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
          setBanner({ type: "error", message: "No hay usuario logueado" });
          return;
        }

        // Cargar perfil
        const profileResult = await userService.getUserProfile(userId);
        if (profileResult.success) {
          // Normaliza: algunos servicios devuelven { data: {...} } y otros devuelven el objeto directamente
          const user = profileResult.data?.data ?? profileResult.data;
          setUserData(user);
          setEditData(user);
        } else {
          setBanner({ type: "error", message: profileResult.error });
        }

        // Cargar estadísticas
        const statsResult = await userService.getUserStats(userId);
        if (statsResult.success) {
          setStats(statsResult.data);
        }

        // Cargar eventos creados
        const eventsResult = await userService.getCreatedEvents(userId);
        if (eventsResult.success) {
          setUserEvents(eventsResult.data);
        }
      } catch (error) {
        console.error('Error cargando datos del usuario:', error);
        setBanner({ type: "error", message: "Error al cargar los datos del usuario" });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...userData });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const userId = localStorage.getItem('userId');

      const result = await userService.updateUserProfile(userId, editData);

      if (result.success) {
        // Normaliza respuesta y actualiza estado
        const updated = result.data?.data ?? result.data;
        setUserData(updated);
        setEditData(updated);
        setIsEditing(false);

        // Actualiza username en localStorage si ha cambiado (opcional)
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
  };

  const handleChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
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
      <div className="profile-container">
        {/* Header with Profile Picture */}
        <div className="profile-header">
          <div className="profile-avatar-container">
            <div className="profile-avatar">
              {userData.nombre.charAt(0).toUpperCase()}
            </div>
            <button className="avatar-edit-btn" title="Cambiar foto">
              <FaEdit />
            </button>
          </div>
          <div className="profile-header-info">
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
          </div>
        </div>

        {/* Main Profile Content */}
        <div className="profile-content">
          {/* Personal Information */}
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
                    <input
                      type="text"
                      value={editData.nombre || ''}
                      onChange={(e) => handleChange('nombre', e.target.value)}
                      className="input-field"
                    />
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
                    <input
                      type="text"
                      value={editData.apellidos || ''}
                      onChange={(e) => handleChange('apellidos', e.target.value)}
                      className="input-field"
                    />
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
                    <input
                      type="email"
                      value={editData.correo || ''}
                      onChange={(e) => handleChange('correo', e.target.value)}
                      className="input-field"
                    />
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
                    <input
                      type="text"
                      value={editData.ciudad || ''}
                      onChange={(e) => handleChange('ciudad', e.target.value)}
                      className="input-field"
                    />
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
                    <input
                      type="date"
                      value={editData.fechaNacimiento || ''}
                      onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
                      className="input-field"
                    />
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

          {/* Bio Section */}
          <div className="profile-section">
            <h2 className="section-title">Sobre Mí</h2>
            <div className="bio-section">
              {isEditing ? (
                <textarea
                  value={editData.bio || ''}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  className="bio-textarea"
                  rows="4"
                  placeholder="Cuéntanos un poco sobre ti..."
                />
              ) : (
                <p className="bio-text">{userData.bio || 'No hay descripción disponible'}</p>
              )}
            </div>
          </div>

          {/* Languages Section */}
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

          {/* User Created Events Section */}
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

          {/* Stats Section */}
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
