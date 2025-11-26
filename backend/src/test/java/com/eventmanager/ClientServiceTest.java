package com.eventmanager;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import org.mockito.Mock;

import org.mockito.junit.jupiter.MockitoExtension;

import com.eventmanager.domain.Evento;
import org.junit.jupiter.api.Test;
import com.eventmanager.domain.Cliente;
import com.eventmanager.repository.ClienteRepository;


@org.junit.jupiter.api.extension.ExtendWith(MockitoExtension.class)
public class ClientServiceTest {

  @Mock
  ClienteRepository clienteRepo;

  private List<Long> participanteIds = new ArrayList<>();

  private Cliente createTestUser(String nombre, String apellidos, String username, String correo, LocalDate fechaNacimiento, Long id) {
    Cliente cliente = new Cliente();
    cliente.setNombre(nombre);
    cliente.setApellidos(apellidos);
    cliente.setUsername(username);
    cliente.setPasswordHash("$2a$10$R7n82AjlIOhQnFnuS4S3feeJUIzlFqEvDVtHpz4DSS0pB3NBLVRCW");
    cliente.setCorreo(correo);
    cliente.setFechaNacimiento(fechaNacimiento);
    cliente.setId(id);
    return cliente;

  }

  @Test
  void getAllUsersFromId(){
    Cliente saved1 = createTestUser("Sergi", "Blasi", "testuser70", "test312102@gmail.com", LocalDate.of(2000, 1, 1), 1L);
    participanteIds.add(saved1.getId());
    Cliente saved2 = createTestUser("Paco", "Lopez", "testuser71", "paco@gmail.com", LocalDate.of(1995, 5, 15), 2L);
    participanteIds.add(saved2.getId());

    when(clienteRepo.findAllById(participanteIds))
            .thenReturn(List.of(saved1, saved2));

    var participantes = clienteRepo.findAllById(participanteIds);

    assertEquals(2, participantes.size());
    assertEquals(participantes.get(0).getNombre(),saved1.getNombre());
    assertEquals(participantes.get(1).getNombre(),saved2.getNombre());
    assertEquals(participantes.get(0).getApellidos(),saved1.getApellidos());
    assertEquals(participantes.get(1).getApellidos(),saved2.getApellidos());
    assertEquals(participantes.get(0).getUsername(),saved1.getUsername());
    assertEquals(participantes.get(1).getUsername(),saved2.getUsername());
    assertEquals(participantes.get(0).getCorreo(),saved1.getCorreo());
    assertEquals(participantes.get(1).getCorreo(),saved2.getCorreo());
    assertEquals(participantes.get(0).getFechaNacimiento(),saved1.getFechaNacimiento());
    assertEquals(participantes.get(1).getFechaNacimiento(),saved2.getFechaNacimiento());
    assertEquals(participantes.get(0).getId(), saved1.getId());
    assertEquals(participantes.get(1).getId(), saved2.getId());
  }


}
