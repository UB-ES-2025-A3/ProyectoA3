// src/components/events/EventCard.js
import React from "react";
import "./EventCard.css";
import { useTranslation } from "react-i18next";

export default function EventCard({
  event,
  isEnrolled,
  isFull,
  onJoin,
  onLeave,
  onClick,
  isJoining = false,
}) {
  const { t } = useTranslation();

  // Formatear fecha de manera segura
  let start = t("EventCard.fallback.noDate");
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

  return (
    <article className="event-card" onClick={onClick}>
      <div className="event-card__media">
        <img src={event.imageUrl} alt={event.name} />
        <div className="event-card__status">
          {isFull ? (
            <span className="status-badge status-full">
              {t("EventCard.status.full")}
            </span>
          ) : (
            <span className="status-badge status-available">
              {t("EventCard.status.spotsAvailable", { count: availableSpots })}
            </span>
          )}
        </div>
      </div>

      <div className="event-card__body">
        <div className="event-card__main">
          <h3 className="event-card__title">{event.name}</h3>

          <p className="event-card__location">
            {t("EventCard.location", { location: event.location })}
          </p>

          <p className="event-card__date">
            {t("EventCard.date", { date: start })}
          </p>
        </div>

        <div className="event-card__sidebar">
          <div className="event-card__capacity-info">
            <span className="capacity-number">
              {currentParticipants}/{event.capacity}
            </span>
            <span className="capacity-label">
              {t("EventCard.capacity.label")}
            </span>
          </div>

          <footer className="event-card__footer">
            {!isEnrolled && (
              <button
                className="btn btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onJoin();
                }}
                disabled={isFull || isJoining}
                aria-disabled={isFull || isJoining}
              >
                {isFull
                  ? t("EventCard.status.full")
                  : isJoining
                  ? t("EventCard.buttons.joining")
                  : t("EventCard.buttons.join")}
              </button>
            )}

            {isEnrolled && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  width: "100%",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    padding: "8px 12px",
                    backgroundColor: "#e8f5e9",
                    color: "#2e7d32",
                    borderRadius: "4px",
                    fontSize: "14px",
                    textAlign: "center",
                    fontWeight: "500",
                  }}
                >
                  {t("EventCard.enrolled.already")}
                </p>

                <button
                  className="btn btn-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLeave();
                  }}
                >
                  {t("EventCard.buttons.leave")}
                </button>
              </div>
            )}
          </footer>
        </div>
      </div>
    </article>
  );
}
