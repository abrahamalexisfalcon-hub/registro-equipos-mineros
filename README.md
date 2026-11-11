# Monitoreo de Horómetros - Equipos Mineros

Sistema integral para el control operativo, seguimiento de horómetros y gestión de ciclos de mantenimiento preventivo para maquinaria pesada minera.

---

## 1. Enlaces del Proyecto en Producción

* **Frontend (Vercel):** [https://registro-equipos-mineros.vercel.app](https://tu-url-frontend.vercel.app) *(reemplaza con tu URL real)*
* **Backend API (Render):** [https://registro-equipos-mineros-backend.onrender.com](https://tu-url-backend.onrender.com)
* **Endpoint de Salud (Smoke Test):** `https://registro-equipos-mineros-backend.onrender.com/health`
* **Repositorio GitHub:** [https://github.com/abrahamalexisfalcon-hub/registro-equipos-mineros](https://github.com/abrahamalexisfalcon-hub/registro-equipos-mineros)

---

## 2. Arquitectura de la Solución

El proyecto sigue una arquitectura monorepo desacoplada:

* **Backend:** Spring Boot 3 (Java 21), Spring Data JPA, Hibernate, contenedorizado vía Dockerfile multi-stage en Render.
* **Frontend:** React 18, Vite, Tailwind CSS v3, Axios, desplegado en Vercel.
* **Base de Datos:** PostgreSQL en la nube (Neon.tech con connection pooling).
* **Diseño del Dominio:**
  * Alertas dinámicas al superar el intervalo configurado (`horas_ciclo >= intervalo_alerta`).
  * Reinicio atómico del ciclo de trabajo (`@Transactional`) al registrar un servicio técnico.
  * Trazabilidad completa en la bitácora histórica de intervenciones (`historial_mantenimientos`).

---

## 3. Ejecución en Entorno Local

### Prerrequisitos
* Java JDK 17 o 21 instalado.
* Node.js v18+ y npm instalados.

### Variables de Entorno

#### Backend (`backend/.env` o variables de sistema):
```env
DB_URL=jdbc:postgresql://<HOST_NEON>:<PUERTO>/<DATABASE>?sslmode=require
DB_USER=<USUARIO>
DB_PASSWORD=<PASSWORD>
PORT=8080