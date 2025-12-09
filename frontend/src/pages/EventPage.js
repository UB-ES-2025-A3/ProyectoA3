// src/pages/EventPage.js
import React, { useCallback, useEffect, useState } from 'react';
import { getEvents, joinEvent, leaveEvent, getFavoriteEvents } from '../services/eventService';
import EventCard from '../components/events/EventCard';
import EventModal from '../components/events/EventModal';
import CreateEventForm from '../components/events/CreateEventForm';
import MessageBanner from '../components/common/MessageBanner';
import '../styles/EventPage.css';
import { FaLanguage, FaUsers, FaSearch, FaFeatherAlt, FaBookmark } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

export default function EventPage() {

  const { t } = useTranslation();
  
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState({ type: 'success', message: '' });
  const [filters, setFilters] = useState({
    searchText: '',
    location: '',
    language: '',
    minAge: '',
    maxPersons: '',
    tags: [],
    onlyFavorites: false
  });
  const [openFilter, setOpenFilter] = useState(null);
  const [availableTags, setAvailableTags] = useState([]);
  const [joiningEventId, setJoiningEventId] = useState(null);
  const [favoriteEventIds, setFavoriteEventIds] = useState([]);

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

  // Modal states
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  const applyFilters = useCallback(() => {
    const favoritesSet = new Set(favoriteEventIds.map(id => id.toString()));

    const filtered = events.filter(event => {
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        if (
          !event.name.toLowerCase().includes(searchLower) &&
          !event.description.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      if (filters.location) {
        if (!event.location.toLowerCase().includes(filters.location.toLowerCase())) {
          return false;
        }
      }

      if (filters.maxPersons) {
        if (event.capacity > parseInt(filters.maxPersons, 10)) {
          return false;
        }
      }

      if (filters.language) {
        if (!event.languages || !event.languages.includes(filters.language)) {
          return false;
        }
      }

      if (filters.tags && filters.tags.length > 0) {
        const eventTags = Array.isArray(event.tags) ? event.tags : [];
        const matchesTag = eventTags.some(tag => filters.tags.includes(tag));
        if (!matchesTag) {
          return false;
        }
      }

      if (filters.onlyFavorites) {
        if (!favoritesSet.has(event.id?.toString())) {
          return false;
        }
      }

      return true;
    });

    setFilteredEvents(filtered);
  }, [events, filters, favoriteEventIds]);

  // Cargar eventos al montar el componente
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const eventsData = await getEvents();
        setEvents(eventsData);
        setFilteredEvents(eventsData);
      } catch (error) {
        console.error('Error cargando eventos:', error);
        setBanner({
          type: 'error',
          message: t('eventsPage.messages.loadError')
        });
        setTimeout(() => setBanner({ type: 'success', message: '' }), 5000);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

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

  useEffect(() => {
    const tagsSet = new Set();
    events.forEach(event => {
      if (Array.isArray(event.tags)) {
        event.tags.forEach(tag => {
          if (tag && typeof tag === 'string') {
            tagsSet.add(tag);
          }
        });
      }
    });
    setAvailableTags(Array.from(tagsSet).sort((a, b) => a.localeCompare(b)));
  }, [events]);

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

  // Funciones de UI de filtros
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

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

  const resetFilters = () => {
    setFilters({
      searchText: '',
      location: '',
      language: '',
      minAge: '',
      maxPersons: '',
      tags: [],
      onlyFavorites: false
    });
  };

  // Modal helpers
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleOpenCreateForm = () => {
    setIsCreateFormOpen(true);
  };

  const handleCloseCreateForm = () => {
    setIsCreateFormOpen(false);
  };

  // Función para unirse a un evento
  const handleJoinEvent = async (eventId) => {
    try {
      setJoiningEventId(eventId);

      const event = events.find(e => e.id === eventId);
      if (!event) {
        setBanner({ type: 'error', message: t('eventsPage.messages.eventNotFound') });
        setTimeout(() => setBanner({ type: 'success', message: '' }), 3000);
        return;
      }

      if (event.participants.length >= event.capacity) {
        setBanner({ type: 'error', message: t('eventsPage.messages.eventFull') });
        setTimeout(() => setBanner({ type: 'success', message: '' }), 3000);
        return;
      }

      if (event.isEnrolled) {
        setBanner({ type: 'warning', message: t('eventsPage.messages.alreadyEnrolled') });
        setTimeout(() => setBanner({ type: 'success', message: '' }), 3000);
        return;
      }

      await joinEvent(eventId);

      const updatedEvents = await getEvents();
      setEvents(updatedEvents);
      const updatedSelected = updatedEvents.find(e => selectedEvent && e.id === selectedEvent.id);
      if (updatedSelected) {
        setSelectedEvent(updatedSelected);
      }

      setBanner({ type: 'success', message: t('eventsPage.messages.joinSuccess') });
      setTimeout(() => setBanner({ type: 'success', message: '' }), 3000);
    } catch (error) {
      console.error('Error al apuntarse al evento:', error);
      const errorMessage = error.message || '';
      if (
        errorMessage.toLowerCase().includes('ya estás apuntado') ||
        errorMessage.toLowerCase().includes('apuntado')
      ) {
        setBanner({ type: 'warning', message: t('eventsPage.messages.alreadyEnrolled') });
      } else {
        setBanner({
          type: 'error',
          message: errorMessage || t('eventsPage.messages.joinErrorFallback')
        });
      }
      setTimeout(() => setBanner({ type: 'success', message: '' }), 5000);
    } finally {
      setJoiningEventId(null);
    }
  };

  // Función para salirse de un evento
  const handleLeaveEvent = async (eventId) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) {
        setBanner({ type: 'error', message: t('eventsPage.messages.eventNotFound') });
        setTimeout(() => setBanner({ type: 'success', message: '' }), 3000);
        return;
      }

      if (!event.isEnrolled) {
        setBanner({ type: 'warning', message: t('eventsPage.messages.notEnrolled') });
        setTimeout(() => setBanner({ type: 'success', message: '' }), 3000);
        return;
      }

      await leaveEvent(eventId);

      const updatedEvents = await getEvents();
      setEvents(updatedEvents);

      if (selectedEvent && selectedEvent.id === eventId) {
        const updatedEvent = updatedEvents.find(e => e.id === eventId);
        if (updatedEvent) {
          setSelectedEvent(updatedEvent);
        }
      }

      setBanner({ type: 'success', message: t('eventsPage.messages.leaveSuccess') });
      setTimeout(() => setBanner({ type: 'success', message: '' }), 3000);
    } catch (error) {
      console.error('Error al desapuntarse del evento:', error);
      setBanner({
        type: 'error',
        message: error.message || t('eventsPage.messages.leaveErrorFallback')
      });
      setTimeout(() => setBanner({ type: 'success', message: '' }), 5000);
    }
  };

  // Función para manejar la creación de evento exitosa
  const handleEventCreated = () => {
    setIsCreateFormOpen(false);
    setBanner({ type: 'success', message: t('eventsPage.messages.createSuccess') });
    setTimeout(() => setBanner({ type: 'success', message: '' }), 3000);

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
      <div className="event-page-layout">
        <aside className="event-filters-panel">
          <div className="filters-card">
            <h2 className="filters-title">{t('eventsPage.filters.title')}</h2>
            <p className="filters-subtitle">
              {t('eventsPage.filters.subtitle')}
            </p>

            <div className="main-search">
              <div className="search-input-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder={t('eventsPage.filters.searchPlaceholder')}
                  value={filters.searchText}
                  onChange={(e) => handleFilterChange('searchText', e.target.value)}
                  className="main-search-input"
                />
              </div>
            </div>

            <div className="quick-filters vertical">
              <div className="filter-icon-group vertical">
                {/* Idioma */}
                <div className="filter-dropdown">
                  <button
                    className={`filter-icon-btn ${filters.language ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFilter('language');
                    }}
                    title={t('eventsPage.filters.language.buttonTitle')}
                  >
                    <FaLanguage />
                    <span>{t('eventsPage.filters.language.buttonLabel')}</span>
                  </button>

                  {openFilter === 'language' && (
                    <div className="filter-dropdown-content language-dropdown">
                      <div className="filter-options">
                        <div className="language-search">
                          <input
                            type="text"
                            placeholder={t('eventsPage.filters.language.searchPlaceholder')}
                            className="language-search-input"
                          />
                        </div>
                        <div className="language-list">
                          <label>
                            <input
                              type="radio"
                              name="language"
                              value=""
                              checked={filters.language === ''}
                              onChange={(e) => handleFilterChange('language', e.target.value)}
                            />
                            {t('eventsPage.filters.language.any')}
                          </label>
                          <label>
                            <input
                              type="radio"
                              name="language"
                              value="es"
                              checked={filters.language === 'es'}
                              onChange={(e) => handleFilterChange('language', e.target.value)}
                            />
                            🇪🇸 {t('eventsPage.filters.language.es')}
                          </label>
                          <label>
                            <input
                              type="radio"
                              name="language"
                              value="en"
                              checked={filters.language === 'en'}
                              onChange={(e) => handleFilterChange('language', e.target.value)}
                            />
                            🇬🇧 {t('eventsPage.filters.language.en')}
                          </label>
                          <label>
                            <input
                              type="radio"
                              name="language"
                              value="fr"
                              checked={filters.language === 'fr'}
                              onChange={(e) => handleFilterChange('language', e.target.value)}
                            />
                            🇫🇷 {t('eventsPage.filters.language.fr')}
                          </label>
                          <label>
                            <input
                              type="radio"
                              name="language"
                              value="de"
                              checked={filters.language === 'de'}
                              onChange={(e) => handleFilterChange('language', e.target.value)}
                            />
                            🇩🇪 {t('eventsPage.filters.language.de')}
                          </label>
                          <label>
                            <input
                              type="radio"
                              name="language"
                              value="it"
                              checked={filters.language === 'it'}
                              onChange={(e) => handleFilterChange('language', e.target.value)}
                            />
                            🇮🇹 {t('eventsPage.filters.language.it')}
                          </label>
                          <label>
                            <input
                              type="radio"
                              name="language"
                              value="pt"
                              checked={filters.language === 'pt'}
                              onChange={(e) => handleFilterChange('language', e.target.value)}
                            />
                            🇵🇹 {t('eventsPage.filters.language.pt')}
                          </label>
                          <label>
                            <input
                              type="radio"
                              name="language"
                              value="ru"
                              checked={filters.language === 'ru'}
                              onChange={(e) => handleFilterChange('language', e.target.value)}
                            />
                            🇷🇺 {t('eventsPage.filters.language.ru')}
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Capacidad */}
                <div className="filter-dropdown">
                  <button
                    className={`filter-icon-btn ${filters.maxPersons ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFilter('capacity');
                    }}
                    title={t('eventsPage.filters.capacity.buttonTitle')}
                  >
                    <FaUsers />
                    <span>{t('eventsPage.filters.capacity.buttonLabel')}</span>
                  </button>

                  {openFilter === 'capacity' && (
                    <div className="filter-dropdown-content">
                      <div className="filter-options">
                        <div className="capacity-input-section">
                          <label htmlFor="capacity-input">
                            {t('eventsPage.filters.capacity.label')}
                          </label>
                          <div className="capacity-input-container">
                            <input
                              type="number"
                              id="capacity-input"
                              min="1"
                              max="100"
                              placeholder={t('eventsPage.filters.capacity.placeholder')}
                              value={filters.maxPersons}
                              onChange={(e) => handleFilterChange('maxPersons', e.target.value)}
                              className="capacity-input"
                            />
                            <span className="capacity-unit">
                              {t('eventsPage.filters.capacity.unit')}
                            </span>
                          </div>
                          <div className="capacity-presets">
                            <button
                              type="button"
                              className={`capacity-preset ${filters.maxPersons === '' ? 'active' : ''}`}
                              onClick={() => handleFilterChange('maxPersons', '')}
                            >
                              {t('eventsPage.filters.capacity.presets.noLimit')}
                            </button>
                            <button
                              type="button"
                              className={`capacity-preset ${filters.maxPersons === '5' ? 'active' : ''}`}
                              onClick={() => handleFilterChange('maxPersons', '5')}
                            >
                              {t('eventsPage.filters.capacity.presets.le5')}
                            </button>
                            <button
                              type="button"
                              className={`capacity-preset ${filters.maxPersons === '10' ? 'active' : ''}`}
                              onClick={() => handleFilterChange('maxPersons', '10')}
                            >
                              {t('eventsPage.filters.capacity.presets.le10')}
                            </button>
                            <button
                              type="button"
                              className={`capacity-preset ${filters.maxPersons === '20' ? 'active' : ''}`}
                              onClick={() => handleFilterChange('maxPersons', '20')}
                            >
                              {t('eventsPage.filters.capacity.presets.le20')}
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
                    className={`filter-icon-btn ${filters.tags && filters.tags.length ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFilter('tags');
                    }}
                    title={t('eventsPage.filters.tags.buttonTitle')}
                  >
                    <FaFeatherAlt />
                    <span>{t('eventsPage.filters.tags.buttonLabel')}</span>
                  </button>

                  {openFilter === 'tags' && (
                    <div className="filter-dropdown-content tags-dropdown">
                      <div className="filter-options">
                        {availableTags.length === 0 ? (
                          <p className="filter-empty">
                            {t('eventsPage.filters.tags.empty')}
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
                            onClick={() => handleFilterChange('tags', [])}
                          >
                            {t('eventsPage.filters.tags.clear')}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Solo favoritos */}
                <button
                  type="button"
                  className={`filter-icon-btn favorite-filter-btn ${filters.onlyFavorites ? 'active' : ''}`}
                  onClick={() => handleFilterChange('onlyFavorites', !filters.onlyFavorites)}
                  title={t('eventsPage.filters.favorites.buttonTitle')}
                >
                  <FaBookmark />
                  <span>{t('eventsPage.filters.favorites.buttonLabel')}</span>
                  <span className="favorite-count">{favoriteEventIds.length}</span>
                </button>
              </div>

              {(filters.searchText ||
                filters.language ||
                filters.minAge ||
                filters.maxPersons ||
                filters.onlyFavorites ||
                (filters.tags && filters.tags.length > 0)) && (
                  <button
                    className="clear-filters-btn full-width"
                    onClick={resetFilters}
                  >
                    {t('eventsPage.filters.clearFilters')}
                  </button>
                )}
            </div>
          </div>
        </aside>

        <div className="event-page-main">
          <div className="event-page-header">
            <div>
              <h1>{t('eventsPage.header.title')}</h1>
              <p className="event-page-subtitle">
                {t('eventsPage.header.subtitle')}
              </p>
            </div>
            <button className="btn btn-primary btn-large" onClick={handleOpenCreateForm}>
              + {t('eventsPage.header.createButton')}
            </button>
          </div>

          <section className="event-results">
            <div className="events-list">
              {loading ? (
                <p>{t('eventsPage.list.loading')}</p>
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
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="no-events">
                  <p>{t('eventsPage.list.empty')}</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {banner.message && <MessageBanner type={banner.type} message={banner.message} />}

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          isEnrolled={selectedEvent.isEnrolled || false}
          isFull={(selectedEvent.participants || []).length >= selectedEvent.capacity}
          onJoin={async () => {
            await handleJoinEvent(selectedEvent.id);
          }}
          onLeave={async () => {
            await handleLeaveEvent(selectedEvent.id);
          }}
        />
      )}

      <CreateEventForm
        isOpen={isCreateFormOpen}
        onClose={handleCloseCreateForm}
        onSuccess={handleEventCreated}
      />
    </div>
  );
}