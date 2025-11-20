package com.eventmanager.dto;

import java.time.LocalDate;
import java.util.List;

public class ClienteUpdateDto {
    private String nombre;
    private String apellidos;
    private String username;
    private String correo;
    private LocalDate fechaNacimiento;
    private String ciudad;
    private List<String> idioma;
    private String descripcion;
    // getters / setters

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
    public List<String> getIdioma() { return idioma; }
    public void setIdioma(List<String> idioma) { this.idioma = idioma; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}