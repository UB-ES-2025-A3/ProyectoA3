// src/pages/HomePage.js
import React, { useEffect, useMemo, useState } from "react";
import { getEvents, joinEvent, leaveEvent } from "../services/eventService";
import { mockEvents } from "../mocks/events.mock";
import EventCard from "../components/events/EventCard";
import MessageBanner from "../components/common/MessageBanner";
import "../styles/HomePage.css";


export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState({ type: "success", message: "" });
  const [me, setMe] = useState(null); // si tienes authService, úsalo aquí

  useEffect(() => {
    // Si tienes authService.getCurrentUser(), úsalo:
    // setMe(authService.getCurrentUser());
    setMe({ id: "me" }); // placeholder
  }, []);

  useEffect(() => {
  (async () => {
    try {
      setLoading(true);
      const data = await getEvents();
      setEvents(data);
    } catch (e) {
      // FALLBACK a mocks
      setEvents(
        [...mockEvents].sort(
          (a, b) => new Date(a.startDate) - new Date(b.startDate)
        )
      );
      setBanner({
        type: "error",
        message: "Backend no disponible. Mostrando datos de prueba.",
      });
    } finally {
      setLoading(false);
    }
  })();
}, []);

  const handleJoin = async (eventId) => {
    try {
      await joinEvent(eventId);
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === eventId
            ? { ...ev, participants: [...(ev.participants || []), { id: me?.id }] }
            : ev
        )
      );
      setBanner({ type: "success", message: "Te has apuntado al evento" });
    } catch (e) {
      const msg =
        e.message?.toLowerCase().includes("completo")
          ? "Este evento ya está completo"
          : e.message?.toLowerCase().includes("inscrito")
          ? "Ya estás inscrito en este evento"
          : e.message || "No ha sido posible apuntarte";
      setBanner({ type: "error", message: msg });
    }
  };

  const handleLeave = async (eventId) => {
    try {
      await leaveEvent(eventId);
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === eventId
            ? {
                ...ev,
                participants: (ev.participants || []).filter((p) => p.id !== me?.id),
              }
            : ev
        )
      );
      setBanner({ type: "success", message: "Te has desapuntado del evento" });
    } catch (e) {
      setBanner({ type: "error", message: e.message || "No ha sido posible desapuntarte" });
    }
  };

  const content = useMemo(() => {
    if (loading) return <p className="home-loading">Cargando eventos…</p>;
    if (!events.length)
      return (
        <div className="home-empty">
          <p>No hay eventos disponibles para este viaje.</p>
          <button className="btn btn-primary">Crear evento</button>
        </div>
      );

    return (
      <ul className="home-list">
        {events.map((ev) => {
          const participants = ev.participants || [];
          const isEnrolled = !!participants.find((p) => p.id === me?.id);
          const isFull =
            typeof ev.capacity === "number" && participants.length >= ev.capacity;

          return (
            <li key={ev.id}>
              <EventCard
                event={ev}
                isEnrolled={isEnrolled}
                isFull={isFull}
                onJoin={() => handleJoin(ev.id)}
                onLeave={() => handleLeave(ev.id)}
              />
            </li>
          );
        })}
      </ul>
    );
  }, [events, loading, me]);

  return (
    <div className="home-page">
      <MessageBanner type={banner.type} message={banner.message} />
      <header className="home-header">
        <h1>Eventos disponibles</h1>
        {/* Filtros/ordenación futura */}
      </header>
      {content}
    </div>
  );
}
