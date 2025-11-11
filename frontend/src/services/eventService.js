import { mockEvents } from "../mocks/events.mock";
import { mockUserEvents } from "../mocks/profile/events.mock";
import { chooseImageForTags } from "./imagePicker";

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
  // Obtener el ID del usuario actual para calcular isEnrolled
  const currentUserId = localStorage.getItem('userId');
  let userEventsIds = [];
  
  // Si hay un usuario logueado, obtener sus eventos para calcular isEnrolled
  if (currentUserId) {
    try {
      const userEventsRes = await fetch(`${config.API_BASE_URL}/events/my-events`, {
        headers: authHeaders(),
      });
      if (userEventsRes.ok) {
        const userEvents = await userEventsRes.json();
        userEventsIds = userEvents.map(e => e.id.toString());
      }
    } catch (error) {
      console.warn('No se pudieron cargar los eventos del usuario para calcular isEnrolled:', error);
    }
  }

  // Transformar los datos del backend al formato esperado por el frontend
  const transformedData = data.map(event => {
    // Validar y formatear fecha y hora
    let startDate = null;
    if (event.fecha && event.hora) {
      try {
        // Asegurar que la fecha esté en formato YYYY-MM-DD
        const fechaStr = event.fecha.toString().split('T')[0]; // Tomar solo la parte de la fecha si viene con hora
        
        // Asegurar que la hora esté en formato HH:mm (sin segundos si los tiene)
        let horaStr = event.hora.toString();
        // Si la hora viene en formato HH:mm:ss o HH:mm:ss.SSS, tomar solo HH:mm
        if (horaStr.includes(':')) {
          const horaParts = horaStr.split(':');
          horaStr = `${horaParts[0].padStart(2, '0')}:${horaParts[1].padStart(2, '0')}`;
        }
        
        // Construir la fecha en formato ISO 8601
        startDate = `${fechaStr}T${horaStr}:00Z`;
        
        // Validar que la fecha sea válida
        const testDate = new Date(startDate);
        if (isNaN(testDate.getTime())) {
          console.warn('Fecha inválida para evento:', event.id, 'fecha:', event.fecha, 'hora:', event.hora, 'startDate construido:', startDate);
          startDate = null;
        }
      } catch (error) {
        console.error('Error al formatear fecha/hora para evento:', event.id, error);
        startDate = null;
      }
    } else {
      console.warn('Evento sin fecha o hora:', event.id, 'fecha:', event.fecha, 'hora:', event.hora);
    }
    
    return {
      id: event.id.toString(),
      name: event.titulo,
      location: event.lugar,
      startDate: startDate || new Date().toISOString(), // Fallback a fecha actual si hay error
      description: event.descripcion,
      restrictions: event.edadMinima ? `Edad mínima: ${event.edadMinima} años` : "",
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1000", // Imagen por defecto
      capacity: event.maxPersonas || 10,
      participants: Array.from({ length: event.ParticipantesInscritos || 0 }, (_, i) => ({ id: i })), // Array con el conteo real
      languages: event.idiomasPermitidos ? event.idiomasPermitidos.split(',').map(lang => lang.trim()) : ["es"],
      isEnrolled: event.isEnrolled || false // Estado de inscripción del usuario actual
    };
  });

      console.log("URL elegida en get events")
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

export async function joinEvent(eventData) {
  const config = getConfig();
  if (config.USE_MOCKS) {
    console.log("Usando mocks para joinEvent");
    return { ok:true };
  }

  const idUser = localStorage.getItem('userId');
  if (!idUser) {
    throw new Error("Usuario no autenticado. Por favor, inicia sesión primero.");
  }

  // Convertir idCreador a número
  const idParticipante = parseInt(idUser, 10);

  const eventoAddDTO = {
    idEvento: eventData,
    idParticipante: idParticipante
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
      const errorData = await res.json().catch(() => null);
      if (errorData && errorData.error) {
        errorMessage = errorData.error;
      } else {
        const errorText = await res.text().catch(() => "");
        if (errorText) {
          errorMessage = errorText;
        }
      }
    } catch (e) {
      // Si no se puede parsear el error, usar el mensaje por defecto
    }
    
    // Detectar si el error es porque ya está apuntado
    const errorLower = errorMessage.toLowerCase();
    if (errorLower.includes('ya está apuntado') || errorLower.includes('already') || 
        errorLower.includes('duplicate') || errorLower.includes('existe')) {
    if (errorLower.includes('ya') || errorLower.includes('already') || 
        errorLower.includes('duplicate') || errorLower.includes('existe') ||
        res.status === 409) {
      throw new Error("Ya estás apuntado a este evento");
    }
    
    throw new Error(errorMessage);
  }
  return { ok: true };
}

export async function leaveEvent(eventId) {
  const config = getConfig();
  if (config.USE_MOCKS) {
    console.log("Usando mocks para leaveEvent");
    return { ok:true };
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
  return { ok: true };
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

const transformedData = await Promise.all(
  data.map(async (event) => {  
    const tags = Array.isArray(event.tags) ? event.tags : [];
    const imageUrl = await chooseImageForTags(
      tags,
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1000"
    );

    console.log("URL elegida en get user events")
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
      tags: Array.isArray(event.tags) ? event.tags : []

  }}));

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
const transformedData = await Promise.all(
  data.map(async (event) => {  
    const tags = Array.isArray(event.tags) ? event.tags : [];
    const imageUrl = await chooseImageForTags(
      tags,
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1000"
    );

    console.log("URL elegida en get my created events")
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
    languages: event.idiomasPermitidos ? event.idiomasPermitidos.split(',').map(lang => lang.trim()) : ["es"]
  }}));

  // 4. Ordenamiento
  return transformedData.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
}
