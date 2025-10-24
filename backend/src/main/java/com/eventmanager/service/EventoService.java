package com.eventmanager.service;

import com.eventmanager.dto.EventoDtos.EventoView;
import com.eventmanager.dto.EventoDtos.EventoCreate;
import com.eventmanager.domain.Cliente;
import com.eventmanager.domain.Evento;
import com.eventmanager.repository.EventoRepository;
import com.eventmanager.repository.ClienteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class EventoService {
  private final EventoRepository repo;
  private final ClienteRepository clienteRepo;

  public EventoService(EventoRepository repo, ClienteRepository clienteRepo) {
    this.repo = repo;
    this.clienteRepo = clienteRepo;
  }

  public List<EventoView> listar() {
    return repo.findAll().stream().map(this::toView).toList();
  }

  private EventoView toView(Evento e) {
    Set<Long> participantesIds = e.getParticipantes()
            .stream()
            .map(Cliente::getId)
            .collect(Collectors.toSet());

    return new EventoView(
      e.getId(), e.getFecha(), e.getHora(), e.getLugar(),
      e.getIdiomasPermitidos(), e.getEdadMinima(), e.getMaxPersonas(),
      e.getTitulo(), e.getDescripcion(), participantesIds
    );
  }

  public EventoView createEvent(EventoCreate dto) {

    var creador = clienteRepo.findById(dto.idCreador())
            .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

    Evento evento = new Evento();
    evento.setFecha(dto.fecha());
    evento.setHora(dto.hora());
    evento.setLugar(dto.lugar());
    evento.setIdiomasPermitidos(dto.idiomasPermitidos());
    evento.setEdadMinima(dto.edadMinima());
    evento.setMaxPersonas(dto.maxPersonas());
    evento.setTitulo(dto.titulo());
    evento.setDescripcion(dto.descripcion());

    evento.addParticipante(creador);

    repo.save(evento);

    return toView(evento);
  }
}
