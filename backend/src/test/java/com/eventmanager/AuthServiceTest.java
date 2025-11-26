package com.eventmanager;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Mockito;
import static org.mockito.Mockito.when;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.eventmanager.dto.AuthDtos.LoginRequest;
import com.eventmanager.dto.AuthDtos.SignUpRequest;
import com.eventmanager.repository.ClienteRepository;
import com.eventmanager.service.AuthService;

import jakarta.validation.ValidationException;

public class AuthServiceTest {
  private ClienteRepository repo;
  private AuthService service;

  @BeforeEach
  void setup() {
    repo = Mockito.mock(ClienteRepository.class);
    service = new AuthService(repo, new BCryptPasswordEncoder());
  }

  @Test
  void signup_ok() {
    List<String> idiomas = new java.util.ArrayList<>();
    idiomas.add("es");
    SignUpRequest req = new SignUpRequest("Ana","Pérez","anap","ana@ex.com",
        LocalDate.of(1995,4,12),"BCN",idiomas,"Abc!123");
    when(repo.existsByUsernameIgnoreCase("anap")).thenReturn(false);
    when(repo.existsByCorreoIgnoreCase("ana@ex.com")).thenReturn(false);
    when(repo.save(any())).thenAnswer(inv -> {
      var c = inv.getArgument(0);
      try { c.getClass().getMethod("setId", Long.class).invoke(c, 1L); } catch (Exception ignored) {}
      return c;
    });

    var res = service.signUp(req);
    assertEquals("anap", res.username());
    assertNotNull(res.token());
  }

  @Test
  void login_falla_si_usuario_no_existe() {
    LoginRequest req = new LoginRequest("noexiste","Abc!123");
    when(repo.findByUsernameIgnoreCase("noexiste")).thenReturn(Optional.empty());
    assertThrows(ValidationException.class, () -> service.login(req));
  }
}
