package com.eventmanager.service;

import java.time.LocalDate;
import java.time.Period;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import com.eventmanager.domain.Evento;
import com.eventmanager.domain.Evento.Restricciones;
import com.eventmanager.dto.EventoDtos.EventoAdd;
import com.eventmanager.dto.EventoDtos.EventoCreate;
import com.eventmanager.dto.EventoDtos.EventoFav;
import com.eventmanager.dto.EventoDtos.EventoView;
import com.eventmanager.repository.ClienteRepository;
import com.eventmanager.repository.EventoRepository;
import com.eventmanager.service.errors.DatabaseSchemaMismatchException;
import com.eventmanager.service.errors.SqlErrorDetails;

import jakarta.persistence.PersistenceException;
import jakarta.validation.ValidationException;

@Service
public class EventoService {
  private final EventoRepository repo;
  private final ClienteRepository clienteRepo;

  public EventoService(EventoRepository repo, ClienteRepository clienteRepo) {
    this.repo = repo;
    this.clienteRepo = clienteRepo;
  }

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
  public List<EventoView> listarEventosSinRestricciones(Long userId) {
     try {
      var usuario = clienteRepo.findById(userId)
              .orElseThrow(() -> new IllegalArgumentException("Usuario no existe"));
      int edadUsuario = Period.between(usuario.getFechaNacimiento(), LocalDate.now()).getYears();

      List<String> idiomasList = usuario.getIdiomas();

       Set<String> idiomasPermitidos = new HashSet<>(idiomasList);

       var eventos = repo.findEventosPermitidos(userId, edadUsuario);

       eventos.removeIf(evento -> {
         var restricciones = evento.getRestricciones();
         if (restricciones == null) return false; // o true si quieres excluir sin restricciones
         List<String> idiomasEvento = restricciones.getIdiomas_permitidos();
         if (idiomasEvento == null || idiomasEvento.isEmpty()) return false;

         for (String idiomaEvento : idiomasEvento) {
           if (!idiomasPermitidos.contains(idiomaEvento)) {
             return true; // eliminar este evento
           }
         }
         return false; // mantener
       });

      return eventos.stream()
            .map(this::toView)
            .toList();

     } catch (DataAccessException | PersistenceException ex) {
       var det = SqlErrorDetails.from(ex);
       throw new DatabaseSchemaMismatchException(buildUserMessage(det), ex);
     }
  }


  public List<EventoView> listarMisEventos(Long clienteId) {
    try {
      return repo.findEventosByParticipanteId(clienteId)
        .stream()
        .map(this::toView)
        .toList();
    } catch (DataAccessException ex) {
      var det = SqlErrorDetails.from(ex);
      throw new DatabaseSchemaMismatchException(buildUserMessage(det), ex);
    } catch (PersistenceException ex) {
      var det = SqlErrorDetails.from(ex);
      throw new DatabaseSchemaMismatchException(buildUserMessage(det), ex);
    }
  }

  public List<EventoView> listarMisEventosCreados(Long creadorId) {
    try {
      return repo.findByIdCreadorOrderByFechaAscHoraAsc(creadorId)
        .stream()
        .map(this::toView)
        .toList();
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
      if (req.fecha() == null) {
        throw new ValidationException("La fecha del evento es obligatoria");
      }
      if (req.fecha().isBefore(LocalDate.now())) {
        throw new ValidationException("La fecha del evento no puede ser anterior a hoy");
      }
      // Validación de latitud (opcional, pero si se proporciona debe ser válida)
      if (req.latitud() != null) {
        if (req.latitud() < -90 || req.latitud() > 90) {
          throw new ValidationException("Latitud inválida");
        }
      }
      // Validación de longitud (opcional, pero si se proporciona debe ser válida)
      if (req.longitud() != null) {
        if (req.longitud() < -180 || req.longitud() > 180) {
          throw new ValidationException("Longitud inválida");
        }
      }
      var e = new Evento();
      e.setFecha(req.fecha());
      e.setHora(req.hora());          
      e.setLugar(req.lugar());
      e.setTitulo(req.titulo());
      e.setDescripcion(req.descripcion());
      e.setIdCreador(req.idCreador());
      e.setTags(req.tags());
      e.setLatitud(req.latitud());
      e.setLongitud(req.longitud());

      if (req.restricciones() != null) {
        e.setRestricciones(new Restricciones(
          req.restricciones().idiomasRequerido(),
          req.restricciones().edad_minima(),
          req.restricciones().plazasDisponibles()
        ));
      }
      var creador = clienteRepo.findById(req.idCreador())
                .orElseThrow(() -> new RuntimeException("Cliente creador no encontrado"));
      e.addParticipante(creador);

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
      e.getIdCreador(),
      e.getTags() == null ? List.of() : e.getTags(),
      e.getParticipantes().stream().map(p -> p.getId()).toList(),
      e.getLatitud(),
      e.getLongitud()
    );
  }


  public EventoView addParticipante(EventoAdd dto) {
    var participante = clienteRepo.findById(dto.idParticipante())
            .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    var evento = repo.findByIdWithParticipantes(dto.idEvento())
            .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

    // Verificar que el participante no esté ya apuntado
    if (evento.getParticipantes().contains(participante)) {
      throw new RuntimeException("El usuario ya está apuntado a este evento");
    }

    evento.addParticipante(participante);
    repo.save(evento);

    return toView(evento);
  }
  public EventoView removeParticipante(EventoAdd dto) {
    var participante = clienteRepo.findById(dto.idParticipante())
            .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    var evento = repo.findByIdWithParticipantes(dto.idEvento())
            .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

    // Verificar que el participante esté realmente apuntado al evento
    if (!evento.getParticipantes().contains(participante)) {
      throw new RuntimeException("El usuario no está apuntado a este evento");
    }

    evento.removeParticipante(participante);
    repo.save(evento);

    return toView(evento);
  }

  public EventoView addEventoFavorito(EventoFav dto){
    var user = clienteRepo.findById(dto.idUsuario())
            .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    var evento = repo.findById(dto.idEvento())
            .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

    if(user.getFavoritos().contains(evento)){
      throw new RuntimeException("El evento ya está en favoritos");
    }

    user.addEventoFavorito(evento);
    clienteRepo.save(user);

    return toView(evento);
  }

  public EventoView removeEventoFavorito(EventoFav dto){
    var user = clienteRepo.findById(dto.idUsuario())
            .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    var evento = repo.findById(dto.idEvento())
            .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

    if(!user.getFavoritos().contains(evento)){
      throw new RuntimeException("El evento no está en favoritos");
    }

    user.removeEventoFavorito(evento);
    clienteRepo.save(user);

    return toView(evento);
  }

  public List<EventoView> listarFavoritos(Long userId) {
    var user = clienteRepo.findById(userId)
            .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    
    return user.getFavoritos().stream()
            .map(this::toView)
            .toList();
  }

  public boolean isEventoFavorito(Long userId, Long eventoId) {
    var user = clienteRepo.findById(userId)
            .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    
    return user.getFavoritos().stream()
            .anyMatch(e -> e.getId().equals(eventoId));
  }
}