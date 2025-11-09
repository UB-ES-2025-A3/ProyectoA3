package com.eventmanager.web;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventmanager.dto.EventoDtos.EventoCreate;
import com.eventmanager.dto.EventoDtos.EventoView;
import com.eventmanager.dto.EventoDtos.EventoAdd;
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

  @PostMapping("/join")
  public EventoView UnirseEvento(@RequestBody EventoAdd dto) {
    return service.addParticipante(dto);
  }

}
