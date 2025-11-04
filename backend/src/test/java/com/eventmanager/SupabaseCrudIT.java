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
@Tag("supabase") // excluye en CI
@EnabledIfEnvironmentVariable(named = "SPRING_DATASOURCE_URL", matches = ".*supabase.*")
class SupabaseCrudIT {

  @Autowired
  JdbcTemplate jdbc;

  @Test
  @Transactional // rollback al final
  void crud_en_tabla_evento_conRollback() {
    assertNotNull(jdbc, "JdbcTemplate no debería ser nulo (debe apuntar a Supabase)");

    // INSERT con todos los campos relevantes y JSONB restricciones
    Long id = jdbc.queryForObject("""
        INSERT INTO public.evento (fecha, hora, lugar, titulo, descripcion, id_creador, restricciones)
        VALUES (CURRENT_DATE, TIME '18:00:00', 'Test-Live', 'Test-Supabase', 'it live',
                999,
                jsonb_build_object(
                  'idiomas_permitidos','es,en',
                  'edad_minima',18,
                  'max_personas',50
                ))
        RETURNING id
        """, Long.class);
    assertNotNull(id, "INSERT RETURNING id debe devolver un id");

    // SELECT de campos planos
    var titulo = jdbc.queryForObject("SELECT titulo FROM public.evento WHERE id = ?", String.class, id);
    var lugar  = jdbc.queryForObject("SELECT lugar  FROM public.evento WHERE id = ?", String.class, id);
    var creador= jdbc.queryForObject("SELECT id_creador FROM public.evento WHERE id = ?", Long.class, id);

    assertEquals("Test-Supabase", titulo);
    assertEquals("Test-Live", lugar);
    assertEquals(999L, creador);

    // SELECT de propiedades dentro del JSONB
    var idiomas = jdbc.queryForObject("SELECT restricciones->>'idiomas_permitidos' FROM public.evento WHERE id = ?", String.class, id);
    var edadMin = jdbc.queryForObject("SELECT (restricciones->>'edad_minima')::int FROM public.evento WHERE id = ?", Integer.class, id);
    var maxPers = jdbc.queryForObject("SELECT (restricciones->>'max_personas')::int FROM public.evento WHERE id = ?", Integer.class, id);

    assertEquals("es,en", idiomas);
    assertEquals(18, edadMin);
    assertEquals(50, maxPers);

    // UPDATE de un plano y uno dentro del JSONB
    int up1 = jdbc.update("UPDATE public.evento SET lugar = ? WHERE id = ?", "Test-Live-Updated", id);
    assertEquals(1, up1);

    int up2 = jdbc.update("""
        UPDATE public.evento
           SET restricciones = jsonb_set(restricciones, '{max_personas}', to_jsonb(?::int), true)
         WHERE id = ?
        """, 60, id);
    assertEquals(1, up2);

    var lugar2 = jdbc.queryForObject("SELECT lugar FROM public.evento WHERE id = ?", String.class, id);
    var maxPers2 = jdbc.queryForObject("SELECT (restricciones->>'max_personas')::int FROM public.evento WHERE id = ?", Integer.class, id);

    assertEquals("Test-Live-Updated", lugar2);
    assertEquals(60, maxPers2);

    // DELETE (además @Transactional hará rollback)
    int del = jdbc.update("DELETE FROM public.evento WHERE id = ?", id);
    assertEquals(1, del);

    Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM public.evento WHERE id = ?", Integer.class, id);
    assertEquals(0, count);
  }
}
