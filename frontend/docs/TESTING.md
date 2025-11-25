# Guía de Testing - Frontend

## 🚀 Ejecutar Tests

### Comandos básicos

```bash
# Ejecutar todos los tests (modo watch)
npm test

# Ejecutar todos los tests una vez (sin watch)
npm test -- --watchAll=false

# Ejecutar tests con cobertura
npm run test:coverage

# Ejecutar tests en modo CI (Windows)
npm run test:ci
```

### Ejecutar un archivo específico

```bash
npm test -- LoginForm.test.js
```

---

## 📋 Tipos de Tests

### 🧪 Tests Unitarios

**Objetivo:** Testear unidades de código aisladas (servicios, funciones, componentes) sin dependencias externas reales.

**Características:**
- Mockean todas las dependencias externas (HTTP, localStorage, etc.)
- Ejecutan rápido
- Son deterministas (mismo input = mismo output)
- No requieren backend ni servicios externos

---

## 🧪 Tests Unitarios - Servicios

### `authService.test.js` - Servicio de Autenticación

**Ubicación:** `src/services/__tests__/authService.test.js`

**Qué testea:** Lógica del servicio que maneja registro, login y logout.

**Funciones testeadas:**
- `signUp()` - Registro de usuarios
- `login()` - Inicio de sesión
- `logout()` - Cerrar sesión

**Comprobaciones principales:**
- ✅ Guarda token y userId en localStorage cuando hay éxito
- ✅ Maneja errores correctamente (404, 500, Network Error, etc.)
- ✅ No guarda datos en localStorage cuando hay errores
- ✅ Elimina credenciales del localStorage en logout
- ✅ Retorna formato correcto de respuesta (`success`, `data`, `error`)

**Total:** 12 tests

---

### `eventService.test.js` - Servicio de Eventos

**Ubicación:** `src/services/__tests__/eventService.test.js`

**Qué testea:** Lógica del servicio que maneja eventos (obtener, crear, unirse, salir).

**Funciones testeadas:**
- `getEvents()` - Obtener lista de eventos
- `createEvent()` - Crear nuevo evento
- `joinEvent()` - Unirse a un evento
- `leaveEvent()` - Salir de un evento
- `getUserEvents()` - Obtener eventos del usuario
- `getMyCreatedEvents()` - Obtener eventos creados por el usuario

**Comprobaciones principales:**
- ✅ Obtiene eventos correctamente (con y sin usuario logueado)
- ✅ **Transforma datos del backend al formato del frontend** (campos, tipos, estructura)
- ✅ Maneja datos faltantes con valores por defecto
- ✅ Calcula `isEnrolled` correctamente
- ✅ Normaliza tags, idiomas y participantes
- ✅ Ordena eventos por fecha
- ✅ Crea eventos con datos correctos y headers de autenticación
- ✅ Valida autenticación antes de crear/unirse/salir
- ✅ Maneja errores de red y del servidor (400, 409, 500)
- ✅ Detecta cuando el usuario ya está apuntado a un evento

**Total:** 23 tests (15 básicos + 8 de transformación)

---

### `userService.test.js` - Servicio de Usuario

**Ubicación:** `src/services/__tests__/userService.test.js`

**Qué testea:** Lógica del servicio que maneja perfiles y estadísticas de usuarios.

**Funciones testeadas:**
- `getUserProfile()` - Obtener perfil del usuario
- `updateUserProfile()` - Actualizar perfil del usuario
- `getUserStats()` - Obtener estadísticas del usuario

**Comprobaciones principales:**
- ✅ Obtiene perfil del usuario con token de autenticación
- ✅ Maneja errores al obtener perfil (404, 500, sin token)
- ✅ Actualiza perfil con datos correctos
- ✅ Maneja errores al actualizar perfil
- ✅ Obtiene estadísticas del usuario
- ✅ Retorna formato correcto de respuesta (`success`, `data`, `error`)
- ✅ Maneja casos sin token de autenticación

**Total:** 9 tests

---

## 🧪 Tests Unitarios - Componentes

### `LoginForm.test.js` - Formulario de Login

**Ubicación:** `src/components/users/__tests__/LoginForm.test.js`

**Qué testea:** Componente React del formulario de inicio de sesión.

**Comprobaciones principales:**
- ✅ Renderiza todos los campos correctamente
- ✅ Valida campos vacíos
- ✅ Limpia errores cuando el usuario escribe
- ✅ Llama a `authService.login()` con datos correctos
- ✅ Muestra estados de carga (botón deshabilitado, texto "Iniciando sesión...")
- ✅ Maneja errores y excepciones
- ✅ Llama callbacks `onSuccess` y `onError` correctamente

**Total:** 12 tests

---

#### `RegisterForm.test.js` - Formulario de Registro

**Ubicación:** `src/components/users/__tests__/RegisterForm.test.js`

**Qué testea:** Componente React del formulario de registro de usuarios.

