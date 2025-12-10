import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './EventMap.css';

// Fix para los iconos de marcadores en Leaflet con Create React App
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});


// Componente para centrar el mapa cuando cambia el evento seleccionado
function MapCenter({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
}

// Componente para detectar clicks en el mapa
function MapClickHandler({ onMapClick }) {
  const map = useMap();

  useEffect(() => {
    if (!onMapClick) return;

    const handleMapClick = async (e) => {
      const { lat, lng } = e.latlng;
      
      // Verificar que las coordenadas son válidas
      if (isNaN(lat) || isNaN(lng)) return;
      
      // Verificar que no es en el mar (coordenadas razonables)
      // Esto es una verificación básica - coordenadas válidas de tierra
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return;
      
      // Intentar obtener información de la ubicación usando reverse geocoding
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'EventManagerApp/1.0'
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          
          // Verificar que no es agua (mar, océano, etc.)
          const type = data.type || '';
          const isWater = type.includes('water') || 
                         type.includes('ocean') || 
                         type.includes('sea') ||
                         (data.address && (
                           data.address.waterway ||
                           data.address.natural === 'water'
                         ));
          
          if (!isWater && data.address) {
            // Construir el nombre de la ubicación
            const locationName = data.display_name || 
                                data.address.city || 
                                data.address.town || 
                                data.address.village ||
                                data.address.municipality ||
                                `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            
            onMapClick({
              latitude: lat,
              longitude: lng,
              location: locationName
            });
          } else {
            alert('Por favor, selecciona un lugar en tierra firme.');
          }
        } else {
          // Si falla la verificación, permitir el click de todas formas
          // pero con coordenadas básicas
          onMapClick({
            latitude: lat,
            longitude: lng,
            location: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
          });
        }
      } catch (error) {
        console.error('Error al verificar ubicación:', error);
        // Si falla la verificación, permitir el click de todas formas
        onMapClick({
          latitude: lat,
          longitude: lng,
          location: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        });
      }
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, onMapClick]);

  return null;
}

// Estilos de mapa disponibles
const MAP_STYLES = {
  googlelike: {
    name: 'Estilo Google Maps',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  light: {
    name: 'Claro (Positron)',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  dark: {
    name: 'Oscuro (Dark Matter)',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  default: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  terrain: {
    name: 'Topográfico',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
  },
  satellite: {
    name: 'Satelital',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>'
  }
};

const EventMap = React.memo(function EventMap({ selectedEvent, events = [], onUnpin, isPinned = false, onMapClick }) {
  const mapRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchCenter, setSearchCenter] = useState(null);
  const [searchZoom, setSearchZoom] = useState(null);
  const [mapStyle, setMapStyle] = useState('googlelike'); // Estado para el estilo del mapa (por defecto estilo Google Maps)

  // Función para buscar una ubicación usando Nominatim (OpenStreetMap)
  const searchLocation = useCallback(async (query) => {
    if (!query || query.trim() === '') {
      setSearchCenter(null);
      setSearchZoom(null);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'EventManagerApp/1.0' // Nominatim requiere un User-Agent
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Error en la búsqueda');
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        
        // Centrar el mapa en la ubicación encontrada
        setSearchCenter([lat, lon]);
        setSearchZoom(13); // Zoom más cercano para mostrar la ubicación
      } else {
        alert('No se encontró la ubicación. Intenta con otro término de búsqueda.');
      }
    } catch (error) {
      console.error('Error al buscar ubicación:', error);
      alert('Error al buscar la ubicación. Por favor, intenta de nuevo.');
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Manejar el envío del formulario de búsqueda
  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchLocation(searchQuery.trim());
    }
  }, [searchQuery, searchLocation]);


  // Si hay un evento seleccionado, usar sus coordenadas (memoizado)
  // Si hay una búsqueda activa, usar esas coordenadas
  const center = useMemo(() => {
    if (searchCenter) {
      return searchCenter;
    }
    if (selectedEvent && selectedEvent.latitude && selectedEvent.longitude) {
      return [selectedEvent.latitude, selectedEvent.longitude];
    }
    return [40.4168, -3.7038]; // Centro de España por defecto
  }, [selectedEvent, searchCenter]);

  const zoom = useMemo(() => {
    if (searchZoom) {
      return searchZoom;
    }
    return selectedEvent ? 13 : 6;
  }, [selectedEvent, searchZoom]);

  return (
    <div className="event-map-container">
      {/* Buscador de ubicaciones */}
      <form className="map-search-form" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          className="map-search-input"
          placeholder="Buscar ubicación (ej: Barcelona, Madrid...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isSearching}
        />
        <button
          type="submit"
          className="map-search-button"
          disabled={isSearching || !searchQuery.trim()}
          title="Buscar ubicación"
        >
          {isSearching ? '⏳' : '🔍'}
        </button>
        {searchCenter && (
          <button
            type="button"
            className="map-search-clear"
            onClick={() => {
              setSearchQuery('');
              setSearchCenter(null);
              setSearchZoom(null);
            }}
            title="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </form>

      {/* Selector de estilo del mapa */}
      <div className="map-style-selector">
        <select 
          className="map-style-select"
          value={mapStyle}
          onChange={(e) => setMapStyle(e.target.value)}
          title="Cambiar estilo del mapa"
        >
          {Object.entries(MAP_STYLES).map(([key, style]) => (
            <option key={key} value={key}>{style.name}</option>
          ))}
        </select>
      </div>

      {isPinned && onUnpin && (
        <button 
          className="map-unpin-button"
          onClick={onUnpin}
          title="Desfijar evento del mapa"
        >
          ✕ Desfijar
        </button>
      )}
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="event-map"
        ref={mapRef}
      >
        <TileLayer
          attribution={MAP_STYLES[mapStyle].attribution}
          url={MAP_STYLES[mapStyle].url}
        />
        
        {/* Centrar el mapa cuando cambia el evento seleccionado */}
        <MapCenter center={center} zoom={zoom} />
        
        {/* Detectar clicks en el mapa */}
        {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
        
        {/* Mostrar marcador del evento seleccionado */}
        {selectedEvent && selectedEvent.latitude && selectedEvent.longitude && (
          <Marker 
            key={`selected-${selectedEvent.id}`}
            position={[selectedEvent.latitude, selectedEvent.longitude]}
          >
            <Popup>
              <div className="map-popup-content">
                <h3>{selectedEvent.name}</h3>
                <p className="map-popup-location">{selectedEvent.location}</p>
                {selectedEvent.description && (
                  <p className="map-popup-description">{selectedEvent.description}</p>
                )}
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Mostrar todos los eventos como marcadores si no hay uno seleccionado */}
        {!selectedEvent && events.map(event => {
          if (event.latitude && event.longitude) {
            return (
              <Marker
                key={event.id}
                position={[event.latitude, event.longitude]}
              >
                <Popup>
                  <div className="map-popup-content">
                    <h3>{event.name}</h3>
                    <p className="map-popup-location">{event.location}</p>
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
});

export default EventMap;

