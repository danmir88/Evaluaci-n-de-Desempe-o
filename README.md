# Objetivos Ejecutivos FRIGOR

Herramienta web para construir, evaluar trimestralmente y calibrar los objetivos de los ejecutivos de FRIGOR. Es el componente 1 (objetivos) del sistema de evaluación de desempeño.

- Propuesta metodológica: [`docs/propuesta-sistema-objetivos.md`](docs/propuesta-sistema-objetivos.md)
- Objetivos 2026 convertidos al nuevo modelo (para cerrar T3 y T4): [`data/objetivos_2026_transicion.json`](data/objetivos_2026_transicion.json)

## Estructura

| Ruta | Qué es |
|---|---|
| `app/objetivos-frigor.html` | La aplicación nueva (HTML + JS sin dependencias) |
| `legacy/constructor-objetivos-2026.html` | El Constructor SMART 2026 original, sin cambios |
| `legacy/storage-compartido.js` | Capa que hace que el Constructor original guarde en el servidor |
| `server.js` | Servidor Node: sirve la app y una API JSON; guarda en Postgres o en archivo |
| `data/` | Datos iniciales para importar |
| `docs/` | Propuesta del modelo |

La página detecta dónde corre:
1. **Servidor propio (Railway):** datos compartidos en el servidor, refresco cada 20 s.
2. **Artefacto de claude.ai:** usa la base compartida del artefacto.
3. **Archivo abierto en el navegador:** guarda solo en ese navegador.

## Constructor original (`/constructor`)

El Constructor de Objetivos SMART 2026 original sigue disponible en `https://<tu-dominio>/constructor`, con la misma clave. Funciona igual que antes. La única diferencia es que todos los gerentes trabajan sobre la misma información guardada en el servidor, y ya no hace falta enviar archivos JSON para consolidar.

- Si dos personas guardan al mismo tiempo, se combinan los cambios: lo que cada una agregó, editó o borró se aplica sobre lo último que hay en el servidor.
- Cada 30 segundos la pantalla trae los cambios de los demás, salvo mientras el asistente está abierto o estás escribiendo.
- El nombre del usuario y el desbloqueo de GTH siguen guardados en cada navegador.
- La primera vez que alguien lo abre, carga los 16 objetivos por defecto. Para traer lo que ya tienes en la versión de claude.ai: ahí, en *💾 Datos*, descarga el estado completo (.json) y, en `/constructor`, súbelo con *Consolidar archivo*.
- Para pasarte a la herramienta nueva: en `/` → *Datos* → **Traer datos del Constructor compartido**.

## Despliegue en Railway

1. En Railway: **New Project → Deploy from GitHub repo** y elige este repositorio.
2. Agrega una base: **+ New → Database → PostgreSQL**. En el servicio de la app, en *Variables*, agrega una referencia `DATABASE_URL = ${{Postgres.DATABASE_URL}}`.
3. En *Variables* agrega `APP_PASSWORD` con una clave para el equipo. El navegador la pide al entrar (cualquier usuario + esa clave).
4. En *Settings → Networking* genera un dominio público.
5. Entra a la URL, ve a **Datos → Importar** y carga `data/objetivos_2026_transicion.json`.

Railway detecta Node, ejecuta `npm install` y `npm start`. `railway.json` configura el health check en `/api/health`.

**Sin Postgres:** si no defines `DATABASE_URL`, los datos se guardan en `storage/datos.json`. En Railway debes montar un **Volume** y apuntar `DATA_DIR` a su ruta (por ejemplo `/data`); sin volumen los datos se pierden en cada despliegue.

### Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | Recomendada | Conexión a Postgres. Crea las tablas al iniciar |
| `APP_PASSWORD` | Recomendada | Clave de acceso (HTTP Basic). Sin ella la app queda abierta |
| `DATA_DIR` | Solo sin Postgres | Carpeta del archivo de datos (montar un volumen) |
| `PORT` | No | Railway la define automáticamente |

## Desarrollo local

```bash
npm install
APP_PASSWORD=prueba npm start   # http://localhost:3000
```

## API

| Método | Ruta | Uso |
|---|---|---|
| GET | `/api/health` | Health check (sin clave) |
| GET | `/api/state` | Todo el estado: objetivos, evaluaciones, cierres, configuración y últimos 500 movimientos |
| PUT / DELETE | `/api/{objetivos\|evaluaciones\|cierres}/{id}` | Guardar o borrar un documento |
| PUT | `/api/config/gerencias` | Lista de gerencias |
| GET / PUT | `/api/kv/{objectives-v3\|registros-v2\|gerencias-v1\|audit-log-v1}` | Datos del Constructor original |
| POST | `/api/bitacora` | Registrar un movimiento |
