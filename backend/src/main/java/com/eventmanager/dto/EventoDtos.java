// dto/EventoDtos.java
package com.eventmanager.dto;

import java.time.LocalDate; import java.time.LocalTime;

public class EventoDtos {
  public static record EventoView(
      Long id, LocalDate fecha, LocalTime hora, String lugar,
      String idiomasPermitidos, Integer edadMinima, Integer maxPersonas,
      String titulo, String descripcion) {}
}
