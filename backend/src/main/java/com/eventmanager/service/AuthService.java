// service/AuthService.java
package com.eventmanager.service;

import com.eventmanager.config.SecurityConfig;
import com.eventmanager.domain.Cliente;
import com.eventmanager.dto.AuthDtos.*;
import com.eventmanager.repository.ClienteRepository;
import jakarta.validation.ValidationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional; import java.util.regex.Pattern;

@Service
public class AuthService {
  private final ClienteRepository repo; private final PasswordEncoder enc;
  private final Pattern policy = Pattern.compile(SecurityConfig.PASSWORD_REGEX);
  public AuthService(ClienteRepository r, PasswordEncoder e){this.repo=r; this.enc=e;}

  public AuthResponse signUp(SignUpRequest req) {
    if (!policy.matcher(req.password()).matches()) throw new ValidationException("Contraseña insegura.");
    if (repo.existsByUsernameIgnoreCase(req.username())) throw new ValidationException("Username en uso.");
    if (repo.existsByCorreoIgnoreCase(req.correo())) throw new ValidationException("Correo en uso.");
    Cliente c = new Cliente();
    c.setNombre(req.nombre()); c.setApellidos(req.apellidos());
    c.setUsername(req.username()); c.setCorreo(req.correo());
    c.setFechaNacimiento(req.fechaNacimiento()); c.setCiudad(req.ciudad()); c.setIdioma(req.idioma());
    c.setPasswordHash(enc.encode(req.password()));
    repo.save(c);
    return new AuthResponse("token-" + c.getId(), c.getId(), c.getUsername());
  }

  public AuthResponse login(LoginRequest req) {
    Optional<Cliente> oc = repo.findByUsernameIgnoreCase(req.usernameOrEmail())
        .or(() -> repo.findByCorreoIgnoreCase(req.usernameOrEmail()));
    Cliente c = oc.orElseThrow(() -> new ValidationException("Credenciales inválidas."));
    if (!enc.matches(req.password(), c.getPasswordHash())) throw new ValidationException("Credenciales inválidas.");
    return new AuthResponse("token-" + c.getId(), c.getId(), c.getUsername());
  }
}
