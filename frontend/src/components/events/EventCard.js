// src/components/events/EventCard.js
import React from "react";
import "./EventCard.css";

export default function EventCard({
  event,
  isEnrolled,
  isFull,
  onJoin,
  onLeave,
  onClick,
}) {
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
  console.log("Evento:", event);
  console.log("Participantes:", event.participants);
  console.log("Current:", currentParticipants, "Available:", availableSpots);

  return (
    <article className="event-card" onClick={onClick}>
      <div className="event-card__media">
        <img src={event.imageUrl} alt={event.name} />
        <div className="event-card__status">
          {isFull ? (
            <span className="status-badge status-full">Completo</span>
          ) : (
            <span className="status-badge status-available">
              {availableSpots} plazas libres
            </span>
          )}
        </div>
      </div>

      <div className="event-card__body">
        <div className="event-card__main">
          <h3 className="event-card__title">{event.name}</h3>
          <p className="event-card__location">📍 {event.location}</p>
          <p className="event-card__date">📅 {start}</p>
        </div>

        <div className="event-card__sidebar">
          <div className="event-card__capacity-info">
            <span className="capacity-number">{currentParticipants}/{event.capacity}</span>
            <span className="capacity-label">participantes</span>
          </div>
          
          <footer className="event-card__footer">
            {!isEnrolled && (
              <button
                className="btn btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onJoin();
                }}
                disabled={isFull}
                aria-disabled={isFull}
              >
                {isFull ? "Completo" : "Apuntarse"}
              </button>
            )}

            {isEnrolled && (
              <button 
                className="btn btn-outline" 
                onClick={(e) => {
                  e.stopPropagation();
                  onLeave();
                }}
              >
                Desapuntarse
              </button>
            )}
          </footer>
        </div>
      </div>
    </article>
  );
}
