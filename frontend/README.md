# Event Manager Frontend

Frontend sencillo para el sistema de gestión de eventos, construido con React.

## Características

- **Formulario de Registro**: Interfaz moderna y responsiva para el registro de usuarios
- **Validación en Tiempo Real**: Validación de campos del lado del cliente
- **Diseño Responsivo**: Funciona perfectamente en dispositivos móviles y desktop
- **Integración con API**: Comunicación con el backend Spring Boot

## Tecnologías Utilizadas

- React 18
- React Router DOM
- Axios para peticiones HTTP
- CSS3 con diseño moderno

## Instalación y Configuración

### Prerrequisitos

- Node.js (versión 16 o superior)
- npm o yarn

### Instalación

1. Navega al directorio del frontend:
```bash
cd frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura la URL del backend (opcional):
   - Por defecto, el frontend se conecta a `http://localhost:8080/api`
   - Puedes cambiar esto creando un archivo `.env` con:
   ```
   REACT_APP_API_URL=http://localhost:8080/api
   ```

### Ejecución

Para ejecutar el frontend en modo desarrollo:

```bash
npm start
```

La aplicación se abrirá en `http://localhost:3000`

### Construcción para Producción

Para crear una versión optimizada para producción:

```bash
npm run build
```

Los archivos se generarán en la carpeta `build/`.

## Estructura del Proyecto

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── users/
│   │       ├── RegisterForm.js
│   │       └── RegisterForm.css
│   ├── pages/
│   │   └── RegisterPage.js
│   ├── services/
│   │   └── authService.js
│   ├── styles/
│   │   ├── index.css
│   │   └── App.css
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## API Endpoints

El frontend se comunica con los siguientes endpoints del backend:

- `POST /api/auth/signup` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión

## Campos del Formulario de Registro

- **Nombre** (requerido)
- **Apellidos** (requerido)
- **Nombre de Usuario** (requerido)
- **Correo Electrónico** (requerido, validación de formato)
- **Fecha de Nacimiento** (requerido)
- **Ciudad** (opcional)
- **Idioma** (opcional, selector)
- **Contraseña** (requerido, mínimo 6 caracteres)

## Características del Diseño

- **Gradiente de fondo** moderno
- **Formulario centrado** con sombras
- **Validación visual** con colores de error
- **Animaciones suaves** en interacciones
- **Mensajes de estado** para éxito y error
- **Diseño responsivo** para móviles

## Desarrollo

Para ejecutar en modo desarrollo con hot reload:

```bash
npm start
```

Para ejecutar las pruebas:

```bash
npm test
```

## Próximas Mejoras

- [ ] Página de login
- [ ] Dashboard de usuario
- [ ] Gestión de eventos
- [ ] Perfil de usuario
- [ ] Autenticación con JWT
- [ ] Manejo de estado global (Redux/Context)





