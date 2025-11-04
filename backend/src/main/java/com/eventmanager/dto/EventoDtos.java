package com.eventmanager.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class EventoDtos {

  // payload para crear (match EXACTO con tu JSON)
  public static record EventoCreate(
      LocalDate fecha,
      LocalTime hora,
      String lugar,
      RestriccionesCreate restricciones,
      String titulo,
      String descripcion,
      Long idCreador
  ) {}

  public static record RestriccionesCreate(
      String idiomas_permitidos,
      Integer edad_minima,
      Integer max_personas
  ) {}

  // View (podemos dejarlo plano para compatibilidad)
  public static record EventoView(
      Long id, LocalDate fecha, LocalTime hora, String lugar,
      String idiomasPermitidos, Integer edadMinima, Integer maxPersonas,
      String titulo, String descripcion, Long idCreador
  ) {}

  public static record EventoAdd(
          Long idEvento,
          Long idParticipante
  ) {}
}
