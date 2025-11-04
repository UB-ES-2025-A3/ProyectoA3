package com.eventmanager.integration;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // usa Supabase real
@Tag("supabase") // ejecútalo solo cuando quieras (p.ej., excluido en CI)
@EnabledIfEnvironmentVariable(named = "SPRING_DATASOURCE_URL", matches = ".*supabase.*")
class SupabaseCrudIT {

  @Autowired
  JdbcTemplate jdbc;

  @Test
  @Transactional // se hace rollback al final: no deja datos persistidos
  void crud_en_tabla_evento_conRollback() {
    assertNotNull(jdbc, "JdbcTemplate no debería ser nulo (debe apuntar a Supabase)");

    // INSERT (usa solo columnas que casi seguro existen; ajusta si tu esquema exige más)
    Long id = jdbc.queryForObject("""
        INSERT INTO evento (fecha, hora, lugar, titulo)
        VALUES (CURRENT_DATE, TIME '18:00', 'Test-Live', 'Test-Supabase')
        RETURNING id
        """, Long.class);
    assertNotNull(id, "INSERT RETURNING id debe devolver un id");

    // SELECT
    String titulo = jdbc.queryForObject(
        "SELECT titulo FROM evento WHERE id = ?",
        String.class, id);
    assertEquals("Test-Supabase", titulo);

    String lugar = jdbc.queryForObject(
        "SELECT lugar FROM evento WHERE id = ?",
        String.class, id);
    assertEquals("Test-Live-Updated", lugar);

    // DELETE (se ejecuta, pero además @Transactional hará rollback al finalizar el test)
    int del = jdbc.update("DELETE FROM evento WHERE id = ?", id);
    assertEquals(1, del, "Debe borrar exactamente 1 fila");

    Integer count = jdbc.queryForObject(
        "SELECT COUNT(*) FROM evento WHERE id = ?",
        Integer.class, id);
    assertEquals(0, count);
  }
}
