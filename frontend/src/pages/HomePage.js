// src/pages/HomePage.js
import React, { useEffect, useState } from "react";
import { getEvents, joinEvent, leaveEvent } from "../services/eventService";
import { mockEvents } from "../mocks/events.mock";
import EventCard from "../components/events/EventCard";
import EventModal from "../components/events/EventModal";
import CreateEventForm from "../components/events/CreateEventForm";
import MessageBanner from "../components/common/MessageBanner";
import "../styles/HomePage.css";

// Iconos
import { FaLanguage, FaUsers, FaSearch, FaMapMarkerAlt, FaFeatherAlt } from "react-icons/fa"; 

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState({ type: "success", message: "" });
  const [me, setMe] = useState(null);
  
  // Estados para los filtros
  const [filters, setFilters] = useState({
    searchText: "",
    location: "",
    language: "",
    minAge: "",
    maxPersons: ""
  });

  // Estado para controlar qué filtro está abierto
  const [openFilter, setOpenFilter] = useState(null);
  
  // Estado para el modal
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado para el formulario de crear evento
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  // Función para aplicar filtros
  const applyFilters = () => {
    let filtered = events.filter(event => {
      // Filtro por texto (título o descripción)
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        if (!event.name.toLowerCase().includes(searchLower) && 
            !event.description.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Filtro por ubicación
      if (filters.location) {
        if (!event.location.toLowerCase().includes(filters.location.toLowerCase())) {
          return false;
        }
      }

      // Filtro por capacidad máxima
      if (filters.maxPersons) {
        if (event.capacity > parseInt(filters.maxPersons)) {
          return false;
        }
      }

      // Filtro por idioma
      if (filters.language) {
        if (!event.languages || !event.languages.includes(filters.language)) {
          return false;
        }
      }

      return true;
    });

    setFilteredEvents(filtered);
  };

  // Cargar eventos al montar el componente
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const eventsData = await getEvents();
        setEvents(eventsData);
      } catch (error) {
        console.error('Error cargando eventos:', error);
        setBanner({ type: "error", message: "Error al cargar los eventos. Inténtalo de nuevo." });
        setTimeout(() => setBanner({ type: "success", message: "" }), 5000);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters();
  }, [filters, events]);

  // Cerrar filtros al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openFilter && !event.target.closest('.filter-dropdown')) {
        setOpenFilter(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openFilter]);

  // Función para manejar cambios en filtros
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Función para abrir/cerrar filtros desplegables
  const toggleFilter = (filterType) => {
    setOpenFilter(openFilter === filterType ? null : filterType);
  };

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

  // Función para manejar la creación de evento exitosa
  const handleEventCreated = () => {
    setIsCreateFormOpen(false);
    setBanner({ type: "success", message: "Evento creado correctamente!" });
    setTimeout(() => setBanner({ type: "success", message: "" }), 3000);
    
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

  // Función para unirse a un evento
  const handleJoinEvent = async (eventId) => {
    try {
      const event = events.find(e => e.id === eventId);
      
      // Verificar si ya está lleno
      if (event.participants.length >= event.capacity) {
        setBanner({ type: "error", message: "El evento está completo. No puedes apuntarte." });
        setTimeout(() => setBanner({ type: "success", message: "" }), 3000);
        return;
      }
      
      // Verificar si ya está apuntado
      if (event.participants.some(p => p.id === "me")) {
        setBanner({ type: "warning", message: "Ya estás apuntado a este evento." });
        setTimeout(() => setBanner({ type: "success", message: "" }), 3000);
        return;
      }

      // Llamar al servicio
      await joinEvent(eventId);
      
      // Actualizar el estado local
      setEvents(prevEvents => 
        prevEvents.map(event => {
          if (event.id === eventId) {
            return {
              ...event,
              participants: [...event.participants, { id: "me" }]
            };
          }
          return event;
        })
      );
      
      setBanner({ type: "success", message: "¡Te has apuntado al evento correctamente!" });
      setTimeout(() => setBanner({ type: "success", message: "" }), 3000);
    } catch (error) {
      console.error('Error al apuntarse al evento:', error);
      setBanner({ type: "error", message: error.message || "Error al apuntarse al evento." });
      setTimeout(() => setBanner({ type: "success", message: "" }), 5000);
    }
  };

  // Función para salirse de un evento
  const handleLeaveEvent = async (eventId) => {
    try {
      const event = events.find(e => e.id === eventId);
      
      // Verificar si está apuntado
      if (!event.participants.some(p => p.id === "me")) {
        setBanner({ type: "warning", message: "No estás apuntado a este evento." });
        setTimeout(() => setBanner({ type: "success", message: "" }), 3000);
        return;
      }

      // Llamar al servicio
      await leaveEvent(eventId);
      
      // Actualizar el estado local
      setEvents(prevEvents => 
        prevEvents.map(event => {
          if (event.id === eventId) {
            return {
              ...event,
              participants: event.participants.filter(p => p.id !== "me")
            };
          }
          return event;
        })
      );
      
      setBanner({ type: "success", message: "Te has desapuntado del evento correctamente." });
      setTimeout(() => setBanner({ type: "success", message: "" }), 3000);
    } catch (error) {
      console.error('Error al desapuntarse del evento:', error);
      setBanner({ type: "error", message: error.message || "Error al desapuntarse del evento." });
      setTimeout(() => setBanner({ type: "success", message: "" }), 5000);
    }
  };

  return (
    <div className="home-page">
      <div className="home-content">
        
        {/* MITAD IZQUIERDA: Filtros y Lista de Eventos */}
        <div className="home-left">
          
          <header className="home-main-header">
            <div className="header-top">
              <div>
                <h1>Encuentra tu próximo evento</h1>
                <p>Explora intercambios culturales y reuniones cerca de ti.</p>
              </div>
              <button className="btn btn-primary btn-create" onClick={handleOpenCreateForm}>
                + Crear Evento
              </button>
            </div>
            
            {/* Buscador Principal */}
            <div className="main-search">
              <div className="search-input-container">
                <FaSearch className="search-icon" />
              <input 
                type="text" 
                  placeholder="Buscar eventos por nombre o descripción..." 
                  value={filters.searchText}
                  onChange={(e) => handleFilterChange('searchText', e.target.value)}
                  className="main-search-input"
                />
              </div>
            </div>

            {/* Filtros Rápidos con Iconos */}
            <div className="quick-filters">
              <div className="filter-icon-group">
                
                <div className="filter-dropdown">
                  <button 
                    className={`filter-icon-btn ${filters.language ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFilter('language');
                    }}
                    title="Filtrar por idioma"
                  >
                    <FaLanguage />
                    <span>Idioma</span>
                  </button>
                  
                  {openFilter === 'language' && (
                    <div className="filter-dropdown-content language-dropdown">
                      <div className="filter-options">
                        <div className="language-search">
              <input 
                type="text" 
                            placeholder="Buscar idioma..."
                            className="language-search-input"
              />
            </div>
                        <div className="language-list">
                          <label>
                            <input 
                              type="radio" 
                              name="language" 
                              value="" 
                              checked={filters.language === ""}
                              onChange={(e) => handleFilterChange('language', e.target.value)}
                            />
                            Cualquier idioma
                          </label>
                          <label>
                            <input 
                              type="radio" 
                              name="language" 
                              value="es" 
                              checked={filters.language === "es"}
                              onChange={(e) => handleFilterChange('language', e.target.value)}
                            />
                            🇪🇸 Español
                          </label>
                          <label>
                            <input 
                              type="radio" 
                              name="language" 
                              value="en" 
                              checked={filters.language === "en"}
                              onChange={(e) => handleFilterChange('language', e.target.value)}
                            />
                            🇬🇧 Inglés
                          </label>
                          <label>
                            <input 
                              type="radio" 
                              name="language" 
                              value="fr" 
                              checked={filters.language === "fr"}
                              onChange={(e) => handleFilterChange('language', e.target.value)}
                            />
                            🇫🇷 Francés
                          </label>
                          <label>
                            <input 
                              type="radio" 
                              name="language" 
                              value="de" 
                              checked={filters.language === "de"}
                              onChange={(e) => handleFilterChange('language', e.target.value)}
                            />
                            🇩🇪 Alemán
                          </label>
                          <label>
                            <input 
                              type="radio" 
                              name="language" 
                              value="it" 
                              checked={filters.language === "it"}
                              onChange={(e) => handleFilterChange('language', e.target.value)}
                            />
                            🇮🇹 Italiano
                          </label>
                          <label>
                            <input 
                              type="radio" 
                              name="language" 
                              value="pt" 
                              checked={filters.language === "pt"}
                              onChange={(e) => handleFilterChange('language', e.target.value)}
                            />
                            🇵🇹 Portugués
                          </label>
                          <label>
                            <input 
                              type="radio" 
                              name="language" 
                              value="ru" 
                              checked={filters.language === "ru"}
                              onChange={(e) => handleFilterChange('language', e.target.value)}
                            />
                            🇷🇺 Ruso
              </label>
                        </div>
                      </div>
                    </div>
                  )}
            </div>

                <div className="filter-dropdown">
                  <button 
                    className={`filter-icon-btn ${filters.minAge ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFilter('age');
                    }}
                    title="Filtrar por edad mínima"
                  >
                    <FaUsers />
                    <span>Edad</span>
                  </button>
                  
                  {openFilter === 'age' && (
                    <div className="filter-dropdown-content">
                      <div className="filter-options">
                        <div className="age-input-section">
                          <label htmlFor="age-input">Edad mínima:</label>
                          <div className="age-input-container">
                            <input 
                              type="number" 
                              id="age-input"
                              min="0" 
                              max="100"
                              placeholder="Ej: 18"
                              value={filters.minAge}
                              onChange={(e) => handleFilterChange('minAge', e.target.value)}
                              className="age-input"
                            />
                            <span className="age-unit">años</span>
                          </div>
                          <div className="age-presets">
                            <button 
                              type="button"
                              className={`age-preset ${filters.minAge === "" ? 'active' : ''}`}
                              onClick={() => handleFilterChange('minAge', '')}
                            >
                              Sin límite
                            </button>
                            <button 
                              type="button"
                              className={`age-preset ${filters.minAge === "18" ? 'active' : ''}`}
                              onClick={() => handleFilterChange('minAge', '18')}
                            >
                              18+
                            </button>
                            <button 
                              type="button"
                              className={`age-preset ${filters.minAge === "21" ? 'active' : ''}`}
                              onClick={() => handleFilterChange('minAge', '21')}
                            >
                              21+
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
            </div>

                <div className="filter-dropdown">
                  <button 
                    className={`filter-icon-btn ${filters.maxPersons ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFilter('capacity');
                    }}
                    title="Filtrar por capacidad máxima"
                  >
                    <FaUsers />
                    <span>Capacidad</span>
                  </button>
                  
                  {openFilter === 'capacity' && (
                    <div className="filter-dropdown-content">
                      <div className="filter-options">
                        <div className="capacity-input-section">
                          <label htmlFor="capacity-input">Capacidad máxima:</label>
                          <div className="capacity-input-container">
              <input 
                type="number" 
                              id="capacity-input"
                min="1" 
                              max="100"
                              placeholder="Ej: 10"
                              value={filters.maxPersons}
                              onChange={(e) => handleFilterChange('maxPersons', e.target.value)}
                              className="capacity-input"
                            />
                            <span className="capacity-unit">personas</span>
                          </div>
                          <div className="capacity-presets">
                            <button 
                              type="button"
                              className={`capacity-preset ${filters.maxPersons === "" ? 'active' : ''}`}
                              onClick={() => handleFilterChange('maxPersons', '')}
                            >
                              Sin límite
                            </button>
                            <button 
                              type="button"
                              className={`capacity-preset ${filters.maxPersons === "5" ? 'active' : ''}`}
                              onClick={() => handleFilterChange('maxPersons', '5')}
                            >
                              ≤ 5
                            </button>
                            <button 
                              type="button"
                              className={`capacity-preset ${filters.maxPersons === "10" ? 'active' : ''}`}
                              onClick={() => handleFilterChange('maxPersons', '10')}
                            >
                              ≤ 10
                            </button>
                            <button 
                              type="button"
                              className={`capacity-preset ${filters.maxPersons === "20" ? 'active' : ''}`}
                              onClick={() => handleFilterChange('maxPersons', '20')}
                            >
                              ≤ 20
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Botón para limpiar filtros */}
              {(filters.searchText || filters.language || filters.minAge || filters.maxPersons) && (
                <button 
                  className="clear-filters-btn"
                  onClick={() => setFilters({
                    searchText: "",
                    location: "",
                    language: "",
                    minAge: "",
                    maxPersons: ""
                  })}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </header>

          {/* Lista de Eventos */}
          <div className="events-list">
            <h2>Eventos Disponibles ({filteredEvents.length})</h2>
            {loading ? (
              <p>Cargando eventos...</p>
            ) : filteredEvents.length > 0 ? (
              <div className="events-grid">
                {filteredEvents.map(event => {
                  const isEnrolled = event.participants.some(p => p.id === "me");
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
                <p>No se encontraron eventos con los filtros aplicados.</p>
                <button 
                  className="btn btn-outline"
                  onClick={() => setFilters({
                    searchText: "",
                    location: "",
                    language: "",
                    minAge: "",
                    maxPersons: ""
                  })}
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MITAD DERECHA: Mapa (placeholder por ahora) */}
        <div className="home-right">
          <div className="map-placeholder">
            <h3>🗺️ Mapa de Eventos</h3>
            <p>Aquí se mostrará un mapa interactivo con la ubicación de los eventos.</p>
            <p><strong>Próximas implementaciones:</strong></p>
            <ul>
              <li>Integración con Google Maps API</li>
              <li>Marcadores de eventos en el mapa</li>
              <li>Filtrado en tiempo real</li>
              <li>Información de eventos al hacer clic en marcadores</li>
            </ul>
          </div>
        </div>
      </div>
      {banner.message && <MessageBanner type={banner.type} message={banner.message} />}
      
      {/* Modal de Evento */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          isEnrolled={selectedEvent.participants.some(p => p.id === "me")}
          isFull={selectedEvent.participants.length >= selectedEvent.capacity}
          onJoin={() => {
            handleJoinEvent(selectedEvent.id);
            // Actualizar el evento seleccionado
            const updatedEvent = events.find(e => e.id === selectedEvent.id);
            if (updatedEvent) {
              setSelectedEvent(updatedEvent);
            }
          }}
          onLeave={() => {
            handleLeaveEvent(selectedEvent.id);
            // Actualizar el evento seleccionado
            const updatedEvent = events.find(e => e.id === selectedEvent.id);
            if (updatedEvent) {
              setSelectedEvent(updatedEvent);
            }
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


