package com.eventmanager.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest // Usa las credenciales reales de Supabase desde application.yml o env vars
class SupabaseSchemaMismatchIT {

  @Autowired
  private DataSource dataSource;

  @Test
  void consultarColumnaInexistente_debeLanzarSQLException() {
    assertNotNull(dataSource, "El DataSource (Supabase) no debería ser nulo");

    try (Connection conn = dataSource.getConnection();
         Statement stmt = conn.createStatement()) {

      // Intentamos leer una columna que NO existe en la tabla evento
      SQLException thrown = assertThrows(SQLException.class, () -> {
        ResultSet rs = stmt.executeQuery("SELECT columna_inexistente FROM evento LIMIT 1");
        rs.next();
      });

      String msg = thrown.getMessage().toLowerCase();

      System.out.println("Mensaje SQL real: " + msg);

      if (msg.contains("error: relation")){
        fail("\n\n\nError a la hora de hacer el query: " + msg);
      }

      // PostgreSQL suele devolver "column \"columna_inexistente\" does not exist"
      assertTrue(msg.contains("does not exist") || msg.contains("no existe"),
          "El mensaje debe indicar que la columna no existe: " + msg);

    } catch (SQLException e) {
      fail("Error inesperado al conectarse o ejecutar la consulta: " + e.getMessage());
    }
  }
}
