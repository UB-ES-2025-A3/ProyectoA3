package com.eventmanager.web;

import com.eventmanager.dto.EventoDtos.EventoCreate;
import com.eventmanager.dto.EventoDtos.EventoView;
import com.eventmanager.dto.EventoDtos.EventoCreate;
import com.eventmanager.service.EventoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventoController {
  private final EventoService service;
  public EventoController(EventoService service) { this.service = service; }

  @GetMapping
  public ResponseEntity<List<EventoView>> listar() {
    return ResponseEntity.ok(service.listar());
  }

  @PostMapping
  public ResponseEntity<EventoView> crear(@RequestBody EventoCreate req) {
    var created = service.crear(req);
    return ResponseEntity.ok(created);
  }

  @GetMapping("/_ping")
  public String ping() { return "events-ok"; }

  @PostMapping
  public EventoView crearEvento(@RequestBody EventoCreate dto) {
    return service.createEvent(dto);
  }
}
