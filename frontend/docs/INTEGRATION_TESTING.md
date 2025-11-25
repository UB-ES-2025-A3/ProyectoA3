# Tests de Integración - Frontend

## Qué son los Tests de Integración

Los tests de integración verifican que múltiples componentes y servicios trabajen juntos correctamente, simulando flujos reales de usuario. A diferencia de los tests unitarios, estos tests mockean solo las llamadas HTTP (axios/fetch) y permiten que los componentes y servicios interactúen entre sí, verificando que el flujo completo funcione correctamente.

**Características:**
- Mockean solo las llamadas HTTP (axios/fetch), no los servicios
- Testean flujos completos: usuario → componente → servicio → UI
- Son más lentos que los tests unitarios
- Verifican interacciones entre partes del sistema

## Diferencia con Tests Unitarios

| Aspecto | Tests Unitarios | Tests de Integración |
|---------|----------------|---------------------|
| **Mockean** | Servicios completos | Solo llamadas HTTP (axios/fetch) |
| **Testean** | Componentes/servicios aislados | Flujos completos usuario → componente → servicio → UI |
| **Velocidad** | Muy rápidos | Más lentos |
| **Cobertura** | Lógica específica | Interacciones entre partes |

## Cómo Ejecutar Tests de Integración

### Ejecutar todos los tests de integración

```bash
# Ejecutar solo tests de integración
npm test -- --testPathPattern=integration

# Una sola ejecución (sin watch)
npm test -- --testPathPattern=integration --watchAll=false
```

### Ejecutar un archivo específico

```bash
# Ejecutar solo tests de autenticación
npm test -- auth.integration.test.js

# Ejecutar solo tests de eventos
npm test -- events.integration.test.js
```

### Ejecutar un test específico

```bash
# Ejecutar un test por nombre
npm test -- --testPathPattern=integration -t "debe completar el flujo de login"
```

## Estructura

```
frontend/src/
└── __tests__/integration/
    ├── auth.integration.test.js      (Flujos de autenticación)
    └── events.integration.test.js     (Flujos de eventos)
```

## Tests de Autenticación

### auth.integration.test.js

**Ubicación:** `src/__tests__/integration/auth.integration.test.js`

**Qué testea:** Flujos completos de autenticación donde componentes y servicios trabajan juntos, verificando que el flujo desde el formulario hasta el guardado del token funcione correctamente.

**Tests incluidos:**

1. **debe completar el flujo de login: formulario → servicio → guardar token → redirección**
   - Usuario llena formulario → LoginForm llama a authService.login()
   - authService hace petición HTTP → Backend responde con token
   - Token se guarda en localStorage (tanto authService como LoginPage lo guardan)
   - Se muestra mensaje de éxito
   - Verifica que la petición HTTP se hizo con los datos correctos

2. **debe manejar errores del backend en el flujo de login**
   - Backend retorna error → authService maneja el error
   - LoginPage muestra el mensaje de error
   - NO se guarda token en localStorage

3. **debe completar el flujo de registro: formulario → servicio → mensaje → redirección**
   - Usuario llena formulario → RegisterForm llama a authService.signUp()
   - authService hace petición HTTP → Backend responde con token
   - Token se guarda en localStorage
   - Se muestra mensaje de éxito con nombre de usuario
   - Verifica que la petición HTTP se hizo con los datos correctos

**Total:** 3 tests

**Comprobaciones principales:**
- Componentes y servicios trabajan juntos (sin mockear servicios)
- Peticiones HTTP se hacen con datos correctos
- Respuestas del backend se procesan correctamente
- Tokens se guardan en localStorage
- Mensajes de éxito/error se muestran correctamente

---

## Tests de Eventos

### events.integration.test.js

**Ubicación:** `src/__tests__/integration/events.integration.test.js`

**Qué testea:** Flujos completos relacionados con eventos donde componentes y servicios trabajan juntos, verificando que el flujo desde la carga de eventos hasta su visualización funcione correctamente.

**Tests incluidos:**

1. **debe cargar y mostrar eventos desde el backend**
   - EventPage se monta → llama a eventService.getEvents()
   - eventService hace petición HTTP GET a /events
   - Backend responde con lista de eventos
   - Los eventos se transforman (titulo → name, lugar → location, etc.)
   - Los eventos se muestran en EventCard componentes
   - Verifica que se llama al backend correctamente
   - Verifica que los eventos se renderizan en la página

2. **debe manejar errores al cargar eventos**
   - Backend retorna error → eventService lanza excepción
   - EventPage muestra mensaje de error en el banner
   - Verifica que se muestra el mensaje de error correctamente

**Total:** 2 tests

**Comprobaciones principales:**
- Componentes y servicios trabajan juntos (sin mockear servicios)
- Peticiones HTTP GET se hacen correctamente
- Datos del backend se transforman al formato del frontend
- Eventos se renderizan en la UI
- Errores se manejan y muestran correctamente

---

## Configuración

### Mock de HTTP

Los tests de integración NO mockean los servicios, solo las llamadas HTTP:

```javascript
// Mock solo de axios/fetch, NO de los servicios
jest.mock('axios');
// O
global.fetch = jest.fn();
```

### Router para Tests

Usar `MemoryRouter` o `HashRouter` para testear navegación:

```javascript
import { MemoryRouter } from 'react-router-dom';

render(
  <MemoryRouter>
    <App />
  </MemoryRouter>
);
```

### Configuración de window.APP_CONFIG

Los tests configuran `window.APP_CONFIG` para simular variables de entorno:

```javascript
window.APP_CONFIG = {
  REACT_APP_API_URL: 'http://localhost:8080/api',
  REACT_APP_USE_MOCKS: false
};
```

---

## Resumen

**Total de tests de integración:** 5 tests

- **Autenticación:** 3 tests (login exitoso, login con error, registro exitoso)
- **Eventos:** 2 tests (cargar eventos, error al cargar eventos)

---

## Notas

- Los tests de integración son más lentos que los unitarios porque testean flujos completos
- Se mockean solo las llamadas HTTP para aislar el frontend del backend
- Los componentes y servicios se ejecutan de forma real, verificando que trabajen juntos correctamente
- Los tests de integración son complementarios a los unitarios: los unitarios testean lógica aislada, los de integración testean interacciones
