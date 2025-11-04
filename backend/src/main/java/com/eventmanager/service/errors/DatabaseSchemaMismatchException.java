package com.eventmanager.service.errors;

public class DatabaseSchemaMismatchException extends RuntimeException {
  public DatabaseSchemaMismatchException(String message, Throwable cause) {
    super(message, cause);
  }
}
