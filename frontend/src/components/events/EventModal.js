// src/components/events/EventModal.js
import React, { useState, useEffect } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import "./EventModal.css";
import userService from "../../services/userService";
import UserProfileModal from "../users/UserProfileModal";

export default function EventModal({ event, isOpen, onClose, isEnrolled, isFull, onJoin, onLeave }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  // Ignoramos el valor, solo usamos el setter (mantiene la lógica pero evita el warning)
  const [, setCreatorInfo] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const notifyFavoritesUpdated = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('favoritesUpdated'));
    }
  };

  useEffect(() => {
    if (event?.id) {
      let favorites;
      try {
        favorites = JSON.parse(localStorage.getItem('favoriteEvents') || '[]');
      } catch (e) {
        favorites = [];
        localStorage.setItem('favoriteEvents', JSON.stringify([]));
      }
      setIsFavorite(favorites.includes(event.id.toString()));
    }
  }, [event?.id]);

  // Cargar información de participantes cuando se abre el modal
  useEffect(() => {
    if (isOpen && event && event.participants && event.participants.length > 0) {
      loadParticipantsInfo();
    } else {
      setParticipants([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, event]);

  const toggleFavorite = () => {
    if (!event?.id) return;
    
    let favorites;
    try {
      favorites = JSON.parse(localStorage.getItem('favoriteEvents') || '[]');
    } catch (e) {
      favorites = [];
      localStorage.setItem('favoriteEvents', JSON.stringify([]));
    }
    const eventIdStr = event.id.toString();
    
    if (isFavorite) {
      const updated = favorites.filter(id => id !== eventIdStr);
      localStorage.setItem('favoriteEvents', JSON.stringify(updated));
      setIsFavorite(false);
      notifyFavoritesUpdated();
    } else {
      favorites.push(eventIdStr);
      localStorage.setItem('favoriteEvents', JSON.stringify(favorites));
      setIsFavorite(true);
      notifyFavoritesUpdated();
    }
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
        
        // Cargar información del creador si existe
        if (event.creatorId) {
          const creatorResult = await userService.getUserProfile(event.creatorId);
          if (creatorResult.success) {
            setCreatorInfo(creatorResult.data);
          }
        }
      } else {
        console.error("Error al cargar participantes:", result.error);
        setParticipants([]);
      }
    } catch (error) {
      console.error("Error al cargar participantes:", error);
      setParticipants([]);
    } finally {
      setLoadingParticipants(false);
    }
  };

  if (!isOpen || !event) return null;

  // Formatear fecha de manera segura
  let start = "Fecha no disponible";
  if (event.startDate) {
    const date = new Date(event.startDate);
    if (!isNaN(date.getTime())) {
      start = date.toLocaleString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }
  const currentParticipants = event.participants ? event.participants.length : 0;
  const availableSpots = event.capacity - currentParticipants;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <button 
          className="modal-favorite-btn" 
          onClick={toggleFavorite}
          aria-label={isFavorite ? "Eliminar de favoritos" : "Añadir a favoritos"}
          title={isFavorite ? "Eliminar de favoritos" : "Añadir a favoritos"}
        >
          {isFavorite ? (
            <FaBookmark className="favorite-icon favorite-icon-filled" />
          ) : (
            <FaRegBookmark className="favorite-icon favorite-icon-outline" />
          )}
        </button>
        
        <div className="modal-header">
          <div className="modal-image">
            <img src={event.imageUrl} alt={event.name} />
            <div className="modal-status">
              {isFull ? (
                <span className="status-badge status-full">Completo</span>
              ) : (
                <span className="status-badge status-available">
                  {availableSpots} plazas libres
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
                  {currentParticipants}/{event.capacity} participantes
                </span>
              </div>
              {event.languages && event.languages.length > 0 && (
                <div className="meta-item">
                  <span className="meta-icon">🌐</span>
                  <span className="meta-text">
                    Idiomas:{" "}
                    {event.languages
                      .map((lang) => {
                        const langNames = {
                          es: "Español",
                          en: "Inglés",
                          fr: "Francés",
                          de: "Alemán",
                          it: "Italiano",
                          pt: "Portugués",
                          ru: "Ruso",
                        };
                        return langNames[lang] || lang;
                      })
                      .join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-body">
          <div className="modal-section">
            <h3>Descripción del Evento</h3>
            <p className="modal-description">{event.description}</p>
          </div>

          {event.restrictions && (
            <div className="modal-section">
              <h3>Restricciones</h3>
              <div className="modal-restrictions">
                <span className="restriction-badge">⚠️ {event.restrictions}</span>
              </div>
            </div>
          )}

          <div className="modal-section">
            <h3>Información del Evento</h3>
            <div className="event-details">
              <div className="detail-item">
                <strong>Capacidad:</strong> {event.capacity} personas
              </div>
              <div className="detail-item">
                <strong>Participantes actuales:</strong> {currentParticipants}
              </div>
              <div className="detail-item">
                <strong>Plazas disponibles:</strong> {availableSpots}
              </div>
            </div>
          </div>

          {/* Sección de Participantes */}
          {currentParticipants > 0 && (
            <div className="modal-section">
              <h3>Participantes Inscritos ({currentParticipants})</h3>

              {loadingParticipants ? (
                <div className="participants-loading">
                  <div className="loading-spinner"></div>
                  <p>Cargando participantes...</p>
                </div>
              ) : participants.length > 0 ? (
                <div className="participants-list">
                  {participants.map((participant) => {
                    const isCreator = event.creatorId && participant.id === event.creatorId;
                    const initials = `${participant.nombre?.[0] || ""}${
                      participant.apellidos?.[0] || ""
                    }`.toUpperCase();

                    return (
                      <div 
                        key={participant.id} 
                        className="participant-card"
                        onClick={() => {
                          setSelectedUserId(participant.id);
                          setIsProfileModalOpen(true);
                        }}
                        style={{ cursor: 'pointer' }}
                        title="Click para ver perfil"
                      >
                        <div className="participant-avatar">{initials || "?"}</div>
                        <div className="participant-info">
                          <div className="participant-name">
                            {participant.nombre} {participant.apellidos}
                            {isCreator && (
                              <span className="creator-badge" title="Creador del evento">
                                ★ Creador
                              </span>
                            )}
                          </div>
                          <div className="participant-details">
                            <span className="participant-username">@{participant.username}</span>
                            {participant.ciudad && (
                              <span className="participant-location">📍 {participant.ciudad}</span>
                            )}
                          </div>
                          {participant.idiomas && participant.idiomas.length > 0 && (
                            <div className="participant-languages">
                              {participant.idiomas.map((lang) => {
                                const langNames = {
                                  es: "🇪🇸 ES",
                                  en: "🇬🇧 EN",
                                  fr: "🇫🇷 FR",
                                  de: "🇩🇪 DE",
                                  it: "🇮🇹 IT",
                                  pt: "🇵🇹 PT",
                                  ru: "🇷🇺 RU",
                                };
                                return (
                                  <span key={lang} className="language-badge">
                                    {langNames[lang] || lang.toUpperCase()}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="participants-empty">
                  <p>No se pudo cargar la información de los participantes</p>
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
              aria-disabled={isFull}
            >
              {isFull ? "Evento Completo" : "Apuntarse al Evento"}
            </button>
          )}

          {isEnrolled && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                width: "100%",
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#e8f5e9",
                  color: "#2e7d32",
                  borderRadius: "6px",
                  fontSize: "15px",
                  textAlign: "center",
                  fontWeight: "500",
                }}
              >
                ✓ Ya estás apuntado a este evento
              </div>
              <button className="btn btn-primary btn-large" onClick={onLeave}>
                Desapuntarse del Evento
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Perfil de Usuario */}
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
