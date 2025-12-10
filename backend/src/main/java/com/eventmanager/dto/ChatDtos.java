package com.eventmanager.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class ChatDtos {

  /**
   * DTO para crear un nuevo mensaje en el chat
   */
  public static record ChatCreate(
      Long eventId,
      String message
  ) {}

  /**
   * DTO para la respuesta de un mensaje del chat
   * Incluye información del remitente y del evento
   */
  public static record ChatView(
      Long id,
      Long clientId,
      String clientName,
      String clientUsername,
      Long eventId,
      String message,
      LocalDate sendedDate,
      LocalTime sendedHour,
      Boolean isCreator
  ) {}
}

