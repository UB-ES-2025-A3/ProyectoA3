package com.eventmanager.integration;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;

import javax.sql.DataSource;
import java.sql.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Tag("supabase")
@EnabledIfEnvironmentVariable(named = "SPRING_DATASOURCE_URL", matches = ".*supabase.*")
class SupabaseSchemaMismatchIT {

  @Autowired
  private DataSource dataSource;

  @Test
  void consultarColumnaInexistente_debeLanzarSQLException() {
    assertNotNull(dataSource, "El DataSource (Supabase) no debería ser nulo");

    try (Connection conn = dataSource.getConnection();
         Statement stmt = conn.createStatement()) {

      SQLException thrown = assertThrows(SQLException.class, () -> {
        try (ResultSet rs = stmt.executeQuery("SELECT columna_inexistente FROM evento LIMIT 1")) {
          if (rs.next()) { /* no debería entrar */ }
        }
      });

      String msg = thrown.getMessage().toLowerCase();
      System.out.println("Mensaje SQL real: " + msg);

      if (msg.contains("error: relation")) {
        fail("\nError de tabla inexistente (queríamos probar columna): " + msg);
      }

      assertTrue(msg.contains("does not exist") || msg.contains("no existe"),
          "El mensaje debe indicar que la columna no existe: " + msg);

    } catch (SQLException e) {
      fail("Error inesperado al conectarse o ejecutar la consulta: " + e.getMessage());
    }
  }
}
