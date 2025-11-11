import React, { useEffect, useState } from 'react';
import { getEvents, joinEvent, leaveEvent } from '../services/eventService';
import EventCard from '../components/events/EventCard';
import EventModal from '../components/events/EventModal';
import CreateEventForm from '../components/events/CreateEventForm';
import MessageBanner from '../components/common/MessageBanner';
import '../styles/EventPage.css';

export default function EventPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState({ type: 'success', message: '' });
  
  // Modal states
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  // Cargar eventos al montar el componente
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const eventsData = await getEvents();
        setEvents(eventsData);
      } catch (error) {
        console.error('Error cargando eventos:', error);
        setBanner({ type: 'error', message: 'Error al cargar los eventos. Inténtalo de nuevo.' });
        setTimeout(() => setBanner({ type: 'success', message: '' }), 5000);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Función para abrir el modal
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  // Función para abrir el formulario de creación
  const handleOpenCreateForm = () => {
    setIsCreateFormOpen(true);
  };

  // Función para cerrar el formulario de creación
  const handleCloseCreateForm = () => {
    setIsCreateFormOpen(false);
  };

  // Función para unirse a un evento
  const handleJoinEvent = async (eventId) => {
    try {
      const event = events.find(e => e.id === eventId);
      
      if (!event) {
        setBanner({ type: 'error', message: 'Evento no encontrado.' });
        setTimeout(() => setBanner({ type: 'success', message: '' }), 3000);
        return;
      }
      
      if (event.participants.length >= event.capacity) {
        setBanner({ type: 'error', message: 'El evento está completo. No puedes apuntarte.' });
        setTimeout(() => setBanner({ type: 'success', message: '' }), 3000);
        return;
      }
      
      if (event.isEnrolled) {
        setBanner({ type: 'warning', message: 'Ya estás apuntado a este evento.' });
        setTimeout(() => setBanner({ type: 'success', message: '' }), 3000);
        return;
      }

      await joinEvent(eventId);
      
      // Recargar eventos para obtener el estado actualizado
      const updatedEvents = await getEvents();
      setEvents(updatedEvents);
      
      // Actualizar el evento seleccionado si está abierto el modal
      if (selectedEvent && selectedEvent.id === eventId) {
        const updatedEvent = updatedEvents.find(e => e.id === eventId);
        if (updatedEvent) {
          setSelectedEvent(updatedEvent);
        }
      }
      
      setBanner({ type: 'success', message: 'Te has apuntado al evento correctamente!' });
      setTimeout(() => setBanner({ type: 'success', message: '' }), 3000);
    } catch (error) {
      console.error('Error al apuntarse al evento:', error);
      const errorMessage = error.message || '';
      // Si el error es que ya está apuntado, mostrar mensaje de advertencia en lugar de error
      if (errorMessage.toLowerCase().includes('ya estás apuntado') || 
          errorMessage.toLowerCase().includes('apuntado')) {
        setBanner({ type: 'warning', message: 'Ya estás apuntado a este evento.' });
        // Recargar eventos para actualizar el estado
        const updatedEvents = await getEvents();
        setEvents(updatedEvents);
        if (selectedEvent && selectedEvent.id === eventId) {
          const updatedEvent = updatedEvents.find(e => e.id === eventId);
          if (updatedEvent) {
            setSelectedEvent(updatedEvent);
          }
        }
      } else {
        setBanner({ type: 'error', message: errorMessage || 'Error al apuntarse al evento.' });
      }
      setTimeout(() => setBanner({ type: 'success', message: '' }), 5000);
    }
  };

  // Función para salirse de un evento
  const handleLeaveEvent = async (eventId) => {
    try {
      const event = events.find(e => e.id === eventId);
      
      if (!event) {
        setBanner({ type: 'error', message: 'Evento no encontrado.' });
        setTimeout(() => setBanner({ type: 'success', message: '' }), 3000);
        return;
      }
      
      if (!event.isEnrolled) {
        setBanner({ type: 'warning', message: 'No estás apuntado a este evento.' });
        setTimeout(() => setBanner({ type: 'success', message: '' }), 3000);
        return;
      }

      await leaveEvent(eventId);
      
      // Recargar eventos para obtener el estado actualizado
      const updatedEvents = await getEvents();
      setEvents(updatedEvents);
      
      // Actualizar el evento seleccionado si está abierto el modal
      if (selectedEvent && selectedEvent.id === eventId) {
        const updatedEvent = updatedEvents.find(e => e.id === eventId);
        if (updatedEvent) {
          setSelectedEvent(updatedEvent);
        }
      }
      
      setBanner({ type: 'success', message: 'Te has desapuntado del evento correctamente.' });
      setTimeout(() => setBanner({ type: 'success', message: '' }), 3000);
    } catch (error) {
      console.error('Error al desapuntarse del evento:', error);
      setBanner({ type: 'error', message: error.message || 'Error al desapuntarse del evento.' });
      setTimeout(() => setBanner({ type: 'success', message: '' }), 5000);
    }
  };

  // Función para manejar la creación de evento exitosa
  const handleEventCreated = () => {
    setIsCreateFormOpen(false);
    setBanner({ type: 'success', message: 'Evento creado correctamente!' });
    setTimeout(() => setBanner({ type: 'success', message: '' }), 3000);
    
    // Recargar eventos
    const loadEvents = async () => {
      try {
        const eventsData = await getEvents();
        setEvents(eventsData);
      } catch (error) {
        console.error('Error recargando eventos:', error);
      }
    };
    loadEvents();
  };

  return (
    <div className="event-page-container">
      <div className="event-page-header">
        <h1>Eventos</h1>
        <button className="btn btn-primary btn-large" onClick={handleOpenCreateForm}>
          + Crear Evento
        </button>
      </div>

      <div className="events-list">
        {loading ? (
          <p>Cargando eventos...</p>
        ) : events.length > 0 ? (
          <div className="events-grid">
            {events.map(event => {
              const isEnrolled = event.isEnrolled || false;
              const isFull = event.participants.length >= event.capacity;
              
              return (
                <EventCard
                  key={event.id}
                  event={event}
                  isEnrolled={isEnrolled}
                  isFull={isFull}
                  onJoin={() => handleJoinEvent(event.id)}
                  onLeave={() => handleLeaveEvent(event.id)}
                  onClick={() => handleEventClick(event)}
                />
              );
            })}
          </div>
        ) : (
          <div className="no-events">
            <p>No hay eventos disponibles en este momento.</p>
          </div>
        )}
      </div>

      {banner.message && <MessageBanner type={banner.type} message={banner.message} />}
      
      {/* Modal de Evento */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          isEnrolled={selectedEvent.isEnrolled || false}
          isFull={selectedEvent.participants.length >= selectedEvent.capacity}
          onJoin={async () => {
            await handleJoinEvent(selectedEvent.id);
          }}
          onLeave={async () => {
            await handleLeaveEvent(selectedEvent.id);
          }}
        />
      )}

      {/* Modal de Crear Evento */}
      <CreateEventForm
        isOpen={isCreateFormOpen}
        onClose={handleCloseCreateForm}
        onSuccess={handleEventCreated}
      />
    </div>
  );
}
