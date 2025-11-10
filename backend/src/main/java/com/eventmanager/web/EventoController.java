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

  /*
  @PostMapping
  public ResponseEntity<EventoView> crear(@RequestBody EventoCreate req) {
    var created = service.crear(req);
    return ResponseEntity.ok(created);
  }
  */
  

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


}
