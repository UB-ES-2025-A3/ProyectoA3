// src/pages/MyEventsPage.js
import React, { useEffect, useState } from "react";
import { getUserEvents, leaveEvent } from "../services/eventService";
import EnrolledEventCard from "../components/events/EnrolledEventCard";
import EventModal from "../components/events/EventModal";
import MessageBanner from "../components/common/MessageBanner";
import "../styles/MyEventsPage.css";
import { useTranslation } from "react-i18next";

export default function MyEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState({ type: "success", message: "" });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const loadUserEvents = async () => {
      try {
        setLoading(true);
        const eventsData = await getUserEvents();
        setEvents(eventsData);
      } catch (error) {
        console.error("Error cargando tus eventos:", error);
        setBanner({
          type: "error",
          message: t("myEvents.messages.loadError")
        });
        setTimeout(
          () => setBanner({ type: "success", message: "" }),
          5000
        );
      } finally {
        setLoading(false);
      }
    };

    loadUserEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleLeaveEvent = async (eventId) => {
    try {
      await leaveEvent(eventId);

      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== eventId)
      );

      setBanner({
        type: "success",
        message: t("myEvents.messages.leaveSuccess")
      });
      setTimeout(
        () => setBanner({ type: "success", message: "" }),
        3000
      );
    } catch (error) {
      console.error("Error al desapuntarse del evento:", error);
      setBanner({
        type: "error",
        message: error.message || t("myEvents.messages.leaveErrorFallback")
      });
      setTimeout(
        () => setBanner({ type: "success", message: "" }),
        5000
      );
    }
  };

  const now = new Date();
  const activeEvents = events.filter(
    (event) => new Date(event.startDate) >= now
  );
  const finishedEvents = events.filter(
    (event) => new Date(event.startDate) < now
  );

  return (
    <div className="my-events-page">
      <div className="my-events-content">
        <header className="my-events-header">
          <h1>
            <span className="header-icon" aria-hidden="true">
              📅
            </span>
            {t("myEvents.title")}
          </h1>
          <p>{t("myEvents.subtitle")}</p>
        </header>

        {loading ? (
          <div className="loading-state">
            <p>{t("myEvents.loading")}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h2>{t("myEvents.empty.title")}</h2>
            <p>{t("myEvents.empty.description")}</p>
            <a href="/events" className="btn btn-primary">
              {t("myEvents.empty.button")}
            </a>
          </div>
        ) : (
          <>
            {/* Eventos Activos */}
            {activeEvents.length > 0 && (
              <section className="events-section">
                <h2 className="section-title">
                  {t("myEvents.sections.upcoming", {
                    count: activeEvents.length
                  })}
                </h2>
                <div className="events-grid">
                  {activeEvents.map((event) => (
                    <EnrolledEventCard
                      key={event.id}
                      event={event}
                      onLeave={() => handleLeaveEvent(event.id)}
                      onClick={() => handleEventClick(event)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Eventos Finalizados */}
            {finishedEvents.length > 0 && (
              <section className="events-section">
                <h2 className="section-title">
                  {t("myEvents.sections.past", {
                    count: finishedEvents.length
                  })}
                </h2>
                <div className="events-grid">
                  {finishedEvents.map((event) => (
                    <EnrolledEventCard
                      key={event.id}
                      event={event}
                      onLeave={() => handleLeaveEvent(event.id)}
                      onClick={() => handleEventClick(event)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {banner.message && (
        <MessageBanner type={banner.type} message={banner.message} />
      )}

      {/* Modal de Evento */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          isEnrolled={true}
          isFull={false}
          onJoin={() => {}}
          onLeave={() => {
            handleLeaveEvent(selectedEvent.id);
            handleCloseModal();
          }}
        />
      )}
    </div>
  );
}
