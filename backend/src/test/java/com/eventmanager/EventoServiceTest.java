package com.eventmanager;

import com.eventmanager.domain.Evento;
import com.eventmanager.repository.EventoRepository;
import com.eventmanager.service.EventoService;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class EventoServiceTest {
  @Test
  void listar_mapea_campos() {
    EventoRepository repo = mock(EventoRepository.class);
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
    when(repo.findAll()).thenReturn(List.of(e));

    var service = new EventoService(repo);
    var lista = service.listar();
    assertEquals(1, lista.size());
    var v = lista.get(0);
    assertEquals(10L, v.id());
    assertEquals("Madrid", v.lugar());
    assertEquals("Paseo", v.titulo());
  }
}

