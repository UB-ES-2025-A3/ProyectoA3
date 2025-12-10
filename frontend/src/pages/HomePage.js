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
import { useTranslation } from "react-i18next";

export default function HomePage() {
  const { t } = useTranslation();

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
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setFavoriteEventIds([]);
      return;
    }

    try {
      const favoriteEvents = await getFavoriteEvents();
      const ids = favoriteEvents.map(event => event.id?.toString()).filter(Boolean);
      setFavoriteEventIds(ids);
    } catch (error) {
      console.warn("No se pudieron cargar los favoritos desde la API.", error);
      setFavoriteEventIds([]);
    }
  }, []);

  // Cargar eventos al montar el componente
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const eventsData = await getEvents();
        setEvents(eventsData || []);
      } catch (error) {
        console.error("Error cargando eventos:", error);
        setBanner({ type: "error", message: t("HomePage.banners.loadEventsError") });
        setTimeout(() => setBanner({ type: "success", message: "" }), 5000);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [t]);

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
        if (
          !event.name.toLowerCase().includes(searchLower) &&
          !event.description.toLowerCase().includes(searchLower)
        ) {
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
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleFavoritesUpdated = () => {
      loadFavoriteIds();
    };

    window.addEventListener("favoritesUpdated", handleFavoritesUpdated);

    return () => {
      window.removeEventListener("favoritesUpdated", handleFavoritesUpdated);
    };
  }, [loadFavoriteIds]);

  // Cerrar filtros al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openFilter && !event.target.closest(".filter-dropdown")) {
        setOpenFilter(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
    setBanner({ type: "success", message: t("HomePage.banners.eventCreatedSuccess") });
    setTimeout(() => setBanner({ type: "success", message: "" }), 3000);

    try {
      const eventsData = await getEvents();
      setEvents(eventsData || []);
    } catch (error) {
      console.error("Error recargando eventos:", error);
      setBanner({ type: "error", message: t("HomePage.banners.reloadEventsError") });
      setTimeout(() => setBanner({ type: "success", message: "" }), 5000);
    }
  };

  // Función para unirse a un evento
  const handleJoinEvent = async (eventId) => {
    try {
      setJoiningEventId(eventId);

      const event = events.find(e => e.id === eventId);
      if (!event) {
        setBanner({ type: "error", message: t("HomePage.banners.eventNotFound") });
        setTimeout(() => setBanner({ type: "success", message: "" }), 3000);
        return;
      }

      if (event.participants.length >= event.capacity) {
        setBanner({ type: "error", message: t("HomePage.banners.eventFull") });
        setTimeout(() => setBanner({ type: "success", message: "" }), 3000);
        return;
      }

      if (event.isEnrolled) {
        setBanner({ type: "warning", message: t("HomePage.banners.alreadyEnrolled") });
        setTimeout(() => setBanner({ type: "success", message: "" }), 3000);
        return;
      }

      await joinEvent(eventId);

      const updatedEvents = await getEvents();
      setEvents(updatedEvents || []);

      if (selectedEvent && selectedEvent.id === eventId) {
        const updatedSelected = updatedEvents.find(e => e.id === eventId);
        if (updatedSelected) {
          setSelectedEvent(updatedSelected);
        }
      }

      setBanner({ type: "success", message: t("HomePage.banners.joinSuccess") });
      setTimeout(() => setBanner({ type: "success", message: "" }), 3000);
    } catch (error) {
      console.error("Error al apuntarse al evento:", error);
      const errorMessage = error.message || "";
      if (
        errorMessage.toLowerCase().includes("ya estás apuntado") ||
        errorMessage.toLowerCase().includes("apuntado") ||
        errorMessage.toLowerCase().includes("already")
      ) {
        setBanner({ type: "warning", message: t("HomePage.banners.alreadyEnrolled") });
      } else {
        setBanner({
          type: "error",
          message: errorMessage || t("HomePage.banners.joinGenericError")
        });
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
        setBanner({ type: "error", message: t("HomePage.banners.eventNotFound") });
        setTimeout(() => setBanner({ type: "success", message: "" }), 3000);
        return;
      }

      if (!event.isEnrolled) {
        setBanner({ type: "warning", message: t("HomePage.banners.notEnrolled") });
        setTimeout(() => setBanner({ type: "success", message: "" }), 3000);
        return;
      }

      await leaveEvent(eventId);

      const updatedEvents = await getEvents();
      setEvents(updatedEvents || []);

      if (selectedEvent && selectedEvent.id === eventId) {
        const updatedSelected = updatedEvents.find(e => e.id === eventId);
        if (updatedSelected) {
          setSelectedEvent(updatedSelected);
        }
      }

      setBanner({ type: "success", message: t("HomePage.banners.leaveSuccess") });
      setTimeout(() => setBanner({ type: "success", message: "" }), 3000);
    } catch (error) {
      console.error("Error al desapuntarse del evento:", error);
      setBanner({
        type: "error",
        message: error.message || t("HomePage.banners.leaveGenericError")
      });
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
<h1 data-testid="home-title">
  {t("HomePage.header.title")}
</h1>
                <p>{t("HomePage.header.subtitle")}</p>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#666",
                    marginTop: "8px"
                  }}
                >
                  {t("HomePage.header.tip")}
                </p>
              </div>
            </div>

            {/* Buscador Principal */}
            <div className="main-search">
              <div className="search-input-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder={t("HomePage.search.placeholder")}
                  value={filters.searchText}
                  onChange={(e) => handleFilterChange("searchText", e.target.value)}
                  className="main-search-input"
                />
              </div>
            </div>

            {/* Filtros Rápidos con Iconos */}
            <div className="quick-filters">
              <div className="filter-icon-group">
                {/* Idioma */}
                <div className="filter-dropdown">
                  <button
                    className={`filter-icon-btn ${filters.language ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFilter("language");
                    }}
                    title={t("HomePage.filters.language.title")}
                  >
                    <FaLanguage />
                    <span>{t("HomePage.filters.language.label")}</span>
                  </button>

                  {openFilter === "language" && (
                    <div className="filter-dropdown-content language-dropdown">
                      <div className="filter-options">
                        <div className="language-search">
                          <input
                            type="text"
                            placeholder={t("HomePage.filters.language.searchPlaceholder")}
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
                              onChange={(e) => handleFilterChange("language", e.target.value)}
                            />
                            {t("HomePage.filters.language.any")}
                          </label>
                          <label>
                            <input
                              type="radio"
                              name="language"
                              value="es"
                              checked={filters.language === "es"}
                              onChange={(e) => handleFilterChange("language", e.target.value)}
                            />
                            🇪🇸 {t("HomePage.filters.language.spanish")}
                          </label>
                          <label>
                            <input
                              type="radio"
                              name="language"
                              value="en"
                              checked={filters.language === "en"}
                              onChange={(e) => handleFilterChange("language", e.target.value)}
                            />
                            🇬🇧 {t("HomePage.filters.language.english")}
                          </label>
                          <label>
                            <input
                              type="radio"
                              name="language"
                              value="fr"
                              checked={filters.language === "fr"}
                              onChange={(e) => handleFilterChange("language", e.target.value)}
                            />
                            🇫🇷 {t("HomePage.filters.language.french")}
                          </label>
                          <label>
                            <input
                              type="radio"
                              name="language"
                              value="de"
                              checked={filters.language === "de"}
                              onChange={(e) => handleFilterChange("language", e.target.value)}
                            />
                            🇩🇪 {t("HomePage.filters.language.german")}
                          </label>
                          <label>
                            <input
                              type="radio"
                              name="language"
                              value="it"
                              checked={filters.language === "it"}
                              onChange={(e) => handleFilterChange("language", e.target.value)}
                            />
                            🇮🇹 {t("HomePage.filters.language.italian")}
                          </label>
                          <label>
                            <input
                              type="radio"
                              name="language"
                              value="pt"
                              checked={filters.language === "pt"}
                              onChange={(e) => handleFilterChange("language", e.target.value)}
                            />
                            🇵🇹 {t("HomePage.filters.language.portuguese")}
                          </label>
                          <label>
                            <input
                              type="radio"
                              name="language"
                              value="ru"
                              checked={filters.language === "ru"}
                              onChange={(e) => handleFilterChange("language", e.target.value)}
                            />
                            🇷🇺 {t("HomePage.filters.language.russian")}
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Edad */}
                <div className="filter-dropdown">
                  <button
                    className={`filter-icon-btn ${filters.minAge ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFilter("age");
                    }}
                    title={t("HomePage.filters.age.title")}
                  >
                    <FaUsers />
                    <span>{t("HomePage.filters.age.label")}</span>
                  </button>

                  {openFilter === "age" && (
                    <div className="filter-dropdown-content">
                      <div className="filter-options">
                        <div className="age-input-section">
                          <label htmlFor="age-input">
                            {t("HomePage.filters.age.minAgeLabel")}
                          </label>
                          <div className="age-input-container">
                            <input
                              type="number"
                              id="age-input"
                              min="0"
                              max="100"
                              placeholder={t("HomePage.filters.age.placeholder")}
                              value={filters.minAge}
                              onChange={(e) => handleFilterChange("minAge", e.target.value)}
                              className="age-input"
                            />
                            <span className="age-unit">
                              {t("HomePage.filters.age.unit")}
                            </span>
                          </div>
                          <div className="age-presets">
                            <button
                              type="button"
                              className={`age-preset ${filters.minAge === "" ? "active" : ""}`}
                              onClick={() => handleFilterChange("minAge", "")}
                            >
                              {t("HomePage.filters.age.noLimit")}
                            </button>
                            <button
                              type="button"
                              className={`age-preset ${
                                filters.minAge === "18" ? "active" : ""
                              }`}
                              onClick={() => handleFilterChange("minAge", "18")}
                            >
                              {t("HomePage.filters.age.eighteenPlus")}
                            </button>
                            <button
                              type="button"
                              className={`age-preset ${
                                filters.minAge === "21" ? "active" : ""
                              }`}
                              onClick={() => handleFilterChange("minAge", "21")}
                            >
                              {t("HomePage.filters.age.twentyOnePlus")}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Capacidad */}
                <div className="filter-dropdown">
                  <button
                    className={`filter-icon-btn ${filters.maxPersons ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFilter("capacity");
                    }}
                    title={t("HomePage.filters.capacity.title")}
                  >
                    <FaUsers />
                    <span>{t("HomePage.filters.capacity.label")}</span>
                  </button>

                  {openFilter === "capacity" && (
                    <div className="filter-dropdown-content">
                      <div className="filter-options">
                        <div className="capacity-input-section">
                          <label htmlFor="capacity-input">
                            {t("HomePage.filters.capacity.maxLabel")}
                          </label>
                          <div className="capacity-input-container">
                            <input
                              type="number"
                              id="capacity-input"
                              min="1"
                              max="100"
                              placeholder={t("HomePage.filters.capacity.placeholder")}
                              value={filters.maxPersons}
                              onChange={(e) =>
                                handleFilterChange("maxPersons", e.target.value)
                              }
                              className="capacity-input"
                            />
                            <span className="capacity-unit">
                              {t("HomePage.filters.capacity.unit")}
                            </span>
                          </div>
                          <div className="capacity-presets">
                            <button
                              type="button"
                              className={`capacity-preset ${
                                filters.maxPersons === "" ? "active" : ""
                              }`}
                              onClick={() => handleFilterChange("maxPersons", "")}
                            >
                              {t("HomePage.filters.capacity.noLimit")}
                            </button>
                            <button
                              type="button"
                              className={`capacity-preset ${
                                filters.maxPersons === "5" ? "active" : ""
                              }`}
                              onClick={() => handleFilterChange("maxPersons", "5")}
                            >
                              {t("HomePage.filters.capacity.max5")}
                            </button>
                            <button
                              type="button"
                              className={`capacity-preset ${
                                filters.maxPersons === "10" ? "active" : ""
                              }`}
                              onClick={() => handleFilterChange("maxPersons", "10")}
                            >
                              {t("HomePage.filters.capacity.max10")}
                            </button>
                            <button
                              type="button"
                              className={`capacity-preset ${
                                filters.maxPersons === "20" ? "active" : ""
                              }`}
                              onClick={() => handleFilterChange("maxPersons", "20")}
                            >
                              {t("HomePage.filters.capacity.max20")}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="filter-dropdown">
                  <button
                    className={`filter-icon-btn ${
                      filters.tags && filters.tags.length ? "active" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFilter("tags");
                    }}
                    title={t("HomePage.filters.tags.title")}
                  >
                    <FaFeatherAlt />
                    <span>{t("HomePage.filters.tags.label")}</span>
                  </button>

                  {openFilter === "tags" && (
                    <div className="filter-dropdown-content tags-dropdown">
                      <div className="filter-options">
                        {availableTags.length === 0 ? (
                          <p className="filter-empty">
                            {t("HomePage.filters.tags.empty")}
                          </p>
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
                            onClick={() => handleFilterChange("tags", [])}
                          >
                            {t("HomePage.filters.tags.clear")}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Solo favoritos */}
                <button
                  type="button"
                  className={`filter-icon-btn favorite-filter-btn ${
                    filters.onlyFavorites ? "active" : ""
                  }`}
                  onClick={() =>
                    handleFilterChange("onlyFavorites", !filters.onlyFavorites)
                  }
                  title={t("HomePage.filters.favorites.title")}
                >
                  <FaBookmark />
                  <span>{t("HomePage.filters.favorites.label")}</span>
                  <span className="favorite-count">{favoriteEventIds.length}</span>
                </button>
              </div>

              {/* Botón para limpiar filtros */}
              {(filters.searchText ||
                filters.language ||
                filters.minAge ||
                filters.maxPersons ||
                filters.onlyFavorites ||
                (filters.tags && filters.tags.length > 0)) && (
                <button className="clear-filters-btn" onClick={resetFilters}>
                  {t("HomePage.filters.clearButton")}
                </button>
              )}
            </div>
          </header>

          {/* Lista de Eventos */}
          <div className="events-list">
            <h2>
              {t("HomePage.eventsList.title")} ({filteredEvents.length})
            </h2>
            {loading ? (
              <p>{t("HomePage.eventsList.loading")}</p>
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
                <p>{t("HomePage.eventsList.empty")}</p>
                <button className="btn btn-outline" onClick={resetFilters}>
                  {t("HomePage.eventsList.clearFilters")}
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
              <h2>{t("HomePage.mapModal.title")}</h2>
              <button className="modal-close" onClick={handleCancelMapClick}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>{t("HomePage.mapModal.question")}</p>
              <p className="modal-location-info">
                <strong>{t("HomePage.mapModal.locationLabel")}</strong>{" "}
                {mapClickConfirmation.location}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={handleCancelMapClick}>
                {t("HomePage.mapModal.cancel")}
              </button>
              <button className="btn btn-primary" onClick={handleConfirmMapClick}>
                {t("HomePage.mapModal.confirm")}
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