**Comprobaciones principales:**
- ✅ Renderiza todos los campos requeridos y opcionales
- ✅ Muestra requisitos de contraseña en tiempo real
- ✅ Valida campos requeridos (nombre, apellidos, username, correo, fecha, contraseña)
- ✅ Valida formato de correo electrónico
- ✅ Valida requisitos de contraseña (mayúscula, minúscula, número, carácter especial)
- ✅ Limpia errores cuando el usuario escribe
- ✅ Llama a `authService.signUp()` con datos correctos
- ✅ Muestra estados de carga (botón deshabilitado, texto "Creando cuenta...")
- ✅ Maneja errores y excepciones
- ✅ Llama callbacks `onSuccess` y `onError` correctamente

**Total:** 12 tests

---

#### `EventCard.test.js` - Tarjeta de Evento

**Ubicación:** `src/components/events/__tests__/EventCard.test.js`

**Qué testea:** Componente React que muestra la información de un evento.

**Comprobaciones principales:**
- ✅ Renderiza información básica del evento (nombre, ubicación, fecha, capacidad)
- ✅ Muestra imagen del evento
- ✅ Muestra plazas disponibles o estado "Completo"
- ✅ Maneja clicks en la tarjeta (onClick)
- ✅ Muestra botón "Apuntarse" cuando no está inscrito
- ✅ Muestra mensaje y botón "Desapuntarse" cuando está inscrito
- ✅ Llama callbacks `onJoin` y `onLeave` correctamente
- ✅ Deshabilita botones durante carga (isJoining) o cuando está completo
- ✅ Maneja datos faltantes (sin fecha, sin participantes)

**Total:** 12 tests

---

#### `CreateEventForm.test.js` - Formulario de Crear Evento

**Ubicación:** `src/components/events/__tests__/CreateEventForm.test.js`

**Qué testea:** Componente React del formulario modal para crear eventos.

**Comprobaciones principales:**
- ✅ Renderiza cuando isOpen es true, no renderiza cuando es false
- ✅ Muestra todos los campos del formulario
- ✅ Valida campos requeridos (título, fecha, hora, lugar, idioma, plazas)
- ✅ Valida que la fecha no sea anterior a hoy
- ✅ Limpia errores cuando el usuario escribe
- ✅ Llama a `eventService.createEvent()` con datos correctos
- ✅ Muestra estados de carga (botón deshabilitado)
- ✅ Maneja errores al crear evento
- ✅ Llama callback `onSuccess` cuando el evento se crea exitosamente

**Total:** 10 tests

---

## 🔗 Tests de Integración

**Objetivo:** Testear la interacción entre múltiples componentes o servicios trabajando juntos.

**Estado:** Pendiente de implementación

**Ejemplos futuros:**
- Flujo completo de registro → login → crear evento
- Integración entre componentes y servicios
- Flujos de usuario completos

---

## 🔧 Configuración

### Mocks configurados

- **`src/__mocks__/axios.js`**: Mock manual de axios para evitar problemas con ES modules
- **`src/setupTests.js`**: Configuración global de mocks (localStorage, jest-dom)

### Notas importantes

- **Tests unitarios de servicios:** Mockean `axios`/`fetch` para no hacer peticiones reales
- **Tests unitarios de componentes:** Mockean los servicios para testear solo la UI
- Los warnings de `act()` son normales con user-event v13 y no afectan los tests

---

## 📊 Cobertura

Para ver la cobertura de código:

```bash
npm run test:coverage
```

Esto genera un reporte HTML en `coverage/lcov-report/index.html`.

---

## 📁 Estructura de Tests

```
frontend/
├── src/
│   ├── services/
│   │   ├── __tests__/
│   │   │   ├── authService.test.js      (12 tests unitarios)
│   │   │   ├── eventService.test.js     (21 tests unitarios)
│   │   │   └── userService.test.js      (9 tests unitarios)
│   │   ├── authService.js
│   │   ├── eventService.js
│   │   └── userService.js
│   └── components/
│       └── users/
│           └── __tests__/
│               ├── LoginForm.test.js      (12 tests unitarios)
│               └── RegisterForm.test.js    (12 tests unitarios)
│       └── events/
│           └── __tests__/
│               ├── EventCard.test.js       (12 tests unitarios)
│               └── CreateEventForm.test.js (10 tests unitarios)
└── docs/
    └── TESTING.md (este archivo)
```

**Total actual:** 90 tests unitarios

---

## 📝 Resumen por Responsabilidades

### Servicios (44 tests)
- **authService:** Autenticación y gestión de sesión (12 tests)
- **eventService:** Gestión de eventos y transformación de datos (23 tests)
- **userService:** Gestión de perfiles de usuario (9 tests)

### Componentes (46 tests)
- **LoginForm:** Formulario de inicio de sesión (12 tests)
- **RegisterForm:** Formulario de registro (12 tests)
- **EventCard:** Tarjeta de evento (12 tests)
- **CreateEventForm:** Formulario de crear evento (10 tests)
