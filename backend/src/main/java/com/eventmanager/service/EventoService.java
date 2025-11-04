package com.eventmanager.service;

import com.eventmanager.dto.EventoDtos.EventoView;
import com.eventmanager.domain.Evento;
import com.eventmanager.repository.EventoRepository;
import com.eventmanager.service.errors.DatabaseSchemaMismatchException;
import jakarta.persistence.PersistenceException;
import org.hibernate.exception.SQLGrammarException;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventoService {
  private final EventoRepository repo;
  public EventoService(EventoRepository repo){ this.repo = repo; }

  public List<EventoView> listar() {
    try {
      // el SELECT ocurre en repo.findAll(); si falta una columna, explota aquí
      return repo.findAll().stream().map(this::toView).toList();
    } catch (DataAccessException | PersistenceException | SQLGrammarException ex) {
      throw new DatabaseSchemaMismatchException(
        "Incompatibilidad de esquema: la tabla/columnas no coinciden con la entidad Evento. " +
        "Revisa migraciones o naming (snake_case).", ex
      );
    }
  }

  private EventoView toView(Evento e) {
    return new EventoView(
      e.getId(), e.getFecha(), e.getHora(), e.getLugar(),
      e.getIdiomasPermitidos(), e.getEdadMinima(), e.getMaxPersonas(),
      e.getTitulo(), e.getDescripcion()
    );
  }
}
