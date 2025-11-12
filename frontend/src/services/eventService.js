import { mockEvents } from "../mocks/events.mock";
import { mockUserEvents } from "../mocks/profile/events.mock";
import { chooseImageForTags } from "./imagePicker";

const DEFAULT_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1000";

// Funciones utilitarias ------------------------------------------------------
function getConfig() {
  if (window.APP_CONFIG) {
    console.log("Usando configuración en tiempo de ejecución:", window.APP_CONFIG);
    return {
      API_BASE_URL: window.APP_CONFIG.REACT_APP_API_URL || "http://localhost:8080/api",
      USE_MOCKS: window.APP_CONFIG.REACT_APP_USE_MOCKS === true,
    };
  }

  console.log("Usando variables de entorno como fallback");
  return {
    API_BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:8080/api",
    USE_MOCKS: process.env.REACT_APP_USE_MOCKS === "true",
  };
}

function authHeaders() {
  const token =
    localStorage.getItem("authToken") ||
    localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const headers = { "Content-Type": "application/json", Accept: "application/json" };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (userId) {
    headers["X-User-Id"] = userId;
  }

  return headers;
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags.map((tag) => tag?.trim()).filter(Boolean);
}

function normalizeLanguages(langs) {
  if (!langs) return [];
  if (Array.isArray(langs)) return langs.map((lang) => lang.trim()).filter(Boolean);

  return String(langs)
    .split(",")
    .map((lang) => lang.trim())
    .filter(Boolean);
}

function normalizeParticipants(participantIds) {
  if (!Array.isArray(participantIds)) return [];
  return participantIds.map((id) => id?.toString()).filter(Boolean);
}

function buildIsoDate(fecha, hora) {
  if (!fecha) return new Date().toISOString();

  try {
    const [yearStr, monthStr, dayStr] = fecha.toString().split("T")[0].split("-");
    const [rawHour = "00", rawMinute = "00"] = hora ? hora.toString().split(":") : [];

    const year = Number.parseInt(yearStr, 10);
    const month = Number.parseInt(monthStr, 10) - 1;
    const day = Number.parseInt(dayStr, 10);
    const hours = Number.parseInt(rawHour, 10) || 0;
    const minutes = Number.parseInt(rawMinute, 10) || 0;

    const date = new Date(Date.UTC(year, month, day, hours, minutes));

    if (Number.isNaN(date.getTime())) {
      throw new Error(`Fecha inválida: ${fecha} ${hora}`);
    }

    return date.toISOString();
  } catch (error) {
    console.warn("No se pudo construir la fecha del evento:", fecha, hora, error);
    return new Date().toISOString();
  }
}


