package com.eventmanager;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.*;

import com.eventmanager.domain.Cliente;
import com.eventmanager.domain.Evento;
import com.eventmanager.repository.EventoRepository;
import com.eventmanager.repository.ClienteRepository;
import com.eventmanager.service.EventoService;
import com.eventmanager.dto.EventoDtos.EventoCreate;
import com.eventmanager.dto.EventoDtos.EventoAdd;

public class EventoServiceTest {

  @Test
  void listar_mapea_campos() {
    EventoRepository repo = mock(EventoRepository.class);
    ClienteRepository clienteRepo = mock(ClienteRepository.class);

    Cliente creador = new Cliente();
    creador.setId(42L);

    Evento e = new Evento();
    e.setId(10L);
    e.setFecha(LocalDate.of(2025, 11, 5));
    e.setHora(LocalTime.of(18, 0));
    e.setLugar("Madrid");

    Map<String, Object> restricciones = Map.of(
            "idiomas_permitidos", "ch",
            "edad_minima", 18,
            "max_personas", 50
    );
    e.setRestricciones(restricciones);

    e.setTitulo("Paseo");
    e.setDescripcion("Ruta");
    e.setTags(List.of("aire libre", "deporte"));
    e.addParticipante(creador);

    when(repo.findAll()).thenReturn(List.of(e));
    when(clienteRepo.findById(42L)).thenReturn(Optional.of(creador));

    var service = new EventoService(repo, clienteRepo);
    var lista = service.listar();

    assertEquals(1, lista.size());
    var v = lista.get(0);

    assertEquals(10L, v.id());
    assertEquals("Madrid", v.lugar());
    assertEquals("Paseo", v.titulo());
    assertTrue(v.participantesIds().contains(42L));

    Map<String, Object> r = v.restricciones();
    assertEquals("ch", r.get("idiomas_permitidos"));
    assertEquals(18, r.get("edad_minima"));
    assertEquals(50, r.get("max_personas"));

    assertTrue(v.tags().contains("aire libre"));
  }

  @Test
  void crear_evento() {
    EventoRepository repo = mock(EventoRepository.class);
    ClienteRepository clienteRepo = mock(ClienteRepository.class);

    Cliente creador = new Cliente();
    creador.setId(42L);

    when(clienteRepo.findById(42L)).thenReturn(Optional.of(creador));
    when(repo.save(any(Evento.class))).thenAnswer(inv -> {
      Evento ev = inv.getArgument(0);
      ev.setId(10L);
      return ev;
    });

    var service = new EventoService(repo, clienteRepo);

    Map<String, Object> restricciones = Map.of(
            "idiomas_permitidos", "ch",
            "edad_minima", 18,
            "max_personas", 50
    );

    EventoCreate dto = new EventoCreate(
            LocalDate.of(2025, 11, 5),
            LocalTime.of(18, 0),
            "Madrid",
            restricciones,
            "Paseo",
            "Ruta",
            42L,
            List.of("verano", "aventura")
    );

    var v = service.createEvent(dto);

    assertEquals("Paseo", v.titulo());
    assertEquals("Madrid", v.lugar());
    assertTrue(v.participantesIds().contains(42L));
    assertTrue(v.tags().contains("verano"));
  }

  @Test
  void add_participante() {
    EventoRepository repo = mock(EventoRepository.class);
    ClienteRepository clienteRepo = mock(ClienteRepository.class);

    Cliente participante = new Cliente();
    participante.setId(42L);
    when(clienteRepo.findById(42L)).thenReturn(Optional.of(participante));

    Evento evento = new Evento();
    evento.setId(10L);
    when(repo.findById(10L)).thenReturn(Optional.of(evento));

    var service = new EventoService(repo, clienteRepo);
    var dto = new EventoAdd(10L, 42L);

    var v = service.addParticipante(dto);

    assertEquals(10L, v.id());
    assertTrue(v.participantesIds().contains(42L));
  }
}