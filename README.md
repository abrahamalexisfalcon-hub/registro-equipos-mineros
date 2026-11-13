# Registro de Equipos Mineros

Sistema web full-stack diseñado para el control de horómetros, seguimiento de desgaste y programación de mantenimientos preventivos en maquinaria pesada minera.

El proyecto automatiza las alertas por exceso de horas trabajadas, registra el historial de servicios técnicos y previene paradas de planta no planificadas mediante una interfaz responsiva adaptada tanto a monitores de oficina como a dispositivos móviles en campo.

* **App en Producción (Frontend):** https://registro-equipos-mineros-silk.vercel.app/
* **API & Health Check (Backend):** https://registro-equipos-mineros-backend.onrender.com/health
* **Repositorio:** https://github.com/abrahamalexisfalcon-hub/registro-equipos-mineros

---

## Decisiones de Arquitectura y Stack

El sistema fue estructurado como un monorepo desacoplado (`frontend/` y `backend/`) priorizando precisión numérica, transaccionalidad y velocidad de operación.

### 1. Frontend: React 19 + Vite + Tailwind CSS
* **Bundle ligero y arranque rápido:** Vite asegura compilación ágil y recarga en caliente sin sobrecarga de dependencias.
* **Diseño adaptativo industrial:** Patrón dual con Tailwind CSS:
  * **Escritorio:** Tabla autoajustable al ancho de pantalla con visualización simultánea de horómetros, barras de desgaste y acciones rápidas.
  * **Móvil / Tablet:** Tarjetas táctiles optimizadas con `touch-manipulation` para supervisores y técnicos operando en faena.
* **Filtros reactivos en memoria:** Búsqueda por código/tipo y filtros por nivel de alerta resueltos en el cliente mediante `useMemo`, evitando peticiones redundantes al servidor.

### 2. Backend: Java 21 + Spring Boot 3 + Spring Data JPA
* **Arquitectura en capas limpia:** Separación estricta de responsabilidades (`Controller` ➔ `Service` ➔ `Repository` ➔ `Entity` / `DTO`).
* **Cero sobreingeniería de seguridad:** Al tratarse de un panel operativo interno sin requerimiento de autenticación, se omitió intencionalmente Spring Security/JWT para evitar fricción innecesaria en el flujo operativo.
* **Precisión numérica:** Uso de `BigDecimal` en Java y `NUMERIC(10,2)` en PostgreSQL para horómetros e intervalos, eliminando errores de redondeo de punto flotante.
* **Manejo global de excepciones:** `@RestControllerAdvice` estandarizado que retorna respuestas JSON predecibles (`timestamp`, `status`, `message`).

### 3. Base de Datos e Infraestructura
* **PostgreSQL Serverless (Neon.tech):** Base de datos relacional administrada con soporte SSL y pool de conexiones optimizado.
* **Docker & Render:** Backend empaquetado en contenedor multi-etapa (`eclipse-temurin:21-jdk-jammy` ➔ `eclipse-temurin:21-jre-jammy`) desplegado en Render.
* **Mitigación de Cold Starts:** Monitoreo activo cada 5 minutos mediante **UptimeRobot** apuntando al endpoint `/health` para mantener la instancia activa.
* **Vercel:** Despliegue continuo del frontend conectado al CDN global.

---

## Flujo de Negocio Clave

1. **Registro de Maquinaria:** Alta de equipos con código tag único (ej. `CAM-01`, `EXC-02`), vinculados a un tipo de maquinaria que define su intervalo de servicio (ej. Camión: 500 h, Excavadora: 250 h, Perforadora: 400 h).
2. **Actualización de Horómetros:** Los horómetros representan horas físicas acumuladas. El sistema valida estrictamente que la nueva lectura sea mayor o igual a la anterior, bloqueando retrocesos accidentales (`HTTP 400`).
3. **Control de Alertas y Servicios:**
   * Cálculo dinámico del ciclo actual: `Horas Transcurridas = Horómetro Actual - Horas Último Mantenimiento`.
   * Cuando `Horas Transcurridas >= Intervalo`, el equipo pasa a **Alerta de Mantenimiento** (y a estado **Crítico** al superar el 110% del intervalo).
   * El registro de un mantenimiento se ejecuta bajo una transacción `@Transactional`: guarda la bitácora en `historial_mantenimiento` y actualiza `horas_ultimo_mantenimiento = horometro`, reiniciando el contador a `0`.

