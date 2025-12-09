// src/pages/HomePage.js
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { getEvents, joinEvent, leaveEvent, getFavoriteEvents } from "../services/eventService";
import EventCard from "../components/events/EventCard";
import EventModal from "../components/events/EventModal";
import CreateEventForm from "../components/events/CreateEventForm";
import MessageBanner from "../components/common/MessageBanner";
import EventMap from "../components/map/EventMap";
import "../styles/HomePage.css";

// Iconos
import { FaLanguage, FaUsers, FaSearch, FaFeatherAlt, FaBookmark } from "react-icons/fa";

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState({ type: "success", message: "" });
  
  // Estados para los filtros
  const [filters, setFilters] = useState({
    searchText: "",
    location: "",
    language: "",
    minAge: "",
    maxPersons: "",
    tags: [],
    onlyFavorites: false
  });

  // Estado para controlar qué filtro está abierto
  const [openFilter, setOpenFilter] = useState(null);
  const [joiningEventId, setJoiningEventId] = useState(null);
  const [favoriteEventIds, setFavoriteEventIds] = useState([]);
  
  // Estado para el modal
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado para el evento que está siendo hover (para centrar el mapa)
  const [hoveredEvent, setHoveredEvent] = useState(null);
  
  // Estado para el evento fijado en el mapa (se mantiene incluso al cerrar el modal)
  const [pinnedEvent, setPinnedEvent] = useState(null);
  
  // Estado para el formulario de crear evento
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [createFormInitialLocation, setCreateFormInitialLocation] = useState(null);
  const [createFormInitialCoordinates, setCreateFormInitialCoordinates] = useState(null);
  
  // Estado para el modal de confirmación de creación desde el mapa
  const [mapClickConfirmation, setMapClickConfirmation] = useState({
    isOpen: false,
    location: null,
    coordinates: null
  });

  // Cargar favoritos desde la API
  const loadFavoriteIds = useCallback(async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setFavoriteEventIds([]);
      return;
    }

    try {
      const favoriteEvents = await getFavoriteEvents();
      const ids = favoriteEvents.map(event => event.id?.toString()).filter(Boolean);
      setFavoriteEventIds(ids);
    } catch (error) {
      console.warn('No se pudieron cargar los favoritos desde la API.', error);
      setFavoriteEventIds([]);
    }
  }, []);


  // Cargar eventos al montar el componente
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        // Usar getEvents() que respeta la configuración USE_MOCKS y puede usar la base de datos
        const eventsData = await getEvents();
        setEvents(eventsData || []);
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

  // Calcular tags disponibles según los eventos cargados (memoizado)
  const availableTags = useMemo(() => {
    const tagsSet = new Set();
    events.forEach(event => {
      if (Array.isArray(event.tags)) {
        event.tags.forEach(tag => {
          if (tag && typeof tag === "string") {
            tagsSet.add(tag);
          }
        });
      }
    });
    return Array.from(tagsSet).sort((a, b) => a.localeCompare(b));
  }, [events]);

  // Calcular eventos filtrados usando useMemo para optimización
  const filteredEvents = useMemo(() => {
    const favoritesSet = new Set(favoriteEventIds.map(id => id.toString()));

    return events.filter(event => {
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
        if (event.capacity > parseInt(filters.maxPersons, 10)) {
          return false;
        }
      }

      // Filtro por edad mínima
      if (filters.minAge) {
        const filterMinAge = parseInt(filters.minAge, 10);
        if (!isNaN(filterMinAge)) {
          // Si el evento tiene edad mínima y es mayor que el filtro, excluirlo
          if (event.edadMinima !== undefined && event.edadMinima !== null) {
            const eventMinAge = parseInt(event.edadMinima, 10);
            if (!isNaN(eventMinAge) && eventMinAge > filterMinAge) {
              return false;
            }
          }
        }
      }

      // Filtro por idioma
      if (filters.language) {
        if (!event.languages || !event.languages.includes(filters.language)) {
          return false;
        }
      }

      // Filtro por tags
      if (filters.tags && filters.tags.length > 0) {
        const eventTags = Array.isArray(event.tags) ? event.tags : [];
        const matchesTag = eventTags.some(tag => filters.tags.includes(tag));
        if (!matchesTag) {
          return false;
        }
      }

      // Filtro por favoritos
      if (filters.onlyFavorites) {
        if (!favoritesSet.has(event.id?.toString())) {
          return false;
        }
      }

      return true;
    });
  }, [events, filters, favoriteEventIds]);

  // Cargar favoritos al montar el componente
  useEffect(() => {
    loadFavoriteIds();
  }, [loadFavoriteIds]);

  // Escuchar actualizaciones de favoritos
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleFavoritesUpdated = () => {
      loadFavoriteIds();
    };

    window.addEventListener('favoritesUpdated', handleFavoritesUpdated);

    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdated);
    };
  }, [loadFavoriteIds]);


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

  const handleTagToggle = (tagValue) => {
    setFilters(prev => {
      const currentTags = prev.tags || [];
      const exists = currentTags.includes(tagValue);
      const updatedTags = exists
        ? currentTags.filter(tag => tag !== tagValue)
        : [...currentTags, tagValue];

      return {
        ...prev,
        tags: updatedTags
      };
    });
  };

  // Función para resetear todos los filtros
  const resetFilters = () => {
    setFilters({
      searchText: "",
      location: "",
      language: "",
      minAge: "",
      maxPersons: "",
      tags: [],
      onlyFavorites: false
    });
  };

  // Función para abrir el modal (click en la tarjeta)
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
    // Fijar el evento en el mapa cuando se hace click
    if (event && event.latitude && event.longitude) {
      setPinnedEvent(event);
    }
  };
  
  // Función para centrar el mapa cuando se hace hover sobre un evento
  const handleEventHover = (event) => {
    if (event && event.latitude && event.longitude) {
      setHoveredEvent(event);
    }
  };
  
  // Función para quitar el hover del mapa
  const handleEventHoverLeave = () => {
    setHoveredEvent(null);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    // No se quita pinnedEvent, así el mapa mantiene la ubicación
  };
  
  // Función para desfijar el evento del mapa
  const handleUnpinEvent = useCallback(() => {
    setPinnedEvent(null);
  }, []);


  // Función para cerrar el formulario de creación
  const handleCloseCreateForm = () => {
    setIsCreateFormOpen(false);
    setCreateFormInitialLocation(null);
    setCreateFormInitialCoordinates(null);
  };

  // Función para manejar clicks en el mapa
  const handleMapClick = useCallback((locationData) => {
    // Mostrar modal de confirmación en lugar de abrir directamente el formulario
    setMapClickConfirmation({
      isOpen: true,
      location: locationData.location,
      coordinates: {
        latitude: locationData.latitude,
        longitude: locationData.longitude
      }
    });
  }, []);

  // Función para confirmar la creación de evento desde el mapa
  const handleConfirmMapClick = useCallback(() => {
    setCreateFormInitialLocation(mapClickConfirmation.location);
    setCreateFormInitialCoordinates(mapClickConfirmation.coordinates);
    setMapClickConfirmation({ isOpen: false, location: null, coordinates: null });
    setIsCreateFormOpen(true);
  }, [mapClickConfirmation]);

  // Función para cancelar la creación de evento desde el mapa
  const handleCancelMapClick = useCallback(() => {
    setMapClickConfirmation({ isOpen: false, location: null, coordinates: null });
  }, []);

  // Función para manejar la creación de evento exitosa
  const handleEventCreated = async () => {
    setIsCreateFormOpen(false);
    setBanner({ type: "success", message: "Evento creado correctamente!" });
    setTimeout(() => setBanner({ type: "success", message: "" }), 3000);
    
    // Recargar eventos desde el backend
    try {
      const eventsData = await getEvents();
      setEvents(eventsData || []);
    } catch (error) {
      console.error('Error recargando eventos:', error);
      setBanner({ type: "error", message: "Error al recargar los eventos." });
      setTimeout(() => setBanner({ type: "success", message: "" }), 5000);
    }
  };

  // Función para unirse a un evento
  const handleJoinEvent = async (eventId) => {
    try {
      setJoiningEventId(eventId);

      const event = events.find(e => e.id === eventId);
      if (!event) {
        setBanner({ type: "error", message: "Evento no encontrado." });
        setTimeout(() => setBanner({ type: "success", message: "" }), 3000);
        return;
      }

      if (event.participants.length >= event.capacity) {
        setBanner({ type: "error", message: "El evento está completo. No puedes apuntarte." });
        setTimeout(() => setBanner({ type: "success", message: "" }), 3000);
        return;
      }

      if (event.isEnrolled) {
        setBanner({ type: "warning", message: "Ya estás apuntado a este evento." });
        setTimeout(() => setBanner({ type: "success", message: "" }), 3000);
        return;
      }

      await joinEvent(eventId);

      // Recargar eventos desde el backend
      const updatedEvents = await getEvents();
      setEvents(updatedEvents || []);
      
      // Actualizar el evento seleccionado si está abierto el modal
      if (selectedEvent && selectedEvent.id === eventId) {
        const updatedSelected = updatedEvents.find(e => e.id === eventId);
        if (updatedSelected) {
          setSelectedEvent(updatedSelected);
        }
      }
      
      setBanner({ type: "success", message: "¡Te has apuntado al evento correctamente!" });
      setTimeout(() => setBanner({ type: "success", message: "" }), 3000);
    } catch (error) {
      console.error('Error al apuntarse al evento:', error);
      const errorMessage = error.message || '';
      if (errorMessage.toLowerCase().includes('ya estás apuntado') || 
          errorMessage.toLowerCase().includes('apuntado') ||
          errorMessage.toLowerCase().includes('already')) {
        setBanner({ type: "warning", message: "Ya estás apuntado a este evento." });
      } else {
        setBanner({ type: "error", message: errorMessage || "Error al apuntarse al evento." });
      }
      setTimeout(() => setBanner({ type: "success", message: "" }), 5000);
    } finally {
      setJoiningEventId(null);
    }
  };

  // Función para salirse de un evento
  const handleLeaveEvent = async (eventId) => {
    try {
      const event = events.find(e => e.id === eventId);
      
      if (!event) {
        setBanner({ type: "error", message: "Evento no encontrado." });
        setTimeout(() => setBanner({ type: "success", message: "" }), 3000);
        return;
      }
      
      if (!event.isEnrolled) {
        setBanner({ type: "warning", message: "No estás apuntado a este evento." });
        setTimeout(() => setBanner({ type: "success", message: "" }), 3000);
        return;
      }

      await leaveEvent(eventId);

      // Recargar eventos desde el backend
      const updatedEvents = await getEvents();
      setEvents(updatedEvents || []);
      
      // Actualizar el evento seleccionado si está abierto el modal
      if (selectedEvent && selectedEvent.id === eventId) {
        const updatedSelected = updatedEvents.find(e => e.id === eventId);
        if (updatedSelected) {
          setSelectedEvent(updatedSelected);
        }
      }
      
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
                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '8px' }}>
                  💡 Haz clic en el mapa para crear un nuevo evento
                </p>
              </div>
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

                <div className="filter-dropdown">
                  <button 
                    className={`filter-icon-btn ${filters.tags && filters.tags.length ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFilter('tags');
                    }}
                    title="Filtrar por etiquetas"
                  >
                    <FaFeatherAlt />
                    <span>Tags</span>
                  </button>

                  {openFilter === 'tags' && (
                    <div className="filter-dropdown-content tags-dropdown">
                      <div className="filter-options">
                        {availableTags.length === 0 ? (
                          <p className="filter-empty">No hay etiquetas disponibles todavía.</p>
                        ) : (
                          <div className="tags-list">
                            {availableTags.map(tag => (
                              <label key={tag} className="tag-option">
                                <input
                                  type="checkbox"
                                  value={tag}
                                  checked={filters.tags?.includes(tag) || false}
                                  onChange={() => handleTagToggle(tag)}
                                />
                                <span>{tag}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        {filters.tags && filters.tags.length > 0 && (
                          <button
                            type="button"
                            className="tags-clear-btn"
                            onClick={() => handleFilterChange('tags', [])}
                          >
                            Limpiar tags
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className={`filter-icon-btn favorite-filter-btn ${filters.onlyFavorites ? 'active' : ''}`}
                  onClick={() => handleFilterChange('onlyFavorites', !filters.onlyFavorites)}
                  title="Mostrar solo eventos guardados"
                >
                  <FaBookmark />
                  <span>Solo favoritos</span>
                  <span className="favorite-count">{favoriteEventIds.length}</span>
                </button>
              </div>
              
              {/* Botón para limpiar filtros */}
              {(filters.searchText || filters.language || filters.minAge || filters.maxPersons || filters.onlyFavorites || (filters.tags && filters.tags.length > 0)) && (
                <button 
                  className="clear-filters-btn"
                  onClick={resetFilters}
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
                  const isEnrolled = event.isEnrolled || false;
                  const isFull = event.participants.length >= event.capacity;
                  
                  return (
                    <EventCard
                      key={event.id}
                      event={event}
                      isEnrolled={isEnrolled}
                      isFull={isFull}
                      isJoining={joiningEventId === event.id}
                      onJoin={() => handleJoinEvent(event.id)}
                      onLeave={() => handleLeaveEvent(event.id)}
                      onClick={() => handleEventClick(event)}
                      onMouseEnter={() => handleEventHover(event)}
                      onMouseLeave={handleEventHoverLeave}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="no-events">
                <p>No se encontraron eventos con los filtros aplicados.</p>
                <button 
                  className="btn btn-outline"
                  onClick={resetFilters}
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MITAD DERECHA: Mapa */}
        <div className="home-right">
          <EventMap 
            selectedEvent={hoveredEvent || pinnedEvent || selectedEvent} 
            events={filteredEvents}
            onUnpin={handleUnpinEvent}
            isPinned={!!pinnedEvent}
            onMapClick={handleMapClick}
          />
        </div>
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
            // handleJoinEvent ya actualiza el estado internamente
          }}
          onLeave={async () => {
            await handleLeaveEvent(selectedEvent.id);
          }}
        />
      )}

      {/* Modal de Confirmación para crear evento desde el mapa */}
      {mapClickConfirmation.isOpen && (
        <div className="modal-overlay" onClick={handleCancelMapClick}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>¿Crear evento aquí?</h2>
              <button className="modal-close" onClick={handleCancelMapClick}>✕</button>
            </div>
            <div className="modal-body">
              <p>¿Quieres añadir un evento en esta ubicación?</p>
              <p className="modal-location-info">
                <strong>Ubicación:</strong> {mapClickConfirmation.location}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={handleCancelMapClick}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleConfirmMapClick}>
                Sí, crear evento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Crear Evento */}
      <CreateEventForm
        isOpen={isCreateFormOpen}
        onClose={handleCloseCreateForm}
        onSuccess={handleEventCreated}
        initialLocation={createFormInitialLocation}
        initialCoordinates={createFormInitialCoordinates}
      />
    </div>
  );
}


