package com.eventmanager;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import com.eventmanager.domain.Cliente;
import com.eventmanager.dto.EventoDtos.EventoCreate;
import com.eventmanager.dto.EventoDtos.EventoView;
import com.eventmanager.dto.EventoDtos.RestriccionesCreate;
import com.eventmanager.repository.ClienteRepository;
import com.eventmanager.repository.EventoRepository;
import com.eventmanager.service.EventoService;

import jakarta.transaction.Transactional;

@SpringBootTest
@Transactional
public class EventoServiceIntegrationTest {

  // Usa H2 en memoria y genera el esquema desde @Entity
  @DynamicPropertySource
  static void overrideProps(DynamicPropertyRegistry r) {
    r.add("spring.datasource.url", () -> "jdbc:h2:mem:testdb;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1");
    r.add("spring.datasource.driver-class-name", () -> "org.h2.Driver");
    r.add("spring.datasource.username", () -> "sa");
    r.add("spring.datasource.password", () -> "");
    r.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
    r.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.H2Dialect");
    r.add("spring.sql.init.mode", () -> "never");
    r.add("spring.jpa.properties.hibernate.type.preferred_json_mapper", () -> "jackson");
  }

  @Autowired
  private EventoRepository eventoRepository;

  @Autowired
  private EventoService eventoService;

  @Autowired
  private ClienteRepository clienteRepo;

  private Long creadorId;

  @BeforeEach
  void setUp() {
      Cliente cliente = new Cliente();
      cliente.setNombre("Sergi");
      cliente.setApellidos("Blasi");
      cliente.setUsername("testuser70");
      cliente.setPasswordHash("$2a$10$R7n82AjlIOhQnFnuS4S3feeJUIzlFqEvDVtHpz4DSS0pB3NBLVRCW");
      cliente.setCorreo("test312102@gmail.com");
      cliente.setFechaNacimiento(LocalDate.of(2000, 1, 1));
      Cliente saved = clienteRepo.save(cliente); // ID generado automáticamente

      // Guardar el ID para usarlo en los tests
      creadorId = saved.getId();
  }

  @Test
  void guardarYListar_eventoEnBaseDeDatos() {
    // Creamos el DTO de entrada (match con el JSON real)
    var req = new EventoCreate(
        LocalDate.of(2027, 11, 5),
        LocalTime.of(18, 0, 0),
        "Sevilla",
        new RestriccionesCreate("es,en", 18, 50),
        List.of("musica", "verano"),
        "Prueba",
        "Prueba de guardar evento",
        creadorId // idCreador
    );

    // Creamos vía servicio (cubre mapping DTO -> entidad -> repo)
    EventoView creado = eventoService.crear(req);
    assertNotNull(creado.id(), "Debe devolver id");

    var lista = eventoService.listar();
    assertFalse(lista.isEmpty(), "La lista no debería estar vacía");

    var v = lista.stream()
        .filter(e -> e.id().equals(creado.id()))
        .findFirst()
        .orElseThrow(() -> new RuntimeException("Evento no encontrado en la lista"));

    // Verificaciones
    assertEquals(req.fecha(), v.fecha());
    assertEquals(req.hora(), v.hora());
    assertEquals(req.lugar(), v.lugar());
    assertEquals(req.restricciones().idiomaRequerido(), v.idiomasPermitidos());
    assertEquals(req.restricciones().edad_minima(), v.edadMinima());
    assertEquals(req.restricciones().plazasDisponibles(), v.maxPersonas());
    assertEquals(req.titulo(), v.titulo());
    assertEquals(req.descripcion(), v.descripcion());
    assertEquals(req.idCreador(), v.idCreador());
  }

  @Test
  void borrar_eventoEnBaseDeDatos() {
    var req = new EventoCreate(
        LocalDate.of(2027, 11, 6),
        LocalTime.of(20, 0, 0),
        "Granada",
        new RestriccionesCreate("es,en", 16, 30),
        List.of("musica", "verano"),
        "EventoBorrar",
        "Prueba de borrar evento",
        creadorId 
    );

    EventoView creado = eventoService.crear(req);
    assertNotNull(creado.id());

    var listaAntes = eventoRepository.findAll();
    assertTrue(listaAntes.stream().anyMatch(e -> e.getId().equals(creado.id())));

    eventoRepository.deleteById(creado.id());

    var listaDespues = eventoRepository.findAll();
    assertFalse(listaDespues.stream().anyMatch(e -> e.getId().equals(creado.id())));
  }
  @Test
  void unirseYSalir_eventoEnBaseDeDatos() {
    //Crear participante extra
    Cliente participante = new Cliente();
    participante.setNombre("Participante");
    participante.setApellidos("Prueba");
    participante.setUsername("participante101");
    participante.setPasswordHash("12345");
    participante.setCorreo("participante101@test.com");
    participante.setFechaNacimiento(LocalDate.of(1995, 5, 5));
    Cliente savedParticipante = clienteRepo.save(participante);
    Long participanteId = savedParticipante.getId();

    //Crear evento
    var req = new EventoCreate(
        LocalDate.of(2027, 12, 1),
        LocalTime.of(19, 0, 0),
        "Madrid",
        new RestriccionesCreate("es", 21, 100),
        List.of("deporte"),
        "EventoUnirseSalir",
        "Prueba de unirse y salir evento",
        creadorId 
    );

    EventoView creado = eventoService.crear(req);
    assertNotNull(creado.id());

    // Unirse al evento
    var addDto = new com.eventmanager.dto.EventoDtos.EventoAdd(creado.id(), participanteId);
    EventoView actualizado = eventoService.addParticipante(addDto);
    assertEquals(2, actualizado.participantesIds().size()); // Creador + nuevo participante

    // Salir del evento
    var removeDto = new com.eventmanager.dto.EventoDtos.EventoAdd(creado.id(), participanteId);
    EventoView actualizadoDespuesSalir = eventoService.removeParticipante(removeDto); 
    assertEquals(1, actualizadoDespuesSalir.participantesIds().size()); // Solo el creador
  }
}
