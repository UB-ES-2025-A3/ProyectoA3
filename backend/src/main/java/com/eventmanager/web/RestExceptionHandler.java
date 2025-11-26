package com.eventmanager.web;

import com.eventmanager.service.errors.DatabaseSchemaMismatchException;
import com.eventmanager.service.errors.SqlErrorDetails;
import jakarta.validation.ValidationException;
import org.postgresql.util.PSQLException;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.jpa.JpaSystemException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class RestExceptionHandler {

    private static final org.slf4j.Logger log =
            org.slf4j.LoggerFactory.getLogger(RestExceptionHandler.class);

    /* --------------------------------------------------------------------------
     * VALIDACIONES (400)
     * -------------------------------------------------------------------------- */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<Map<String, String>> handleValidation(ValidationException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleBind(MethodArgumentNotValidException ex) {
        var msg = ex.getBindingResult().getAllErrors().stream()
                .findFirst().map(e -> e.getDefaultMessage()).orElse("Datos inválidos");
        return ResponseEntity.badRequest().body(Map.of("message", msg));
    }

    /* --------------------------------------------------------------------------
     * ERRORES DE ESQUEMA PERSONALIZADOS
     * -------------------------------------------------------------------------- */
    @ExceptionHandler(DatabaseSchemaMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleSchemaMismatch(DatabaseSchemaMismatchException ex) {

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("code", "SCHEMA_MISMATCH");
        body.put("error", "El esquema de la base de datos no coincide con lo esperado.");
        body.put("details", ex.getMessage());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    /* --------------------------------------------------------------------------
     * ERRORES DE NEGOCIO (RuntimeException)
     * -------------------------------------------------------------------------- */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntime(RuntimeException ex) {
        String msg = ex.getMessage();

        if (msg != null && (msg.contains("apuntado") || msg.contains("no encontrado"))) {
            return ResponseEntity.badRequest().body(Map.of("error", msg));
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", msg != null ? msg : "Error interno del servidor"));
    }

    /* --------------------------------------------------------------------------
     * ERRORES DE BD: DataAccess / JPA / PSQLException
     * -------------------------------------------------------------------------- */
    @ExceptionHandler({ DataAccessException.class, JpaSystemException.class, PSQLException.class })
    public ResponseEntity<Map<String, Object>> handleDb(Exception ex) {

        Throwable root = getRootCause(ex);
        String message = root.getMessage() != null ? root.getMessage() : ex.getMessage();

        log.error(" Error de base de datos capturado:", root);

        // 1) Caso especial: tu error actual de PSQLException
        if (root instanceof PSQLException psql
                && message != null
                && message.contains("La consulta no retornó ningún resultado")) {

            SqlErrorDetails.Parsed parsed = SqlErrorDetails.from(psql);

            // Cogemos las primeras líneas del stack para que veas dónde peta de verdad
            String[] stackTop = Arrays.stream(psql.getStackTrace())
                    .limit(5)
                    .map(StackTraceElement::toString)
                    .toArray(String[]::new);

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("code", parsed.kind());                // aquí te saldrá SCHEMA_MISMATCH
            body.put("error", "Error de PostgreSQL al procesar la consulta.");
            body.put("details", parsed.message());          // "La consulta no retornó ningún resultado."
            body.put("sqlState", parsed.sqlState());        // código de error SQL real
            body.put("exceptionType", psql.getClass().getName());
            body.put("stackTop", stackTop);                 // primeras 5 líneas de stack

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
        }


        // 2) Otros errores de Postgres / esquema
        if (root instanceof PSQLException psql) {
            SqlErrorDetails.Parsed parsed = SqlErrorDetails.from(psql);

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("code", parsed.kind());
            body.put("error", "Error en la base de datos.");
            body.put("details", parsed.message());

            switch (parsed.kind()) {
                case "COLUMN_NOT_FOUND" ->
                        body.put("hint", "Falta la columna '" + parsed.name() + "'. ¿Actualizaste la migración?");
                case "TABLE_NOT_FOUND"  ->
                        body.put("hint", "La tabla '" + parsed.name() + "' no existe.");
                case "SQL_SYNTAX_ERROR" ->
                        body.put("hint", "Error de sintaxis SQL cerca de '" + parsed.name() + "'.");
                default ->
                        body.put("hint", "El esquema de la base de datos puede no coincidir con lo que espera la aplicación.");
            }

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
        }

        // 3) Fallback general: algo de BD pero no directamente PSQLException
        SqlErrorDetails.Parsed parsed = SqlErrorDetails.from(root);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("code", parsed.kind());
        body.put("error", "Error general de base de datos.");
        body.put("details", parsed.message() != null ? parsed.message() : message);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    /* --------------------------------------------------------------------------
     * HELPER
     * -------------------------------------------------------------------------- */
    private Throwable getRootCause(Throwable t) {
        Throwable root = t;
        while (root.getCause() != null && root != root.getCause()) {
            root = root.getCause();
        }
        return root;
    }
}
