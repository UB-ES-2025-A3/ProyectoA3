package com.eventmanager.repository;

import com.eventmanager.domain.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatRepository extends JpaRepository<Chat, Long> {

  /**
   * Obtiene todos los mensajes de un evento ordenados por fecha y hora ascendente
   * (más antiguos primero, más recientes al final - estilo WhatsApp)
   */
  @Query("SELECT c FROM Chat c WHERE c.evento.id = :eventId ORDER BY c.sendedDate ASC, c.sendedHour ASC")
  List<Chat> findByEventIdOrderByDateAscHourAsc(@Param("eventId") Long eventId);

  /**
   * Verifica si un usuario está inscrito en un evento
   */
  @Query("SELECT COUNT(ec) > 0 FROM Evento e JOIN e.participantes ec WHERE e.id = :eventId AND ec.id = :userId")
  boolean isUserEnrolledInEvent(@Param("eventId") Long eventId, @Param("userId") Long userId);
}

