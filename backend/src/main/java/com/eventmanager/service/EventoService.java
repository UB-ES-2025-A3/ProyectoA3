package com.eventmanager.service;

import java.time.LocalDate;
import java.time.Period;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import com.eventmanager.domain.Cliente;
import com.eventmanager.domain.Evento;
import com.eventmanager.domain.Evento.Restricciones;
import com.eventmanager.dto.EventoDtos.EventoAdd;
import com.eventmanager.dto.EventoDtos.EventoCreate;
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
      var e = new Evento();
      e.setFecha(req.fecha());
      e.setHora(req.hora());          
      e.setLugar(req.lugar());
      e.setTitulo(req.titulo());
      e.setDescripcion(req.descripcion());
      e.setIdCreador(req.idCreador());
      e.setTags(req.tags()); 

      if (req.restricciones() != null) {
        e.setRestricciones(new Restricciones(
          req.restricciones().idiomaRequerido(),
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
    //System.err.printf("Participantes: ", e.getParticipantes().stream().map(p -> p.getId()).toList());
    return new EventoView(
      e.getId(), e.getFecha(), e.getHora(), e.getLugar(),
      r != null ? r.getIdiomas_permitidos() : null,
      r != null ? r.getEdad_minima() : null,
      r != null ? r.getMax_personas() : null,
      e.getTitulo(), e.getDescripcion(),
      e.getIdCreador(),
      e.getTags() == null ? List.of() : e.getTags(),   // <- AQUI
      e.getParticipantes().stream().map(p -> p.getId()).toList()
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

  /**
   * Lista eventos filtrados según las restricciones que el usuario cumple.
   * Solo devuelve eventos a los que el usuario se puede unir.
   */
  public List<EventoView> listarEventosCompatibleConUsuario(Long clienteId) {
    try {
      Cliente cliente = clienteRepo.findById(clienteId)
          .orElseThrow(() -> new ValidationException("Cliente no encontrado"));

      // Calcular edad del usuario
      int edadUsuario = calcularEdad(cliente.getFechaNacimiento());
      List<String> idiomaUsuario = cliente.getIdioma();

      // Obtener todos los eventos y filtrar
      List<Evento> todosEventos = repo.findAll();
      
      System.err.println("[DEBUG] Total eventos en BD: " + todosEventos.size());
      
      return todosEventos.stream()
          .filter(evento -> {
            boolean cumple = cumpleRestricciones(evento, edadUsuario, idiomaUsuario);
            if (!cumple) {
              System.err.println("[DEBUG] Evento " + evento.getId() + " (" + evento.getTitulo() + ") rechazado");
              if (evento.getRestricciones() != null) {
                System.err.println("  - idiomas_permitidos: " + evento.getRestricciones().getIdiomas_permitidos());
              } else {
                System.err.println("  - restricciones: null");
              }
            } else {
              System.err.println("[DEBUG] Evento " + evento.getId() + " (" + evento.getTitulo() + ") ACEPTADO");
              if (evento.getRestricciones() != null) {
                System.err.println("  - idiomas_permitidos: " + evento.getRestricciones().getIdiomas_permitidos());
              }
            }
            return cumple;
          })
          .map(this::toView)
          .collect(Collectors.toList());
    } catch (DataAccessException ex) {
      var det = SqlErrorDetails.from(ex);
      throw new DatabaseSchemaMismatchException(buildUserMessage(det), ex);
    } catch (PersistenceException ex) {
      var det = SqlErrorDetails.from(ex);
      throw new DatabaseSchemaMismatchException(buildUserMessage(det), ex);
    }
  }

  /**
   * Calcula la edad del usuario desde su fecha de nacimiento
   */
  private int calcularEdad(LocalDate fechaNacimiento) {
    if (fechaNacimiento == null) {
      return 0; // Si no tiene fecha de nacimiento, se considera que no cumple restricciones de edad
    }
    return Period.between(fechaNacimiento, LocalDate.now()).getYears();
  }

  /**
   * Verifica si un evento cumple con las restricciones del usuario
   */
  private boolean cumpleRestricciones(Evento evento, int edadUsuario, List<String> idiomaUsuario) {
    Restricciones restricciones = evento.getRestricciones();
    
    // Si no tiene restricciones en absoluto, el usuario puede unirse
    if (restricciones == null) {
      return true;
    }

    // Verificar restricción de edad
    if (restricciones.getEdad_minima() != null) {
      if (edadUsuario < restricciones.getEdad_minima()) {
        return false; // No cumple la edad mínima
      }
    }

    // Verificar restricción de idiomas
    List<String> idiomasPermitidos = restricciones.getIdiomas_permitidos();
    
    // Si el evento tiene restricción de idiomas especificada (no null y no vacío/blank)
    if (idiomasPermitidos != null && !idiomasPermitidos.isEmpty()) {
      // Parsear idiomas (pueden venir como "it" o "es,en,fr")
      List<String> idiomasLista = idiomasPermitidos.stream()
          .filter(s -> s != null && !s.trim().isEmpty()) // Filtrar strings vacíos después del trim
          .map(String::toLowerCase)
          .collect(Collectors.toList());
      

      if(!idiomasLista.isEmpty()){
        if(idiomaUsuario == null || idiomaUsuario.isEmpty()){
          return false; // El usuario no tiene idiomas, pero el evento requiere alguno
        }
        boolean coincide = idiomaUsuario.stream()
            .filter(s-> s != null && !s.trim().isEmpty())
            .map(String::toLowerCase)
            .anyMatch(idiomasLista::contains);
        if(!coincide){
          return false;
        }
      }
    }
    
    return verificarCapacidad(restricciones, evento);
  }
  
  /**
   * Verifica si el evento tiene capacidad disponible
   */
  private boolean verificarCapacidad(Restricciones restricciones, Evento evento) {

    // Verificar restricción de capacidad
    if (restricciones.getMax_personas() != null) {
      int participantesActuales = evento.getParticipantes().size();
      if (participantesActuales >= restricciones.getMax_personas()) {
        return false; // El evento está lleno
      }
    }

    // Si pasa todas las restricciones, el usuario puede unirse
    return true;
  }
}