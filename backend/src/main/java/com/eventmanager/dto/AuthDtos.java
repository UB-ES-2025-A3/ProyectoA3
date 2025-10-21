// dto/AuthDtos.java
package com.eventmanager.dto;

import jakarta.validation.constraints.*; import java.time.LocalDate;

public class AuthDtos {
  public static record SignUpRequest(
      @NotBlank String nombre, @NotBlank String apellidos,
      @NotBlank String username, @NotBlank @Email String correo,
      @NotNull LocalDate fechaNacimiento, String ciudad, String idioma,
      @NotBlank String password) {}
  public static record LoginRequest(@NotBlank String usernameOrEmail, @NotBlank String password) {}
  public static record AuthResponse(String token, Long userId, String username) {}
}
