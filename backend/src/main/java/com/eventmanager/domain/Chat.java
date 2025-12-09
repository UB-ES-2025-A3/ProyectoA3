package com.eventmanager.domain;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "chat_evento")
public class Chat {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotNull
  @ManyToOne
  @JoinColumn(name = "client_id", nullable = false)
  private Cliente cliente;

  @NotNull
  @ManyToOne
  @JoinColumn(name = "evento_id", nullable = false)
  private Evento evento;

  @NotBlank
  @Column(columnDefinition = "TEXT")
  private String message;

  @NotNull
  @Column(name = "sended_date", nullable = false)
  private LocalDate sendedDate;

  @NotNull
  @Column(name = "sended_hour", nullable = false)
  private LocalTime sendedHour;

  public Chat() {}

  // Getters/Setters
  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Cliente getCliente() {
    return cliente;
  }

  public void setCliente(Cliente cliente) {
    this.cliente = cliente;
  }

  public Evento getEvento() {
    return evento;
  }

  public void setEvento(Evento evento) {
    this.evento = evento;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public LocalDate getSendedDate() {
    return sendedDate;
  }

  public void setSendedDate(LocalDate sendedDate) {
    this.sendedDate = sendedDate;
  }

  public LocalTime getSendedHour() {
    return sendedHour;
  }

  public void setSendedHour(LocalTime sendedHour) {
    this.sendedHour = sendedHour;
  }
}

