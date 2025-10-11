package com.eventmanager.web;

import jakarta.validation.ValidationException;
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
}
