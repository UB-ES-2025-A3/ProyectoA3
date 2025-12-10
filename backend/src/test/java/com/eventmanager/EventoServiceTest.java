package com.eventmanager;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import com.eventmanager.domain.Cliente;
import com.eventmanager.repository.ClienteRepository;
import com.eventmanager.repository.EventoRepository;
import jakarta.validation.ValidationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.eventmanager.domain.Evento;
import com.eventmanager.domain.Evento.Restricciones;
import com.eventmanager.dto.EventoDtos;
import com.eventmanager.service.EventoService;

@org.junit.jupiter.api.extension.ExtendWith(MockitoExtension.class)
class EventoServiceTest {

  @Mock
  EventoRepository eventoRepo;

  @Mock
  ClienteRepository clienteRepo;

  @InjectMocks
  EventoService service;

  EventoDtos.EventoCreate evento_create;

  @BeforeEach
  void setup() {
    evento_create = new EventoDtos.EventoCreate(
        LocalDate.of(LocalDate.now().getYear() + 1, 3, 7),
        LocalTime.of(0, 0),
        "Reus",
        new EventoDtos.RestriccionesCreate(
            List.of("es", "en"),
            18,
            50
        ),
        List.of("Música", "Concierto"),
        "Concierto de Navidad",
        "Un evento especial para celebrar la Navidad con música en vivo.",
        1L,
        41.3851,
        2.1734
    );
  }

  private Evento getEvento() {
    Evento guardado = new Evento();
    guardado.setId(10L);
    guardado.setFecha(evento_create.fecha());
    guardado.setHora(evento_create.hora());
    guardado.setLugar(evento_create.lugar());
    guardado.setTitulo(evento_create.titulo());
    guardado.setDescripcion(evento_create.descripcion());
    guardado.setIdCreador(evento_create.idCreador());
    guardado.setRestricciones(new Restricciones(
            evento_create.restricciones().idiomasRequerido(),
            evento_create.restricciones().edad_minima(),
            evento_create.restricciones().plazasDisponibles()
    ));
    return guardado;
  }

  @Test
  void crear_guarda_evento_en_repo() {
    Cliente c = new Cliente();
    c.setId(1L);
    c.setNombre("Chaofan");

    when(clienteRepo.findById(1L)).thenReturn(Optional.of(c));

    // Dado un Evento que repo.save(... ) devolverá
    Evento guardado = getEvento();

    when(eventoRepo.save(org.mockito.ArgumentMatchers.any(Evento.class)))
            .thenReturn(guardado);

    var v = service.crear(evento_create);

    assertEquals(10L, v.id());
    assertEquals("Concierto de Navidad", v.titulo());
    assertEquals("Reus", v.lugar());
    assertEquals(List.of("es", "en"), v.idiomasPermitidos());
  }

  @Test
  void crear_guarda_evento_en_repo_error_fecha_nula() {
    // Crear un DTO con fecha nula
    var req = new EventoDtos.EventoCreate(
            null,
            evento_create.hora(),
            evento_create.lugar(),
            evento_create.restricciones(),
            evento_create.tags(),
            evento_create.titulo(),
            evento_create.descripcion(),
            evento_create.idCreador(),
            evento_create.latitud(),
            evento_create.longitud()
    );

    var err = assertThrowsExactly(
            ValidationException.class,
            () -> service.crear(req)
    );

    // Comprobar mensaje exacto
    assertEquals("La fecha del evento es obligatoria", err.getMessage());
  }

  @Test
  void crear_guarda_evento_en_repo_error_fecha_incorrecta() {
    // Crear un DTO con fecha nula
    var req = new EventoDtos.EventoCreate(
            LocalDate.of(LocalDate.now().getYear() - 1, 3, 7),
            evento_create.hora(),
            evento_create.lugar(),
            evento_create.restricciones(),
            evento_create.tags(),
            evento_create.titulo(),
            evento_create.descripcion(),
            evento_create.idCreador(),
            evento_create.latitud(),
            evento_create.longitud()
    );

    var err = assertThrowsExactly(
            ValidationException.class,
            () -> service.crear(req)
    );

    // Comprobar mensaje exacto
    assertEquals("La fecha del evento no puede ser anterior a hoy", err.getMessage());
  }

  @Test
  void crear_guarda_evento_en_repo_error_cliente_creador_no_existe() {
    // Dado un Evento que repo.save(... ) devolverá
    var err = assertThrowsExactly(
            RuntimeException.class,
            () -> service.crear(evento_create)
    );

    // Comprobar mensaje exacto
    assertEquals("Cliente creador no encontrado", err.getMessage());
  }

