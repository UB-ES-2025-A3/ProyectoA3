package com.eventmanager.service;

import com.eventmanager.dto.EventoDtos.EventoView;
import com.eventmanager.dto.EventoDtos.EventoCreate;
import com.eventmanager.dto.EventoDtos.EventoAdd;
import com.eventmanager.domain.Cliente;
import com.eventmanager.domain.Evento;
import com.eventmanager.repository.EventoRepository;
import com.eventmanager.repository.ClienteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
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

    Map<String, Object> restricciones = e.getRestricciones();

    return new EventoView(
            e.getId(),
            e.getFecha(),
            e.getHora(),
            e.getLugar(),
            restricciones,
            e.getTitulo(),
            e.getDescripcion(),
            participantesIds,
            e.getTags()
    );
  }

  public EventoView createEvent(EventoCreate dto) {
    var creador = clienteRepo.findById(dto.idCreador())
            .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

    Evento evento = new Evento();
    evento.setFecha(dto.fecha());
    evento.setHora(dto.hora());
    evento.setLugar(dto.lugar());
    evento.setTitulo(dto.titulo());
    evento.setDescripcion(dto.descripcion());
    evento.setIdCreador(dto.idCreador());
    evento.setTags(dto.tags());

    // Si el DTO tiene restricciones, las guardamos tal cual
    Map<String, Object> restricciones = dto.restricciones();
    if (restricciones != null) {
      evento.setRestricciones(restricciones);
    }

    // Añadimos automáticamente el creador como participante
    evento.addParticipante(creador);

    repo.save(evento);
    return toView(evento);
  }

  public EventoView addParticipante(EventoAdd dto) {
    var participante = clienteRepo.findById(dto.idParticipante())
            .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    var evento = repo.findById(dto.idEvento())
            .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

    evento.addParticipante(participante);
    repo.save(evento);

    return toView(evento);
  }
}