# AGENTS.md — Reglas y Directrices de Desarrollo

## 1. Misión del Proyecto
Construir y desplegar el sistema "Registro de Equipos Mineros" (Spring Boot 3 + React + PostgreSQL) cumpliendo los requisitos de evaluación técnica: automatización con `./deploy.sh`, backend y frontend desacoplados y cero sobreingeniería.

## 2. Reglas Inquebrantables (Hard Constraints)
- **Cero Spring Security / Cero JWT:** No agregar dependencias de seguridad ni autenticación. Los endpoints deben ser públicos.
- **Health Check Limpio:** El endpoint `GET /health` debe responder `200 OK` con JSON `{"status": "UP"}` sin redirecciones ni filtros.
- **CORS Global:** Permitir peticiones cross-origin desde cualquier origen (`allowedOriginPatterns("*")`) con métodos GET, POST, PUT, DELETE y OPTIONS.
- **Variables de Entorno con Fallbacks:** Usar `${DB_URL:...}`, `${DB_USER:...}`, `${DB_PASSWORD:...}` y `${PORT:8080}` en `application.properties`. Prohibido hardcodear credenciales en código.
- **Tipos Numéricos:** Usar `BigDecimal` (no `double` ni `float`) para horómetros y cálculos de horas en Java y `NUMERIC(10, 2)` en PostgreSQL.

## 3. Lógica de Negocio Central
- **Cálculo Dinámico de Mantenimiento:**
  - `horasDesdeUltimo = horometro - horasUltimoMantenimiento`
  - `requiereMantenimiento = horasDesdeUltimo >= intervaloHorasMantenimiento`
  - **No** persistir un booleano estático en la tabla `equipos`; calcularlo siempre en el DTO `EquipoResponse`.
- **Transacción de Mantenimiento (`@Transactional`):**
  - Al registrar mantenimiento: insertar registro en `historial_mantenimiento` y actualizar en `equipos` el campo `horas_ultimo_mantenimiento = horometro`.

## 4. Convenciones de Código
- **Backend:** Java 21, Spring Boot 3, Spring Data JPA. Arquitectura en capas limpia (`controller`, `dto/request`, `dto/response`, `entity`, `exception`, `repository`, `service/impl`).
- **Manejo de Errores:** `@RestControllerAdvice` con respuestas JSON estructuradas (`status`, `message`, `timestamp`).
- **Frontend:** React 18+ con Vite, Tailwind CSS v3, Axios, Lucide Icons. Componentes funcionales y diseño sobrio tipo dashboard industrial.