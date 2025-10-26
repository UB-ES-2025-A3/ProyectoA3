import { mockEvents } from "../mocks/events.mock";

// Función para obtener la configuración en tiempo de ejecución
function getConfig() {
  // Primero intenta usar la configuración en tiempo de ejecución
  if (window.APP_CONFIG) {
    console.log("Usando configuración en tiempo de ejecución:", window.APP_CONFIG);
    return {
      API_BASE_URL: window.APP_CONFIG.REACT_APP_API_URL || "http://localhost:8080/api",
      USE_MOCKS: window.APP_CONFIG.REACT_APP_USE_MOCKS === true
    };
  }
  
  // Fallback a variables de entorno (para compatibilidad)
  console.log("Usando variables de entorno como fallback");
  return {
    API_BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:8080/api",
    USE_MOCKS: process.env.REACT_APP_USE_MOCKS === "true"
  };
}

function authHeaders() {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const headers = { "Content-Type": "application/json" };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  if (userId) {
    headers["X-User-Id"] = userId;
  }
  
  return headers;
}

export async function getEvents() {
  const config = getConfig();
  if (config.USE_MOCKS) {
    console.log("Usando mocks para getEvents");
    return [...mockEvents].sort((a,b)=>new Date(a.startDate)-new Date(b.startDate));
  }
  console.log("Usando backend para getEvents");
  // backend esperado: GET /api/events
  const res = await fetch(`${config.API_BASE_URL}/events`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("No se pudieron cargar los eventos");
  const data = await res.json();

  // Transformar los datos del backend al formato esperado por el frontend
  const transformedData = data.map(event => ({
    id: event.id.toString(),
    name: event.titulo,
    location: event.lugar,
    startDate: `${event.fecha}T${event.hora}:00Z`, // Combinar fecha y hora
    description: event.descripcion,
    restrictions: event.edadMinima ? `Edad mínima: ${event.edadMinima} años` : "",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1000", // Imagen por defecto
    capacity: event.maxPersonas || 10,
    participants: Array(event.participantesCount || 0).fill({ id: "placeholder" }), // Array con el conteo real
    languages: event.idiomasPermitidos ? event.idiomasPermitidos.split(',').map(lang => lang.trim()) : ["es"],
    isEnrolled: event.isEnrolled || false // Estado de inscripción del usuario actual
  }));

  // Ordenar por fecha de inicio ASC (criterio de aceptación 3.0)
  return transformedData.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
}

export async function joinEvent(eventId) {
  const config = getConfig();
  if (config.USE_MOCKS) {
    console.log("Usando mocks para joinEvent");
    return { ok:true };
  }
  console.log("Usando backend para joinEvent");
  const res = await fetch(`${config.API_BASE_URL}/events/${eventId}/join`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(errorText || "No se pudo apuntar al evento");
  }
  return { ok: true };
}

export async function leaveEvent(eventId) {
  const config = getConfig();
  if (config.USE_MOCKS) {
    console.log("Usando mocks para leaveEvent");
    return { ok:true };
  }
  console.log("Usando backend para leaveEvent");
  const res = await fetch(`${config.API_BASE_URL}/events/${eventId}/leave`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(errorText || "No se pudo desapuntar del evento");
  }
  return { ok: true };
}
