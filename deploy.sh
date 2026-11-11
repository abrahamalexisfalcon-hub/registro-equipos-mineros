#!/usr/bin/env bash
# ==============================================================================
# deploy.sh — Script de Automatización, Compilación y Despliegue
# Proyecto: Registro de Equipos Mineros (Spring Boot 3 + React + PostgreSQL)
# Uso:
#   ./deploy.sh          -> Valida entorno y compila artefactos de producción
#   ./deploy.sh --run    -> Compila, levanta Backend + Frontend y verifica /health
#   ./deploy.sh --smoke  -> Ejecuta smoke test contra el Backend activo
# ==============================================================================

set -euo pipefail

# --- Colores de consola ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1" >&2; }

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"
FRONTEND_DIR="${ROOT_DIR}/frontend"
BACKEND_PID=""

# --- Limpieza de procesos en background al salir ---
cleanup() {
  if [[ -n "${BACKEND_PID}" ]] && kill -0 "${BACKEND_PID}" 2>/dev/null; then
    echo ""
    log_info "Deteniendo proceso del Backend (PID: ${BACKEND_PID})..."
    kill "${BACKEND_PID}" 2>/dev/null || true
    wait "${BACKEND_PID}" 2>/dev/null || true
    log_success "Backend detenido correctamente."
  fi
}
trap cleanup EXIT INT TERM

# --- Carga opcional de variables de entorno (.env) ---
if [[ -f "${ROOT_DIR}/.env" ]]; then
  log_info "Cargando variables de entorno desde .env..."
  set -a
  # Ignorar retornos de carro en caso de edición en Windows
  source <(tr -d '\r' < "${ROOT_DIR}/.env")
  set +a
fi

PORT="${PORT:-8080}"
BACKEND_URL="${BACKEND_URL:-http://localhost:${PORT}}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

# ==============================================================================
# 1. Validación de Entorno (Java, Node.js, npm)
# ==============================================================================
check_dependencies() {
  echo -e "\n${BOLD}=== [1/3] Validando dependencias del entorno ===${NC}"

  # Validar Java (JDK 17+)
  if ! command -v java >/dev/null 2>&1; then
    log_error "Java no está instalado o no se encuentra en el PATH. Se requiere JDK 17 o 21+."
    exit 1
  fi

  JAVA_VER_RAW="$(java -version 2>&1 | head -n 1)"
  JAVA_MAJOR="$(echo "${JAVA_VER_RAW}" | sed -E 's/.*"([0-9]+)(\.[0-9]+)*".*/\1/')"
  if [[ "${JAVA_MAJOR}" =~ ^[0-9]+$ ]] && (( JAVA_MAJOR < 17 )); then
    log_error "Versión de Java no soportada (${JAVA_VER_RAW}). Se requiere JDK 17 o 21+."
    exit 1
  fi
  log_success "Java detectado: ${JAVA_VER_RAW}"

  # Validar Node.js (v18+)
  if ! command -v node >/dev/null 2>&1; then
    log_error "Node.js no está instalado o no se encuentra en el PATH. Se requiere Node.js v18+."
    exit 1
  fi

  NODE_VER="$(node -v)"
  NODE_MAJOR="$(echo "${NODE_VER}" | sed -E 's/^v([0-9]+).*/\1/')"
  if [[ "${NODE_MAJOR}" =~ ^[0-9]+$ ]] && (( NODE_MAJOR < 18 )); then
    log_error "Versión de Node.js insuficiente (${NODE_VER}). Se requiere v18 o superior."
    exit 1
  fi
  log_success "Node.js detectado: ${NODE_VER}"

  # Validar npm
  if ! command -v npm >/dev/null 2>&1; then
    log_error "npm no está instalado o no se encuentra en el PATH."
    exit 1
  fi
  log_success "npm detectado: v$(npm -v)"
}

# ==============================================================================
# 2. Compilación del Backend (Spring Boot 3 + Maven Wrapper)
# ==============================================================================
build_backend() {
  echo -e "\n${BOLD}=== [2/3] Compilando Backend (Spring Boot) ===${NC}"

  if [[ ! -d "${BACKEND_DIR}" ]]; then
    log_error "No se encontró el directorio del backend en: ${BACKEND_DIR}"
    exit 1
  fi

  pushd "${BACKEND_DIR}" >/dev/null

  if [[ -f "./mvnw" ]]; then
    chmod +x ./mvnw 2>/dev/null || true
    MVN_CMD="./mvnw"
  elif command -v mvn >/dev/null 2>&1; then
    MVN_CMD="mvn"
  else
    log_error "No se encontró ./mvnw ni una instalación global de Maven."
    exit 1
  fi

  log_info "Ejecutando: ${MVN_CMD} clean package -DskipTests"
  "${MVN_CMD}" clean package -DskipTests

  JAR_FILE="$(find target -maxdepth 1 -name "*.jar" ! -name "*.jar.original" | head -n 1)"
  if [[ -z "${JAR_FILE}" ]]; then
    log_error "No se generó el artefacto JAR en backend/target/."
    exit 1
  fi

  log_success "Artefacto Backend generado: backend/${JAR_FILE}"
  popd >/dev/null
}

