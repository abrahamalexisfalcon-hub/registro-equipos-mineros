# Monitoreo de Horómetros — Registro de Equipos Mineros

Sistema web full-stack para el registro operativo de maquinaria minera, control de ciclos de horómetro y alertas automáticas de mantenimiento preventivo.

[![Frontend en Producción](https://img.shields.io/badge/Demo-Vercel-blue?style=flat-square&logo=vercel)](https://registro-equipos-mineros-silk.vercel.app/)
[![Backend API](https://img.shields.io/badge/API-Render-46E3B7?style=flat-square&logo=render)](https://registro-equipos-mineros-backend.onrender.com/health)
[![Health Check](https://img.shields.io/badge/Health%20Check-UP-emerald?style=flat-square)](https://registro-equipos-mineros-backend.onrender.com/health)

- **Demo en Producción:** [https://registro-equipos-mineros-silk.vercel.app/](https://registro-equipos-mineros-silk.vercel.app/)
- **API Health Check:** [https://registro-equipos-mineros-backend.onrender.com/health](https://registro-equipos-mineros-backend.onrender.com/health)
- **Repositorio:** [https://github.com/abrahamalexisfalcon-hub/registro-equipos-mineros](https://github.com/abrahamalexisfalcon-hub/registro-equipos-mineros)

---

## Decisiones de Arquitectura y Stack

El sistema fue diseñado como un monorepo desacoplado (`frontend/` y `backend/`) priorizando robustez técnica, transaccionalidad sin sobreingeniería y una experiencia fluida tanto en sala de control como en faena.

### 1. Frontend: React 19 + Vite + Tailwind CSS
- **Bundle ultraligero y arranque instantáneo:** Vite garantiza compilación y recarga en caliente sin sobrecarga de dependencias.
- **Diseño adaptativo industrial:** Implementa un patrón dual con Tailwind CSS:
  - **Escritorio (`hidden md:block`):** Tabla densa y autoajustable al 100% de pantalla (1080p+) con visualización simultánea de horómetros, barras de progreso y acciones rápidas sin scroll horizontal.
  - **Móvil / Tablet (`block md:hidden`):** Tarjetas táctiles (`space-y-3.5`) optimizadas con `touch-manipulation` para supervisores o técnicos operando en campo.
- **Filtros reactivos en memoria:** Búsqueda por texto (código/tipo) y filtros por estado de alerta resueltos directamente en el cliente con `useMemo`, eliminando peticiones redundantes a la red.

### 2. Backend: Java 21 + Spring Boot 3 + Spring Data JPA
- **Arquitectura en capas limpia:** Separación estricta de responsabilidades (`Controller` ➔ `Service` ➔ `Repository` ➔ `Entity` / `DTO`).
- **Cero sobreingeniería de seguridad:** Al tratarse de un panel operativo interno sin requerimiento de autenticación, se evitó intencionalmente la fricción innecesaria de Spring Security o JWT tokens.
- **Tipos numéricos de precisión:** Uso estricto de `BigDecimal` en Java y `NUMERIC(10,2)` en base de datos para horómetros e intervalos, eliminando errores de redondeo de punto flotante.
- **Manejo global de excepciones:** `@RestControllerAdvice` estandarizado que retorna respuestas JSON predecibles (`timestamp`, `status`, `message`).

### 3. Base de Datos e Infraestructura
- **PostgreSQL Serverless (Neon.tech):** Conexión vía pooling (`sslmode=require`) que escala dinámicamente y aísla la capa de almacenamiento de la de cómputo.
- **Docker & Render:** Backend empaquetado en contenedor Docker multi-etapa (`eclipse-temurin:21-jdk-alpine` ➔ `eclipse-temurin:21-jre-alpine`) desplegado en Render.
- **Mitigación de Cold Starts:** Monitoreo activo cada 5 minutos mediante **UptimeRobot** apuntando al endpoint `/health` para mantener el contenedor tibio y responder de inmediato.
- **Vercel:** Despliegue estático del frontend conectado al CDN global.

---

## Flujo de Negocio Clave

```
[1. Registro de Equipo] ──► [2. Carga de Horómetros] ──► [3. Evaluación de Alerta y Servicio]
 - Código tag único          - Horómetro incremental       - Horas ciclo = Horómetro - Último Serv.
 - Tipo e intervalo (h)      - Validación anti-retroceso   - Si Horas ciclo >= Intervalo ➔ Alerta
                                                           - Servicio técnico reinicia ciclo a 0
```

1. **Registro de Maquinaria:** Se da de alta cada equipo con un código tag correlativo (ej. `CAM-01`, `EXC-02`), vinculándolo a un tipo de equipo que define su intervalo de mantenimiento (ej. Camión: 500 h, Excavadora: 250 h, Perforadora: 400 h).
2. **Actualización de Horómetros:** Los horómetros representan horas físicas acumuladas. El sistema valida estrictamente que el nuevo valor sea mayor o igual al actual, impidiendo retrocesos accidentales o fraudulentos (`HTTP 400`).
3. **Control de Alertas y Servicios:** 
   - Se calculan dinámicamente las horas del ciclo actual:
     $$\text{Horas Transcurridas} = \text{Horómetro Actual} - \text{Horas Último Mantenimiento}$$
   - Si $\text{Horas Transcurridas} \ge \text{Intervalo}$, el equipo se marca inmediatamente en **Alerta de Mantenimiento**.
   - El registro de un servicio técnico se ejecuta dentro de una transacción `@Transactional`: guarda la bitácora en `historial_mantenimiento` y actualiza `horas_ultimo_mantenimiento = horometro`, reiniciando el ciclo a 0.

---

## Desarrollo Asistido por Herramientas de IA

Este proyecto fue desarrollado bajo una filosofía de **ingeniería asistida por Inteligencia Artificial**, donde los modelos actuaron como aceleradores de productividad mientras que el criterio, diseño de arquitectura y control de calidad recayeron 100% en el desarrollador:

- **Herramientas utilizadas:** Modelos LLM avanzados (Claude 3.5 Sonnet / Opus, Gemini 2.5 / 3.8 Flash a través de Antigravity).
- **Alcance de la asistencia de IA:**
  - Generación de plantillas iniciales de código (boilerplate de DTOs, entidades JPA y mapeos).
  - Aceleración en la composición de clases utilitarias de Tailwind CSS para layouts complejos.
  - Asistencia en la redacción inicial de scripts de despliegue (`deploy.sh`) y Dockerfiles multi-etapa.
- **Rol y Control del Desarrollador (Dominio Técnico):**
  - **Diseño Relacional & Negocio:** Modelado de tablas, definición de llaves foráneas, índices y lógica de cálculo dinámico no persistido.
  - **Depuración de Entorno:** Solución de dialectos JDBC/Hibernate en Spring Boot, compatibilidad en Windows vs. Linux en Docker, y configuración robusta de carga de variables `.env` vía `spring.config.import`.
  - **Seguridad & Git Ops:** Auditoría y purga manual de credenciales en el historial Git, configuración estricta de `.gitignore` y aislamiento de secretos.
  - **Refactorización Frontend:** Transición de tablas con desbordamiento horizontal hacia un sistema dual adaptativo (tabla autoajustable + tarjetas móviles táctiles) y filtros reactivos sin peticiones espurias al backend.

---

## Puesta en Marcha Local

### Prerrequisitos
- **Java JDK 21**
- **Node.js 18+** y **npm**
- Instancia de **PostgreSQL** (local o base serverless en Neon)

### Variables de Entorno

Toma como referencia el archivo unificado [`.env.example`](.env.example):

| Variable | Descripción | Ejemplo Local |
| :--- | :--- | :--- |
| `DB_URL` | URL JDBC de conexión a PostgreSQL | `jdbc:postgresql://localhost:5432/equipos_mineros` |
| `DB_USER` | Usuario de la base de datos | `postgres` |
| `DB_PASSWORD` | Contraseña de la base de datos | `secret` |
| `PORT` | Puerto de escucha del backend | `8080` |
| `VITE_API_URL` | URL base del backend para Vite | `http://localhost:8080` |

### 1. Iniciar Backend (Spring Boot)

Configura `backend/.env` con tus credenciales y ejecuta:

```bash
cd backend
./mvnw spring-boot:run
```
El backend iniciará en `http://localhost:8080`. Puedes validar su estado en `http://localhost:8080/health`.

### 2. Iniciar Frontend (Vite + React)

Configura `frontend/.env.local` con `VITE_API_URL=http://localhost:8080`:

```bash
cd frontend
npm install
npm run dev
```
La aplicación quedará disponible en `http://localhost:5173`.

---

## Despliegue Automatizado

El monorepo cuenta con el script automatizado [`deploy.sh`](deploy.sh), el cual ejecuta auditorías de compilación, construcción de artefactos y disparadores de despliegue:

```bash
# Otorgar permisos y ejecutar
chmod +x deploy.sh
./deploy.sh
```

El script valida el build de producción de Vite (`npm run build`), verifica la compilación de Spring Boot (`mvn clean package`) y notifica a los webhooks de Render y Vercel según la configuración de `.env.deploy`.
