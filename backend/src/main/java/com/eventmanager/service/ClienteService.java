package com.eventmanager.service;

import com.eventmanager.dto.ClienteDtos.ClienteView;
import com.eventmanager.dto.ClienteUpdateDto;
import com.eventmanager.domain.Cliente;
import com.eventmanager.repository.ClienteRepository;
import jakarta.validation.ValidationException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.regex.Pattern;

@Service
public class ClienteService {
  private final ClienteRepository repo;
  public ClienteService(ClienteRepository repo) { this.repo = repo; }

  public ClienteView update(Long id, ClienteUpdateDto req) {
    Cliente c = repo.findById(id).orElseThrow(() -> new ValidationException("Cliente no encontrado"));

    // Validaciones básicas
    if (req.getNombre() != null && req.getNombre().trim().length() < 1) {
      throw new ValidationException("Nombre no puede estar vacío");
    }
    if (req.getApellidos() != null && req.getApellidos().trim().length() < 1) {
      throw new ValidationException("Apellidos no puede estar vacío");
    }
    if (req.getUsername() != null && req.getUsername().trim().length() < 3) {
      throw new ValidationException("Usuario debe tener al menos 3 caracteres");
    }
    if (req.getCorreo() != null) {
      String email = req.getCorreo().trim();
      Pattern emailPattern = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
      if (!emailPattern.matcher(email).matches()) {
        throw new ValidationException("Correo electrónico inválido");
      }
      repo.findByCorreo(email).ifPresent(other -> {
        if (!other.getId().equals(id)) {
          throw new ValidationException("El correo ya está en uso");
        }
      });
    }
    if (req.getUsername() != null) {
      String username = req.getUsername().trim();
      repo.findByUsername(username).ifPresent(other -> {
        if (!other.getId().equals(id)) {
          throw new ValidationException("El nombre de usuario ya está en uso");
        }
      });
    }
    if (req.getFechaNacimiento() != null) {
      LocalDate d = req.getFechaNacimiento();
      if (d.isAfter(LocalDate.now())) {
        throw new ValidationException("Fecha de nacimiento inválida");
      }
    }

    // Aplicar cambios (solo si no son nulos)
    if (req.getNombre() != null) c.setNombre(req.getNombre().trim());
    if (req.getApellidos() != null) c.setApellidos(req.getApellidos().trim());
    if (req.getUsername() != null) c.setUsername(req.getUsername().trim());
    if (req.getCorreo() != null) c.setCorreo(req.getCorreo().trim());
    if (req.getFechaNacimiento() != null) c.setFechaNacimiento(req.getFechaNacimiento());
    if (req.getCiudad() != null) c.setCiudad(req.getCiudad().trim());
    if (req.getIdioma() != null) c.setIdioma(req.getIdioma().trim());
    // Si hay campos extras como bio/languages y tu entidad los soporta, mapearlos aquí.

    Cliente saved = repo.save(c);

    return new ClienteView(
      saved.getId(),
      saved.getNombre(),
      saved.getApellidos(),
      saved.getUsername(),
      saved.getCorreo(),
      saved.getFechaNacimiento(),
      saved.getCiudad(),
      saved.getIdioma()
    );
  }

  public ClienteView getById(Long id) {
    Cliente c = repo.findById(id).orElseThrow(() -> new ValidationException("Cliente no encontrado"));
    return new ClienteView(
      c.getId(),
      c.getNombre(),
      c.getApellidos(),
      c.getUsername(),
      c.getCorreo(),
      c.getFechaNacimiento(),
      c.getCiudad(),
      c.getIdioma()
    );
  }
}