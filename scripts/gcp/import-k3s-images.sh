#!/usr/bin/env bash

set -euo pipefail

images=(
  tienda-generica/frontend:k8s
  tienda-generica/gateway-service:k8s
  tienda-generica/usuarios-service:k8s
  tienda-generica/clientes-service:k8s
  tienda-generica/proveedores-service:k8s
  tienda-generica/productos-service:k8s
  tienda-generica/ventas-service:k8s
  tienda-generica/report-service:k8s
)

archive_path="${TMPDIR:-/tmp}/tienda-generica-k8s-images.tar"

docker save -o "${archive_path}" "${images[@]}"
sudo mkdir -p /var/lib/rancher/k3s/agent/images
sudo mv "${archive_path}" /var/lib/rancher/k3s/agent/images/tienda-generica-k8s-images.tar
sudo k3s ctr images import /var/lib/rancher/k3s/agent/images/tienda-generica-k8s-images.tar
