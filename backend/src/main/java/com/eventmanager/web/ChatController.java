package com.eventmanager.web;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventmanager.dto.ChatDtos.ChatCreate;
import com.eventmanager.dto.ChatDtos.ChatView;
import com.eventmanager.service.ChatService;

@RestController
@RequestMapping("/api/events")
public class ChatController {
  private final ChatService chatService;

  public ChatController(ChatService chatService) {
    this.chatService = chatService;
  }

  /**
   * Obtiene todos los mensajes de un evento
   * GET /api/events/{eventId}/chat
   */
  @GetMapping("/{eventId}/chat")
  public ResponseEntity<List<ChatView>> getEventMessages(@PathVariable Long eventId) {
    List<ChatView> messages = chatService.getMessagesByEventId(eventId);
    return ResponseEntity.ok(messages);
  }

  /**
   * Crea un nuevo mensaje en el chat de un evento
   * POST /api/events/{eventId}/chat
   * Requiere autenticación (Authorization header)
   */
  @PostMapping("/{eventId}/chat")
  public ResponseEntity<ChatView> sendMessage(
      @PathVariable Long eventId,
      @RequestHeader("Authorization") String authHeader,
      @RequestBody ChatCreate dto) {
    
    Long userId = extractUserIdFromToken(authHeader);
    
    // Asegurar que el eventId del path coincide con el del DTO
    ChatCreate dtoWithEventId = new ChatCreate(eventId, dto.message());
    
    ChatView message = chatService.createMessage(userId, dtoWithEventId);
    return ResponseEntity.ok(message);
  }

  /**
   * Extrae el ID de usuario del token de autenticación
   */
  private Long extractUserIdFromToken(String authHeader) {
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      throw new IllegalArgumentException("Token de autenticación inválido");
    }
    String token = authHeader.substring(7); // Eliminar "Bearer "
    if (!token.startsWith("token-")) {
      throw new IllegalArgumentException("Formato de token inválido");
    }
    try {
      return Long.parseLong(token.substring(6)); // Extraer el ID después de "token-"
    } catch (NumberFormatException e) {
      throw new IllegalArgumentException("Token de autenticación inválido");
    }
  }
}

