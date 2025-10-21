import { mockEvents } from "../mocks/events.mock";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";
const USE_MOCKS = process.env.REACT_APP_USE_MOCKS || "true";

function authHeaders() {
  const token = localStorage.getItem("token"); // o donde guardes el JWT
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

export async function getEvents() {
  if (USE_MOCKS) {
    return [...mockEvents].sort((a,b)=>new Date(a.startDate)-new Date(b.startDate));
  }
  // backend esperado: GET /api/events?scope=available (ajústalo a tu API real)
  const res = await fetch(`${API_BASE_URL}/events?scope=available`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("No se pudieron cargar los eventos");
  const data = await res.json();

  // Ordenar por fecha de inicio ASC (criterio de aceptación 3.0)
  return data.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
}

export async function joinEvent(eventId) {
  if (USE_MOCKS) return { ok:true };
  const res = await fetch(`${API_BASE_URL}/events/${eventId}/join`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "No se pudo apuntar al evento");
  }
  return res.json();
}

export async function leaveEvent(eventId) {
  if (USE_MOCKS) return { ok:true };
  const res = await fetch(`${API_BASE_URL}/events/${eventId}/leave`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "No se pudo desapuntar del evento");
  }
  return res.json();
}
