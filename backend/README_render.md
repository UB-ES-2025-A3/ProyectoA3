
---

## Deploy automático en Render

**Nuevo bloque añadido (no existía):**
```md
## Despliegue en pre-producción (Render)

Cada vez que haces *push* a la rama `pre_prod`:
- GitHub Actions ejecuta los tests y construye el JAR.
- Si todo pasa, lanza un **Deploy Hook** hacia **Render**.
- Render reconstruye la imagen y despliega el servicio.


Para ver el frontend : 
https://ub-es-2025-a3.github.io/ProyectoA3/


### Variables de entorno en Render
| KEY | VALUE | Comentario |
|-----|--------|------------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require` | URL de Supabase |
| `SPRING_DATASOURCE_USERNAME` | *(usuario Supabase)* |  |
| `SPRING_DATASOURCE_PASSWORD` | *(contraseña Supabase)* |  |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | `update` | crea tablas si no existen |
| `SERVER_ERROR_INCLUDE_MESSAGE` | `always` | muestra errores en JSON |
| `SERVER_ERROR_INCLUDE_STACKTRACE` | `on_param` | permite `?trace=true` para depurar |

### Endpoints públicos de pre-producción a probar (no estan todos)
- **Healthcheck:**  [`/ping`](https://proyectoa3.onrender.com/ping) → `pong`  
- **Eventos (ping interno):** [`/api/events/_ping`](https://proyectoa3.onrender.com/api/events/_ping) → `events-ok`  
- **Eventos (lista):** [`/api/events`](https://proyectoa3.onrender.com/api/events) → lista JSON (200 OK)


## Depuración de errores en Render

Para ver el detalle de un error 500 sin acceder al panel de Render:

1. Añade en Environment:

SERVER_ERROR_INCLUDE_MESSAGE=always
SERVER_ERROR_INCLUDE_STACKTRACE=on_param

2. Llama al endpoint con `?trace=true`, por ejemplo:

https://proyectoa3.onrender.com/api/events?trace=true


## Pruebas rápidas

**Ping**
```bash
curl https://proyectoa3.onrender.com/ping
# → pong
curl https://proyectoa3.onrender.com/api/events/_ping
# → events-ok
curl https://proyectoa3.onrender.com/api/events
# → [] (lista vacía o datos existentes)