export async function getEvents() {
  const config = getConfig();
  if (config.USE_MOCKS) {
    // Asigna imagen aleatoria a cada mock según tag
    const enriched = await Promise.all(
      mockEvents
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .map(async (ev) => ({
          ...ev,
          imageUrl: await chooseImageForTags(ev.tags, ev.imageUrl),
          isEnrolled: false,
        }))
    );
    return enriched;
  }

  const res = await fetch(`${config.API_BASE_URL}/events`, { headers: authHeaders() });
  if (!res.ok) throw new Error("No se pudieron cargar los eventos");
  const data = await res.json();

  const currentUserId = localStorage.getItem("userId");
  const currentUserIdStr = currentUserId ? currentUserId.toString() : null;
  let enrolledIds = new Set();

  if (currentUserIdStr) {
    try {
      const userEventsRes = await fetch(`${config.API_BASE_URL}/events/my-events`, {
        headers: authHeaders(),
      });
      if (userEventsRes.ok) {
        const userEvents = await userEventsRes.json();
        enrolledIds = new Set(
          userEvents
            .map((evt) => evt.id)
            .filter((id) => id !== undefined && id !== null)
            .map((id) => id.toString())
        );
      }
    } catch (error) {
      console.warn("No se pudieron cargar los eventos del usuario para calcular isEnrolled:", error);
    }
  }

  const transformed = await Promise.all(
    data.map(async (event) => {
      const tags = normalizeTags(event.tags);
      const participants = normalizeParticipants(event.participantesIds);
      const imageUrl = await chooseImageForTags(tags, DEFAULT_EVENT_IMAGE);
      const startDate = buildIsoDate(event.fecha, event.hora);
      const languages = normalizeLanguages(event.idiomasPermitidos);

      const capacity =
        typeof event.maxPersonas === "number" && !Number.isNaN(event.maxPersonas)
          ? event.maxPersonas
          : Math.max(participants.length, 10);

      const isEnrolled =
        !!currentUserIdStr &&
        (enrolledIds.has(event.id?.toString()) || participants.includes(currentUserIdStr));

      const fallbackId =
        event.id !== undefined && event.id !== null
          ? event.id.toString()
          : `tmp-${Math.random().toString(36).slice(2)}`;

      return {
        id: fallbackId,
        name: event.titulo ?? "Evento sin título",
        location: event.lugar ?? "Ubicación por confirmar",
        startDate,
        description: event.descripcion ?? "",
        restrictions: event.edadMinima ? `Edad mínima: ${event.edadMinima} años` : "",
        imageUrl,
        capacity,
        participants,
        languages: languages.length ? languages : ["es"],
        tags,
        isEnrolled,
      };
    })
  );

  return transformed.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
}

export async function createEvent(eventData) {
  const config = getConfig();
  
  // Obtener el ID del usuario creador del localStorage
  const idCreador = localStorage.getItem('userId');
  if (!idCreador) {
    throw new Error("Usuario no autenticado. Por favor, inicia sesión primero.");
  }

  // Convertir idCreador a número
  const creatorId = parseInt(idCreador, 10);

  // Construir el DTO según el modelo del backend
  const eventoCreateDTO = {
    fecha: eventData.fecha, // String en formato YYYY-MM-DD
    hora: eventData.hora || "10:00", // String en formato HH:mm
    lugar: eventData.lugar,
    restricciones: eventData.restricciones || {}, // Map de restricciones (puede contener edadMinima, etc.)
    tags: eventData.etiquetas ? [eventData.etiquetas] : [],  // Convertir a array de tags
    titulo: eventData.titulo,
    descripcion: eventData.descripcion || "",
    idCreador: creatorId
  };

  console.log("Enviando evento al backend:", eventoCreateDTO);

  try {
    const res = await fetch(`${config.API_BASE_URL}/events`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(eventoCreateDTO)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Error al crear el evento");
    }

    const createdEvent = await res.json();
    console.log("Evento creado exitosamente:", createdEvent);
    return createdEvent;
  } catch (error) {
    console.error("Error en createEvent:", error);
    throw error;
  }
}

export async function joinEvent(eventId) {
  const config = getConfig();
  if (config.USE_MOCKS) {
    console.log("Usando mocks para joinEvent");
    return { ok: true };
  }

  const idUser = localStorage.getItem('userId');
  if (!idUser) {
    throw new Error("Usuario no autenticado. Por favor, inicia sesión primero.");
  }

  const idParticipante = parseInt(idUser, 10);

  const eventoAddDTO = {
    idEvento: eventId,
    idParticipante,
  };

  console.log("Usando backend para joinEvent");
  const res = await fetch(`${config.API_BASE_URL}/events/join`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(eventoAddDTO)
  });
  if (!res.ok) {
    let errorMessage = "No se pudo apuntar al evento";
    try {
      const parsed = await res.json().catch(() => null);
      if (parsed) {
        errorMessage = parsed.error || parsed.message || errorMessage;
      } else {
        const fallback = await res.text().catch(() => "");
        if (fallback) errorMessage = fallback;
      }
    } catch {
      // mantenemos el mensaje por defecto
    }

    const errorLower = errorMessage.toLowerCase();
    if (
      errorLower.includes("ya") ||
      errorLower.includes("already") ||
      errorLower.includes("duplicate") ||
      errorLower.includes("existe") ||
      res.status === 409
    ) {
      throw new Error("Ya estás apuntado a este evento");
    }

    throw new Error(errorMessage);
  }

  return res.json().catch(() => ({ ok: true }));
}

