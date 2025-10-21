package com.eventmanager.service;

import com.eventmanager.dto.EventoDtos.EventoView;
import com.eventmanager.domain.Evento;
import com.eventmanager.repository.EventoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventoService {
  private final EventoRepository repo;
  public EventoService(EventoRepository repo){ this.repo = repo; }

  public List<EventoView> listar() {
    return repo.findAll().stream().map(this::toView).toList();
  }

  private EventoView toView(Evento e) {
    return new EventoView(
      e.getId(), e.getFecha(), e.getHora(), e.getLugar(),
      e.getIdiomasPermitidos(), e.getEdadMinima(), e.getMaxPersonas(),
      e.getTitulo(), e.getDescripcion()
    );
  }
}
