import { mockEvents } from "../mocks/events.mock";
import { mockUserEvents } from "../mocks/profile/events.mock";

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
  const token = localStorage.getItem("authToken"); // misma clave que guardas al hacer login
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" }
    : { "Content-Type": "application/json", Accept: "application/json" };
}


export async function getEvents() {
  const config = getConfig();
  if (config.USE_MOCKS) {
    // Asigna imagen aleatoria a cada mock según tag
    const enriched = await Promise.all(
      mockEvents
        .sort((a,b)=>new Date(a.startDate)-new Date(b.startDate))
        .map(async (ev) => ({
          ...ev,
          imageUrl: await chooseImageForTags(ev.tags, ev.imageUrl)
        }))
    );
    return enriched;
  }

  const res = await fetch(`${config.API_BASE_URL}/events`, { headers: authHeaders() });
  if (!res.ok) throw new Error("No se pudieron cargar los eventos");
  const data = await res.json();

  const transformed = await Promise.all(
    data.map(async (event) => {
      const tags = Array.isArray(event.tags) ? event.tags : [];
      const imageUrl = await chooseImageForTags(
        tags,
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1000"
      );

      console.log("URL elegida")
      console.log(imageUrl)

      return {
        id: event.id.toString(),
        name: event.titulo,
        location: event.lugar,
        startDate: `${event.fecha}T${event.hora}:00Z`,
        description: event.descripcion,
        restrictions: event.edadMinima ? `Edad mínima: ${event.edadMinima} años` : "",
        imageUrl,
        capacity: event.maxPersonas || 10,
        participants: [],
        languages: event.idiomasPermitidos ? event.idiomasPermitidos.split(',').map(lang => lang.trim()) : ["es"],
        tags
      };
    })
  );

  return transformed.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
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
    titulo: eventData.titulo,
    descripcion: eventData.descripcion || "",
    fecha: eventData.fecha, // String en formato YYYY-MM-DD
    hora: eventData.hora || "10:00", // String en formato HH:mm
    lugar: eventData.lugar,
    tags: eventData.etiquetas ? [eventData.etiquetas] : [], // Convertir a array de tags
    restricciones: eventData.restricciones || {}, // Map de restricciones (puede contener edadMinima, etc.)
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
    return { ok:true };
  }
  console.log("Usando backend para joinEvent");
  const res = await fetch(`${config.API_BASE_URL}/events/${eventId}/join`, {
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
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "No se pudo desapuntar del evento");
  }
  return res.json();
}

export async function getUserEvents() {
  const config = getConfig();
  if (config.USE_MOCKS) {
    console.log("Usando mocks para getUserEvents");
    return mockEvents
      .filter(event => event.participants.some(p => p.id === "me"))
      .sort((a,b)=>new Date(a.startDate)-new Date(b.startDate));
  }
  console.log("Usando backend para getUserEvents");
  const res = await fetch(`${config.API_BASE_URL}/events/my-events`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("No se pudieron cargar tus eventos");
  const data = await res.json();

  const transformedData = data.map(event => ({
    id: event.id.toString(),
    name: event.titulo,
    location: event.lugar,
    startDate: `${event.fecha}T${event.hora}:00Z`, 
    description: event.descripcion,
    restrictions: event.edadMinima ? `Edad mínima: ${event.edadMinima} años` : "",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1000", // Imagen por defecto
    capacity: event.maxPersonas || 10,
    participants: [],
    languages: event.idiomasPermitidos ? event.idiomasPermitidos.split(',').map(lang => lang.trim()) : ["es"],
    tags: Array.isArray(event.tags) ? event.tags : []

  }));

  return transformedData.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
}

export async function getMyCreatedEvents() {
  const config = getConfig();
  
  // 1. Mocking (opcional, pero mantiene la consistencia)
  if (config.USE_MOCKS) {
    console.log("Usando mocks para getMyCreatedEvents");
    // Aquí podrías filtrar tus mockEvents por un 'creatorId' si lo tuvieras
    return []; 
  }

  // 2. Llamada real al backend
  console.log("Usando backend para getMyCreatedEvents");
  
  const res = await fetch(`${config.API_BASE_URL}/events/my-created-events`, {
    headers: authHeaders(), // <-- Usa las cabeceras de autenticación
  });

  if (!res.ok) throw new Error("No se pudieron cargar tus eventos creados");
  
  const data = await res.json();

  // 3. Transformación de datos (es la misma que en getEvents y getUserEvents)
  const transformedData = data.map(event => ({
    id: event.id.toString(),
    name: event.titulo,
    location: event.lugar,
    startDate: `${event.fecha}T${event.hora}:00Z`, 
    description: event.descripcion,
    restrictions: event.edadMinima ? `Edad mínima: ${event.edadMinima} años` : "",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1000", // Imagen por defecto
    capacity: event.maxPersonas || 10,
    participants: [],
    languages: event.idiomasPermitidos ? event.idiomasPermitidos.split(',').map(lang => lang.trim()) : ["es"]
  }));

  // 4. Ordenamiento
  return transformedData.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
}