---

## Integración Continua (CI) y Pruebas Automatizadas

El repositorio incluye un pipeline automatizado en **GitHub Actions** (`.github/workflows/ci.yml`) que se dispara en cada `push` o `pull_request` hacia `main`:

* **Backend CI:** Compila el proyecto con JDK 21 y ejecuta las pruebas de contexto de Spring Boot utilizando un perfil aislado con base de datos en memoria **H2** (`application-test.properties`). Esto evita acoplar las pruebas a credenciales o redes externas.
* **Frontend CI:** Valida la instalación limpia de dependencias (`npm ci`) y verifica que el empaquetado de producción (`npm run build`) finalice sin errores.

---

## Puesta en Marcha Local

### Opción A: Vía Docker Compose (Recomendada)

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/abrahamalexisfalcon-hub/registro-equipos-mineros.git]
   cd registro-equipos-mineros

2. **Levantar PostgreSQL local y Backend:**

    docker compose up --build -d

3. **Iniciar el Frontend:**

    cd frontend
    npm install
    npm run dev

    Frontend: http://localhost:5173
    Backend Health Check: http://localhost:8080/health

### Opción B: Ejecución Manual (Sin Docker)
    Prerrequisitos: Java JDK 21, Node.js 20+ y una instancia de PostgreSQL (local o en Neon.tech).

1. **Configurar e iniciar el Backend:**
    DB_URL=jdbc:postgresql://<HOST>:<PORT>/<DATABASE>?sslmode=require
    DB_USER=<USUARIO>
    DB_PASSWORD=<CONTRASENA>
    PORT=8080

    Ejecuta el servidor:
    cd backend
    ./mvnw spring-boot:run

2. **Configurar e iniciar el Frontend**
    Crea frontend/.env.local con VITE_API_URL=http://localhost:8080 y ejecuta:
    cd frontend
    npm install
    npm run dev

## Despliegue Automatizado y Estrategia de Rollback

    Script de Despliegue
    El monorepo cuenta con el script deploy.sh, que ejecuta validaciones de compilación (npm run build y mvn clean package) y dispara los webhooks de Render y Vercel configurados en .env.deploy:

    chmod +x deploy.sh
    ./deploy.sh

## Política de Rollback ante Fallos
    Frontend (Vercel): Uso de Instant Rollback desde el panel de Deployments hacia el último build estable en menos de 30 segundos.

    Backend (Render): Despliegue manual desde Manual Deploy > Deploy a specific commit seleccionando el último commit validado en verde por GitHub Actions.

    Código Fuente (Git): Reversión segura mediante git revert HEAD para restaurar el estado funcional sin alterar el historial de commits.

## DESARROLLO ASISTIDO POR IA
    Este proyecto fue construido bajo un flujo de ingeniería asistida por IA, utilizando asistentes como aceleradores de código mientras el diseño arquitectónico, modelado de datos y control de calidad recayeron íntegramente en el desarrollador:

    - Herramientas usadas: Claude y Gemini a través de Antigravity
    - Se usaron principalmente para la generación de plantillas iniciales (DTOs, entidades JPA), composición de clases utilitarias de Tailwind CSS y estructuración base de scripts (deploy.sh, Dockerfile).

    - Criterios usados como desarrollador: 
    1. Diseño Relacional y Negocio: Modelado de tablas, llaves foráneas, validación anti-retroceso de horómetros y cálculo dinámico de ciclos.
    2. Depuración e Infraestructura: Resolución de dialectos Hibernate, aislamiento de pruebas con H2 en CI, configuración de carga .env y compatibilidad multiplataforma.
    3. Seguridad y Git Ops: Auditoría de historial Git, purga de secretos y configuración de .gitignore. La IA normalmente pone en evidencia las Keys.
    4. Refactorización UX: Rediseño de tablas con desbordamiento horizontal hacia un sistema dual responsivo (tabla autoajustable + tarjetas táctiles).
