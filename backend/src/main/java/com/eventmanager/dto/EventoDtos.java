package com.eventmanager.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class EventoDtos {

  // payload para crear (match EXACTO con tu JSON)
  public static record EventoCreate(
      LocalDate fecha,
      LocalTime hora,
      String lugar,
      RestriccionesCreate restricciones,
      List<String> tags,
      String titulo,
      String descripcion,
      Long idCreador
  ) {}

  public static record RestriccionesCreate(
      String idiomaRequerido,
      Integer edad_minima,
      Integer plazasDisponibles
  ) {}

  // View (podemos dejarlo plano para compatibilidad)
  public static record EventoView(
      Long id, LocalDate fecha, LocalTime hora, String lugar,
      String idiomasPermitidos, Integer edadMinima, Integer maxPersonas,
      String titulo, String descripcion, Long idCreador, List<String> tags, Integer ParticipantesInscritos
  ) {}

  public static record EventoAdd(
          Long idEvento,
          Long idParticipante
  ) {}
}
