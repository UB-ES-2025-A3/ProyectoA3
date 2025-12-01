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
      Long idCreador,
      Double latitud,
      Double longitud
  ) {}

  public static record RestriccionesCreate(
      List<String> idiomasRequerido,
      Integer edad_minima,
      Integer plazasDisponibles
  ) {}

  // View (podemos dejarlo plano para compatibilidad)
  public static record EventoView(
      Long id, LocalDate fecha, LocalTime hora, String lugar,
      List<String> idiomasPermitidos, Integer edadMinima, Integer maxPersonas,
      String titulo, String descripcion, Long idCreador, List<String> tags, List<Long> participantesIds,
      Double latitud, Double longitud
  ) {}

  public static record EventoAdd(
          Long idEvento,
          Long idParticipante
  ) {}
  public static record EventoRemove(
          Long idEvento,
          Long idParticipante
  ) {}

  public static record EventoFav(
            Long idEvento,
            Long idUsuario
  ) {}
}
