#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd -- "${SCRIPT_DIR}/../.." && pwd)"

kubectl apply -k "${PROJECT_ROOT}/infra/k8s"
kubectl -n tienda-generica get pods,svc,ingress
