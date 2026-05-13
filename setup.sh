#!/usr/bin/env bash
# =============================================================
#  FERREMAS — Setup inicial de variables de entorno
#  Uso: bash setup.sh
#  Compatible: Linux / macOS
# =============================================================

set -euo pipefail

# ── Colores ───────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # sin color

# ── Banner ────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║        FERREMAS — Configuración inicial      ║${NC}"
echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════╝${NC}"
echo ""

# ── Verificar Node.js ─────────────────────────────────────────
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js no está instalado. Instálalo desde https://nodejs.org${NC}"
  exit 1
fi

# ── Instrucciones Supabase ────────────────────────────────────
echo -e "${BOLD}📋 Credenciales de Supabase${NC}"
echo -e "   Ve a ${CYAN}https://app.supabase.com${NC}"
echo -e "   → Selecciona tu proyecto"
echo -e "   → ${BOLD}Settings → API${NC}"
echo -e "   Allí encontrarás la URL y las dos API Keys."
echo ""
echo -e "${YELLOW}⚠️  La Service Role Key tiene permisos totales. Nunca la expongas en el frontend.${NC}"
echo ""

# ── Leer credenciales ─────────────────────────────────────────
read -p "🔗 SUPABASE_URL        (ej: https://xxxx.supabase.co): " SUPABASE_URL
read -p "🔑 SUPABASE_ANON_KEY   (anon/public key): "              SUPABASE_ANON_KEY
read -p "🔐 SUPABASE_SERVICE_ROLE_KEY (service_role key): "       SUPABASE_SERVICE_ROLE_KEY

# Validaciones básicas
if [[ -z "$SUPABASE_URL" || -z "$SUPABASE_ANON_KEY" || -z "$SUPABASE_SERVICE_ROLE_KEY" ]]; then
  echo -e "${RED}❌ Todos los campos son obligatorios.${NC}"
  exit 1
fi

if [[ "$SUPABASE_URL" != https://*.supabase.co* ]]; then
  echo -e "${YELLOW}⚠️  La URL no parece una URL de Supabase válida. Continuando de todas formas...${NC}"
fi

# ── Generar JWT_SECRET ────────────────────────────────────────
echo ""
echo -e "🔧 Generando JWT_SECRET seguro..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo -e "   JWT_SECRET generado: ${CYAN}${JWT_SECRET:0:16}...${NC} (64 caracteres)"

# ── Función: verificar sobreescritura ─────────────────────────
confirm_overwrite() {
  local filepath="$1"
  if [[ -f "$filepath" ]]; then
    echo ""
    echo -e "${YELLOW}⚠️  El archivo ${BOLD}${filepath}${NC}${YELLOW} ya existe.${NC}"
    read -p "   ¿Sobreescribir? (s/N): " confirm
    confirm="${confirm:-N}"
    if [[ "${confirm,,}" != "s" ]]; then
      echo -e "   ↩  Omitiendo ${filepath}."
      return 1
    fi
  fi
  return 0
}

# ── Crear backend/.env ────────────────────────────────────────
echo ""
BACKEND_ENV="backend/.env"

if confirm_overwrite "$BACKEND_ENV"; then
  mkdir -p backend
  cat > "$BACKEND_ENV" <<EOF
# ============================================================
#  FERREMAS Backend — Variables de entorno
#  Generado por setup.sh el $(date '+%Y-%m-%d %H:%M:%S')
#  ⚠️  NUNCA subas este archivo al repositorio.
# ============================================================

# Supabase
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}

# Autenticación
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=8h

# Servidor
PORT=3000
NODE_ENV=development

# CORS — URL del frontend en desarrollo
CORS_ORIGIN=http://localhost:5173
EOF
  echo -e "${GREEN}   ✅ ${BACKEND_ENV} creado correctamente.${NC}"
fi

# ── Crear .env.local (frontend) ───────────────────────────────
FRONTEND_ENV=".env.local"

if confirm_overwrite "$FRONTEND_ENV"; then
  cat > "$FRONTEND_ENV" <<EOF
# ============================================================
#  FERREMAS Frontend — Variables de entorno Vite
#  Generado por setup.sh el $(date '+%Y-%m-%d %H:%M:%S')
#  ⚠️  NUNCA subas este archivo al repositorio.
#  Solo las variables con prefijo VITE_ son expuestas al cliente.
# ============================================================

VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}

# production = usa la API real | mockup = usa datos de prueba locales
VITE_APP_MODE=production

# URL del backend Node.js en desarrollo
VITE_API_URL=http://localhost:3000
EOF
  echo -e "${GREEN}   ✅ ${FRONTEND_ENV} creado correctamente.${NC}"
fi

# ── Confirmación final ────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║       ✅ Configuración completada            ║${NC}"
echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BOLD}🚀 Para iniciar el backend:${NC}"
echo -e "   ${CYAN}cd backend && npm install && npm run dev${NC}"
echo ""
echo -e "${BOLD}🎯 En otra terminal, el frontend:${NC}"
echo -e "   ${CYAN}npm install && npm run dev${NC}"
echo ""
echo -e "${BOLD}🌐 URLs disponibles:${NC}"
echo -e "   Frontend → ${CYAN}http://localhost:5173${NC}"
echo -e "   Backend  → ${CYAN}http://localhost:3000${NC}"
echo ""
