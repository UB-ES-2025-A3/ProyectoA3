package com.eventmanager.dto;

import java.time.LocalDate;

public class ClienteUpdateDto {
    private String nombre;
    private String apellidos;
    private String username;
    private String correo;
    private LocalDate fechaNacimiento;
    private String ciudad;
    private String idioma;
    // campos opcionales que el frontend puede enviar y que ignoraremos si no existen en la entidad
    private String bio;
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
    public String getIdioma() { return idioma; }
    public void setIdioma(String idioma) { this.idioma = idioma; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
}