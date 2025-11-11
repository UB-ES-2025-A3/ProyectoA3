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

  // Ordenar por fecha de inicio ASC (criterio de aceptación 3.0)
  return transformedData.sort(
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
