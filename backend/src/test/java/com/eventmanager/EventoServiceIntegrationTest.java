package com.eventmanager;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
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

@SpringBootTest // Arranca todo el contexto de Spring Boot
@Transactional  // Para que cada test se haga en una transacción y se revierta al final
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


        EventoCreate dto = new EventoCreate(
                LocalDate.of(2025, 11, 5),
                LocalTime.of(18, 0),
                "Madrid",
                "es,en",
                18,
                50,
                "EventoCrear",
                "Prueba de crear evento",
                idCreador
        );

        EventoView resultado = eventoService.createEvent(dto);

        Evento eventoDB = eventoRepository.findById(resultado.id())
                .orElseThrow();

        assertEquals("EventoCrear", eventoDB.getTitulo());
        assertEquals("Madrid", eventoDB.getLugar());

        assertTrue(
                eventoDB.getParticipantes().stream()
                        .anyMatch(c -> c.getId().equals(idCreador)),
                "El creador debe aparecer en evento_cliente"
        );
    }

    @Test
    void guardarYListar_eventoEnBaseDeDatos() {
        // Creamos un evento
        Evento evento = new Evento();
        evento.setFecha(LocalDate.of(2025, 11, 5));
        evento.setHora(LocalTime.of(18, 0));
        evento.setLugar("Sevilla");
        evento.setIdiomasPermitidos("es,en");
        evento.setEdadMinima(18);
        evento.setMaxPersonas(50);
        evento.setTitulo("Prueba");
        evento.setDescripcion("Prueba de guardar evento");

        // Guardamos en la base de datos
        eventoRepository.save(evento);

        // Ahora lo leemos usando el servicio
        var lista = eventoService.listar();

        EventoDtos.EventoView v = lista.stream()
            .filter(e -> e.titulo().equals("Prueba"))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Evento no encontrado en la lista"));

        assertFalse(lista.isEmpty(), "La lista no debería estar vacía");
        
        // Verificamos que los datos coinciden
        assertEquals(evento.getFecha(), v.fecha());
        assertEquals(evento.getHora(), v.hora());
        assertEquals(evento.getLugar(), v.lugar());
        assertEquals(evento.getIdiomasPermitidos(), v.idiomasPermitidos());
        assertEquals(evento.getEdadMinima(), v.edadMinima());
        assertEquals(evento.getMaxPersonas(), v.maxPersonas());
        assertEquals(evento.getTitulo(), v.titulo());
        assertEquals(evento.getDescripcion(), v.descripcion());
    }

    @Test
    void borrar_eventoEnBaseDeDatos() {
    // Creamos un evento
    Evento evento = new Evento();
    evento.setFecha(LocalDate.of(2025, 11, 6));
    evento.setHora(LocalTime.of(20, 0));
    evento.setLugar("Granada");
    evento.setIdiomasPermitidos("es,en");
    evento.setEdadMinima(16);
    evento.setMaxPersonas(30);
    evento.setTitulo("EventoBorrar");  // título único
    evento.setDescripcion("Prueba de borrar evento");

    // Guardamos en la base de datos
    eventoRepository.save(evento);

    // Comprobamos que se ha guardado
    var listaAntes = eventoRepository.findAll();
    assertTrue(listaAntes.stream().anyMatch(e -> e.getTitulo().equals("EventoBorrar")));

    // Borramos el evento
    eventoRepository.delete(evento);

    // Comprobamos que ya no está
    var listaDespues = eventoRepository.findAll();
    assertFalse(listaDespues.stream().anyMatch(e -> e.getTitulo().equals("EventoBorrar")));
    }
}
