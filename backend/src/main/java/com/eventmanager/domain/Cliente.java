package com.eventmanager.domain;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "clientes_new")
public class Cliente {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank private String nombre;
  @NotBlank private String apellidos;
  @NotBlank @Column(unique = true) private String username;
  @NotBlank @Email @Column(unique = true) private String correo;
  @NotNull private LocalDate fechaNacimiento;
  private String ciudad;

  @Column(name = "idioma")
  private List<String> idioma = new ArrayList<>();

  @Column(columnDefinition = "TEXT")
  private String descripcion;
  @NotBlank private String passwordHash;

  // Tema de color de la interfaz (default, blue, green, purple, orange, pink)
  private String tema = "default";


  @ManyToMany(fetch = FetchType.LAZY, cascade = { CascadeType.MERGE, CascadeType.PERSIST })
  @JoinTable(
          name = "eventos_favoritos",
          joinColumns = @JoinColumn(name = "cliente_id"),
          inverseJoinColumns = @JoinColumn(name = "evento_id")
  )
  private Set<Evento> favoritos = new HashSet<>();


  public Cliente() {}

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }

  public String getNombre() { return nombre; }
  public void setNombre(String nombre) { this.nombre = nombre; }

  public String getApellidos() { return apellidos; }
  public void setApellidos(String apellidos) { this.apellidos = apellidos; }

  public String getUsername() { return username; }
  public void setUsername(String username) { this.username = username; }

  public String getCorreo() { return correo; }
  public void setCorreo(String correo) { this.correo = correo; }

  public LocalDate getFechaNacimiento() { return fechaNacimiento; }
  public void setFechaNacimiento(LocalDate fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }

  public String getCiudad() { return ciudad; }
  public void setCiudad(String ciudad) { this.ciudad = ciudad; }

  public List<String> getIdiomas() { return idioma; }
  public void setIdiomas(List<String> idiomas) { this.idioma = idiomas; }
  public void addIdiomas(String idioma){ this.idioma.add(idioma); }

  public String getDescripcion() { return descripcion; }
  public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

  public String getPasswordHash() { return passwordHash; }
  public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

  public Set<Evento> getFavoritos() { return favoritos; }
  public void setFavoritos(Set<Evento> favoritos) { this.favoritos = favoritos; }
  public void addEventoFavorito(Evento evento) { this.favoritos.add(evento); }
  public void removeEventoFavorito(Evento evento) { this.favoritos.remove(evento);}

  public String getTema() { return tema; }
  public void setTema(String tema) { this.tema = tema; }
}
