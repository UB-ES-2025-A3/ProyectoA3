// src/pages/HomePage.js
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { joinEvent, leaveEvent } from "../services/eventService";
import { homePageMockEvents } from "../mocks/homePageEvents.mock";
import EventCard from "../components/events/EventCard";
import EventModal from "../components/events/EventModal";
import CreateEventForm from "../components/events/CreateEventForm";
import MessageBanner from "../components/common/MessageBanner";
import EventMap from "../components/map/EventMap";
import "../styles/HomePage.css";

// Iconos
import { FaLanguage, FaUsers, FaSearch, FaMapMarkerAlt, FaFeatherAlt, FaBookmark } from "react-icons/fa"; 

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

  // Función para obtener favoritos del localStorage
  const getStoredFavoriteIds = useCallback(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const stored = JSON.parse(localStorage.getItem('favoriteEvents') || '[]');
      return Array.isArray(stored) ? stored : [];
    } catch (error) {
      console.warn('No se pudieron cargar los favoritos almacenados.', error);
      return [];
    }
  }, []);


  // Cargar eventos mock al montar el componente (solo para HomePage)
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        // Usar mocks con coordenadas para el mapa
        // Transformar los eventos mock al formato del frontend (similar a eventService.transformEvents)
        const eventsData = homePageMockEvents.map(event => {
          // Construir startDate desde fecha y hora
          const startDate = event.fecha && event.hora 
            ? `${event.fecha}T${event.hora}Z`
            : event.startDate || new Date().toISOString();
          
          // Normalizar tags
          const tags = Array.isArray(event.tags) ? event.tags : [];
          
          // Normalizar languages desde idiomas_permitidos
          const languages = event.idiomas_permitidos 
            ? event.idiomas_permitidos.split(',').map(l => l.trim()).filter(l => l)
            : event.languages || [];
          
          // Normalizar participants
          const participants = event.participants 
            ? event.participants.map(p => typeof p === 'object' ? p.id : p)
            : [];
          
          // Construir restrictions string
          let restrictions = "";
          if (event.restricciones) {
            if (typeof event.restricciones === 'object') {
              if (event.restricciones.edad_minima) {
                restrictions = `Edad mínima: ${event.restricciones.edad_minima} años`;
              } else if (event.restricciones.requisitos) {
                restrictions = event.restricciones.requisitos;
              } else if (event.restricciones.max_personas) {
                restrictions = `Grupo máx. ${event.restricciones.max_personas}`;
              }
            } else {
              restrictions = event.restricciones;
            }
          }
          
          return {
            id: event.id?.toString() || `mock-${Math.random()}`,
            name: event.titulo || event.name || "Evento sin título",
            location: event.lugar || event.location || "Ubicación por confirmar",
            startDate,
            description: event.descripcion || event.description || "",
            restrictions,
            imageUrl: event.imageUrl || "",
            capacity: event.max_personas || event.capacity || 10,
            participants,
            languages: languages.length ? languages : ["es"],
            tags,
            isEnrolled: event.isEnrolled || false,
            id_creador: event.id_creador,
            creatorId: event.id_creador, // Alias para compatibilidad
            latitude: event.latitude,
            longitude: event.longitude,
          };
        });
        
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
    setFavoriteEventIds(getStoredFavoriteIds());
  }, [getStoredFavoriteIds]);

  // Escuchar cambios en favoritos
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleFavoritesUpdated = () => {
      setFavoriteEventIds(getStoredFavoriteIds());
    };

    window.addEventListener('favoritesUpdated', handleFavoritesUpdated);
    window.addEventListener('storage', handleFavoritesUpdated);

    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdated);
      window.removeEventListener('storage', handleFavoritesUpdated);
    };
  }, [getStoredFavoriteIds]);


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
    
    // Recargar eventos mock (en HomePage usamos mocks)
    const loadEvents = async () => {
      try {
        const eventsData = homePageMockEvents.map(event => ({
          ...event,
          participants: event.participants.map(p => p.id),
        }));
        setEvents(eventsData);
      } catch (error) {
        console.error('Error recargando eventos:', error);
      }
    };
    loadEvents();
  };

  // Función para unirse a un evento (simulado con mocks en HomePage)
  const handleJoinEvent = async (eventId) => {
    try {
      setJoiningEventId(eventId);
      const event = events.find(e => e.id === eventId);
      
      if (!event) {
        setBanner({ type: "error", message: "Evento no encontrado." });
        setTimeout(() => setBanner({ type: "success", message: "" }), 3000);
        return;
      }
      
      // Verificar si ya está lleno
      if (event.participants.length >= event.capacity) {
        setBanner({ type: "error", message: "El evento está completo. No puedes apuntarte." });
        setTimeout(() => setBanner({ type: "success", message: "" }), 3000);
        return;
      }
      
      // Verificar si ya está apuntado
      const currentUserId = localStorage.getItem('userId') || 'me';
      if (event.participants.includes(currentUserId) || event.isEnrolled) {
        setBanner({ type: "warning", message: "Ya estás apuntado a este evento." });
        setTimeout(() => setBanner({ type: "success", message: "" }), 3000);
        return;
      }

      // Simular unirse al evento (en HomePage usamos mocks, no llamamos al backend)
      const updatedEvents = events.map(e => {
        if (e.id === eventId) {
          return {
            ...e,
            participants: [...e.participants, currentUserId],
            isEnrolled: true
          };
        }
        return e;
      });
      setEvents(updatedEvents);
      
      // Actualizar el evento seleccionado si está abierto el modal
      if (selectedEvent && selectedEvent.id === eventId) {
        const updatedEvent = updatedEvents.find(e => e.id === eventId);
        if (updatedEvent) {
          setSelectedEvent(updatedEvent);
        }
      }
      
      setBanner({ type: "success", message: "¡Te has apuntado al evento correctamente!" });
      setTimeout(() => setBanner({ type: "success", message: "" }), 3000);
    } catch (error) {
      console.error('Error al apuntarse al evento:', error);
      const errorMessage = error.message || '';
      if (errorMessage.toLowerCase().includes('ya estás apuntado') || 
          errorMessage.toLowerCase().includes('apuntado')) {
        setBanner({ type: "warning", message: "Ya estás apuntado a este evento." });
      } else {
        setBanner({ type: "error", message: errorMessage || "Error al apuntarse al evento." });
      }
      setTimeout(() => setBanner({ type: "success", message: "" }), 5000);
    }
    finally {
      setJoiningEventId(null);
    }
  };

  // Función para salirse de un evento (simulado con mocks en HomePage)
  const handleLeaveEvent = async (eventId) => {
    try {
      const event = events.find(e => e.id === eventId);
      
      if (!event) {
        setBanner({ type: "error", message: "Evento no encontrado." });
        setTimeout(() => setBanner({ type: "success", message: "" }), 3000);
        return;
      }
      
      // Verificar si está apuntado
      const currentUserId = localStorage.getItem('userId') || 'me';
      if (!event.participants.includes(currentUserId) && !event.isEnrolled) {
        setBanner({ type: "warning", message: "No estás apuntado a este evento." });
        setTimeout(() => setBanner({ type: "success", message: "" }), 3000);
        return;
      }

      // Simular salirse del evento (en HomePage usamos mocks, no llamamos al backend)
      const updatedEvents = events.map(e => {
        if (e.id === eventId) {
          return {
            ...e,
            participants: e.participants.filter(id => id !== currentUserId),
            isEnrolled: false
          };
        }
        return e;
      });
      setEvents(updatedEvents);
      
      // Actualizar el evento seleccionado si está abierto el modal
      if (selectedEvent && selectedEvent.id === eventId) {
        const updatedEvent = updatedEvents.find(e => e.id === eventId);
        if (updatedEvent) {
          setSelectedEvent(updatedEvent);
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

      {/* Modal de Crear Evento */}
      <CreateEventForm
        isOpen={isCreateFormOpen}
        onClose={handleCloseCreateForm}
        onSuccess={handleEventCreated}
      />
    </div>
  );
}


