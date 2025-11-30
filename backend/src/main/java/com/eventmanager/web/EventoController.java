package com.eventmanager.web;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventmanager.dto.EventoDtos.EventoAdd;
import com.eventmanager.dto.EventoDtos.EventoCreate;
import com.eventmanager.dto.EventoDtos.EventoFav;
import com.eventmanager.dto.EventoDtos.EventoView;
import com.eventmanager.service.EventoService;

@RestController
@RequestMapping("/api/events")
public class EventoController {
  private final EventoService service;
  public EventoController(EventoService service) { this.service = service; }

  @GetMapping
  public ResponseEntity<List<EventoView>> listar() {
    return ResponseEntity.ok(service.listar());
  }


  @GetMapping("/compatible")
  public ResponseEntity<List<EventoView>> eventosSinRestricciones(@RequestHeader("Authorization") String authHeader) {
    Long userId = extractUserIdFromToken(authHeader);
    return ResponseEntity.ok(service.listarEventosSinRestricciones(userId));
  }

  @GetMapping("/my-events")
  public ResponseEntity<List<EventoView>> misEventos(@RequestHeader("Authorization") String authHeader) {
    Long userId = extractUserIdFromToken(authHeader);
    return ResponseEntity.ok(service.listarMisEventos(userId));
  }

  @GetMapping("/my-created-events")
  public ResponseEntity<List<EventoView>> misEventosCreados(@RequestHeader("Authorization") String authHeader) {
    Long userId = extractUserIdFromToken(authHeader);
    return ResponseEntity.ok(service.listarMisEventosCreados(userId));
  }

  @GetMapping("/_ping")
  public String ping() { return "events-ok"; }

  @PostMapping
  public EventoView crearEvento(@RequestBody EventoCreate dto) {
    return service.crear(dto);
  }

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
  @PostMapping("/join")
  public EventoView UnirseEvento(@RequestBody EventoAdd dto) {
    return service.addParticipante(dto);
  }
  @PostMapping("/leave")
  public EventoView salirEvento(@RequestBody EventoAdd dto) {
    return service.removeParticipante(dto);
  }

  @PostMapping("/addfavorite")
  public EventoView favoriteEvento(@RequestBody EventoFav dto) {
    return service.addEventoFavorito(dto);
  }

  @PostMapping("/removefavorite")
  public EventoView removeFavoriteEvento(@RequestBody EventoFav dto) {
    return service.removeEventoFavorito(dto);
  }

  @GetMapping("/favorites")
  public ResponseEntity<List<EventoView>> listarFavoritos(@RequestHeader("Authorization") String authHeader) {
    Long userId = extractUserIdFromToken(authHeader);
    return ResponseEntity.ok(service.listarFavoritos(userId));
  }

  @GetMapping("/is-favorite/{eventoId}")
  public ResponseEntity<Boolean> isEventoFavorito(
      @RequestHeader("Authorization") String authHeader,
      @org.springframework.web.bind.annotation.PathVariable Long eventoId) {
    Long userId = extractUserIdFromToken(authHeader);
    return ResponseEntity.ok(service.isEventoFavorito(userId, eventoId));
  }
}
