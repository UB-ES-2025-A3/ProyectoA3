package com.eventmanager.service;

import com.eventmanager.dto.EventoDtos.EventoCreate;
import com.eventmanager.dto.EventoDtos.EventoView;
import com.eventmanager.domain.Evento;
import com.eventmanager.domain.Evento.Restricciones;
import com.eventmanager.repository.EventoRepository;
import com.eventmanager.service.errors.DatabaseSchemaMismatchException;
import com.eventmanager.service.errors.SqlErrorDetails;
import jakarta.persistence.PersistenceException;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventoService {
  private final EventoRepository repo;
  public EventoService(EventoRepository repo){ this.repo = repo; }

  public List<EventoView> listar() {
    try {
      return repo.findAll().stream().map(this::toView).toList();
    } catch (DataAccessException ex) {
      var det = SqlErrorDetails.from(ex);
      throw new DatabaseSchemaMismatchException(buildUserMessage(det), ex);
    } catch (PersistenceException ex) {
      var det = SqlErrorDetails.from(ex);
      throw new DatabaseSchemaMismatchException(buildUserMessage(det), ex);
    }
  }

  public EventoView crear(EventoCreate req) {
    try {
      var e = new Evento();
      e.setFecha(req.fecha());
      e.setHora(req.hora());          
      e.setLugar(req.lugar());
      e.setTitulo(req.titulo());
      e.setDescripcion(req.descripcion());
      e.setIdCreador(req.idCreador());
      if (req.restricciones() != null) {
        e.setRestricciones(new Restricciones(
          req.restricciones().idiomas_permitidos(),
          req.restricciones().edad_minima(),
          req.restricciones().max_personas()
        ));
      }
      var saved = repo.save(e);
      return toView(saved);
    } catch (DataAccessException ex) {
      var det = SqlErrorDetails.from(ex);
      throw new DatabaseSchemaMismatchException(buildUserMessage(det), ex);
    } catch (PersistenceException ex) {
      var det = SqlErrorDetails.from(ex);
      throw new DatabaseSchemaMismatchException(buildUserMessage(det), ex);
    }
  }

  private String buildUserMessage(SqlErrorDetails.Parsed det) {
    String base = switch (det.kind()) {
      case "COLUMN_NOT_FOUND" -> "Columna inexistente en BD: \"" + det.name() + "\".";
      case "TABLE_NOT_FOUND"  -> "Tabla inexistente en BD: \"" + det.name() + "\".";
      case "SQL_SYNTAX_ERROR" -> "Error de sintaxis SQL cerca de: \"" + det.name() + "\".";
      default -> "Incompatibilidad de esquema entre entidad y base de datos.";
    };
    return det.sqlState() != null ? base + " (sqlState=" + det.sqlState() + ")" : base;
  }

  private EventoView toView(Evento e) {
    var r = e.getRestricciones();
    return new EventoView(
      e.getId(), e.getFecha(), e.getHora(), e.getLugar(),
      r != null ? r.getIdiomas_permitidos() : null,
      r != null ? r.getEdad_minima() : null,
      r != null ? r.getMax_personas() : null,
      e.getTitulo(), e.getDescripcion(),
      e.getIdCreador()
    );
  }
}
