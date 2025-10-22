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
  const start = new Date(event.startDate).toLocaleString();
  const currentParticipants = event.participants ? event.participants.length : 0;
  const availableSpots = event.capacity - currentParticipants;

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
