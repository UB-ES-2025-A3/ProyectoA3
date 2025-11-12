package com.eventmanager.repository;

import com.eventmanager.domain.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EventoRepository extends JpaRepository<Evento, Long> {
  
  @Query("SELECT e FROM Evento e JOIN e.participantes p WHERE p.id = :clienteId ORDER BY e.fecha ASC, e.hora ASC")
  List<Evento> findEventosByParticipanteId(@Param("clienteId") Long clienteId);

  // No necesita @Query
  List<Evento> findByIdCreadorOrderByFechaAscHoraAsc(Long idCreador);

  // Cargar evento con participantes para operaciones de agregar/remover
  @Query("SELECT e FROM Evento e LEFT JOIN FETCH e.participantes WHERE e.id = :id")
  Optional<Evento> findByIdWithParticipantes(@Param("id") Long id);
}
