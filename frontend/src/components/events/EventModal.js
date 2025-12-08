// src/components/events/EventModal.js
import React, { useState, useEffect, useCallback } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import "./EventModal.css";
import userService from "../../services/userService";
import {
  isEventFavorite,
  addEventToFavorites,
  removeEventFromFavorites
} from "../../services/eventService";
import UserProfileModal from "../users/UserProfileModal";
import { useTranslation } from "react-i18next";

import avatarDefault from "../../assets/avatars/avatar-default.jpg";
import avatar1 from "../../assets/avatars/avatar-1.png";
import avatar2 from "../../assets/avatars/avatar-2.png";
import avatar3 from "../../assets/avatars/avatar-3.png";
import avatar4 from "../../assets/avatars/avatar-4.png";
import avatar5 from "../../assets/avatars/avatar-5.png";

const AVATAR_OPTIONS = [avatar1, avatar2, avatar3, avatar4, avatar5, avatarDefault];

const getAvatarForUser = (userId) => {
  if (!userId) return avatarDefault;
  const idStr = userId.toString();
  let sum = 0;
  for (let i = 0; i < idStr.length; i++) sum += idStr.charCodeAt(i);
  return AVATAR_OPTIONS[sum % AVATAR_OPTIONS.length];
};

export default function EventModal({
  event,
  isOpen,
  onClose,
  isEnrolled,
  isFull,
  onJoin,
  onLeave
}) {
  const { t, i18n } = useTranslation();

  console.log("[EventModal] i18n.language =", i18n.language);

  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [, setCreatorInfo] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
  };

  const notifyFavoritesUpdated = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("favoritesUpdated"));
    }
  };

  // Verificar si el usuario está autenticado
  const isAuthenticated = useCallback(() => {
    return !!localStorage.getItem("userId");
  }, []);

  // Cargar estado de favorito desde la API
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      if (event?.id && isAuthenticated()) {
        try {
          const favorite = await isEventFavorite(event.id);
          setIsFavorite(favorite);
        } catch (error) {
          console.error("Error al verificar favorito:", error);
          setIsFavorite(false);
        }
      } else {
        setIsFavorite(false);
      }
    };

    if (isOpen) {
      loadFavoriteStatus();
    }
  }, [event?.id, isOpen, isAuthenticated]);

  // Cargar info de participantes (useCallback + useEffect con deps correctas)
  const loadParticipantsInfo = useCallback(async () => {
    if (!event) {
      setParticipants([]);
      return;
    }

    setLoadingParticipants(true);
    try {
      const participantIds = event.participants || [];
      if (participantIds.length === 0) {
        setParticipants([]);
        setLoadingParticipants(false);
        return;
      }

      const result = await userService.getParticipantsByIds(participantIds);

      if (result.success) {
        setParticipants(result.data);
        if (event.creatorId) {
          const creatorResult = await userService.getUserProfile(event.creatorId);
          if (creatorResult.success) {
            setCreatorInfo(creatorResult.data);
          }
        }
      } else {
        setParticipants([]);
      }
    } catch {
      setParticipants([]);
    } finally {
      setLoadingParticipants(false);
    }
  }, [event]);

  useEffect(() => {
    if (isOpen && event?.participants?.length > 0) {
      loadParticipantsInfo();
    } else {
      setParticipants([]);
    }
  }, [isOpen, event, loadParticipantsInfo]);

  const toggleFavorite = async () => {
    if (!event?.id) return;

    // Verificar si el usuario está autenticado
    if (!isAuthenticated()) {
      alert(t("EventModal.favorite.mustLogin"));
      return;
    }

    setLoadingFavorite(true);

    try {
      if (isFavorite) {
        const result = await removeEventFromFavorites(event.id);
        if (result.success) {
          setIsFavorite(false);
          notifyFavoritesUpdated();
        } else {
          console.error("Error al eliminar de favoritos:", result.error);
        }
      } else {
        const result = await addEventToFavorites(event.id);
        if (result.success) {
          setIsFavorite(true);
          notifyFavoritesUpdated();
        } else {
          console.error("Error al añadir a favoritos:", result.error);
        }
      }
    } catch (error) {
      console.error("Error al cambiar favorito:", error);
    } finally {
      setLoadingFavorite(false);
    }
  };

  if (!isOpen || !event) return null;

  const rawLang = i18n.language || "es";
  const baseLang = rawLang.split("-")[0]; // "es-ES" -> "es", "ca-ES" -> "ca", "cat" -> "cat"

  // si en tu config usas "cat" como código, lo mapeamos a "ca"
  const lang = baseLang === "cat" ? "ca" : baseLang;

  // Elegir locale según el idioma actual de i18n
  const localeMap = {
    es: "es-ES",
    ca: "ca-ES",
    en: "en-GB",
    fr: "fr-FR",
    de: "de-DE",
    it: "it-IT",
    pt: "pt-PT",
    ru: "ru-RU"
  };
  const locale = localeMap[lang] || "es-ES";

  console.log("[EventModal] rawLang =", rawLang, "| baseLang =", baseLang, "| lang =", lang, "| locale =", locale);

  let start = t("EventModal.dateFallback");
  if (event.startDate) {
    const date = new Date(event.startDate);
    if (!isNaN(date.getTime())) {
      start = date.toLocaleString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    }
  }

  const currentParticipants = event.participants?.length || 0;
  const availableSpots = event.capacity - currentParticipants;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className={`modal-wrapper ${isChatOpen ? "isChatOpen" : ""}`}>
        <div className={`chat-panel ${isChatOpen ? "open" : ""}`}>
          <header className="chat-header">
            <h2>Chat</h2>
          </header>

          <div className="chat-messages">

            {/*ESTO ES UNA PRUEBA DE CHAT*/}

            <div className="message user">
              <div className="bubble">Hola, ¿qué tal?</div>
              <img className="avatarUsuario" src={getAvatarForUser(localStorage.getItem("userId"))} alt=""/>
            </div>

            <div className="message notUser">
              {/*Anañir imagen de perfil*/}
              <div className="bubble">Todo bien, ¿y tú?</div>
            </div>


          </div>

          <div className="chat-input-area">
            <input
                type="text"
                placeholder="Escribe un mensaje…"
                className="chat-input"
            />
            <button className="chat-send">Enviar</button>
          </div>
        </div>
        <div className="modal-content">
          {isEnrolled && (
              <button className="chat-floating-btn" onClick={toggleChat}>
                💬
              </button>
          )}
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>

          <button
              className={`modal-favorite-btn ${loadingFavorite ? "loading" : ""}`}
              onClick={toggleFavorite}
              disabled={loadingFavorite}
              aria-label={
                isFavorite
                    ? t("EventModal.aria.removeFavorite")
                    : t("EventModal.aria.addFavorite")
              }
              title={
                !isAuthenticated()
                    ? t("EventModal.aria.loginToFavorite")
                    : isFavorite
                        ? t("EventModal.aria.removeFavorite")
                        : t("EventModal.aria.addFavorite")
              }
          >
            {loadingFavorite ? (
                <span className="favorite-loading">⏳</span>
            ) : isFavorite ? (
                <FaBookmark className="favorite-icon favorite-icon-filled"/>
            ) : (
                <FaRegBookmark className="favorite-icon favorite-icon-outline"/>
            )}
          </button>

          <div className="modal-header">
            <div className="modal-image">
              <img src={event.imageUrl} alt={event.name}/>
              <div className="modal-status">
                {isFull ? (
                    <span className="status-badge status-full">
                    {t("EventModal.status.full")}
                  </span>
                ) : (
                    <span className="status-badge status-available">
                    {t("EventModal.status.availableSpots", {count: availableSpots})}
                  </span>
                )}
              </div>
            </div>

            <div className="modal-info">
              <h1 className="modal-title">{event.name}</h1>

              <div className="modal-meta">
                <div className="meta-item">
                  <span className="meta-icon">📍</span>
                  <span className="meta-text">{event.location}</span>
                </div>

                <div className="meta-item">
                  <span className="meta-icon">📅</span>
                  <span className="meta-text">{start}</span>
                </div>

                <div className="meta-item">
                  <span className="meta-icon">👥</span>
                  <span className="meta-text">
                    {t("EventModal.meta.participantsCount", {
                      current: currentParticipants,
                      capacity: event.capacity
                    })}
                  </span>
                </div>

                {event.languages?.length > 0 && (
                    <div className="meta-item">
                      <span className="meta-icon">🌐</span>
                      <span className="meta-text">
                      {t("EventModal.meta.languages")}: {event.languages.join(", ")}
                    </span>
                    </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-body">
            <div className="modal-section">
              <h3>{t("EventModal.sections.description")}</h3>
              <p className="modal-description">{event.description}</p>
            </div>

            {event.restrictions && (
                <div className="modal-section">
                  <h3>{t("EventModal.sections.restrictions")}</h3>
                  <div className="modal-restrictions">
                    <span className="restriction-badge">⚠️ {event.restrictions}</span>
                  </div>
                </div>
            )}

            <div className="modal-section">
              <h3>{t("EventModal.sections.info")}</h3>
              <div className="event-details">
                <div className="detail-item">
                  <strong>{t("EventModal.details.capacity")}</strong> {event.capacity}
                </div>
                <div className="detail-item">
                  <strong>{t("EventModal.details.currentParticipants")}</strong>{" "}
                  {currentParticipants}
                </div>
                <div className="detail-item">
                  <strong>{t("EventModal.details.availableSpots")}</strong>{" "}
                  {availableSpots}
                </div>
              </div>
            </div>

            {currentParticipants > 0 && (
                <div className="modal-section">
                  <h3>
                    {t("EventModal.sections.registeredParticipants", {
                      count: currentParticipants
                    })}
                  </h3>

                  {loadingParticipants ? (
                      <div className="participants-loading">
                        <div className="loading-spinner"></div>
                        <p>{t("EventModal.sections.loadingParticipants")}</p>
                      </div>
                  ) : participants.length > 0 ? (
                      <div className="participants-list">
                        {participants.map((participant) => {
                          const isCreator = participant.id === event.creatorId;
                          const avatar = getAvatarForUser(participant.id);

                          return (
                              <div
                                  key={participant.id}
                                  className="participant-card"
                                  onClick={() => {
                                    setSelectedUserId(participant.id);
                                    setIsProfileModalOpen(true);
                                  }}
                                  style={{cursor: "pointer"}}
                                  title={t("EventModal.clickToViewProfile")}
                              >
                                <div className="participant-avatar">
                                  <img
                                      src={avatar}
                                      alt="Avatar"
                                      className="participant-avatar-img"
                                  />
                                </div>

                                <div className="participant-info">
                                  <div className="participant-name">
                                    {participant.nombre} {participant.apellidos}
                                    {isCreator && (
                                        <span
                                            className="creator-badge"
                                            title={t("EventModal.creatorBadge")}
                                        >
                                  {t("EventModal.creatorStar")}
                                </span>
                                    )}
                                  </div>

                                  <div className="participant-details">
                              <span className="participant-username">
                                @{participant.username}
                              </span>
                                    {participant.ciudad && (
                                        <span className="participant-location">
                                  📍 {participant.ciudad}
                                </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                          );
                        })}
                      </div>
                  ) : (
                      <div className="participants-empty">
                        <p>{t("EventModal.sections.participantsError")}</p>
                      </div>
                  )}
                </div>
            )}
          </div>

          <div className="modal-footer">
            {!isEnrolled && (
                <button
                    className="btn btn-primary btn-large"
                    onClick={onJoin}
                    disabled={isFull}
                >
                  {isFull ? t("EventModal.eventFull") : t("EventModal.join")}
                </button>
            )}

            {isEnrolled && (
                <div className="modal-enrolled-box">
                  <div className="enrolled-message">
                    {t("EventModal.alreadyEnrolled")}
                  </div>
                  <button className="btn btn-primary btn-large" onClick={onLeave}>
                    {t("EventModal.leave")}
                  </button>
                </div>
            )}
          </div>
        </div>
      </div>

      <UserProfileModal
          userId={selectedUserId}
          isOpen={isProfileModalOpen}
          onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedUserId(null);
        }}
      />
    </div>
  );
}
