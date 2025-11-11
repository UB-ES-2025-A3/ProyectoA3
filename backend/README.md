
# Backend · ProyectoA3  

Backend del sistema de gestión de eventos (Spring Boot 3 + Java 21).  
Incluye endpoints REST para autenticación, gestión de eventos y conexión con base de datos **PostgreSQL (Supabase)**.  
El entorno de **pre-producción** está desplegado automáticamente en **Render** mediante *GitHub Actions*.


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

## Comprobar que funcione

Recargar terminal y comprobar que esto funcione

- java -version
- mvn -v

# Correr el server de manera local (si no ir a readme del render)

Ejecutar en el directorio donde esta el `pom.xml` (dentro de backend)

En caso de Windows:
- Si no esta creado el archivo de credenciales:
  - Crear archivo .env llamado "credentials.env" en la siguiente ruta: "backend\src\main\resources\" y guardar las credenciales del servidor
- ejecutar el archivo run-backend.ps1 con el comando .\run-backend.ps1

Cualquier caso:
- Cargar las credenciales del archivo credenciales.env 
- mvn -U clean package (para actualizarlo)
- mvn spring-boot:run  (para correrlo)

En caso de MacOS:
- export $(grep -v '^#' src/main/resources/credentials.env | xargs)
- mvn -U clean package (para actualizarlo)



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

## Añadir evento

Ejemplo de añadir evento:
curl -X POST http://localhost:8080/api/events \
-H "Content-Type: application/json" \
-d '{
  "fecha": "2025-11-05",
  "hora": "18:00:00",
  "lugar": "Madrid",
  "restricciones": {
    "idiomas_permitidos": "es,en",
    "edad_minima": 18,
    "max_personas": 50
  },
  "titulo": "Evento desde curl",
  "descripcion": "Probando crear evento desde curl",
  "id_creador": 83
}'

es necesario que la id sea existente

se espera una respuesta parecida a:
{
  "id": 117,
  "fecha": "2025-11-05",
  "hora": "18:00:00",
  "lugar": "Madrid",
  "restricciones": {
    "idiomas_permitidos": "es,en",
    "edad_minima": 18,
    "max_personas": 50
  },
  "titulo": "Evento desde curl",
  "descripcion": "Probando crear evento desde curl",
  "participantesIds": [83]
}


# Como esta estructurado el backend

```
backend/
├── src/main/java/com/eventmanager/
│ ├── config/ ← seguridad, CORS, codificación de contraseñas
│ ├── domain/ ← entidades JPA
│ ├── dto/ ← DTOs (requests/responses)
│ ├── repository/ ← repositorios JPA
│ ├── service/ ← lógica de negocio
│ └── web/ ← controladores REST
├── src/main/resources/
│ ├── credentials.env ← supabase
│ └── application.yml 
└── pom.xml
```

`ViajesApplication.java`

Clase raíz para que Spring lea todo (no hace falta tocar)

`config/`

Qué es:
- Clases de configuración de Spring: seguridad, CORS, codificación de contraseñas, etc.

Cuándo tocarlo:
Solo si necesitas cambiar:

- Reglas de CORS (orígenes permitidos).
- Políticas de seguridad / contraseñas.
- Nuevos beans globales (por ejemplo un PasswordEncoder o CorsConfiguration).


`domain/`

Qué es:
- Las entidades JPA que representan las tablas de la base de datos (@Entity).

Cuándo tocarlo:
Cuando cambias el modelo de datos:

- Añades un campo a una tabla → agrégalo aquí.
- Creas una nueva tabla → crea una nueva clase @Entity.
- Cambias tipos o nombres →  actualizar también migraciones?

`dto/` (Data Transfer Objects)

Qué es:
- Clases que definen el formato de datos que viaja por la API (lo que el frontend envía y recibe).

Cuándo tocarlo:

- Si cambias el formato del JSON que se envía o se recibe. 
- Para no exponer directamente las entidades (domain).

`repository/` (Spring Data JPA)

Qué es:
- Interfaces que hablan con la base de datos. Extienden JpaRepository y Spring genera las queries automáticamente.

Cuándo tocarlo:

- Si necesitas nuevas consultas (findByEmail, findByFecha, etc.).
- Si agregas nuevas entidades.

`service/` (lógica de negocio)

Qué es:
- Lógica de negocio pura: validaciones, reglas, conversiones DTO ↔ Entidad, etc.

Cuándo tocarlo:
- Si cambias cómo funcionan las operaciones (por ejemplo, lógica de login, registro o validaciones de eventos).
- Si agregas nuevos casos de uso o reglas de negocio.


`web/` (controladores)

- Endpoints REST con @RestController.
- Si cambias DTOs/servicios, ajusta firmas y rutas.
- Añade endpoints para nuevas entidades (GET/POST/PUT/DELETE)


`src/main/resources/`

Qué es:
Archivos de configuración y datos iniciales.

- application.yml → configuración general (puertos, conexión BBDD, CORS, etc.).
- credentials.env → variables locales de Supabase (no se sube al repo).

Cuándo tocarlo:

- application.yml → si cambias la base de datos, puerto o CORS.
- credentials.env → solo para tus credenciales locales.

`src/test/*`


Tests unitarios e integración

# Guia para añadir o quitar atributos en clases ya definidas

Ejemplo para añadir telefono a usuario

`Cliente.java`

private String telefono;
public String getTelefono(){ return telefono; }
public void setTelefono(String t){ this.telefono = t; }

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



# Lanzar tests unitarios

Poner el test que quieras probar

```
mvn -q test

mvn -Dtest=SupabaseSchemaMismatchIT test
mvn -Dtest=EventoServiceIntegrationTest test
```