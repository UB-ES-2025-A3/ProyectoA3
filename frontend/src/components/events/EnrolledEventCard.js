// src/components/events/EnrolledEventCard.js
import React from "react";
import "./EnrolledEventCard.css";
import { useTranslation } from "react-i18next";

export default function EnrolledEventCard({ event, onLeave, onClick }) {
  const { t, i18n } = useTranslation();

  const eventDate = new Date(event.startDate);
  const now = new Date();
  const isFinished = eventDate < now;

  // Elegir locale según el idioma actual de i18n
  const lang = (i18n.language || "es").split("-")[0];
  const localeMap = {
    es: "es-ES",
    ca: "ca-ES",
    en: "en-GB"
  };
  const locale = localeMap[lang] || "es-ES";

  const formattedDate = eventDate.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const formattedTime = eventDate.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <article className="enrolled-event-card" onClick={onClick}>
      <div className="enrolled-event-card__media">
        <img src={event.imageUrl} alt={event.name} />
        <div className="enrolled-event-card__status">
          {isFinished ? (
            <span className="status-badge status-finished">
              {t("EnrolledEvents.card.status.finished")}
            </span>
          ) : (
            <span className="status-badge status-active">
              {t("EnrolledEvents.card.status.active")}
            </span>
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
              {t("EnrolledEvents.card.leaveButton")}
            </button>
          )}
          {isFinished && (
            <button className="btn btn-disabled" disabled>
              {t("EnrolledEvents.card.finishedButton")}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
