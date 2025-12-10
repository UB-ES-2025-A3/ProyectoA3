package com.eventmanager.dto;

import java.time.LocalDate;
import java.util.List;

public class ClienteDtos {
  public static record ClienteView(
    Long id,
    String nombre,
    String apellidos,
    String username,
    String correo,
    LocalDate fechaNacimiento,
    String ciudad,
    List<String> idioma,
    String descripcion,
    String tema
  ) {}

  public static record TemaUpdate(
    String tema
  ) {}
}