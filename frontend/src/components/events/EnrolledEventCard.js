// src/components/events/EnrolledEventCard.js
import React from "react";
import "./EnrolledEventCard.css";

export default function EnrolledEventCard({ event, onLeave, onClick }) {
  const eventDate = new Date(event.startDate);
  const now = new Date();
  const isFinished = eventDate < now;
  
  // Formatear la fecha para mostrar
  const formattedDate = eventDate.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedTime = eventDate.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <article className="enrolled-event-card" onClick={onClick}>
      <div className="enrolled-event-card__media">
        <img src={event.imageUrl} alt={event.name} />
        <div className="enrolled-event-card__status">
          {isFinished ? (
            <span className="status-badge status-finished">Finalizado</span>
          ) : (
            <span className="status-badge status-active">Activo</span>
          )}
        </div>
      </div>

      <div className="enrolled-event-card__content">
        <div className="enrolled-event-card__info">
          <h3 className="enrolled-event-card__title">{event.name}</h3>
          
          <div className="enrolled-event-card__details">
            <p className="enrolled-event-card__location">
              <span className="icon">📍</span>
              <span>{event.location}</span>
            </p>
            <p className="enrolled-event-card__date">
              <span className="icon">📅</span>
              <span>{formattedDate}</span>
            </p>
            <p className="enrolled-event-card__time">
              <span className="icon">🕐</span>
              <span>{formattedTime}</span>
            </p>
          </div>
        </div>

        <div className="enrolled-event-card__actions">
          {!isFinished && (
            <button
              className="btn btn-outline-danger"
              onClick={(e) => {
                e.stopPropagation();
                onLeave();
              }}
            >
              Desapuntarse
            </button>
          )}
          {isFinished && (
            <button
              className="btn btn-disabled"
              disabled
            >
              Evento finalizado
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