export async function leaveEvent(eventId) {
  const config = getConfig();
  if (config.USE_MOCKS) {
    console.log("Usando mocks para leaveEvent");
    return { ok: true };
  }

  const idUser = localStorage.getItem('userId');
  if (!idUser) {
    throw new Error("Usuario no autenticado. Por favor, inicia sesión primero.");
  }

  // Convertir idUser a número
  const idParticipante = parseInt(idUser, 10);

  const eventoLeaveDTO = {
    idEvento: parseInt(eventId, 10),
    idParticipante: idParticipante
  };

  console.log("Usando backend para leaveEvent");
  const res = await fetch(`${config.API_BASE_URL}/events/leave`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(eventoLeaveDTO)
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(errorText || "No se pudo desapuntar del evento");
  }
  return res.json().catch(() => ({ ok: true }));
}

export async function getUserEvents() {
  const config = getConfig();
  if (config.USE_MOCKS) {
    console.log("Usando mocks para getUserEvents");
    return mockEvents
      .filter((event) => event.participants.some((p) => p.id === "me"))
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }
  console.log("Usando backend para getUserEvents");
  const res = await fetch(`${config.API_BASE_URL}/events/my-events`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("No se pudieron cargar tus eventos");
  const data = await res.json();

  const transformed = await Promise.all(
    data.map(async (event) => {
      const tags = normalizeTags(event.tags);
      const participants = normalizeParticipants(event.participantesIds);
      const imageUrl = await chooseImageForTags(tags, DEFAULT_EVENT_IMAGE);

      return {
        id: event.id?.toString() ?? `tmp-${Math.random().toString(36).slice(2)}`,
        name: event.titulo ?? "Evento sin título",
        location: event.lugar ?? "Ubicación por confirmar",
        startDate: buildIsoDate(event.fecha, event.hora),
        description: event.descripcion ?? "",
        restrictions: event.edadMinima ? `Edad mínima: ${event.edadMinima} años` : "",
        imageUrl,
        capacity:
          typeof event.maxPersonas === "number" && !Number.isNaN(event.maxPersonas)
            ? event.maxPersonas
            : Math.max(participants.length, 10),
        participants,
        languages: normalizeLanguages(event.idiomasPermitidos),
        tags,
      };
    })
  );

  return transformed.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
}

export async function getMyCreatedEvents() {
  const config = getConfig();

  if (config.USE_MOCKS) {
    console.log("Usando mocks para getMyCreatedEvents");
    return [];
  }

  console.log("Usando backend para getMyCreatedEvents");

  const res = await fetch(`${config.API_BASE_URL}/events/my-created-events`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("No se pudieron cargar tus eventos creados");

  const data = await res.json();

  const transformed = await Promise.all(
    data.map(async (event) => {
      const tags = normalizeTags(event.tags);
      const participants = normalizeParticipants(event.participantesIds);
      const imageUrl = await chooseImageForTags(tags, DEFAULT_EVENT_IMAGE);

      return {
        id: event.id?.toString() ?? `tmp-${Math.random().toString(36).slice(2)}`,
        name: event.titulo ?? "Evento sin título",
        location: event.lugar ?? "Ubicación por confirmar",
        startDate: buildIsoDate(event.fecha, event.hora),
        description: event.descripcion ?? "",
        restrictions: event.edadMinima ? `Edad mínima: ${event.edadMinima} años` : "",
        imageUrl,
        capacity:
          typeof event.maxPersonas === "number" && !Number.isNaN(event.maxPersonas)
            ? event.maxPersonas
            : Math.max(participants.length, 10),
        participants,
        languages: normalizeLanguages(event.idiomasPermitidos),
        tags,
      };
    })
  );

  return transformed.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
}
