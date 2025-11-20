package com.eventmanager.domain;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
public class Cliente {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank private String nombre;
  @NotBlank private String apellidos;
  @NotBlank @Column(unique = true) private String username;
  @NotBlank @Email @Column(unique = true) private String correo;
  @NotNull private LocalDate fechaNacimiento;
  private String ciudad;
  private List<String> idioma;
  @Column(columnDefinition = "TEXT")
  private String descripcion;
  @NotBlank private String passwordHash;

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
  public void addIdiomas(String idioma){this.idioma.add(idioma);}

  public String getDescripcion() { return descripcion; }
  public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

  public String getPasswordHash() { return passwordHash; }
  public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
}
