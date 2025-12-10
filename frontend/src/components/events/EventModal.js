// src/components/events/EventModal.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import "./EventModal.css";
import userService from "../../services/userService";
import {
  isEventFavorite,
  addEventToFavorites,
  removeEventFromFavorites
} from "../../services/eventService";
import { getEventMessages, sendEventMessage } from "../../services/chatService";
import UserProfileModal from "../users/UserProfileModal";
import { useTranslation } from "react-i18next";

import avatarDefault from "../../assets/avatars/avatar-default.jpg";
import avatar1 from "../../assets/avatars/avatar-1.png";
import avatar2 from "../../assets/avatars/avatar-2.png";
import avatar3 from "../../assets/avatars/avatar-3.png";
import avatar4 from "../../assets/avatars/avatar-4.png";
import avatar5 from "../../assets/avatars/avatar-5.png";

const AVATAR_OPTIONS = [avatar1, avatar2, avatar3, avatar4, avatar5, avatarDefault];

const getAvatarForUser = (userId) => {
  if (!userId) return avatarDefault;
  const idStr = userId.toString();
  let sum = 0;
  for (let i = 0; i < idStr.length; i++) sum += idStr.charCodeAt(i);
  return AVATAR_OPTIONS[sum % AVATAR_OPTIONS.length];
};

