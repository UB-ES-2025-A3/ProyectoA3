import React, { useState, useEffect, useCallback } from 'react';
import userService from '../../services/userService';
import './UserProfileModal.css';

export default function UserProfileModal({ userId, isOpen, onClose }) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadUserProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await userService.getUserProfile(userId);
      if (result.success) {
        setUserProfile(result.data);
      } else {
        setError(result.error || 'Error al cargar el perfil del usuario');
      }
    } catch (err) {
      setError('Error al cargar el perfil del usuario');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen && userId) {
      loadUserProfile();
    } else {
      setUserProfile(null);
      setError(null);
    }
  }, [isOpen, userId, loadUserProfile]);

  const calculateAge = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;
    const birthDate = new Date(fechaNacimiento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getLanguageInfo = (langCode) => {
    const langInfo = {
      es: { name: 'Español', flagCode: 'es' },
      en: { name: 'Inglés', flagCode: 'gb' },
      fr: { name: 'Francés', flagCode: 'fr' },
      de: { name: 'Alemán', flagCode: 'de' },
      it: { name: 'Italiano', flagCode: 'it' },
      pt: { name: 'Portugués', flagCode: 'pt' },
      ru: { name: 'Ruso', flagCode: 'ru' },
      ca: { name: 'Catalán', flagCode: 'es' },
      nl: { name: 'Holandés', flagCode: 'nl' },
      pl: { name: 'Polaco', flagCode: 'pl' },
      ja: { name: 'Japonés', flagCode: 'jp' },
      zh: { name: 'Chino', flagCode: 'cn' },
      ar: { name: 'Árabe', flagCode: 'sa' }
    };
    const code = String(langCode).trim().toLowerCase();
    return langInfo[code] || { name: code.toUpperCase(), flagCode: 'un' };
  };

  const normalizeLanguages = (idiomas) => {
    if (!idiomas) return [];
    
    // Normalizar: puede venir como array, string, o null
    let idiomasArray = [];
    if (Array.isArray(idiomas)) {
      idiomasArray = idiomas.filter(lang => lang && String(lang).trim() !== '');
    } else if (typeof idiomas === 'string' && idiomas.trim() !== '') {
      // Si viene como string separado por comas
      idiomasArray = idiomas.split(',').map(lang => lang.trim()).filter(lang => lang !== '');
    }
    
    return idiomasArray.map(lang => getLanguageInfo(String(lang).trim()));
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const initials = userProfile
    ? `${userProfile.nombre?.[0] || ''}${userProfile.apellidos?.[0] || ''}`.toUpperCase()
    : '?';

  return (
    <div className="user-profile-modal-backdrop" onClick={handleBackdropClick}>
      <div className="user-profile-modal-content">
        <button className="user-profile-modal-close" onClick={onClose}>
          ✕
        </button>

        {loading ? (
          <div className="user-profile-loading">
            <div className="loading-spinner"></div>
            <p>Cargando perfil...</p>
          </div>
        ) : error ? (
          <div className="user-profile-error">
            <p>{error}</p>
            <button className="btn btn-primary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        ) : userProfile ? (
          <>
            <div className="user-profile-header">
              <div className="user-profile-avatar-large">
                {initials || '?'}
              </div>
              <h2 className="user-profile-name">
                {userProfile.nombre} {userProfile.apellidos}
              </h2>
              <p className="user-profile-username">@{userProfile.username}</p>
            </div>

            <div className="user-profile-body">
              <div className="user-profile-section">
                <h3>Información Personal</h3>
                <div className="user-profile-info-grid">
                  {userProfile.ciudad && (
                    <div className="user-profile-info-item">
                      <span className="info-icon">📍</span>
                      <div>
                        <strong>Ciudad</strong>
                        <p>{userProfile.ciudad}</p>
                      </div>
                    </div>
                  )}

                  {userProfile.fechaNacimiento && calculateAge(userProfile.fechaNacimiento) && (
                    <div className="user-profile-info-item">
                      <span className="info-icon">🎂</span>
                      <div>
                        <strong>Edad</strong>
                        <p>{calculateAge(userProfile.fechaNacimiento)} años</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {(() => {
                // Normalizar idioma: puede venir como idioma o idiomas, array o null
                const idiomas = userProfile.idioma || userProfile.idiomas;
                const languagesList = normalizeLanguages(idiomas);
                
                return languagesList.length > 0 ? (
                  <div className="user-profile-section">
                    <h3>Idiomas</h3>
                    <ul className="user-profile-languages-list">
                      {languagesList.map((lang, index) => (
                        <li key={index} className="user-profile-language-item">
                          <img 
                            src={`https://flagcdn.com/w20/${lang.flagCode}.png`}
                            alt={`Bandera ${lang.name}`}
                            className="language-flag-icon"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <span className="language-name">{lang.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null;
              })()}

              {userProfile.descripcion && (
                <div className="user-profile-section">
                  <h3>Descripción</h3>
                  <p className="user-profile-description">{userProfile.descripcion}</p>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

