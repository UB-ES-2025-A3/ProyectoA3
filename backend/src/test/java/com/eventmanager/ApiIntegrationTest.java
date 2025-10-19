package com.tuorg.viajes;


import com.tuorg.viajes.dto.AuthDtos.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;


import java.time.LocalDate;
import java.util.Map;


import static org.junit.jupiter.api.Assertions.*;


@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class ApiIntegrationTest {


  @LocalServerPort int port;


  @Autowired TestRestTemplate rest;


  @Test
  void flujo_basico_signup_login_y_listar_eventos() {
    // signup
    var signReq = new SignUpRequest("Ana","Pérez","anap2","ana2@example.com",
        LocalDate.of(1995,4,12),"BCN","es","Abc!123");
    ResponseEntity<AuthResponse> signResp =
        rest.postForEntity(url("/api/auth/signup"), signReq, AuthResponse.class);
    assertEquals(HttpStatus.OK, signResp.getStatusCode());
    assertNotNull(signResp.getBody());
    assertEquals("anap2", signResp.getBody().username());


    // login
    var loginReq = new LoginRequest("anap2", "Abc!123");
    ResponseEntity<AuthResponse> loginResp =
        rest.postForEntity(url("/api/auth/login"), loginReq, AuthResponse.class);
    assertEquals(HttpStatus.OK, loginResp.getStatusCode());
    assertNotNull(loginResp.getBody());
    assertEquals("anap2", loginResp.getBody().username());


    // listar eventos (cargados por data.sql)
    ResponseEntity<Object[]> eventsResp =
        rest.getForEntity(url("/api/events"), Object[].class);
    assertEquals(HttpStatus.OK, eventsResp.getStatusCode());
    assertNotNull(eventsResp.getBody());
    assertTrue(eventsResp.getBody().length >= 2); // vienen 2 del data.sql
  }


  private String url(String path){ return "http://localhost:" + port + path; }
}



