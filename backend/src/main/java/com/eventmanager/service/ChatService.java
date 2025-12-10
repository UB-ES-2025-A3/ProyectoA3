package com.eventmanager.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import com.eventmanager.domain.Chat;
import com.eventmanager.domain.Cliente;
import com.eventmanager.domain.Evento;
import com.eventmanager.dto.ChatDtos.ChatCreate;
import com.eventmanager.dto.ChatDtos.ChatView;
import com.eventmanager.repository.ChatRepository;
import com.eventmanager.repository.ClienteRepository;
import com.eventmanager.repository.EventoRepository;
import com.eventmanager.service.errors.DatabaseSchemaMismatchException;
import com.eventmanager.service.errors.SqlErrorDetails;

import jakarta.persistence.PersistenceException;
import jakarta.validation.ValidationException;

@Service
public class ChatService {
  private final ChatRepository chatRepo;
  private final ClienteRepository clienteRepo;
  private final EventoRepository eventoRepo;

  public ChatService(ChatRepository chatRepo, ClienteRepository clienteRepo, EventoRepository eventoRepo) {
    this.chatRepo = chatRepo;
    this.clienteRepo = clienteRepo;
    this.eventoRepo = eventoRepo;
  }

  /**
   * Obtiene todos los mensajes de un evento ordenados por fecha y hora ascendente
   * (más antiguos primero, más recientes al final - estilo WhatsApp)
   */
  public List<ChatView> getMessagesByEventId(Long eventId) {
    try {
      // Verificar que el evento existe
      Evento evento = eventoRepo.findById(eventId)
          .orElseThrow(() -> new ValidationException("Evento no encontrado"));

      List<Chat> messages = chatRepo.findByEventIdOrderByDateAscHourAsc(eventId);
      
      return messages.stream()
          .map(chat -> toView(chat, evento.getIdCreador()))
          .toList();
    } catch (DataAccessException ex) {
      var det = SqlErrorDetails.from(ex);
      throw new DatabaseSchemaMismatchException(buildUserMessage(det), ex);
    } catch (PersistenceException ex) {
      var det = SqlErrorDetails.from(ex);
      throw new DatabaseSchemaMismatchException(buildUserMessage(det), ex);
    }
  }

  /**
   * Crea un nuevo mensaje en el chat de un evento
   * Verifica que el usuario esté inscrito en el evento
   */
  public ChatView createMessage(Long userId, ChatCreate dto) {
    try {
      // Verificar que el usuario existe
      Cliente cliente = clienteRepo.findById(userId)
          .orElseThrow(() -> new ValidationException("Usuario no encontrado"));

      // Verificar que el evento existe
      Evento evento = eventoRepo.findById(dto.eventId())
          .orElseThrow(() -> new ValidationException("Evento no encontrado"));

      // Verificar que el usuario está inscrito en el evento
      boolean isEnrolled = chatRepo.isUserEnrolledInEvent(dto.eventId(), userId);
      if (!isEnrolled) {
        throw new ValidationException("El usuario no está inscrito en este evento");
      }

      // Validar que el mensaje no esté vacío
      if (dto.message() == null || dto.message().trim().isEmpty()) {
        throw new ValidationException("El mensaje no puede estar vacío");
      }

      // Validar longitud máxima del mensaje (5000 caracteres)
      String trimmedMessage = dto.message().trim();
      if (trimmedMessage.length() > 5000) {
        throw new ValidationException("El mensaje no puede exceder 5000 caracteres");
      }

      // Crear el mensaje
      Chat chat = new Chat();
      chat.setCliente(cliente);
      chat.setEvento(evento);
      chat.setMessage(trimmedMessage);
      chat.setSendedDate(LocalDate.now());
      chat.setSendedHour(LocalTime.now());

      Chat saved = chatRepo.save(chat);
      return toView(saved, evento.getIdCreador());
    } catch (DataAccessException ex) {
      var det = SqlErrorDetails.from(ex);
      throw new DatabaseSchemaMismatchException(buildUserMessage(det), ex);
    } catch (PersistenceException ex) {
      var det = SqlErrorDetails.from(ex);
      throw new DatabaseSchemaMismatchException(buildUserMessage(det), ex);
    }
  }

  /**
   * Convierte una entidad Chat a un DTO ChatView
   */
  private ChatView toView(Chat chat, Long eventCreatorId) {
    Cliente cliente = chat.getCliente();
    boolean isCreator = eventCreatorId != null && eventCreatorId.equals(cliente.getId());

    return new ChatView(
        chat.getId(),
        cliente.getId(),
        cliente.getNombre() + " " + cliente.getApellidos(),
        cliente.getUsername(),
        chat.getEvento().getId(),
        chat.getMessage(),
        chat.getSendedDate(),
        chat.getSendedHour(),
        isCreator
    );
  }

  private String buildUserMessage(SqlErrorDetails.Parsed det) {
    String base = switch (det.kind()) {
      case "COLUMN_NOT_FOUND" -> "Columna inexistente en BD: \"" + det.name() + "\".";
      case "TABLE_NOT_FOUND" -> "Tabla inexistente en BD: \"" + det.name() + "\".";
      case "SQL_SYNTAX_ERROR" -> "Error de sintaxis SQL cerca de: \"" + det.name() + "\".";
      default -> "Incompatibilidad de esquema entre entidad y base de datos.";
    };
    return det.sqlState() != null ? base + " (sqlState=" + det.sqlState() + ")" : base;
  }
}

