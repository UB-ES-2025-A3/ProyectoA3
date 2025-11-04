package com.eventmanager.web;

import com.eventmanager.service.errors.DatabaseSchemaMismatchException;
import jakarta.validation.ValidationException;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestControllerAdvice
public class RestExceptionHandler {
  @ExceptionHandler(ValidationException.class)
  public ResponseEntity<Map<String,String>> handleValidation(ValidationException ex) {
    return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String,String>> handleBind(MethodArgumentNotValidException ex) {
    var msg = ex.getBindingResult().getAllErrors().stream()
        .findFirst().map(e -> e.getDefaultMessage()).orElse("Datos inválidos");
    return ResponseEntity.badRequest().body(Map.of("error", msg));
  }

  // error de esquema controlado (500 con JSON propio)
  @ExceptionHandler(DatabaseSchemaMismatchException.class)
  public ResponseEntity<Map<String,String>> handleSchemaMismatch(DatabaseSchemaMismatchException ex) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(Map.of(
          "code", "SCHEMA_MISMATCH",
          "error", ex.getMessage()
        ));
  }

  // Fallback (por si algo se cuela sin envolver)
  @ExceptionHandler(DataAccessException.class)
  public ResponseEntity<Map<String,String>> handleDb(DataAccessException ex) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(Map.of("code", "DB_ERROR", "error", "Error de base de datos."));
  }
}
