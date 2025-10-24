package com.eventmanager.domain;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.persistence.CascadeType;

@Entity
public class Evento {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotNull private LocalDate fecha;
  @NotNull private LocalTime hora;
  @NotBlank private String lugar;

  private String idiomasPermitidos;
  private Integer edadMinima;
  private Integer maxPersonas;

  @NotBlank private String titulo;
  private String descripcion;
  @ManyToMany(fetch = FetchType.LAZY, cascade = { CascadeType.MERGE, CascadeType.PERSIST })
  @JoinTable(
          name = "evento_cliente",
          joinColumns = @JoinColumn(name = "evento_id"),
          inverseJoinColumns = @JoinColumn(name = "cliente_id")
  )
  private Set<Cliente> participantes = new HashSet<>();

  public Evento() {}

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }

  public LocalDate getFecha() { return fecha; }
  public void setFecha(LocalDate fecha) { this.fecha = fecha; }

  public LocalTime getHora() { return hora; }
  public void setHora(LocalTime hora) { this.hora = hora; }

  public String getLugar() { return lugar; }
  public void setLugar(String lugar) { this.lugar = lugar; }

  public String getIdiomasPermitidos() { return idiomasPermitidos; }
  public void setIdiomasPermitidos(String idiomasPermitidos) { this.idiomasPermitidos = idiomasPermitidos; }

  public Integer getEdadMinima() { return edadMinima; }
  public void setEdadMinima(Integer edadMinima) { this.edadMinima = edadMinima; }

  public Integer getMaxPersonas() { return maxPersonas; }
  public void setMaxPersonas(Integer maxPersonas) { this.maxPersonas = maxPersonas; }

  public String getTitulo() { return titulo; }
  public void setTitulo(String titulo) { this.titulo = titulo; }

  public String getDescripcion() { return descripcion; }
  public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

  public Set<Cliente> getParticipantes() { return participantes; }
  public void setParticipantes(Set<Cliente> participantes) { this.participantes = participantes; }
  public void addParticipante(Cliente cliente) { this.participantes.add(cliente);}

}
