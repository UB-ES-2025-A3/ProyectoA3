package com.eventmanager.web;

import com.eventmanager.dto.ClienteDtos.ClienteView;
import com.eventmanager.dto.ClienteUpdateDto;
import com.eventmanager.service.ClienteService;
import jakarta.validation.ValidationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}