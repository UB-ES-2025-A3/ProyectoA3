# Tests Unitarios - Frontend

## Qué son los Tests Unitarios

Los tests unitarios verifican unidades de código aisladas (servicios, funciones, componentes) sin dependencias externas reales. Cada test se enfoca en una funcionalidad específica y mockea todas las dependencias externas (llamadas HTTP, localStorage, etc.) para garantizar que el código funciona correctamente de forma aislada.

**Características:**
- Mockean todas las dependencias externas (HTTP, localStorage, etc.)
- Ejecutan rápido
- Son deterministas (mismo input = mismo output)
- No requieren backend ni servicios externos

## Cómo Ejecutar Tests Unitarios

### Ejecutar todos los tests unitarios

```bash
# Modo watch (se reejecutan al cambiar archivos)
npm test

# Una sola ejecución (sin watch)
npm test -- --watchAll=false

# Con cobertura de código
npm run test:coverage

# Modo CI (Windows)
npm run test:ci
```

### Ejecutar un archivo específico

```bash
# Ejecutar solo tests de un servicio
npm test -- authService.test.js

# Ejecutar solo tests de un componente
npm test -- LoginForm.test.js
```

### Ejecutar un test específico

```bash
# Ejecutar un test por nombre (usando -t o --testNamePattern)
npm test -- -t "debe registrar un usuario exitosamente"
```

## Tests de Servicios

### authService.test.js

**Ubicación:** `src/services/__tests__/authService.test.js`

**Qué testea:** Lógica del servicio de autenticación que maneja registro, login y logout de usuarios.

**Funciones testeadas:**
- `signUp()` - Registro de nuevos usuarios
- `login()` - Inicio de sesión de usuarios existentes
- `logout()` - Cerrar sesión y limpiar credenciales

**Tests incluidos:**

1. **signUp - debe registrar un usuario exitosamente y guardar token en localStorage**
   - Verifica que el registro exitoso guarda token y userId en localStorage

2. **signUp - debe manejar errores de registro correctamente**
   - Verifica que los errores del servidor se manejan correctamente

3. **signUp - debe usar mensaje de error por defecto si no hay mensaje específico**
   - Verifica que se usa un mensaje de error genérico cuando el servidor no proporciona uno

4. **signUp - debe guardar userId solo si está presente en la respuesta**
   - Verifica que userId solo se guarda si viene en la respuesta del servidor

5. **login - debe hacer login exitosamente y guardar token en localStorage**
   - Verifica que el login exitoso guarda token y userId en localStorage

6. **login - debe manejar error con mensaje del servidor**
   - Verifica que los errores con mensaje del servidor se manejan correctamente

7. **login - debe manejar error con campo "error" del servidor**
   - Verifica que los errores con campo "error" se manejan correctamente

8. **login - debe manejar error 404 con mensaje específico**
   - Verifica que los errores 404 se manejan con mensaje específico

9. **login - debe manejar error 500 con mensaje específico**
   - Verifica que los errores 500 se manejan con mensaje específico

10. **login - debe manejar Network Error con mensaje específico**
    - Verifica que los errores de red se manejan correctamente

11. **login - debe usar mensaje de error por defecto si no hay información específica**
    - Verifica que se usa un mensaje de error genérico cuando no hay información específica

12. **logout - debe eliminar token y userId del localStorage**
    - Verifica que logout limpia las credenciales del localStorage

**Total:** 12 tests

---

### eventService.test.js

**Ubicación:** `src/services/__tests__/eventService.test.js`

**Qué testea:** Lógica del servicio de eventos que maneja obtención, creación, unión y salida de eventos.

**Funciones testeadas:**
- `getEvents()` - Obtener lista de eventos compatibles
- `createEvent()` - Crear nuevo evento
- `joinEvent()` - Unirse a un evento
- `leaveEvent()` - Salir de un evento
- `getUserEvents()` - Obtener eventos del usuario
- `getMyCreatedEvents()` - Obtener eventos creados por el usuario

**Tests incluidos:**

1. **getEvents - debe obtener eventos cuando no hay usuario logueado**
   - Verifica que se obtienen eventos sin autenticación

2. **getEvents - debe transformar correctamente los datos del backend al formato del frontend**
   - Verifica la transformación de campos (titulo → name, lugar → location, etc.)

3. **getEvents - debe manejar datos faltantes con valores por defecto**
   - Verifica que se usan valores por defecto cuando faltan datos