  @Test
  void listar_eventos() {
    Evento e1 = getEvento();
    Evento e2 = getEvento();
    e2.setId(20L);

    when(eventoRepo.findAll()).thenReturn(List.of(e1, e2));

    var lista = service.listar();

    assertEquals(2, lista.size());
    assertEquals(10L, lista.get(0).id());
    assertEquals(20L, lista.get(1).id());
  }

  @Test
  void listar_mis_eventos() {
    Evento e1 = getEvento();
    Evento e2 = getEvento();
    e2.setId(20L);

    when(eventoRepo.findEventosByParticipanteId(1L))
        .thenReturn(List.of(e1, e2));

    var lista = service.listarMisEventos(1L);

    assertEquals(2, lista.size());
    assertEquals(10L, lista.get(0).id());
    assertEquals(20L, lista.get(1).id());
  }

  @Test
  void apuntarse_a_evento() {
    Cliente participante = new Cliente();
    participante.setId(1L);

    Evento e = getEvento();

    when(clienteRepo.findById(1L)).thenReturn(Optional.of(participante));
    when(eventoRepo.findByIdWithParticipantes(10L)).thenReturn(Optional.of(e));
    when(eventoRepo.save(e)).thenReturn(e);

    var dto = new EventoDtos.EventoAdd(10L, 1L);

    var r = service.addParticipante(dto);

    assertEquals(10L, r.id());
    assertEquals(1, r.participantesIds().size());
    assertEquals(1L, r.participantesIds().getFirst());
  }

  @Test
  void apuntarse_a_evento_error_cliente_inexistente() {
    var dto = new EventoDtos.EventoAdd(10L, 1L);

    var err = assertThrowsExactly(
            RuntimeException.class,
            () -> service.addParticipante(dto)
    );

    // Comprobar mensaje exacto
    assertEquals("Cliente no encontrado", err.getMessage());
  }

  @Test
  void apuntarse_a_evento_error_evento_inexistente() {
    Cliente participante = new Cliente();
    participante.setId(1L);

    when(clienteRepo.findById(1L)).thenReturn(Optional.of(participante));
    when(eventoRepo.findByIdWithParticipantes(10L)).thenReturn(Optional.empty());

    var dto = new EventoDtos.EventoAdd(10L, 1L);

    var err = assertThrowsExactly(
            RuntimeException.class,
            () -> service.addParticipante(dto)
    );

    assertEquals("Evento no encontrado", err.getMessage());
  }

  @Test
  void apuntarse_a_evento_error_usuario_ya_apuntado() {
    Cliente participante = new Cliente();
    participante.setId(1L);

    Evento e = getEvento();
    e.addParticipante(participante);

    when(clienteRepo.findById(1L)).thenReturn(Optional.of(participante));
    when(eventoRepo.findByIdWithParticipantes(10L)).thenReturn(Optional.of(e));

    var dto = new EventoDtos.EventoAdd(10L, 1L);

    var err = assertThrowsExactly(
            RuntimeException.class,
            () -> service.addParticipante(dto)
    );

    assertEquals("El usuario ya está apuntado a este evento", err.getMessage());
  }

  @Test
  void desapuntarse_a_evento() {
    Cliente participante = new Cliente();
    participante.setId(1L);

    Evento e = getEvento();
    e.addParticipante(participante);

    when(clienteRepo.findById(1L)).thenReturn(Optional.of(participante));
    when(eventoRepo.findByIdWithParticipantes(10L)).thenReturn(Optional.of(e));
    when(eventoRepo.save(e)).thenReturn(e);

    var dto = new EventoDtos.EventoAdd(10L, 1L);

    var r = service.removeParticipante(dto);

    assertEquals(10L, r.id());
    assertTrue(r.participantesIds().isEmpty());
  }

  @Test
  void desapuntarse_a_evento_error_cliente_inexistente() {
    when(clienteRepo.findById(1L)).thenReturn(Optional.empty());

    var dto = new EventoDtos.EventoAdd(10L, 1L);

    var err = assertThrowsExactly(
            RuntimeException.class,
            () -> service.removeParticipante(dto)
    );

    assertEquals("Cliente no encontrado", err.getMessage());
  }

