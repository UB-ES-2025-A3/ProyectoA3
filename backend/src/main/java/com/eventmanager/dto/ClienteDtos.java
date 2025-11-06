package com.eventmanager.dto;

import java.time.LocalDate;

public class ClienteDtos {
  public static record ClienteView(
    Long id,
    String nombre,
    String apellidos,
    String username,
    String correo,
    LocalDate fechaNacimiento,
    String ciudad,
    String idioma
  ) {}
}