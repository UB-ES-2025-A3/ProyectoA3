package com.eventmanager.web;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.eventmanager.domain.Cliente;
import com.eventmanager.dto.ClienteDtos.ClienteView;
import com.eventmanager.dto.ClienteDtos.TemaUpdate;
import com.eventmanager.dto.ClienteUpdateDto;
import com.eventmanager.service.ClienteService;

import jakarta.validation.ValidationException;

@RestController
@RequestMapping("/api/clients")
@CrossOrigin(
  origins = "*", 
  allowedHeaders = "*", 
  methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS }
)
public class ClienteController {
  private final ClienteService svc;
  public ClienteController(ClienteService svc){ this.svc = svc; }

  @GetMapping("/{id}")
  public ResponseEntity<ClienteView> getById(@PathVariable Long id) {
    return ResponseEntity.ok(svc.getById(id));
  }

  @PutMapping("/{id}")
  public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ClienteUpdateDto req) {
    try {
      // Opcional: comprobar autorización del usuario logueado aquí según SecurityConfig
      ClienteView updated = svc.update(id, req);
      return ResponseEntity.ok(updated);
    } catch (ValidationException ve) {
      return ResponseEntity.badRequest().body(java.util.Map.of("message", ve.getMessage()));
    } catch (Exception ex) {
      return ResponseEntity.status(500).body(java.util.Map.of("message", "Error actualizando perfil"));
    }
  }

  @GetMapping("/_ping")
  public String ping() { return "clients-ok"; }

  @PostMapping("/participants")
  public List<Cliente> obtenerParticipantes(@RequestBody List<Long> participanteIds){
    return svc.getParticipantesByIds(participanteIds);
  }

  @GetMapping("/{id}/tema")
  public ResponseEntity<String> getTema(@PathVariable Long id) {
    try {
      String tema = svc.getTema(id);
      return ResponseEntity.ok(tema);
    } catch (ValidationException ve) {
      return ResponseEntity.badRequest().body(ve.getMessage());
    }
  }

  @PutMapping("/{id}/tema")
  public ResponseEntity<?> updateTema(@PathVariable Long id, @RequestBody TemaUpdate req) {
    try {
      ClienteView updated = svc.updateTema(id, req.tema());
      return ResponseEntity.ok(updated);
    } catch (ValidationException ve) {
      return ResponseEntity.badRequest().body(java.util.Map.of("message", ve.getMessage()));
    } catch (Exception ex) {
      return ResponseEntity.status(500).body(java.util.Map.of("message", "Error actualizando tema"));
    }
  }
}