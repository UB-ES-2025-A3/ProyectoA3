package com.eventmanager.repository;

import com.eventmanager.domain.Evento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventoRepository extends JpaRepository<Evento, Long> {}
