package com.eventmanager;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.eventmanager.domain.Evento;
import com.eventmanager.domain.Cliente;
import com.eventmanager.dto.EventoDtos;
import com.eventmanager.repository.EventoRepository;
import com.eventmanager.repository.ClienteRepository;
import com.eventmanager.service.EventoService;
import com.eventmanager.dto.EventoDtos.EventoCreate;
import com.eventmanager.dto.EventoDtos.EventoView;

import jakarta.transaction.Transactional;

@SpringBootTest
@Transactional
public class EventoServiceIntegrationTest {

    @Autowired
    private EventoRepository eventoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private EventoService eventoService;

    @Test
    void crear_eventoEnBaseDeDatos() {
        Long idCreador = 83L;
        var creador = clienteRepository.findById(idCreador)
                .orElseThrow(() -> new RuntimeException("Cliente 83 no existe en BD"));

        Map<String, Object> restricciones = Map.of(
                "idiomas_permitidos", "es,en",
                "edad_minima", 18,
                "max_personas", 50
        );

        List<String> tags = List.of("aire libre", "ocio", "deporte");

        EventoCreate dto = new EventoCreate(
                LocalDate.of(2025, 11, 5),
                LocalTime.of(18, 0),
                "Madrid",
                restricciones,
                "EventoCrear",
                "Prueba de crear evento",
                idCreador,
                tags
        );

        EventoView resultado = eventoService.createEvent(dto);

        Evento eventoDB = eventoRepository.findById(resultado.id())
                .orElseThrow();

        assertEquals("EventoCrear", eventoDB.getTitulo());
        assertEquals("Madrid", eventoDB.getLugar());

        assertEquals("es,en", eventoDB.getRestricciones().get("idiomas_permitidos"));
        assertEquals(18, eventoDB.getRestricciones().get("edad_minima"));
        assertEquals(50, eventoDB.getRestricciones().get("max_personas"));

        assertTrue(eventoDB.getTags().contains("aire libre"));
        assertTrue(eventoDB.getTags().contains("ocio"));

        assertTrue(
                eventoDB.getParticipantes().stream()
                        .anyMatch(c -> c.getId().equals(idCreador)),
                "El creador debe aparecer en evento_cliente"
        );
    }

    @Test
    void guardarYListar_eventoEnBaseDeDatos() {
        Evento evento = new Evento();
        evento.setFecha(LocalDate.of(2025, 11, 5));
        evento.setHora(LocalTime.of(18, 0));
        evento.setLugar("Sevilla");

        Map<String, Object> restricciones = Map.of(
                "idiomas_permitidos", "es,en",
                "edad_minima", 18,
                "max_personas", 50
        );
        evento.setRestricciones(restricciones);

        evento.setTitulo("Prueba");
        evento.setDescripcion("Prueba de guardar evento");
        evento.setTags(List.of("musica", "fiesta"));

        eventoRepository.save(evento);

        var lista = eventoService.listar();

        EventoDtos.EventoView v = lista.stream()
                .filter(e -> e.titulo().equals("Prueba"))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Evento no encontrado en la lista"));

        assertFalse(lista.isEmpty(), "La lista no debería estar vacía");

        assertEquals(evento.getFecha(), v.fecha());
        assertEquals(evento.getHora(), v.hora());
        assertEquals(evento.getLugar(), v.lugar());
        assertEquals("es,en", v.restricciones().get("idiomas_permitidos"));
        assertEquals(18, v.restricciones().get("edad_minima"));
        assertEquals(50, v.restricciones().get("max_personas"));
        assertEquals(evento.getTitulo(), v.titulo());
        assertEquals(evento.getDescripcion(), v.descripcion());

        assertTrue(v.tags().contains("musica"));
        assertTrue(v.tags().contains("fiesta"));
    }
}