

# Que necesito para correr el backend

Para instalar JAVA 21 (en modo administrador en powershell)

- winget install EclipseAdoptium.Temurin.21.JDK

## Para el maven

Descargar de la web `https://maven.apache.org/download.cgi` el archivo `apache-maven-3.9.11-bin.zip`
y ponerlo en el siguiente directorio `C:\Tools`.

Para que funcione el visual cambiar el `settings.json` !

``` settings.json

  "terminal.integrated.env.windows": {
    "JAVA_HOME": "C:\\Program Files\\Eclipse Adoptium\\jdk-21.0.8.9-hotspot",
    "MAVEN_HOME": "C:\\Tools\\apache-maven-3.9.11",
    "PATH": "C:\\Program Files\\Eclipse Adoptium\\jdk-21.0.8.9-hotspot\\bin;C:\\Tools\\apache-maven-3.9.11\\bin;${env:PATH}"
  },
  "maven.executable.path": "C:\\Tools\\apache-maven-3.9.11\\bin\\mvn.cmd",
  "java.configuration.runtimes": [
    {
      "name": "JavaSE-21",
      "path": "C:\\Program Files\\Eclipse Adoptium\\jdk-21.0.8.9-hotspot",
      "default": true
    }
  ],

```

Recargar terminal y comprobar que esto funcione

- java -version
- mvn -v

# Correr el server 

Ejecutar en el directorio donde esta el `pom.xml` (dentro de backend)

- mvn -U clean package (para actualizarlo)
- mvn spring-boot:run  (para correrlo)



# Verificación que el backend esta funcionando

Ejecutar en powershell (en otra terminal una vez el servidor esta corriendo)

## Conexión establecida

curl.exe http://127.0.0.1:8080/ping  -- devuelve "pong"

## Sign up

Simula una petición de sign up y muestra el json respuesta

$signup = @{
  nombre = "Ana"
  apellidos = "Perez"
  username = "anap200"
  correo = "ana200@example.com"
  fechaNacimiento = "1995-04-12"
  ciudad = "BCN"
  idioma = "es"
  password = "Abc!123"
} | ConvertTo-Json

Invoke-RestMethod -Method POST -Uri "http://127.0.0.1:8080/api/auth/signup" -Body $signup -ContentType "application/json"

## Log in 

$login = @{ usernameOrEmail = "anap200"; password = "Abc!123" } | ConvertTo-Json

Invoke-RestMethod -Method POST -Uri "http://127.0.0.1:8080/api/auth/login" -Body $login -ContentType "application/json"


## Ver eventos

Para comprobar que esta bien montado hacer un sanity check

Invoke-RestMethod "http://127.0.0.1:8080/api/events/_ping"  

Devuelve `events-ok`

Para ver la lista hacer (deberian de haber 2 creados en el `schema.sql` y `data.sql`)

Invoke-RestMethod "http://127.0.0.1:8080/api/events"


# Como esta estructurado el backend

`ViajesApplication.java`

Clase raíz para que Spring lea todo (no hace falta tocar)

`config/`

Se encarga de codificar las contraseñas. No se que es CORS ni JWT 

`domain/`

Las clases del modelo 

Si se cambian atributos de una clase ya existente 
- Actualiza `schema.sql`
- Revisar los `DTO`(lo que se recibe o envia), `service/` (lógica) y `web/` (JSON).
- Ajustar `data.sql`

Toda esta clase se verifica con `jakarta.validation`

`dto/` (Data Transfer Objects)

Forma del JSON que entra/sale por la API. Sirve para no exponer entidades directamente (sí es necesario, no lo quiteis)

Si se cambia alguna clase
- Añadir/quitar campos para requests/responses sin romper la entidad.
- Mantener compatibilidad con el frontend (nombres de propiedad).

`repository/` (Spring Data JPA)

Querys de SQL automaticas. Spring Data genera automáticamente la implementación en tiempo de ejecución.

`service/` (lógica de negocio)

- validaciones, hashing, mapeos DTO↔Entidad.
- Si cambias atributos, actualiza mapeos y validaciones.
- Añade nuevos servicios cuando aparezcan nuevos casos de uso.

`web/` (controladores)

- Endpoints REST con @RestController.
- Si cambias DTOs/servicios, ajusta firmas y rutas.
- Añade endpoints para nuevas entidades (GET/POST/PUT/DELETE)


`src/main/resources/`

`application.yml:`es el archivo central de configuración de Spring Boot. puerto/host del servidor, datasource (BDD), JPA/Hibernate, carga de schema.sql/data.sql, CORS, logging, etc.

`schema.sql`: crea/actualiza tablas locales.
`data.sql`: datos demo (eventos) para probar datos.

`src/test/*`

Tests unitarios e integración

# Guia para añadir o quitar atributos en clases ya definidas

Ejemplo para añadir telefono a usuario

`Cliente.java`

private String telefono;
public String getTelefono(){ return telefono; }
public void setTelefono(String t){ this.telefono = t; }

`schema.sql`

``` sql
alter table cliente add column telefono varchar(30);
```

también se puede : `drop table + create table` con la nueva columna

`DTOs`

cambiar para enviar o recibir datos 

`Service`

En `AuthService.signUp`, setea `c.setTelefono(req.telefono())` si lo metiste en request.

`Controller`

No deberia de cambiar si el DTO esta bien configurado

`Tests`

Actualizar tests para que pasen todos


# Guia para añadir o quitar nuevas clases

1. Crear la entidad en domain (mirar clases ya definidas + obligatorio tener getters y setters)
2. Crear la tabla en `schema.sql`
3. Crear su repositorio
4. Crear su DTO 
5. Crear su service 
6. Crear un nuevo controller para definir los endpoints necesarios


# Tests unitarios creados actualmente

1) PasswordPolicyTest

comprobar que la regex de contraseñas cumple la política definida en `SecurityConfig.PASSWORD_REGEX.`

- `acepta_valida()` → Abc!123 debe cumplir: (≥6, 1 mayúscula, 1 minúscula, 1 número, 1 especial).
- `rechaza_sin_mayus()`→ abc!123 falla por no tener mayúscula.
- `rechaza_sin_minus()` → ABC!123 falla por no tener minúscula.
- `rechaza_sin_num()`→ Abc!Abc falla por no tener dígito.
- `rechaza_sin_esp()` → Abc1234 falla por no tener carácter especial.
- `rechaza_corta()` → Aa!1 falla por tener menos de 6 caracteres.

2) AuthServiceTest (unit con mocks)

Objetivo: asegurar la lógica de signup/login sin tocar la base de datos (se mockea `ClienteRepository`).

3) EventoServiceTest (unit con mocks)

Objetivo: verificar que el servicio de eventos mapea Entidad → DTO correctamente.

4) ApiIntegrationTest (integración end-to-end)

Objetivo: levantar Spring de verdad (puerto aleatorio), ejecutar signup → login → listar eventos usando TestRestTemplate.