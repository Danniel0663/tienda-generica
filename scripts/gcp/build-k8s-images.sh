#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd -- "${SCRIPT_DIR}/../.." && pwd)"

cd "${PROJECT_ROOT}"

./mvnw -q -DskipTests package

(
    cd frontend
    npm ci
    npm run build
)

build_service_image() {
    local image_name="$1"
    local module_path="$2"
    local artifact_name="$3"

    docker build \
      -t "${image_name}" \
      -f Dockerfile.service.prebuilt \
      --build-arg MODULE_PATH="${module_path}" \
      --build-arg ARTIFACT_NAME="${artifact_name}" \
      .
}

build_service_image "tienda-generica/usuarios-service:k8s" "microservices/usuarios-service" "usuarios-service-0.0.1-SNAPSHOT.war"
build_service_image "tienda-generica/clientes-service:k8s" "microservices/clientes-service" "clientes-service-0.0.1-SNAPSHOT.war"
build_service_image "tienda-generica/proveedores-service:k8s" "microservices/proveedores-service" "proveedores-service-0.0.1-SNAPSHOT.war"
build_service_image "tienda-generica/productos-service:k8s" "microservices/productos-service" "productos-service-0.0.1-SNAPSHOT.war"
build_service_image "tienda-generica/ventas-service:k8s" "microservices/ventas-service" "ventas-service-0.0.1-SNAPSHOT.war"
build_service_image "tienda-generica/report-service:k8s" "microservices/report-service" "report-service-0.0.1-SNAPSHOT.jar"
build_service_image "tienda-generica/gateway-service:k8s" "microservices/gateway-service" "gateway-service-0.0.1-SNAPSHOT.war"

docker build \
  -t "tienda-generica/frontend:k8s" \
  -f frontend/Dockerfile.prebuilt \
  frontend

docker image ls 'tienda-generica/*:k8s'
