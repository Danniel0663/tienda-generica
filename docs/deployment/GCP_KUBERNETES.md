# Kubernetes en GCP

Esta carpeta deja la parte de Kubernetes lista para sustentar el proyecto junto al despliegue principal que ya corre en GCP con Docker Compose.

## Qué incluye

- `infra/k8s`: manifiestos de Kubernetes para `frontend`, `gateway`, microservicios de dominio y `mysql`
- `scripts/gcp/install-k3s.sh`: instalación rápida de `k3s` en una VM Ubuntu
- `scripts/gcp/build-k8s-images.sh`: compila el proyecto y construye imágenes Docker para Kubernetes
- `scripts/gcp/import-k3s-images.sh`: importa las imágenes locales al runtime de `k3s`
- `scripts/gcp/deploy-k8s.sh`: aplica los manifiestos con `kubectl apply -k`

## Alcance recomendado para la sustentación

El despliegue público principal puede seguir en Docker Compose, mientras Kubernetes se presenta como la evolución de la misma arquitectura.

Con esto puedes mostrar:

- `Namespace` dedicado: `tienda-generica`
- `ConfigMap` y `Secret` para variables del sistema
- `StatefulSet` + `PVC` para MySQL
- `Deployment` + `Service` para cada microservicio
- `Deployment` replicado para `frontend` y `gateway`
- `Ingress` para exponer `/` y `/api`

## Flujo sugerido en una VM Ubuntu de GCP

1. Instalar `k3s`

```bash
chmod +x scripts/gcp/install-k3s.sh
./scripts/gcp/install-k3s.sh
```

2. Construir imágenes compatibles con Kubernetes

```bash
chmod +x scripts/gcp/build-k8s-images.sh
./scripts/gcp/build-k8s-images.sh
```

3. Importar imágenes al runtime de `k3s`

```bash
chmod +x scripts/gcp/import-k3s-images.sh
./scripts/gcp/import-k3s-images.sh
```

4. Aplicar manifiestos

```bash
chmod +x scripts/gcp/deploy-k8s.sh
./scripts/gcp/deploy-k8s.sh
```

## Archivos clave

- [kustomization.yaml](/Users/dannielparra/Downloads/TiendaGenerica/infra/k8s/kustomization.yaml)
- [apps.yaml](/Users/dannielparra/Downloads/TiendaGenerica/infra/k8s/apps.yaml)
- [mysql.yaml](/Users/dannielparra/Downloads/TiendaGenerica/infra/k8s/mysql.yaml)
- [ingress.yaml](/Users/dannielparra/Downloads/TiendaGenerica/infra/k8s/ingress.yaml)

## Nota práctica

La VM que hoy deja el sistema público corriendo en GCP está bastante justa de memoria. Por eso el despliegue estable y accesible para la entrega quedó en Docker Compose, y la parte de Kubernetes se dejó preparada para demostración académica y evolución del proyecto sin romper el acceso actual.
