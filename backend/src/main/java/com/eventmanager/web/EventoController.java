package com.eventmanager.web;

import com.eventmanager.dto.EventoDtos.EventoView;
import com.eventmanager.dto.EventoDtos.EventoCreate;
import com.eventmanager.service.EventoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events") // <- ESTA ruta es la que vas a llamar
public class EventoController {
  private final EventoService service;
  public EventoController(EventoService service) { this.service = service; }

  @GetMapping
  public ResponseEntity<List<EventoView>> listar() {
    return ResponseEntity.ok(service.listar());
  }

  // prueba rápida para asegurar que el mapping existe
  @GetMapping("/_ping")
  public String ping() { return "events-ok"; }

  @PostMapping
  public EventoView crearEvento(@RequestBody EventoCreate dto) {
    return service.createEvent(dto);
  }
}