  @Test
  void desapuntarse_a_evento_error_evento_inexistente() {
    Cliente participante = new Cliente();
    participante.setId(1L);

    when(clienteRepo.findById(1L)).thenReturn(Optional.of(participante));
    when(eventoRepo.findByIdWithParticipantes(10L)).thenReturn(Optional.empty());

    var dto = new EventoDtos.EventoAdd(10L, 1L);

    var err = assertThrowsExactly(
            RuntimeException.class,
            () -> service.removeParticipante(dto)
    );

    assertEquals("Evento no encontrado", err.getMessage());
  }

  @Test
  void add_evento_favorito() {
    Cliente user = new Cliente();
    user.setId(1L);

    Evento e = getEvento();

    when(clienteRepo.findById(1L)).thenReturn(Optional.of(user));
    when(eventoRepo.findById(10L)).thenReturn(Optional.of(e));
    when(clienteRepo.save(user)).thenReturn(user);

    var dto = new EventoDtos.EventoFav(10L, 1L);

    var r = service.addEventoFavorito(dto);

    assertEquals(10L, r.id());
  }

  @Test
  void add_evento_favorito_error_evento_ya_favorito() {
      Cliente user = new Cliente();
      user.setId(1L);

      Evento e = getEvento();
      user.addEventoFavorito(e);

      when(clienteRepo.findById(1L)).thenReturn(Optional.of(user));
      when(eventoRepo.findById(10L)).thenReturn(Optional.of(e));

      var dto = new EventoDtos.EventoFav(10L, 1L);

      var err = assertThrowsExactly(
              RuntimeException.class,
              () -> service.addEventoFavorito(dto)
      );

      assertEquals("El evento ya está en favoritos", err.getMessage());
  }

  @Test
  void add_evento_favorito_error_usuario_inexistente() {
    when(clienteRepo.findById(1L)).thenReturn(Optional.empty());

    var dto = new EventoDtos.EventoFav(10L, 1L);

    var err = assertThrowsExactly(
            RuntimeException.class,
            () -> service.addEventoFavorito(dto)
    );

    assertEquals("Cliente no encontrado", err.getMessage());
  }

  @Test
  void add_evento_favorito_error_evento_inexistente() {
    Cliente user = new Cliente();
    user.setId(1L);

    when(clienteRepo.findById(1L)).thenReturn(Optional.of(user));
    when(eventoRepo.findById(10L)).thenReturn(Optional.empty());

    var dto = new EventoDtos.EventoFav(10L, 1L);

    var err = assertThrowsExactly(
            RuntimeException.class,
            () -> service.addEventoFavorito(dto)
    );

    assertEquals("Evento no encontrado", err.getMessage());
  }

  @Test
  void remove_evento_favorito() {
    Cliente user = new Cliente();
    user.setId(1L);

    Evento e = getEvento();
    user.addEventoFavorito(e);

    when(clienteRepo.findById(1L)).thenReturn(Optional.of(user));
    when(eventoRepo.findById(10L)).thenReturn(Optional.of(e));
    when(clienteRepo.save(user)).thenReturn(user);

    var dto = new EventoDtos.EventoFav(10L, 1L);

    var r = service.removeEventoFavorito(dto);

    assertEquals(10L, r.id());
  }

  @Test
  void remove_evento_favorito_error_evento_no_favorito() {
    Cliente user = new Cliente();
    user.setId(1L);

    Evento e = getEvento();

    when(clienteRepo.findById(1L)).thenReturn(Optional.of(user));
    when(eventoRepo.findById(10L)).thenReturn(Optional.of(e));

    var dto = new EventoDtos.EventoFav(10L, 1L);

    var err = assertThrowsExactly(
            RuntimeException.class,
            () -> service.removeEventoFavorito(dto)
    );

    assertEquals("El evento no está en favoritos", err.getMessage());
  }

  @Test
  void remove_evento_favorito_error_usuario_inexistente() {
    when(clienteRepo.findById(1L)).thenReturn(Optional.empty());

    var dto = new EventoDtos.EventoFav(10L, 1L);

    var err = assertThrowsExactly(
            RuntimeException.class,
            () -> service.removeEventoFavorito(dto)
    );

    assertEquals("Cliente no encontrado", err.getMessage());
  }

  @Test
  void remove_evento_favorito_error_evento_inexistente() {
      Cliente user = new Cliente();
      user.setId(1L);

      when(clienteRepo.findById(1L)).thenReturn(Optional.of(user));
      when(eventoRepo.findById(10L)).thenReturn(Optional.empty());

      var dto = new EventoDtos.EventoFav(10L, 1L);

      var err = assertThrowsExactly(
              RuntimeException.class,
              () -> service.removeEventoFavorito(dto)
      );

      assertEquals("Evento no encontrado", err.getMessage());
  }
}
