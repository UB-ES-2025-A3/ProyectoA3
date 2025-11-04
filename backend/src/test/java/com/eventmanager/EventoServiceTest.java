package com.eventmanager;

import com.eventmanager.domain.Evento;
import com.eventmanager.domain.Evento.Restricciones;
import com.eventmanager.dto.EventoDtos.EventoView;
import com.eventmanager.repository.EventoRepository;
import com.eventmanager.service.EventoService;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@org.junit.jupiter.api.extension.ExtendWith(MockitoExtension.class)
class EventoServiceTest {

  @Mock
  EventoRepository repo;

  @InjectMocks
  EventoService service;

  @Test
  void listar_mapeaRestricciones_a_EventoView() {
    Evento e = new Evento();
    e.setId(1L);
    e.setFecha(LocalDate.of(2025, 11, 5));
    e.setHora(LocalTime.of(18, 0));
    e.setLugar("Sevilla");
    e.setTitulo("Prueba");
    e.setDescripcion("desc");
    e.setIdCreador(123L);
    // restricciones JSON 
    e.setRestricciones(new Restricciones("es,en", 18, 50));

    when(repo.findAll()).thenReturn(List.of(e));

    List<EventoView> lista = service.listar();
    assertEquals(1, lista.size());
    var v = lista.get(0);

    assertEquals(e.getId(), v.id());
    assertEquals(e.getFecha(), v.fecha());
    assertEquals(e.getHora(), v.hora());
    assertEquals(e.getLugar(), v.lugar());
    assertEquals("es,en", v.idiomasPermitidos());
    assertEquals(18, v.edadMinima());
    assertEquals(50, v.maxPersonas());
    assertEquals("Prueba", v.titulo());
    assertEquals("desc", v.descripcion());
    assertEquals(123L, v.idCreador());
  }
}
