package com.eventmanager;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.eventmanager.domain.Cliente;
import com.eventmanager.repository.ClienteRepository;
import com.eventmanager.repository.EventoRepository;
import com.eventmanager.service.EventoService;

import jakarta.transaction.Transactional;

@SpringBootTest
@Transactional
public class ClientServiceTest {
    
    
  @Autowired
  private EventoRepository eventoRepository;

  @Autowired
  private EventoService eventoService;

  @Autowired
  private ClienteRepository clienteRepo;

  private List<Long> participanteIds = new ArrayList<>();

  private Cliente createTestUser(String nombre, String apellidos, String username, String correo, LocalDate fechaNacimiento){
    Cliente cliente = new Cliente();
    cliente.setNombre(nombre);
    cliente.setApellidos(apellidos);
    cliente.setUsername(username);
    cliente.setPasswordHash("$2a$10$R7n82AjlIOhQnFnuS4S3feeJUIzlFqEvDVtHpz4DSS0pB3NBLVRCW");
    cliente.setCorreo(correo);
    cliente.setFechaNacimiento(fechaNacimiento);
    return clienteRepo.save(cliente);

  }

  @Test
  void getAllUsersFromId(){
    var saved1 = createTestUser("Sergi", "Blasi", "testuser70", "test312102@gmail.com", LocalDate.of(2000, 1, 1));
    participanteIds.add(saved1.getId());
    var saved2 = createTestUser("Paco", "Lopez", "testuser71", "paco@gmail.com", LocalDate.of(1995, 5, 15));
    participanteIds.add(saved2.getId());

    var participantes = clienteRepo.findAllById(participanteIds);

    assertEquals(participantes.size(),2);
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
