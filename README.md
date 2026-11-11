# Registro de Equipos Mineros — Monitoreo de Horómetros y Mantenimiento

Sistema full-stack para el control de flota minera, seguimiento de horómetros acumulados, alertas preventivas por intervalo de operación y bitácora transaccional de servicios técnicos.

---

## 🌐 Enlaces de Producción

| Componente | Plataforma | URL Pública |
| :--- | :--- | :--- |
| **Repositorio GitHub** | GitHub | [https://github.com/abrahamalexisfalcon-hub/registro-equipos-mineros](https://github.com/abrahamalexisfalcon-hub/registro-equipos-mineros) |
| **Frontend (UI)** | Vercel | [https://registro-equipos-mineros-silk.vercel.app](https://registro-equipos-mineros-silk.vercel.app) |
| **Backend (API REST)** | Render | [https://registro-equipos-mineros-backend.onrender.com](https://registro-equipos-mineros-backend.onrender.com) |
| **Health Check** | Render | [https://registro-equipos-mineros-backend.onrender.com/health](https://registro-equipos-mineros-backend.onrender.com/health) |

---

## ⚙️ Funcionalidades y Reglas de Negocio

1. **Gestión de Maquinaria (CRUD):**
   - Alta, listado, actualización de horómetro y baja de equipos identificados por un código único (ej. `CAM-01`, `EXC-02`, `PERF-01`).
   - Catálogo de tipos de equipo pre-cargado automáticamente al iniciar (`DataInitializer`):
     - `CAMION`: intervalo de mantenimiento cada **500.00 h**.
     - `EXCAVADORA`: intervalo de mantenimiento cada **250.00 h**.
     - `PERFORADORA`: intervalo de mantenimiento cada **400.00 h**.
2. **Validación Estricta de Horómetro:**
   - El horómetro representa horas físicas acumuladas de uso (`NUMERIC(10,2)` / `BigDecimal`); el sistema impide registrar un valor inferior al horómetro actual del equipo (retorna `HTTP 400 Bad Request`).
3. **Cálculo Dinámico de Alerta de Mantenimiento:**
   - `horasDesdeUltimoMantenimiento = horometro - horasUltimoMantenimiento`
   - `requiereMantenimiento = horasDesdeUltimoMantenimiento >= intervaloHorasMantenimiento`
   - Cuando un equipo alcanza o supera el umbral de su tipo, se marca automáticamente en estado **"Requiere Mantenimiento"** con indicadores visuales en el dashboard.
4. **Registro Transaccional de Mantenimiento (`@Transactional`):**
   - Al registrar un servicio técnico (nombre del técnico y observaciones), se guarda el evento en `historial_mantenimiento` con el horómetro actual y se actualiza `horas_ultimo_mantenimiento = horometro`, reiniciando las horas del ciclo a `0.00 h`.

---

## 🏗️ Arquitectura y Stack Tecnológico

Estructura monorepo desacoplada (`/backend` y `/frontend`):

- **Backend (`/backend`):**
  - Java 21 + Spring Boot 3 (Spring Web MVC, Spring Data JPA, Jakarta Bean Validation).
  - Contenedor Docker multi-etapa (`eclipse-temurin:21-jdk-alpine` → `eclipse-temurin:21-jre-alpine`).
  - Manejo centralizado de errores con `@RestControllerAdvice` (`GlobalExceptionHandler`).
- **Frontend (`/frontend`):**
  - React 19 + Vite + Tailwind CSS v3 + Axios + Lucide Icons.
  - Dashboard industrial oscuro con tarjetas de métricas, barra de progreso de ciclo, polling de `/health` y modales reactivos.
- **Base de Datos:**
  - PostgreSQL gestionado en la nube (**Neon Serverless Postgres**).

---

## 🔌 Endpoints de la API REST

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/health` | Verifica la disponibilidad del servicio (`{"status": "UP"}`). |
| `GET` | `/api/v1/equipos` | Lista toda la flota con el cálculo dinámico de mantenimiento. |
| `GET` | `/api/v1/equipos/{id}` | Obtiene el detalle de un equipo por su ID. |
| `POST` | `/api/v1/equipos` | Registra un nuevo equipo (`codigo`, `tipoId`, `horometroInicial`). |
| `PUT` | `/api/v1/equipos/{id}/horometro` | Actualiza el horómetro validando que no sea menor al actual. |
| `POST` | `/api/v1/equipos/{id}/mantenimiento` | Registra un servicio técnico y reinicia las horas de ciclo a `0.00`. |
| `GET` | `/api/v1/equipos/{id}/historial` | Obtiene la bitácora histórica de mantenimientos de un equipo. |
| `DELETE` | `/api/v1/equipos/{id}` | Elimina el equipo junto con su historial asociado. |

---

## 🚀 Cómo Levantarlo en Local

### 1. Prerrequisitos
- **Java JDK 21** (o 17+)
- **Node.js v18+** y **npm**
- Instancia de **PostgreSQL** (local o cuenta en Neon.tech)

### 2. Configurar Variables de Entorno
Copia la plantilla `.env.example` a `.env` en la raíz del proyecto (o en `backend/.env`):

```bash
cp .env.example .env
```

Edita `.env` con las credenciales de tu base de datos PostgreSQL:

```env
DB_URL=jdbc:postgresql://<HOST>:<PORT>/<DATABASE>?sslmode=require
DB_USER=<USUARIO>
DB_PASSWORD=<CONTRASENA>
PORT=8080
```

> Spring Boot 3 carga automáticamente el archivo `.env` local mediante `spring.config.import=optional:file:.env[.properties],optional:file:../.env[.properties]`.

### 3. Ejecución con un solo comando (`./deploy.sh --run`)
Desde una terminal Bash / Git Bash:

```bash
chmod +x deploy.sh
./deploy.sh --run
```

Este comando valida las versiones de Java y Node, empaqueta el JAR del backend, construye el bundle del frontend, inicia el backend en segundo plano, verifica `http://localhost:8080/health` y levanta el servidor del frontend.

### 4. Ejecución manual en dos terminales (Desarrollo)
- **Terminal 1 (Backend):**
  ```bash
  cd backend
  ./mvnw spring-boot:run
  ```
- **Terminal 2 (Frontend):**
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

---

## 📦 Automatización y Despliegue (`./deploy.sh`)

El script [`./deploy.sh`](./deploy.sh) en la raíz del repositorio automatiza el flujo completo con control estricto de errores (`set -euo pipefail`, terminando con código de salida `!= 0` ante cualquier fallo):

```bash
# 1. Validar entorno y compilar artefactos de producción (Backend JAR + Frontend dist/)
./deploy.sh

# 2. Compilar, levantar servicios localmente y verificar /health
./deploy.sh --run

# 3. Ejecutar Smoke Test contra el endpoint /health (local o remoto según BACKEND_URL)
BACKEND_URL=https://registro-equipos-mineros-backend.onrender.com ./deploy.sh --smoke
```

### Despliegue Continuo en Nube (Render + Vercel)
- **Backend (Render):** Conectado a la rama `main` de GitHub utilizando `backend/Dockerfile` (multi-stage build) y variables de entorno `DB_URL`, `DB_USER`, `DB_PASSWORD` y `PORT`. También soporta disparo vía webhook configurando `BACKEND_DEPLOY_HOOK` en `.env`.
- **Frontend (Vercel):** Conectado al directorio `frontend` del repositorio con la variable de entorno `VITE_API_URL=https://registro-equipos-mineros-backend.onrender.com`.

---

## 🤖 Uso de Herramientas de IA

De acuerdo con los lineamientos de transparencia de la evaluación, durante el desarrollo de este proyecto se utilizaron asistentes de IA (**Google Antigravity IDE** con modelos **Gemini** y **Claude**) como apoyo en pair-programming para:
- Generación de estructuras base (boilerplate) de entidades JPA, DTOs `record` de Java 21 y manejo de excepciones con `@RestControllerAdvice`.
- Maquetación de componentes de interfaz en React + Tailwind CSS v3 y diseño del script de automatización `./deploy.sh` y `Dockerfile`.
- Ejecución de pruebas de validación de casos borde (edge cases) contra los endpoints desplegados.

Toda la arquitectura, reglas de negocio, modelo de datos relacional y configuración de infraestructura fueron revisados, validados y probados integralmente.
