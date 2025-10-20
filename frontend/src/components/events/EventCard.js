// src/components/events/EventCard.js
import React from "react";
import "./EventCard.css";

export default function EventCard({
  event,
  isEnrolled,
  isFull,
  onJoin,
  onLeave,
}) {
  const start = new Date(event.startDate).toLocaleString();

  return (
    <article className="event-card">
      <div className="event-card__media">
        <img src={event.imageUrl} alt={event.name} />
      </div>

      <div className="event-card__body">
        <header className="event-card__header">
          <h3 className="event-card__title">{event.name}</h3>
          <span className="event-card__date">{start}</span>
        </header>

        <p className="event-card__location">📍 {event.location}</p>
        <p className="event-card__desc">{event.description}</p>
        {event.restrictions && (
          <p className="event-card__restrictions">⚠️ {event.restrictions}</p>
        )}

        <footer className="event-card__footer">
          {!isEnrolled && (
            <button
              className="btn btn-primary"
              onClick={onJoin}
              disabled={isFull}
              aria-disabled={isFull}
            >
              {isFull ? "Evento completo" : "Apuntarse"}
            </button>
          )}

          {isEnrolled && (
            <button className="btn btn-outline" onClick={onLeave}>
              Desapuntarse
            </button>
          )}
        </footer>
      </div>
    </article>
  );
}
