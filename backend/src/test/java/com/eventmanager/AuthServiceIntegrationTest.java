package com.eventmanager;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import com.eventmanager.domain.Cliente;
import com.eventmanager.dto.AuthDtos.*;
import com.eventmanager.dto.AuthDtos.LoginRequest;
import com.eventmanager.dto.AuthDtos.SignUpRequest;
import com.eventmanager.repository.ClienteRepository;
import com.eventmanager.service.AuthService;

import jakarta.validation.ValidationException;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;


@SpringBootTest
@Transactional // Cada test se revierte al finalizar
public class AuthServiceIntegrationTest {

    @org.springframework.test.context.DynamicPropertySource
    static void h2(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", () -> "jdbc:h2:mem:authdb;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1");
        r.add("spring.datasource.driver-class-name", () -> "org.h2.Driver");
        r.add("spring.datasource.username", () -> "sa");
        r.add("spring.datasource.password", () -> "");
        r.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
        r.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.H2Dialect");
        r.add("spring.sql.init.mode", () -> "never");
        r.add("spring.jpa.properties.hibernate.type.preferred_json_mapper", () -> "jackson");

    }

    @Autowired ClienteRepository clienteRepository;
    @Autowired AuthService authService;

    @Test
    void signup_guarda_en_base_de_datos() {
        SignUpRequest req = new SignUpRequest(
                "Ana", "Pérez", "anap", "ana@ex.com",
                LocalDate.of(1995, 4, 12), "BCN", "es", "Abc!123"
        );

        var res = authService.signUp(req);

        assertEquals("anap", res.username());
        assertNotNull(res.token());

        // Verificamos que realmente se guardó en base de datos
        var guardado = clienteRepository.findByUsernameIgnoreCase("anap").orElseThrow();
        assertEquals("ana@ex.com", guardado.getCorreo());
        assertTrue(guardado.getPasswordHash().startsWith("$2a$")); // bcrypt
    }

    @Test
    void login_ok_y_falla_si_contrasena_incorrecta() {
        // Creamos un usuario directamente en BD
        Cliente c = new Cliente();
        c.setNombre("Luis");
        c.setApellidos("Gómez");
        c.setUsername("luisg");
        c.setCorreo("luis@ex.com");
        c.setFechaNacimiento(LocalDate.of(1990, 1, 1));
        c.setCiudad("Madrid");
        c.setIdioma("es");
        c.setPasswordHash(new BCryptPasswordEncoder().encode("Secreto!1"));
        clienteRepository.save(c);

        // login correcto
        var loginOk = authService.login(new LoginRequest("luisg", "Secreto!1"));
        assertEquals("luisg", loginOk.username());
        assertNotNull(loginOk.token());

        // login incorrecto
        assertThrows(ValidationException.class, () ->
                authService.login(new LoginRequest("luisg", "mala"))
        );
    }
}
