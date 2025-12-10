// src/services/chatService.js

function getConfig() {
  const API_BASE_URL =
    (window.APP_CONFIG && window.APP_CONFIG.REACT_APP_API_URL) ||
    process.env.REACT_APP_API_URL ||
    "http://localhost:8080/api";

  const USE_MOCKS =
    process.env.REACT_APP_USE_MOCKS === "true" ||
    window.APP_CONFIG?.REACT_APP_USE_MOCKS === true;

  return { API_BASE_URL, USE_MOCKS };
}

function authHeaders() {
  const token =
    localStorage.getItem("authToken") ||
    localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const headers = { "Content-Type": "application/json", Accept: "application/json" };

  // Construir el token en el formato esperado por el backend: "token-{userId}"
  if (userId) {
    headers.Authorization = `Bearer token-${userId}`;
  } else if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Obtiene todos los mensajes de un evento
 * @param {number|string} eventId - ID del evento
 * @returns {Promise<Array>} Lista de mensajes ordenados por fecha/hora descendente
 */
export async function getEventMessages(eventId) {
  const config = getConfig();
  
  if (config.USE_MOCKS) {
    console.log("[chat] Usando mocks para getEventMessages");
    // Retornar array vacío para mocks
    return [];
  }

  try {
    const res = await fetch(`${config.API_BASE_URL}/events/${eventId}/chat`, {
      headers: authHeaders(),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(errorText || "No se pudieron cargar los mensajes del chat");
    }

    const messages = await res.json();
    return messages || [];
  } catch (error) {
    console.error("[chat] Error al cargar mensajes:", error);
    throw error;
  }
}

/**
 * Envía un mensaje al chat de un evento
 * @param {number|string} eventId - ID del evento
 * @param {string} message - Texto del mensaje
 * @returns {Promise<Object>} El mensaje creado
 */
export async function sendEventMessage(eventId, message) {
  const config = getConfig();
  const userId = localStorage.getItem("userId");

  if (!userId) {
    throw new Error("Usuario no autenticado. Por favor, inicia sesión primero.");
  }

  if (!message || message.trim().length === 0) {
    throw new Error("El mensaje no puede estar vacío");
  }

  // Validar longitud máxima (5000 caracteres)
  const trimmedMessage = message.trim();
  if (trimmedMessage.length > 5000) {
    throw new Error("El mensaje no puede exceder 5000 caracteres");
  }

  if (config.USE_MOCKS) {
    console.log("[chat] Usando mocks para sendEventMessage");
    // Retornar un mensaje mock
    return {
      id: Date.now(),
      clientId: parseInt(userId, 10),
      clientName: "Usuario Mock",
      clientUsername: "mockuser",
      eventId: parseInt(eventId, 10),
      message: trimmedMessage,
      sendedDate: new Date().toISOString().split("T")[0],
      sendedHour: new Date().toTimeString().split(" ")[0],
      isCreator: false,
    };
  }

  try {
    const res = await fetch(`${config.API_BASE_URL}/events/${eventId}/chat`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        message: trimmedMessage,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(errorText || "No se pudo enviar el mensaje");
    }

    const createdMessage = await res.json();
    return createdMessage;
  } catch (error) {
    console.error("[chat] Error al enviar mensaje:", error);
    throw error;
  }
}

