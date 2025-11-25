// dto/AuthDtos.java
package com.eventmanager.dto;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AuthDtos {
  public static record SignUpRequest(
      @NotBlank String nombre, @NotBlank String apellidos,
      @NotBlank String username, @NotBlank @Email String correo,
      @NotNull LocalDate fechaNacimiento, String ciudad, List<String> idioma,
      @NotBlank String password) {}
  public static record LoginRequest(@NotBlank String usernameOrEmail, @NotBlank String password) {}
  public static record AuthResponse(String token, Long userId, String username) {}
}
