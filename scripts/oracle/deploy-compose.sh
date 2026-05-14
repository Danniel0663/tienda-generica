#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd -- "${SCRIPT_DIR}/../.." && pwd)"
ENV_FILE="${1:-${PROJECT_ROOT}/.env.oracle}"

if [[ ! -f "${ENV_FILE}" ]]; then
    echo "No existe el archivo de entorno: ${ENV_FILE}" >&2
    echo "Copia .env.oracle.example a .env.oracle y completa los valores." >&2
    exit 1
fi

set -a
source "${ENV_FILE}"
set +a

: "${ORACLE_HOST:?Debes definir ORACLE_HOST en ${ENV_FILE}}"
: "${ORACLE_SSH_USER:?Debes definir ORACLE_SSH_USER en ${ENV_FILE}}"
: "${ORACLE_SSH_KEY:?Debes definir ORACLE_SSH_KEY en ${ENV_FILE}}"

REMOTE_DIR="${ORACLE_REMOTE_DIR:-/home/${ORACLE_SSH_USER}/tienda-generica}"
ARCHIVE_NAME="tienda-generica-$(date +%Y%m%d%H%M%S).tar.gz"
ARCHIVE_PATH="${TMPDIR:-/tmp}/${ARCHIVE_NAME}"

if [[ ! -f "${ORACLE_SSH_KEY}" ]]; then
    echo "No se encontro la llave SSH: ${ORACLE_SSH_KEY}" >&2
    exit 1
fi

cleanup() {
    rm -f "${ARCHIVE_PATH}"
}

trap cleanup EXIT

echo "Empaquetando proyecto desde ${PROJECT_ROOT}..."
tar \
    --exclude='.git' \
    --exclude='*.tar.gz' \
    --exclude='.env.oracle' \
    --exclude='frontend/node_modules' \
    --exclude='microservices/*/target' \
    -czf "${ARCHIVE_PATH}" \
    -C "${PROJECT_ROOT}" .

echo "Validando acceso SSH a ${ORACLE_SSH_USER}@${ORACLE_HOST}..."
ssh -i "${ORACLE_SSH_KEY}" -o StrictHostKeyChecking=no -o ConnectTimeout=10 \
    "${ORACLE_SSH_USER}@${ORACLE_HOST}" "echo ok" >/dev/null

echo "Subiendo artefactos a Oracle..."
scp -i "${ORACLE_SSH_KEY}" -o StrictHostKeyChecking=no \
    "${ARCHIVE_PATH}" \
    "${ENV_FILE}" \
    "${ORACLE_SSH_USER}@${ORACLE_HOST}:/tmp/"

echo "Actualizando despliegue remoto en ${REMOTE_DIR}..."
ssh -i "${ORACLE_SSH_KEY}" -o StrictHostKeyChecking=no "${ORACLE_SSH_USER}@${ORACLE_HOST}" bash <<EOF
set -euo pipefail

mkdir -p "${REMOTE_DIR}"
rm -rf "${REMOTE_DIR}/"*
tar -xzf "/tmp/${ARCHIVE_NAME}" -C "${REMOTE_DIR}"
cp "/tmp/$(basename "${ENV_FILE}")" "${REMOTE_DIR}/.env.oracle"

cd "${REMOTE_DIR}"
docker compose \
  -f docker-compose.yml \
  -f docker-compose.oracle.yml \
  --env-file .env.oracle \
  down --remove-orphans

docker compose \
  -f docker-compose.yml \
  -f docker-compose.oracle.yml \
  --env-file .env.oracle \
  up -d --build --remove-orphans

docker compose \
  -f docker-compose.yml \
  -f docker-compose.oracle.yml \
  --env-file .env.oracle \
  ps
EOF

echo "Despliegue finalizado."
