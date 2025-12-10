// src/components/events/EventCard.js
import React from "react";
import "./EventCard.css";
import { useTranslation } from "react-i18next";

const EventCard = React.memo(function EventCard({
  event,
  isEnrolled,
  isFull,
  onJoin,
  onLeave,
  onClick,
  onMouseEnter,
  onMouseLeave,
  isJoining = false,
}) {
  const { t, i18n } = useTranslation();

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
  // Verificar si el evento fue creado por el usuario actual
  const isUserEvent = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    const userId = localStorage.getItem('userId');
    if (!userId || !event) return false;

    const creatorId = event.id_creador !== undefined ? event.id_creador : event.creatorId;
    if (creatorId === null || creatorId === undefined) return false;

    const creatorIdNum = Number(creatorId);
    const userIdNum = Number(userId);

    if (!isNaN(creatorIdNum) && !isNaN(userIdNum)) {
      return creatorIdNum === userIdNum;
    }

    return String(creatorId) === String(userId);
  }, [event]);

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



  const currentParticipants = event.participants ? event.participants.length : 0;
  const availableSpots = event.capacity - currentParticipants;

  return (
    <article
      className="event-card"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h3 className="event-card__title">{event.name}</h3>
            {isUserEvent && (
              <span
                style={{
                  fontSize: '12px',
                  padding: '2px 8px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  borderRadius: '12px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap'
                }}
                title="Evento creado por ti"
              >
                Tu evento
              </span>
            )}
          </div>
          <p className="event-card__location">📍 {event.location}</p>
          <p className="event-card__date">📅 {start}</p>
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
});

export default EventCard;
