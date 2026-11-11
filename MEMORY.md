# MEMORY.md — Contexto Activo del Proyecto

## Estado Actual
- Estructura monorepo inicializada: `/backend` y `/frontend`.
- Frontend configurado con Vite, React y Tailwind CSS v3 verificado.
- Archivos `.gitignore` y `.env.example` creados en la raíz.
- Backend (Spring Boot 3 + Java 21) implementado con Entidades, Repositorios, DTOs, Servicios, Excepciones, Inicializador de Semilla, Controladores REST (`/api/v1/equipos`, `/health`) y CORS global.
- Compilación verificada con `mvnw compile` y `mvnw test-compile`.
- Frontend implementado (`src/api`, `src/components`, `src/utils`, `App.jsx`): dashboard con métricas, tabla de flota y modales de alta, horómetro, mantenimiento e historial. `eslint` y `vite build` sin errores.

## Contrato API (frontend ↔ backend)
- `GET /health`
- `GET|POST /api/v1/equipos`, `DELETE /api/v1/equipos/{id}` (borra también su historial)
- `PUT /api/v1/equipos/{id}/horometro`
- `POST /api/v1/equipos/{id}/mantenimiento`
- `GET /api/v1/equipos/{id}/historial`
- Frontend usa `VITE_API_URL` (fallback `http://localhost:8080`).

## Modelo de Datos Aprobado
1. `tipos_equipo`:
   - `id_tipo` (PK, Serial)
   - `nombre` (CAMION [500h], EXCAVADORA [250h], PERFORADORA [400h])
   - `intervalo_horas_mantenimiento` (Numeric 10,2)
   - `descripcion` (Varchar)
2. `equipos`:
   - `id_equipo` (PK, BigSerial)
   - `codigo` (Varchar, Unique, ej. CAM-01)
   - `tipo_id` (FK -> tipos_equipo)
   - `horometro` (Numeric 10,2)
   - `horas_ultimo_mantenimiento` (Numeric 10,2)
   - `fecha_creacion`, `fecha_actualizacion` (Timestamp)
3. `historial_mantenimiento`:
   - `id_historial` (PK, BigSerial)
   - `id_equipo` (FK -> equipos)
   - `horometro_servicio` (Numeric 10,2)
   - `fecha_servicio` (Timestamp)
   - `nombre_tecnico` (Varchar)
   - `observaciones` (Text)

## Próximas Tareas
- [x] Generar entidades JPA, repositorios, DTOs y servicios en el backend.
- [x] Implementar `DataInitializer` (CommandLineRunner) para cargar los 3 tipos de equipo por defecto si la base está vacía.
- [x] Implementar endpoints REST: CRUD `/api/v1/equipos`, `/health`, y registro/historial de mantenimiento.
- [x] Probar compilación del backend con `mvnw clean compile`.
- [x] Construir la interfaz de usuario en React conectada a la API.
- [x] Prueba end-to-end con PostgreSQL local (backend + frontend levantados).
- [x] Configurar script `./deploy.sh` y variables de entorno en producción.