4. **getEvents - debe calcular isEnrolled correctamente cuando el usuario está inscrito**
   - Verifica que isEnrolled se calcula correctamente

5. **getEvents - debe normalizar tags correctamente**
   - Verifica que los tags se normalizan (eliminar espacios, filtrar vacíos)

6. **getEvents - debe normalizar idiomas correctamente**
   - Verifica que los idiomas se normalizan (array, string separado por comas, etc.)

7. **getEvents - debe ordenar eventos por fecha de inicio**
   - Verifica que los eventos se ordenan por fecha

8. **getEvents - debe obtener eventos compatibles cuando hay usuario logueado**
   - Verifica que se obtienen eventos compatibles con usuario autenticado

9. **getEvents - debe manejar errores al obtener eventos**
   - Verifica que los errores se manejan correctamente

10. **createEvent - debe crear un evento exitosamente**
    - Verifica que se crea un evento con datos correctos

11. **createEvent - crea evento sin edad mínima (null)**
    - Verifica que se puede crear evento sin edad mínima

12. **createEvent - crea evento con edad mínima de 0 años**
    - Verifica que se puede crear evento con edad mínima 0

13. **createEvent - crea evento con edad mínima de 18 años**
    - Verifica que se puede crear evento con edad mínima 18

14. **createEvent - crea evento con edad mínima de 65 años**
    - Verifica que se puede crear evento con edad mínima 65

15. **createEvent - incluye el idCreador en la petición**
    - Verifica que idCreador se incluye en la petición

16. **createEvent - envía todos los campos correctamente estructurados**
    - Verifica que todos los campos se envían correctamente

17. **createEvent - convierte edad mínima string a número**
    - Verifica que edad mínima se convierte de string a número

18. **createEvent - debe lanzar error si el usuario no está autenticado**
    - Verifica que se valida autenticación antes de crear evento

19. **createEvent - maneja error del servidor correctamente**
    - Verifica que los errores del servidor se manejan correctamente

20. **createEvent - debe manejar errores del servidor al crear evento**
    - Verifica manejo de errores adicionales

21. **joinEvent - debe unirse a un evento exitosamente**
    - Verifica que se une a un evento correctamente

22. **joinEvent - debe lanzar error si el usuario no está autenticado**
    - Verifica que se valida autenticación antes de unirse

23. **joinEvent - debe manejar error cuando ya está apuntado al evento**
    - Verifica que se detecta cuando el usuario ya está apuntado

24. **joinEvent - debe manejar otros errores del servidor**
    - Verifica manejo de otros errores del servidor

25. **leaveEvent - debe salir de un evento exitosamente**
    - Verifica que se sale de un evento correctamente

26. **leaveEvent - debe lanzar error si el usuario no está autenticado**
    - Verifica que se valida autenticación antes de salir

27. **leaveEvent - debe manejar errores del servidor**
    - Verifica que los errores del servidor se manejan correctamente

28. **getUserEvents - debe obtener eventos del usuario exitosamente**
    - Verifica que se obtienen eventos del usuario

29. **getUserEvents - debe manejar errores al obtener eventos del usuario**
    - Verifica manejo de errores al obtener eventos del usuario

30. **getMyCreatedEvents - debe obtener eventos creados por el usuario exitosamente**
    - Verifica que se obtienen eventos creados por el usuario

31. **getMyCreatedEvents - debe manejar errores al obtener eventos creados**
    - Verifica manejo de errores al obtener eventos creados

**Total:** 31 tests

---

### userService.test.js

**Ubicación:** `src/services/__tests__/userService.test.js`

**Qué testea:** Lógica del servicio de usuario que maneja perfiles y estadísticas de usuarios.

**Funciones testeadas:**
- `getUserProfile()` - Obtener perfil del usuario
- `updateUserProfile()` - Actualizar perfil del usuario
- `getUserStats()` - Obtener estadísticas del usuario

**Tests incluidos:**

1. **getUserProfile - debe obtener el perfil del usuario exitosamente**
   - Verifica que se obtiene el perfil del usuario con token de autenticación

2. **getUserProfile - debe manejar errores al obtener el perfil**
   - Verifica que los errores se manejan correctamente

3. **getUserProfile - debe usar mensaje de error por defecto si no hay mensaje específico**
   - Verifica que se usa un mensaje de error genérico cuando no hay mensaje específico

