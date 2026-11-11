#!/usr/bin/env bash
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}   PIPELINE DE DESPLIEGUE REMOTO & SMOKE TESTING   ${NC}"
echo -e "${BLUE}====================================================${NC}"

# Cargar variables locales de despliegue si existen
if [ -f "./.env.deploy" ]; then
    echo -e "${GREEN}[INFO] Cargando credenciales desde .env.deploy...${NC}"
    export $(grep -v '^#' .env.deploy | xargs)
fi

# Validar variables requeridas
if [ -z "$RENDER_DEPLOY_HOOK" ]; then
    echo -e "${RED}[ERROR] RENDER_DEPLOY_HOOK no está definida.${NC}"
    exit 1
fi

if [ -z "$BACKEND_URL" ]; then
    echo -e "${RED}[ERROR] BACKEND_URL no está definida.${NC}"
    exit 1
fi

# 1. Trigger Backend en Render
echo -e "${YELLOW}[1/3] Disparando despliegue de Backend en Render...${NC}"
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$RENDER_DEPLOY_HOOK")

if [ "$HTTP_RESPONSE" -ge 200 ] && [ "$HTTP_RESPONSE" -lt 300 ]; then
    echo -e "${GREEN}[OK] Trigger de Render enviado correctamente (HTTP $HTTP_RESPONSE).${NC}"
else
    echo -e "${RED}[ERROR] Falló el trigger de Render. Código HTTP: $HTTP_RESPONSE${NC}"
    exit 1
fi

# 2. Despliegue Frontend en Vercel
echo -e "${YELLOW}[2/3] Desplegando Frontend en Vercel (Producción)...${NC}"
cd frontend
npx vercel --prod --yes
cd ..
echo -e "${GREEN}[OK] Frontend desplegado en Vercel.${NC}"

# 3. Smoke Test al endpoint /health
echo -e "${YELLOW}[3/3] Ejecutando Smoke Test en: $BACKEND_URL/health ...${NC}"

MAX_RETRIES=8
RETRY_COUNT=0
HEALTH_OK=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -fsS "$BACKEND_URL/health" > /dev/null 2>&1; then
        HEALTH_OK=true
        break
    else
        echo -e "${YELLOW}Esperando respuesta del servicio... (intento $((RETRY_COUNT+1))/$MAX_RETRIES)${NC}"
        sleep 5
        RETRY_COUNT=$((RETRY_COUNT+1))
    fi
done

if [ "$HEALTH_OK" = true ]; then
    echo -e "${GREEN}====================================================${NC}"
    echo -e "${GREEN} ✓ DESPLIEGUE Y SMOKE TEST EXITOSOS: BACKEND IS UP  ${NC}"
    echo -e "${GREEN}====================================================${NC}"
    exit 0
else
    echo -e "${RED}====================================================${NC}"
    echo -e "${RED} ✗ FALLÓ EL SMOKE TEST: $BACKEND_URL/health no respondió${NC}"
    echo -e "${RED}====================================================${NC}"
    exit 1
fi