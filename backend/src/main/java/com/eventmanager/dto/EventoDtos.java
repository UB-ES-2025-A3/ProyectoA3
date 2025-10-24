package com.eventmanager.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;
import java.util.Set;
import java.util.List;

public class EventoDtos {

  public static record EventoView(
          Long id,
          LocalDate fecha,
          LocalTime hora,
          String lugar,
          Map<String, Object> restricciones,
          String titulo,
          String descripcion,
          Set<Long> participantesIds,
          List<String> tags
  ) {}

  public static record EventoCreate(
          LocalDate fecha,
          LocalTime hora,
          String lugar,
          Map<String, Object> restricciones,
          String titulo,
          String descripcion,
          Long idCreador,
          List<String> tags
  ) {}

  public static record EventoAdd(
          Long idEvento,
          Long idParticipante
  ) {}
}