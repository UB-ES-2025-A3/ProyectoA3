package com.eventmanager;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;

import com.eventmanager.domain.Cliente;
import com.eventmanager.domain.Evento;
import com.eventmanager.repository.EventoRepository;
import com.eventmanager.repository.ClienteRepository;
import com.eventmanager.service.EventoService;
import com.eventmanager.dto.EventoDtos.EventoCreate;
import com.eventmanager.dto.EventoDtos.EventoView;
 
//Este test no comprueba en base de datos, solo la funcionalidad
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
    e.setIdiomasPermitidos("es,en");
    e.setEdadMinima(18);
    e.setMaxPersonas(50);
    e.setTitulo("Paseo");
    e.setDescripcion("Ruta");
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

    assertTrue(v.participantesIds().contains(42L),
            "El DTO debe incluir el ID del cliente participante");
  }

  @Test
  void crear_evento() {
    EventoRepository repo = mock(EventoRepository.class);
    ClienteRepository clienteRepo = mock(ClienteRepository.class);

    Cliente creador = new Cliente();
    creador.setId(42L);

    // Cuando el servicio busque el creador por ID, lo encuentra
    when(clienteRepo.findById(42L)).thenReturn(Optional.of(creador));

    // Mock repo.save: devuelve el evento que se intenta guardar
    when(repo.save(any(Evento.class))).thenAnswer(inv -> {
      Evento ev = inv.getArgument(0);
      ev.setId(10L); // ID generado ficticio
      return ev;
    });

    var service = new EventoService(repo, clienteRepo);

    EventoCreate dto = new EventoCreate(
            LocalDate.of(2025, 11, 5),
            LocalTime.of(18, 0),
            "Madrid",
            "es,en",
            18,
            50,
            "Paseo",
            "Ruta",
            42L
    );

    var v = service.createEvent(dto);

    assertEquals("Paseo", v.titulo());
    assertEquals("Madrid", v.lugar());
    assertTrue(v.participantesIds().contains(42L),
            "El creador debe añadirse automáticamente a los participantes");
  }
}

