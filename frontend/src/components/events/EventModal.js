// src/components/events/EventModal.js
import React, { useState, useEffect } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import "./EventModal.css";
import userService from "../../services/userService";
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
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [, setCreatorInfo] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const notifyFavoritesUpdated = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("favoritesUpdated"));
    }
  };

  useEffect(() => {
    if (event?.id) {
      let favorites;
      try {
        favorites = JSON.parse(localStorage.getItem("favoriteEvents") || "[]");
      } catch {
        favorites = [];
        localStorage.setItem("favoriteEvents", JSON.stringify([]));
      }
      setIsFavorite(favorites.includes(event.id.toString()));
    }
  }, [event?.id]);

  useEffect(() => {
    if (isOpen && event?.participants?.length > 0) {
      loadParticipantsInfo();
    } else {
      setParticipants([]);
    }
  }, [isOpen, event]);

  const toggleFavorite = () => {
    if (!event?.id) return;
    let favorites;
    try {
      favorites = JSON.parse(localStorage.getItem("favoriteEvents") || "[]");
    } catch {
      favorites = [];
      localStorage.setItem("favoriteEvents", JSON.stringify([]));
    }
    const eventIdStr = event.id.toString();
    if (isFavorite) {
      const updated = favorites.filter(id => id !== eventIdStr);
      localStorage.setItem("favoriteEvents", JSON.stringify(updated));
      setIsFavorite(false);
    } else {
      favorites.push(eventIdStr);
      localStorage.setItem("favoriteEvents", JSON.stringify(favorites));
      setIsFavorite(true);
    }
    notifyFavoritesUpdated();
  };

  const loadParticipantsInfo = async () => {
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
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>✕</button>

        <button
          className="modal-favorite-btn"
          onClick={toggleFavorite}
          aria-label={
            isFavorite
              ? t("EventModal.aria.removeFavorite")
              : t("EventModal.aria.addFavorite")
          }
          title={
            isFavorite
              ? t("EventModal.aria.removeFavorite")
              : t("EventModal.aria.addFavorite")
          }
        >
          {isFavorite ? <FaBookmark className="favorite-icon favorite-icon-filled" />
                      : <FaRegBookmark className="favorite-icon favorite-icon-outline" />}
        </button>

        <div className="modal-header">
          <div className="modal-image">
            <img src={event.imageUrl} alt={event.name} />
            <div className="modal-status">
              {isFull ? (
                <span className="status-badge status-full">
                  {t("EventModal.status.full")}
                </span>
              ) : (
                <span className="status-badge status-available">
                  {t("EventModal.status.availableSpots", { count: availableSpots })}
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
                    {t("EventModal.meta.languages")}:{" "}
                    {event.languages.join(", ")}
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
                <strong>{t("EventModal.details.currentParticipants")}</strong> {currentParticipants}
              </div>
              <div className="detail-item">
                <strong>{t("EventModal.details.availableSpots")}</strong> {availableSpots}
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
                        style={{ cursor: "pointer" }}
                        title={t("EventModal.clickToViewProfile")}
                      >
                        <div className="participant-avatar">
                          <img
                            src={avatar}
                            alt={`Avatar`}
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
              {isFull
                ? t("EventModal.eventFull")
                : t("EventModal.join")}
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
