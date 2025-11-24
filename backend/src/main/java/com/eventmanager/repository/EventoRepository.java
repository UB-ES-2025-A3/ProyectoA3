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

  @Query(value = """
    SELECT e.*
    FROM evento e
    WHERE
        (
            e.restricciones->>'edad_minima' IS NULL
            OR (e.restricciones->>'edad_minima')::int <= :edad
        )
        AND (
              (
                  SELECT COUNT(*)
                  FROM evento_cliente ec
                  WHERE ec.evento_id = e.id
              ) < (e.restricciones->>'max_personas')::int
        
            OR EXISTS (
                SELECT 1 FROM evento_cliente ec2
                WHERE ec2.evento_id = e.id AND ec2.cliente_id = :userId
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
