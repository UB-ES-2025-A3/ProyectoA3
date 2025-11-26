import React, { useEffect, useRef, useMemo } from 'react';
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

const EventMap = React.memo(function EventMap({ selectedEvent, events = [], onUnpin, isPinned = false }) {
  const mapRef = useRef(null);

  // Filtrar eventos que tengan coordenadas válidas (memoizado)
  const eventsWithCoords = useMemo(() => 
    events.filter(e => e.latitude && e.longitude),
    [events]
  );

  // Si hay un evento seleccionado, usar sus coordenadas (memoizado)
  const center = useMemo(() => {
    if (selectedEvent && selectedEvent.latitude && selectedEvent.longitude) {
      return [selectedEvent.latitude, selectedEvent.longitude];
    }
    return [40.4168, -3.7038]; // Centro de España por defecto
  }, [selectedEvent]);

  const zoom = useMemo(() => selectedEvent ? 13 : 6, [selectedEvent]);

  return (
    <div className="event-map-container">
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
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Centrar el mapa cuando cambia el evento seleccionado */}
        <MapCenter center={center} zoom={zoom} />
        
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