# ==============================================================================
# 3. Compilación del Frontend (React + Vite + Tailwind CSS)
# ==============================================================================
build_frontend() {
  echo -e "\n${BOLD}=== [3/3] Compilando Frontend (React + Vite) ===${NC}"

  if [[ ! -d "${FRONTEND_DIR}" ]]; then
    log_error "No se encontró el directorio del frontend en: ${FRONTEND_DIR}"
    exit 1
  fi

  pushd "${FRONTEND_DIR}" >/dev/null

  if [[ -f "package-lock.json" ]]; then
    log_info "Instalando dependencias con npm ci..."
    npm ci --prefer-offline --no-audit || npm install
  else
    log_info "Instalando dependencias con npm install..."
    npm install
  fi

  log_info "Generando bundle de producción con Vite (npm run build)..."
  VITE_API_URL="${BACKEND_URL}" npm run build

  if [[ ! -f "dist/index.html" ]]; then
    log_error "La compilación del frontend no generó dist/index.html."
    exit 1
  fi

  log_success "Bundle Frontend generado en: frontend/dist/"
  popd >/dev/null
}

# ==============================================================================
# 4. Smoke Test contra /health
# ==============================================================================
wait_for_health() {
  local url="${1}/health"
  local max_attempts="${2:-30}"
  local sleep_secs="${3:-2}"

  log_info "Verificando disponibilidad del Backend en ${url}..."

  for (( i=1; i<=max_attempts; i++ )); do
    if command -v curl >/dev/null 2>&1; then
      RESPONSE="$(curl -fsS --max-time 3 "${url}" 2>/dev/null || true)"
    elif command -v wget >/dev/null 2>&1; then
      RESPONSE="$(wget -qO- --timeout=3 "${url}" 2>/dev/null || true)"
    else
      log_warn "No se encontró curl ni wget para verificar ${url}."
      return 0
    fi

    if echo "${RESPONSE}" | grep -q '"status"[[:space:]]*:[[:space:]]*"UP"'; then
      log_success "Health Check exitoso (${url}) -> ${RESPONSE}"
      return 0
    fi

    echo -ne "\r${BLUE}[INFO]${NC} Esperando a que el Backend inicie... (intento ${i}/${max_attempts})"
    sleep "${sleep_secs}"
  done

  echo ""
  log_error "El Backend no respondió con {\"status\": \"UP\"} en ${url} tras $((max_attempts * sleep_secs)) segundos."
  return 1
}

# ==============================================================================
# 5. Ejecución Local (--run)
# ==============================================================================
run_services() {
  echo -e "\n${BOLD}=== Iniciando Servicios en Entorno Local ===${NC}"

  JAR_PATH="$(find "${BACKEND_DIR}/target" -maxdepth 1 -name "*.jar" ! -name "*.jar.original" | head -n 1)"
  LOG_FILE="${BACKEND_DIR}/target/backend.log"

  log_info "Iniciando Backend en segundo plano en el puerto ${PORT} (logs: backend/target/backend.log)..."
  java -jar "${JAR_PATH}" > "${LOG_FILE}" 2>&1 &
  BACKEND_PID=$!

  if ! wait_for_health "http://localhost:${PORT}" 30 2; then
    log_error "Revisa los últimos logs del Backend:"
    tail -n 25 "${LOG_FILE}" || true
    exit 1
  fi

  echo ""
  log_success "Backend activo en:  http://localhost:${PORT} (Health: http://localhost:${PORT}/health)"
  log_info    "Iniciando servidor Frontend en: http://localhost:${FRONTEND_PORT} (Presiona Ctrl+C para detener ambos)"
  echo ""

  pushd "${FRONTEND_DIR}" >/dev/null
  npm run preview -- --port "${FRONTEND_PORT}" --host
  popd >/dev/null
}

# ==============================================================================
# Flujo Principal
# ==============================================================================
MODE="${1:-build}"

case "${MODE}" in
  --smoke|smoke)
    wait_for_health "${BACKEND_URL}" 5 2
    ;;
  --run|run)
    check_dependencies
    build_backend
    build_frontend
    run_services
    ;;
  --build|build|"")
    check_dependencies
    build_backend
    build_frontend

    # Si hay un deploy hook remoto configurado (ej. Render), dispararlo opcionalmente
    if [[ -n "${BACKEND_DEPLOY_HOOK:-}" ]] && [[ "${BACKEND_DEPLOY_HOOK}" != *"srv-xxxxxx"* ]]; then
      log_info "Disparando Deploy Hook remoto del Backend..."
      curl -fsS -X POST "${BACKEND_DEPLOY_HOOK}" >/dev/null && log_success "Deploy Hook disparado exitosamente."
    fi

    echo -e "\n${GREEN}${BOLD}==================================================================${NC}"
    echo -e "${GREEN}${BOLD}  [SUCCESS] Compilación de Backend y Frontend completada con éxito${NC}"
    echo -e "${GREEN}${BOLD}==================================================================${NC}"
    echo -e "Artefactos listos:"
    echo -e "  • Backend JAR:    ${BOLD}backend/target/horometro-0.0.1-SNAPSHOT.jar${NC}"
    echo -e "  • Frontend Dist:  ${BOLD}frontend/dist/${NC}"
    echo -e ""
    echo -e "Opciones de ejecución:"
    echo -e "  1) Levantar todo automáticamente (Backend + Health Check + Frontend):"
    echo -e "     ${BOLD}./deploy.sh --run${NC}"
    echo -e ""
    echo -e "  2) Arranque manual en terminales separadas:"
    echo -e "     • Terminal 1 (Backend):  ${BOLD}cd backend && ./mvnw spring-boot:run${NC}"
    echo -e "     • Terminal 2 (Frontend): ${BOLD}cd frontend && npm run dev${NC}"
    echo -e "     • Smoke Test (/health):  ${BOLD}./deploy.sh --smoke${NC}"
    ;;
  *)
    log_error "Argumento no reconocido: ${MODE}"
    echo "Uso: ./deploy.sh [build | --run | --smoke]"
    exit 1
    ;;
esac
