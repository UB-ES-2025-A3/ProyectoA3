import React, { useEffect, useState } from "react";
import { getUserEvents, leaveEvent } from "../services/eventService";
import EnrolledEventCard from "../components/events/EnrolledEventCard";
import EventModal from "../components/events/EventModal";
import MessageBanner from "../components/common/MessageBanner";
import "../styles/MyEventsPage.css";

export default function MyEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState({ type: "success", message: "" });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadUserEvents = async () => {
      try {
        setLoading(true);
        const eventsData = await getUserEvents();
        setEvents(eventsData);
      } catch (error) {
        console.error('Error cargando tus eventos:', error);
        setBanner({ 
          type: "error", 
          message: "Error al cargar tus eventos. Inténtalo de nuevo." 
        });
        setTimeout(() => setBanner({ type: "success", message: "" }), 5000);
      } finally {
        setLoading(false);
      }
    };

    loadUserEvents();
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
      
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      
      setBanner({ 
        type: "success", 
        message: "Te has desapuntado del evento correctamente." 
      });
      setTimeout(() => setBanner({ type: "success", message: "" }), 3000);
    } catch (error) {
      console.error('Error al desapuntarse del evento:', error);
      setBanner({ 
        type: "error", 
        message: error.message || "Error al desapuntarse del evento." 
      });
      setTimeout(() => setBanner({ type: "success", message: "" }), 5000);
    }
  };

  const now = new Date();
  const activeEvents = events.filter(event => new Date(event.startDate) >= now);
  const finishedEvents = events.filter(event => new Date(event.startDate) < now);

  return (
    <div className="my-events-page">
      <div className="my-events-content">
        <header className="my-events-header">
          <h1>
            <span className="header-icon" aria-hidden="true">📅</span>
            Mi Agenda de Eventos
          </h1>
          <p>Aquí puedes ver todos los eventos en los que estás inscrito</p>
        </header>

        {loading ? (
          <div className="loading-state">
            <p>Cargando tus eventos...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h2>Todavía no tienes eventos guardados</h2>
            <p>Explora los eventos disponibles y apúntate a los que más te interesen</p>
            <a href="/events" className="btn btn-primary">
              Ver eventos disponibles
            </a>
          </div>
        ) : (
          <>
            {/* Eventos Activos */}
            {activeEvents.length > 0 && (
              <section className="events-section">
                <h2 className="section-title">
                  Próximos Eventos ({activeEvents.length})
                </h2>
                <div className="events-grid">
                  {activeEvents.map(event => (
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
                  Eventos Pasados ({finishedEvents.length})
                </h2>
                <div className="events-grid">
                  {finishedEvents.map(event => (
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

      {banner.message && <MessageBanner type={banner.type} message={banner.message} />}
      
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
