// src/components/events/EventModal.js
import React, { useState, useEffect } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import "./EventModal.css";

export default function EventModal({ event, isOpen, onClose, isEnrolled, isFull, onJoin, onLeave }) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (event?.id) {
      const favorites = JSON.parse(localStorage.getItem('favoriteEvents') || '[]');
      setIsFavorite(favorites.includes(event.id.toString()));
    }
  }, [event?.id]);

  const toggleFavorite = () => {
    if (!event?.id) return;
    
    const favorites = JSON.parse(localStorage.getItem('favoriteEvents') || '[]');
    const eventIdStr = event.id.toString();
    
    if (isFavorite) {
      const updated = favorites.filter(id => id !== eventIdStr);
      localStorage.setItem('favoriteEvents', JSON.stringify(updated));
      setIsFavorite(false);
    } else {
      favorites.push(eventIdStr);
      localStorage.setItem('favoriteEvents', JSON.stringify(favorites));
      setIsFavorite(true);
    }
  };

  if (!isOpen || !event) return null;

  // Formatear fecha de manera segura
  let start = "Fecha no disponible";
  if (event.startDate) {
    const date = new Date(event.startDate);
    if (!isNaN(date.getTime())) {
      start = date.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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
                <span className="meta-text">{currentParticipants}/{event.capacity} participantes</span>
              </div>
              {event.languages && event.languages.length > 0 && (
                <div className="meta-item">
                  <span className="meta-icon">🌐</span>
                  <span className="meta-text">
                    Idiomas: {event.languages.map(lang => {
                      const langNames = {
                        'es': 'Español',
                        'en': 'Inglés',
                        'fr': 'Francés',
                        'de': 'Alemán',
                        'it': 'Italiano',
                        'pt': 'Portugués',
                        'ru': 'Ruso'
                      };
                      return langNames[lang] || lang;
                    }).join(', ')}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              <div style={{ 
                padding: '12px 16px', 
                backgroundColor: '#e8f5e9', 
                color: '#2e7d32', 
                borderRadius: '6px', 
                fontSize: '15px',
                textAlign: 'center',
                fontWeight: '500'
              }}>
                ✓ Ya estás apuntado a este evento
              </div>
              <button className="btn btn-primary btn-large" onClick={onLeave}>
                Desapuntarse del Evento
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