4. **getUserProfile - debe funcionar sin token de autenticación**
   - Verifica que se puede obtener perfil sin token

5. **updateUserProfile - debe actualizar el perfil del usuario exitosamente**
   - Verifica que se actualiza el perfil con datos correctos

6. **updateUserProfile - debe manejar respuesta con data anidada**
   - Verifica que se maneja respuesta con data anidada

7. **updateUserProfile - debe manejar errores al actualizar el perfil**
   - Verifica que los errores se manejan correctamente

8. **updateUserProfile - debe usar mensaje de error por defecto si no hay mensaje específico**
   - Verifica que se usa un mensaje de error genérico cuando no hay mensaje específico

9. **getUserStats - debe obtener estadísticas del usuario exitosamente**
   - Verifica que se obtienen estadísticas del usuario

10. **getUserStats - debe manejar errores al obtener estadísticas**
    - Verifica que los errores se manejan correctamente

**Total:** 10 tests

---

## Tests de Componentes

### LoginForm.test.js

**Ubicación:** `src/components/users/__tests__/LoginForm.test.js`

**Qué testea:** Componente React del formulario de inicio de sesión, incluyendo renderizado, validación, interacción del usuario y llamadas al servicio.

**Tests incluidos:**

1. **debe renderizar el formulario con todos los campos**
   - Verifica que se renderizan todos los campos del formulario

2. **debe mostrar el enlace de registro**
   - Verifica que se muestra el enlace de registro

3. **debe mostrar error cuando el campo usuario está vacío**
   - Verifica validación de campo usuario vacío

4. **debe mostrar error cuando el campo contraseña está vacío**
   - Verifica validación de campo contraseña vacío

5. **debe limpiar errores cuando el usuario empieza a escribir**
   - Verifica que los errores se limpian al escribir

6. **debe llamar a authService.login con los datos correctos**
   - Verifica que se llama al servicio con los datos correctos

7. **debe llamar a onSuccess cuando el login es exitoso**
   - Verifica que se llama el callback onSuccess en caso de éxito

8. **debe mostrar error cuando el login falla**
   - Verifica que se muestra error cuando el login falla

9. **debe mostrar mensaje de error cuando hay una excepción**
   - Verifica que se muestra mensaje de error en caso de excepción

10. **debe deshabilitar el botón y mostrar "Iniciando sesión..." durante el proceso**
    - Verifica estados de carga (botón deshabilitado, texto de carga)

11. **debe actualizar el valor del input cuando el usuario escribe**
    - Verifica que los inputs se actualizan correctamente

12. **debe deshabilitar inputs durante el proceso de login**
    - Verifica que los inputs se deshabilitan durante el proceso

**Total:** 12 tests

---

### RegisterForm.test.js

**Ubicación:** `src/components/users/__tests__/RegisterForm.test.js`

**Qué testea:** Componente React del formulario de registro de usuarios, incluyendo renderizado, validación de campos, requisitos de contraseña y llamadas al servicio.

**Tests incluidos:**

1. **debe renderizar el formulario con todos los campos requeridos**
   - Verifica que se renderizan todos los campos requeridos

2. **debe mostrar campos opcionales (ciudad e idioma)**
   - Verifica que se muestran campos opcionales

3. **debe mostrar el enlace de login**
   - Verifica que se muestra el enlace de login

4. **debe mostrar los requisitos de contraseña**
   - Verifica que se muestran los requisitos de contraseña

5. **debe mostrar error cuando el campo nombre está vacío**
   - Verifica validación de campo nombre vacío

6. **debe mostrar error cuando el campo correo no es válido**
   - Verifica validación de formato de correo electrónico

7. **debe validar requisitos de contraseña**
   - Verifica validación de requisitos de contraseña (mayúscula, minúscula, número, carácter especial)

8. **debe limpiar errores cuando el usuario empieza a escribir**
   - Verifica que los errores se limpian al escribir

9. **debe llamar a authService.signUp con los datos correctos**
   - Verifica que se llama al servicio con los datos correctos

10. **debe llamar a onSuccess cuando el registro es exitoso**
    - Verifica que se llama el callback onSuccess en caso de éxito

11. **debe llamar a onError cuando el registro falla**
    - Verifica que se llama el callback onError en caso de error

12. **debe mostrar estado de carga durante el registro**
    - Verifica estados de carga (botón deshabilitado, texto de carga)

**Total:** 12 tests

---

