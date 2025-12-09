import React, { useState, useEffect, useCallback } from 'react';
import userService from '../../services/userService';
import './UserProfileModal.css';
import { useTranslation } from 'react-i18next';

import avatarDefault from "../../assets/avatars/avatar-default.jpg";
import avatar1 from "../../assets/avatars/avatar-1.png";
import avatar2 from "../../assets/avatars/avatar-2.png";
import avatar3 from "../../assets/avatars/avatar-3.png";
import avatar4 from "../../assets/avatars/avatar-4.png";
import avatar5 from "../../assets/avatars/avatar-5.png";

const AVATAR_OPTIONS = [avatar1, avatar2, avatar3, avatar4, avatar5, avatarDefault];

const getAvatarForUser = (userKey) => {
  if (!userKey) return avatarDefault;

  const idStr = userKey.toString();
  let sum = 0;

  for (let i = 0; i < idStr.length; i++) {
    sum += idStr.charCodeAt(i);
  }

  const index = sum % AVATAR_OPTIONS.length;
  return AVATAR_OPTIONS[index];
};

// Solo mapeamos código de idioma → flag
const LANGUAGE_FLAG_MAP = {
  es: 'es',
  en: 'gb',
  fr: 'fr',
  de: 'de',
  it: 'it',
  pt: 'pt',
  ru: 'ru',
  ca: 'es',
  nl: 'nl',
  pl: 'pl',
  ja: 'jp',
  zh: 'cn',
  ar: 'sa'
};

const getLanguageInfo = (langCode) => {
  const code = String(langCode).trim().toLowerCase();
  return {
    code,
    flagCode: LANGUAGE_FLAG_MAP[code] || 'un'
  };
};

const normalizeLanguages = (idiomas) => {
  if (!idiomas) return [];
  
  let idiomasArray = [];
  if (Array.isArray(idiomas)) {
    idiomasArray = idiomas.filter(lang => lang && String(lang).trim() !== '');
  } else if (typeof idiomas === 'string' && idiomas.trim() !== '') {
    idiomasArray = idiomas.split(',').map(lang => lang.trim()).filter(lang => lang !== '');
  }
  
  return idiomasArray.map(lang => getLanguageInfo(String(lang).trim()));
};

export default function UserProfileModal({ userId, isOpen, onClose }) {
  const { t } = useTranslation();

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
        setError(result.error || t("UserProfile.loadError"));
      }
    } catch (err) {
      setError(t("UserProfile.loadError"));
    } finally {
      setLoading(false);
    }
  }, [userId, t]);

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

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const initials = userProfile
    ? `${userProfile.nombre?.[0] || ''}${userProfile.apellidos?.[0] || ''}`.toUpperCase()
    : '?';

  const avatar = userProfile
    ? getAvatarForUser(userProfile.id || userId || userProfile.username)
    : avatarDefault;

  return (
    <div className="user-profile-modal-backdrop" onClick={handleBackdropClick}>
      <div className="user-profile-modal-content">
        <button className="user-profile-modal-close" onClick={onClose}>
          ✕
        </button>

        {loading ? (
          <div className="user-profile-loading">
            <div className="loading-spinner"></div>
            <p>{t("UserProfile.loading")}</p>
          </div>
        ) : error ? (
          <div className="user-profile-error">
            <p>{error}</p>
            <button className="btn btn-primary" onClick={onClose}>
              {t("UserProfile.closeButton")}
            </button>
          </div>
        ) : userProfile ? (
          <>
            <div className="user-profile-header">
              <div className="user-profile-avatar-large">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={`${userProfile.nombre} ${userProfile.apellidos}`}
                    className="user-profile-avatar-img"
                  />
                ) : (
                  initials || "?"
                )}
              </div>
              <h2 className="user-profile-name">
                {userProfile.nombre} {userProfile.apellidos}
              </h2>
              <p className="user-profile-username">@{userProfile.username}</p>
            </div>

            <div className="user-profile-body">
              <div className="user-profile-section">
                <h3>{t("UserProfile.sections.personalInfo")}</h3>
                <div className="user-profile-info-grid">
                  {userProfile.ciudad && (
                    <div className="user-profile-info-item">
                      <span className="info-icon">📍</span>
                      <div>
                        <strong>{t("UserProfile.fields.city")}</strong>
                        <p>{userProfile.ciudad}</p>
                      </div>
                    </div>
                  )}

                  {userProfile.fechaNacimiento && calculateAge(userProfile.fechaNacimiento) && (
                    <div className="user-profile-info-item">
                      <span className="info-icon">🎂</span>
                      <div>
                        <strong>{t("UserProfile.fields.age")}</strong>
                        <p>
                          {calculateAge(userProfile.fechaNacimiento)}{" "}
                          {t("UserProfile.ageSuffix")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {(() => {
                const idiomas = userProfile.idioma || userProfile.idiomas;
                const languagesList = normalizeLanguages(idiomas);
                
                return languagesList.length > 0 ? (
                  <div className="user-profile-section">
                    <h3>{t("UserProfile.sections.languages")}</h3>
                    <ul className="user-profile-languages-list">
                      {languagesList.map((lang, index) => {
                        const key = `Register.languages.${lang.code}`;
                        let languageName = t(key);
                        // Si no existe la key, mostramos el código en mayúsculas
                        if (languageName === key) {
                          languageName = lang.code.toUpperCase();
                        }

                        return (
                          <li key={index} className="user-profile-language-item">
                            <img 
                              src={`https://flagcdn.com/w20/${lang.flagCode}.png`}
                              alt={languageName}
                              className="language-flag-icon"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <span className="language-name">{languageName}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null;
              })()}

              {userProfile.descripcion && (
                <div className="user-profile-section">
                  <h3>{t("UserProfile.sections.description")}</h3>
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
