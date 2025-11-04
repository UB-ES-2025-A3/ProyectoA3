package com.eventmanager;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.eventmanager.domain.Evento;
import com.eventmanager.dto.EventoDtos;
import com.eventmanager.repository.EventoRepository;
import com.eventmanager.service.EventoService;

import jakarta.transaction.Transactional;

import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@SpringBootTest
@Transactional
public class EventoServiceIntegrationTest {

    // Estas propiedades se aplican SOLO en este test: usa H2 y crea las tablas desde las entidades
    @DynamicPropertySource
    static void overrideProps(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", () -> "jdbc:h2:mem:testdb;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1");
        r.add("spring.datasource.driver-class-name", () -> "org.h2.Driver");
        r.add("spring.datasource.username", () -> "sa");
        r.add("spring.datasource.password", () -> "");
        r.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop"); // autogenera esquema desde @Entity
        r.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.H2Dialect");
        r.add("spring.sql.init.mode", () -> "never"); // no ejecutar scripts externos
    }

    @Autowired
    private EventoRepository eventoRepository;

    @Autowired
    private EventoService eventoService;

    @Test
    void guardarYListar_eventoEnBaseDeDatos() {
        Evento evento = new Evento();
        evento.setFecha(LocalDate.of(2025, 11, 5));
        evento.setHora(LocalTime.of(18, 0));
        evento.setLugar("Sevilla");
        evento.setIdiomasPermitidos("es,en");
        evento.setEdadMinima(18);
        evento.setMaxPersonas(50);
        evento.setTitulo("Prueba");
        evento.setDescripcion("Prueba de guardar evento");

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
        assertEquals(evento.getIdiomasPermitidos(), v.idiomasPermitidos());
        assertEquals(evento.getEdadMinima(), v.edadMinima());
        assertEquals(evento.getMaxPersonas(), v.maxPersonas());
        assertEquals(evento.getTitulo(), v.titulo());
        assertEquals(evento.getDescripcion(), v.descripcion());
    }

    @Test
    void borrar_eventoEnBaseDeDatos() {
        Evento evento = new Evento();
        evento.setFecha(LocalDate.of(2025, 11, 6));
        evento.setHora(LocalTime.of(20, 0));
        evento.setLugar("Granada");
        evento.setIdiomasPermitidos("es,en");
        evento.setEdadMinima(16);
        evento.setMaxPersonas(30);
        evento.setTitulo("EventoBorrar");
        evento.setDescripcion("Prueba de borrar evento");

        eventoRepository.save(evento);

        var listaAntes = eventoRepository.findAll();
        assertTrue(listaAntes.stream().anyMatch(e -> e.getTitulo().equals("EventoBorrar")));

        eventoRepository.delete(evento);

        var listaDespues = eventoRepository.findAll();
        assertFalse(listaDespues.stream().anyMatch(e -> e.getTitulo().equals("EventoBorrar")));
    }
}