### EventCard.test.js

**Ubicación:** `src/components/events/__tests__/EventCard.test.js`

**Qué testea:** Componente React que muestra la información de un evento, incluyendo renderizado, interacciones del usuario y estados del evento.

**Tests incluidos:**

1. **debe renderizar la información básica del evento**
   - Verifica que se renderiza información básica (nombre, ubicación, fecha, capacidad)

2. **debe mostrar la imagen del evento**
   - Verifica que se muestra la imagen del evento

3. **debe mostrar plazas disponibles cuando no está completo**
   - Verifica que se muestran plazas disponibles cuando hay espacio

4. **debe mostrar estado "Completo" cuando isFull es true**
   - Verifica que se muestra estado "Completo" cuando el evento está lleno

5. **debe llamar onClick cuando se hace click en la tarjeta**
   - Verifica que se llama el callback onClick al hacer click en la tarjeta

6. **debe mostrar botón "Apuntarse" cuando no está inscrito**
   - Verifica que se muestra botón "Apuntarse" cuando el usuario no está inscrito

7. **debe llamar onJoin cuando se hace click en "Apuntarse"**
   - Verifica que se llama el callback onJoin al hacer click en "Apuntarse"

8. **debe mostrar mensaje y botón "Desapuntarse" cuando está inscrito**
   - Verifica que se muestra mensaje y botón "Desapuntarse" cuando el usuario está inscrito

9. **debe llamar onLeave cuando se hace click en "Desapuntarse"**
   - Verifica que se llama el callback onLeave al hacer click en "Desapuntarse"

10. **debe deshabilitar botón cuando isJoining es true**
    - Verifica que el botón se deshabilita durante la carga

11. **debe deshabilitar botón cuando el evento está completo**
    - Verifica que el botón se deshabilita cuando el evento está completo

12. **debe manejar evento sin fecha**
    - Verifica que se maneja correctamente cuando no hay fecha

13. **debe manejar evento sin participantes**
    - Verifica que se maneja correctamente cuando no hay participantes

**Total:** 13 tests

---

### CreateEventForm.test.js

**Ubicación:** `src/components/events/__tests__/CreateEventForm.test.js`

**Qué testea:** Componente React del formulario modal para crear eventos, incluyendo renderizado condicional, validación de campos y llamadas al servicio.

**Tests incluidos:**

1. **debe renderizar el formulario cuando isOpen es true**
   - Verifica que se renderiza el formulario cuando isOpen es true

2. **no debe renderizar cuando isOpen es false**
   - Verifica que no se renderiza el formulario cuando isOpen es false

3. **debe mostrar todos los campos del formulario**
   - Verifica que se muestran todos los campos del formulario

4. **debe mostrar error cuando el título está vacío**
   - Verifica validación de campo título vacío

5. **debe mostrar error cuando la fecha está vacía**
   - Verifica validación de campo fecha vacío

6. **debe mostrar error cuando la fecha es anterior a hoy**
   - Verifica validación de fecha anterior a hoy

7. **debe limpiar errores cuando el usuario empieza a escribir**
   - Verifica que los errores se limpian al escribir

8. **debe llamar a createEvent con los datos correctos**
   - Verifica que se llama al servicio con los datos correctos

9. **debe llamar a onSuccess cuando el evento se crea exitosamente**
   - Verifica que se llama el callback onSuccess en caso de éxito

10. **debe mostrar error cuando falla la creación del evento**
    - Verifica que se muestra error cuando falla la creación

11. **debe mostrar estado de carga durante la creación**
    - Verifica estados de carga (botón deshabilitado)

**Total:** 11 tests

---

## Configuración

### Mocks configurados

- **`src/__mocks__/axios.js`**: Mock manual de axios para evitar problemas con ES modules
- **`src/setupTests.js`**: Configuración global de mocks (localStorage, jest-dom)

### Notas importantes

- **Tests unitarios de servicios:** Mockean `axios`/`fetch` para no hacer peticiones reales
- **Tests unitarios de componentes:** Mockean los servicios para testear solo la UI
- Los warnings de `act()` son normales con user-event v13 y no afectan los tests

---

## Resumen

**Total de tests unitarios:** 102 tests

- **Servicios:** 53 tests (authService: 12, eventService: 31, userService: 10)
- **Componentes:** 49 tests (LoginForm: 12, RegisterForm: 12, EventCard: 13, CreateEventForm: 11)