export default function EventModal({
  event,
  isOpen,
  onClose,
  isEnrolled,
  isFull,
  onJoin,
  onLeave
}) {
  const { t, i18n } = useTranslation();

  console.log("[EventModal] i18n.language =", i18n.language);

  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [, setCreatorInfo] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatError, setChatError] = useState("");
  const chatMessagesEndRef = useRef(null);
  const chatMessagesContainerRef = useRef(null);

  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
  };

  // Función para hacer scroll al final del chat
  const scrollToBottom = useCallback(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Cargar mensajes del chat cuando se abre
  useEffect(() => {
    const loadChatMessages = async () => {
      if (!isChatOpen || !event?.id || !isEnrolled) {
        setChatMessages([]);
        setChatError("");
        return;
      }

      setLoadingChat(true);
      setChatError("");
      try {
        const messages = await getEventMessages(event.id);
        setChatMessages(messages || []);
        // Scroll al final después de cargar
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error("Error al cargar mensajes del chat:", error);
        setChatMessages([]);
        setChatError("No se pudieron cargar los mensajes. Intenta recargar el chat.");
      } finally {
        setLoadingChat(false);
      }
    };

    loadChatMessages();
  }, [isChatOpen, event?.id, isEnrolled, scrollToBottom]);

  // Scroll al final cuando se agregan nuevos mensajes
  useEffect(() => {
    if (chatMessages.length > 0) {
      scrollToBottom();
    }
  }, [chatMessages.length, scrollToBottom]);

  // Enviar mensaje
  const handleSendMessage = async () => {
    if (!chatInput.trim() || !event?.id || sendingMessage) return;

    const messageText = chatInput.trim();
    
    // Validar longitud en frontend
    if (messageText.length > 5000) {
      setChatError("El mensaje no puede exceder 5000 caracteres");
      return;
    }

    setChatInput("");
    setSendingMessage(true);
    setChatError("");

    try {
      const newMessage = await sendEventMessage(event.id, messageText);
      // Agregar el nuevo mensaje al final (estilo WhatsApp)
      setChatMessages(prev => [...prev, newMessage]);
      // Scroll al final después de enviar
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      setChatError(error.message || "No se pudo enviar el mensaje. Intenta de nuevo.");
      // Restaurar el texto del input si falla
      setChatInput(messageText);
    } finally {
      setSendingMessage(false);
    }
  };

  // Manejar Enter en el input
  const handleChatInputKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const notifyFavoritesUpdated = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("favoritesUpdated"));
    }
  };

  // Verificar si el usuario está autenticado
  const isAuthenticated = useCallback(() => {
    return !!localStorage.getItem("userId");
  }, []);

  // Cargar estado de favorito desde la API
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      if (event?.id && isAuthenticated()) {
        try {
          const favorite = await isEventFavorite(event.id);
          setIsFavorite(favorite);
        } catch (error) {
          console.error("Error al verificar favorito:", error);
          setIsFavorite(false);
        }
      } else {
        setIsFavorite(false);
      }
    };

    if (isOpen) {
      loadFavoriteStatus();
    }
  }, [event?.id, isOpen, isAuthenticated]);

  // Cargar info de participantes (useCallback + useEffect con deps correctas)
  const loadParticipantsInfo = useCallback(async () => {
    if (!event) {
      setParticipants([]);
      return;
    }

    setLoadingParticipants(true);
    try {
      const participantIds = event.participants || [];
      if (participantIds.length === 0) {
        setParticipants([]);
        setLoadingParticipants(false);
        return;
      }

      const result = await userService.getParticipantsByIds(participantIds);

      if (result.success && Array.isArray(result.data)) {
        setParticipants(result.data);
        if (event.creatorId) {
          const creatorResult = await userService.getUserProfile(event.creatorId);
          if (creatorResult.success) {
            setCreatorInfo(creatorResult.data);
          }
        }
      } else {
        setParticipants([]);
      }
    } catch {
      setParticipants([]);
    } finally {
      setLoadingParticipants(false);
    }
  }, [event]);

  useEffect(() => {
    if (isOpen && event?.participants?.length > 0) {
      loadParticipantsInfo();
    } else {
      setParticipants([]);
    }
  }, [isOpen, event, loadParticipantsInfo]);

  const toggleFavorite = async () => {
    if (!event?.id) return;

    // Verificar si el usuario está autenticado
    if (!isAuthenticated()) {
      alert(t("EventModal.favorite.mustLogin"));
      return;
    }

    setLoadingFavorite(true);

    try {
      if (isFavorite) {
        const result = await removeEventFromFavorites(event.id);
        if (result.success) {
          setIsFavorite(false);
          notifyFavoritesUpdated();
        } else {
          console.error("Error al eliminar de favoritos:", result.error);
        }
      } else {
        const result = await addEventToFavorites(event.id);
        if (result.success) {
          setIsFavorite(true);
          notifyFavoritesUpdated();
        } else {
          console.error("Error al añadir a favoritos:", result.error);
        }
      }
    } catch (error) {
      console.error("Error al cambiar favorito:", error);
    } finally {
      setLoadingFavorite(false);
    }
  };

  if (!isOpen || !event) return null;

  const rawLang = i18n.language || "es";
  const baseLang = rawLang.split("-")[0]; // "es-ES" -> "es", "ca-ES" -> "ca", "cat" -> "cat"

  // si en tu config usas "cat" como código, lo mapeamos a "ca"
  const lang = baseLang === "cat" ? "ca" : baseLang;

  // Elegir locale según el idioma actual de i18n
  const localeMap = {
    es: "es-ES",
    ca: "ca-ES",
    en: "en-GB",
    fr: "fr-FR",
    de: "de-DE",
    it: "it-IT",
    pt: "pt-PT",
    ru: "ru-RU"
  };
  const locale = localeMap[lang] || "es-ES";

  console.log("[EventModal] rawLang =", rawLang, "| baseLang =", baseLang, "| lang =", lang, "| locale =", locale);

  let start = t("EventModal.dateFallback");
  if (event.startDate) {
    const date = new Date(event.startDate);
    if (!isNaN(date.getTime())) {
      start = date.toLocaleString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    }
  }

  const currentParticipants = event.participants?.length || 0;
  const availableSpots = event.capacity - currentParticipants;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className={`modal-wrapper ${isChatOpen ? "isChatOpen" : ""}`}>
        <div className={`chat-panel ${isChatOpen ? "open" : ""}`}>
          <header className="chat-header">
            <h2>Chat</h2>
          </header>

          <div className="chat-messages" ref={chatMessagesContainerRef}>
            {chatError && (
              <div className="chat-error">
                <p>{chatError}</p>
                <button onClick={() => setChatError("")}>✕</button>
              </div>
            )}
            {loadingChat ? (
              <div className="chat-loading">
                <p>Cargando mensajes...</p>
              </div>
            ) : chatMessages.length === 0 ? (
              <div className="chat-empty">
                <p>No hay mensajes aún. ¡Sé el primero en escribir!</p>
              </div>
            ) : (
              (() => {
                // Agrupar mensajes por fecha
                const messagesByDate = {};
                chatMessages.forEach((msg) => {
                  // Validar que el mensaje tenga fecha
                  if (!msg || !msg.sendedDate) {
                    console.warn("Mensaje sin fecha:", msg);
                    return;
                  }
                  const dateKey = msg.sendedDate;
                  if (!messagesByDate[dateKey]) {
                    messagesByDate[dateKey] = [];
                  }
                  messagesByDate[dateKey].push(msg);
                });

                // Ordenar las fechas
                const sortedDates = Object.keys(messagesByDate).sort();

                return sortedDates.map((dateKey) => {
                  const messages = messagesByDate[dateKey];
                  
                  // Formatear la fecha del separador
                  let dateDisplay = dateKey; // Fallback
                  try {
                    if (!dateKey || typeof dateKey !== 'string') {
                      throw new Error("Fecha inválida");
                    }
                    
                    const dateObj = new Date(dateKey + 'T00:00:00');
                    
                    if (isNaN(dateObj.getTime())) {
                      // Intentar parsear manualmente
                      const [year, month, day] = dateKey.split('-').map(Number);
                      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                        const parsedDate = new Date(year, month - 1, day);
                        if (!isNaN(parsedDate.getTime())) {
                          const now = new Date();
                          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                          const messageDay = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
                          
                          if (messageDay.getTime() === today.getTime()) {
                            dateDisplay = "Hoy";
                          } else if (messageDay.getTime() === today.getTime() - 86400000) {
                            dateDisplay = "Ayer";
                          } else {
                            dateDisplay = parsedDate.toLocaleDateString(locale, {
                              day: "numeric",
                              month: "long",
                              year: "numeric"
                            });
                          }
                        }
                      }
                    } else {
                      const now = new Date();
                      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                      const messageDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
                      
                      if (messageDay.getTime() === today.getTime()) {
                        dateDisplay = "Hoy";
                      } else if (messageDay.getTime() === today.getTime() - 86400000) {
                        dateDisplay = "Ayer";
                      } else {
                        dateDisplay = dateObj.toLocaleDateString(locale, {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        });
                      }
                    }
                  } catch (e) {
                    console.error("Error formateando fecha del separador:", e, dateKey);
                    dateDisplay = dateKey || "Fecha desconocida";
                  }

                  return (
                    <div key={dateKey} className="chat-date-group">
                      <div className="chat-date-separator">
                        <span>{dateDisplay}</span>
                      </div>
                      {messages.map((msg) => {
                        const currentUserId = localStorage.getItem("userId");
                        const isCurrentUser = currentUserId && msg.clientId.toString() === currentUserId.toString();
                        
                        // Parsear fecha y hora correctamente
                        let messageDate;
                        let formattedTime = "??:??";
                        
                        try {
                          if (!msg.sendedDate || !msg.sendedHour) {
                            throw new Error("Fecha u hora faltante");
                          }

                          const dateTimeStr = `${msg.sendedDate}T${msg.sendedHour}`;
                          messageDate = new Date(dateTimeStr);
                          
                          if (isNaN(messageDate.getTime())) {
                            // Intentar parsear manualmente
                            const [datePart, timePart] = dateTimeStr.split('T');
                            if (!datePart || !timePart) {
                              throw new Error("Formato de fecha inválido");
                            }
                            
                            const [year, month, day] = datePart.split('-').map(Number);
                            const timeParts = timePart.split(':');
                            const hours = Number(timeParts[0]) || 0;
                            const minutes = Number(timeParts[1]) || 0;
                            const seconds = timeParts[2] ? Number(timeParts[2].split('.')[0]) : 0;
                            
                            if (isNaN(year) || isNaN(month) || isNaN(day)) {
                              throw new Error("Fecha inválida");
                            }
                            
                            messageDate = new Date(year, month - 1, day, hours, minutes, seconds);
                            
                            if (isNaN(messageDate.getTime())) {
                              throw new Error("Fecha no válida después del parseo");
                            }
                          }

                          // Solo mostrar la hora
                          formattedTime = messageDate.toLocaleTimeString(locale, {
                            hour: "2-digit",
                            minute: "2-digit"
                          });
                        } catch (e) {
                          console.error("Error parsing date:", e, msg);
                          // Usar valores por defecto si falla el parsing
                          formattedTime = "??:??";
                        }

                        return (
                          <div key={msg.id} className={`message-wrapper ${isCurrentUser ? "user" : "notUser"}`}>
                            <div className={`message ${isCurrentUser ? "user" : "notUser"}`}>
                              {isCurrentUser ? (
                                <>
                                  <div className="bubble">
                                    <div className="message-text">{msg.message}</div>
                                    <div className="message-meta">
                                      <span className="message-time">{formattedTime}</span>
                                    </div>
                                  </div>
                                  <div className="avatarWrapper">
                                    <img
                                      className="avatarUsuario"
                                      src={getAvatarForUser(msg.clientId)}
                                      alt={msg.clientUsername}
                                    />
                                    {msg.isCreator && (
                                      <img
                                        className="crownIcon"
                                        src="/icons/crown.svg"
                                        alt="Creador del evento"
                                        title="Creador del evento"
                                      />
                                    )}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="avatarWrapper">
                                    <img
                                      className="avatarUsuario"
                                      src={getAvatarForUser(msg.clientId)}
                                      alt={msg.clientUsername}
                                    />
                                    {msg.isCreator && (
                                      <img
                                        className="crownIcon"
                                        src="/icons/crown.svg"
                                        alt="Creador del evento"
                                        title="Creador del evento"
                                      />
                                    )}
                                  </div>
                                  <div className="bubble">
                                    <div className="message-sender">{msg.clientName}</div>
                                    <div className="message-text">{msg.message}</div>
                                    <div className="message-meta">
                                      <span className="message-time">{formattedTime}</span>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                });
              })()
            )}
            <div ref={chatMessagesEndRef} />
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              placeholder="Escribe un mensaje…"
              className="chat-input"
              value={chatInput}
              onChange={(e) => {
                setChatInput(e.target.value);
                setChatError(""); // Limpiar error al escribir
              }}
              onKeyPress={handleChatInputKeyPress}
              disabled={sendingMessage || !isEnrolled}
              maxLength={5000}
            />
            <button
              className="chat-send"
              onClick={handleSendMessage}
              disabled={sendingMessage || !chatInput.trim() || !isEnrolled}
            >
              {sendingMessage ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </div>
        <div className="modal-content">
          {isEnrolled && (
              <button className="chat-floating-btn" onClick={toggleChat}>
                💬
              </button>
          )}
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>

          <button
              className={`modal-favorite-btn ${loadingFavorite ? "loading" : ""}`}
              onClick={toggleFavorite}
              disabled={loadingFavorite}
              aria-label={
                isFavorite
                    ? t("EventModal.aria.removeFavorite")
                    : t("EventModal.aria.addFavorite")
              }
              title={
                !isAuthenticated()
                    ? t("EventModal.aria.loginToFavorite")
                    : isFavorite
                        ? t("EventModal.aria.removeFavorite")
                        : t("EventModal.aria.addFavorite")
              }
          >
            {loadingFavorite ? (
                <span className="favorite-loading">⏳</span>
            ) : isFavorite ? (
                <FaBookmark className="favorite-icon favorite-icon-filled"/>
            ) : (
                <FaRegBookmark className="favorite-icon favorite-icon-outline"/>
            )}
          </button>

          <div className="modal-header">
            <div className="modal-image">
              <img src={event.imageUrl} alt={event.name}/>
              <div className="modal-status">
                {isFull ? (
                    <span className="status-badge status-full">
                    {t("EventModal.status.full")}
                  </span>
                ) : (
                    <span className="status-badge status-available">
                    {t("EventModal.status.availableSpots", {count: availableSpots})}
                  </span>
                )}
              </div>
            </div>

            <div className="modal-info">
              <h1 className="modal-title">{event.name}</h1>

              <div className="modal-meta">
                <div className="meta-item">
                  <span className="meta-icon">📍</span>
                  <span className="meta-text">{event.location}</span>
                </div>

                <div className="meta-item">
                  <span className="meta-icon">📅</span>
                  <span className="meta-text">{start}</span>
                </div>

                <div className="meta-item">
                  <span className="meta-icon">👥</span>
                  <span className="meta-text">
                    {t("EventModal.meta.participantsCount", {
                      current: currentParticipants,
                      capacity: event.capacity
                    })}
                  </span>
                </div>

                {event.languages?.length > 0 && (
                    <div className="meta-item">
                      <span className="meta-icon">🌐</span>
                      <span className="meta-text">
                      {t("EventModal.meta.languages")}: {event.languages.join(", ")}
                    </span>
                    </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-body">
            <div className="modal-section">
              <h3>{t("EventModal.sections.description")}</h3>
              <p className="modal-description">{event.description}</p>
            </div>

            {event.restrictions && (
                <div className="modal-section">
                  <h3>{t("EventModal.sections.restrictions")}</h3>
                  <div className="modal-restrictions">
                    <span className="restriction-badge">⚠️ {event.restrictions}</span>
                  </div>
                </div>
            )}

            <div className="modal-section">
              <h3>{t("EventModal.sections.info")}</h3>
              <div className="event-details">
                <div className="detail-item">
                  <strong>{t("EventModal.details.capacity")}</strong> {event.capacity}
                </div>
                <div className="detail-item">
                  <strong>{t("EventModal.details.currentParticipants")}</strong>{" "}
                  {currentParticipants}
                </div>
                <div className="detail-item">
                  <strong>{t("EventModal.details.availableSpots")}</strong>{" "}
                  {availableSpots}
                </div>
              </div>
            </div>

            {currentParticipants > 0 && (
                <div className="modal-section">
                  <h3>
                    {t("EventModal.sections.registeredParticipants", {
                      count: currentParticipants
                    })}
                  </h3>

                  {loadingParticipants ? (
                      <div className="participants-loading">
                        <div className="loading-spinner"></div>
                        <p>{t("EventModal.sections.loadingParticipants")}</p>
                      </div>
                  ) : Array.isArray(participants) && participants.length > 0 ? (
                      <div className="participants-list">
                        {participants.map((participant) => {
                          const isCreator = participant.id === event.creatorId;
                          const avatar = getAvatarForUser(participant.id);

                          return (
                              <div
                                  key={participant.id}
                                  className="participant-card"
                                  onClick={() => {
                                    setSelectedUserId(participant.id);
                                    setIsProfileModalOpen(true);
                                  }}
                                  style={{cursor: "pointer"}}
                                  title={t("EventModal.clickToViewProfile")}
                              >
                                <div className="participant-avatar">
                                  <img
                                      src={avatar}
                                      alt="Avatar"
                                      className="participant-avatar-img"
                                  />
                                </div>

                                <div className="participant-info">
                                  <div className="participant-name">
                                    {participant.nombre} {participant.apellidos}
                                    {isCreator && (
                                        <span
                                            className="creator-badge"
                                            title={t("EventModal.creatorBadge")}
                                        >
                                          {t("EventModal.creatorStar")}
                                        </span>
                                    )}
                                  </div>

                                  <div className="participant-details">
                                    <span className="participant-username">
                                      @{participant.username}
                                    </span>
                                    {participant.ciudad && (
                                        <span className="participant-location">
                                          📍 {participant.ciudad}
                                        </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                          );
                        })}
                      </div>
                  ) : (
                      <div className="participants-empty">
                        <p>{t("EventModal.sections.participantsError")}</p>
                      </div>
                  )}
                </div>
            )}
          </div>

          <div className="modal-footer">
            {!isEnrolled && (
                <button
                    className="btn btn-primary btn-large"
                    onClick={onJoin}
                    disabled={isFull}
                >
                  {isFull ? t("EventModal.eventFull") : t("EventModal.join")}
                </button>
            )}

            {isEnrolled && (
                <div className="modal-enrolled-box">
                  <div className="enrolled-message">
                    {t("EventModal.alreadyEnrolled")}
                  </div>
                  <button className="btn btn-primary btn-large" onClick={onLeave}>
                    {t("EventModal.leave")}
                  </button>
                </div>
            )}
          </div>
        </div>
      </div>

      <UserProfileModal
          userId={selectedUserId}
          isOpen={isProfileModalOpen}
          onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedUserId(null);
        }}
      />
    </div>
  );
}
