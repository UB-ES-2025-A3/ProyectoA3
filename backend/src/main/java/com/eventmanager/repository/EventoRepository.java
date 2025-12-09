package com.eventmanager.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.eventmanager.domain.Evento;

public interface EventoRepository extends JpaRepository<Evento, Long> {
  
  @Query("SELECT e FROM Evento e JOIN e.participantes p WHERE p.id = :clienteId ORDER BY e.fecha ASC, e.hora ASC")
  List<Evento> findEventosByParticipanteId(@Param("clienteId") Long clienteId);

  @Query(value = """
    SELECT e.*
    FROM eventos_new e
    WHERE
        (
            e.restricciones->>'edad_minima' IS NULL
            OR (e.restricciones->>'edad_minima')::int <= :edad
        )
        AND (
              (
                  SELECT COUNT(*)
                  FROM participantes_evento ec
                  WHERE ec.evento_id = e.id
              ) < (e.restricciones->>'max_personas')::int
        
            OR EXISTS (
                SELECT 1 FROM participantes_evento ec2
                WHERE ec2.evento_id = e.id AND ec2.participante_id = :userId
            )
        )
    ORDER BY e.fecha ASC, e.hora ASC
""", nativeQuery = true)
  List<Evento> findEventosPermitidos(
          @Param("userId") Long userId,
          @Param("edad") Integer edad
  );

  // No necesita @Query
  List<Evento> findByIdCreadorOrderByFechaAscHoraAsc(Long idCreador);

  // Cargar evento con participantes para operaciones de agregar/remover
  @Query("SELECT e FROM Evento e LEFT JOIN FETCH e.participantes WHERE e.id = :id")
  Optional<Evento> findByIdWithParticipantes(@Param("id") Long id);
}
