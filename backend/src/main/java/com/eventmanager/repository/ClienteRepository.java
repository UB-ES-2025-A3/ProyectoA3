// repository/ClienteRepository.java
package com.eventmanager.repository;

import com.eventmanager.domain.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
  boolean existsByUsernameIgnoreCase(String username);
  boolean existsByCorreoIgnoreCase(String correo);
  Optional<Cliente> findByUsernameIgnoreCase(String username);
  Optional<Cliente> findByCorreoIgnoreCase(String correo);
}
