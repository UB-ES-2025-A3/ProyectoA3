package com.eventmanager.domain;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;


@Entity
@Table(name = "evento")
public class Evento {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotNull
  private LocalDate fecha;

  @NotNull
  private LocalTime hora;

  @NotBlank
  private String lugar;

  // JSON (una sola definición; NO duplicar este campo)
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "restricciones") // sin columnDefinition para que H2 no se queje
  private Restricciones restricciones;

  @NotBlank
  private String titulo;

  private String descripcion;

  private List<String> tags = new ArrayList<>();


  @ManyToMany(fetch = FetchType.LAZY, cascade = { CascadeType.MERGE, CascadeType.PERSIST })
  @JoinTable(
          name = "evento_cliente",
          joinColumns = @JoinColumn(name = "evento_id"),
          inverseJoinColumns = @JoinColumn(name = "cliente_id")
  )
  private Set<Cliente> participantes = new HashSet<>();


  @Column(name = "id_creador")
  private Long idCreador;

  public Evento() {}

  // Getters/Setters
  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }

  public LocalDate getFecha() { return fecha; }
  public void setFecha(LocalDate fecha) { this.fecha = fecha; }

  public LocalTime getHora() { return hora; }
  public void setHora(LocalTime hora) { this.hora = hora; }

  public String getLugar() { return lugar; }
  public void setLugar(String lugar) { this.lugar = lugar; }


  public Restricciones getRestricciones() { return restricciones; }
  public void setRestricciones(Restricciones restricciones) { this.restricciones = restricciones; }


  public String getTitulo() { return titulo; }
  public void setTitulo(String titulo) { this.titulo = titulo; }

  public String getDescripcion() { return descripcion; }
  public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

  public Set<Cliente> getParticipantes() { return participantes; }
  public void setParticipantes(Set<Cliente> participantes) { this.participantes = participantes; }
  public void addParticipante(Cliente cliente) { this.participantes.add(cliente);}
  public void removeParticipante(Cliente cliente) {this.participantes.remove(cliente);}

  public Long getIdCreador() { return idCreador; }
  public void setIdCreador(Long idCreador) { this.idCreador = idCreador; }


  // ---------- JSON POJO ----------
  // Importante: SIN @Embeddable y SIN @Column en sus campos
  public static class Restricciones {
    private String idiomas_permitidos;
    private Integer edad_minima;
    private Integer max_personas;

    public Restricciones() {}

    public Restricciones(String idiomas_permitidos, Integer edad_minima, Integer max_personas) {
      this.idiomas_permitidos = idiomas_permitidos;
      this.edad_minima = edad_minima;
      this.max_personas = max_personas;
    }

    public String getIdiomas_permitidos() { return idiomas_permitidos; }
    public void setIdiomas_permitidos(String idiomas_permitidos) { this.idiomas_permitidos = idiomas_permitidos; }

    public Integer getEdad_minima() { return edad_minima; }
    public void setEdad_minima(Integer edad_minima) { this.edad_minima = edad_minima; }

    public Integer getMax_personas() { return max_personas; }
    public void setMax_personas(Integer max_personas) { this.max_personas = max_personas; }
  }
}
