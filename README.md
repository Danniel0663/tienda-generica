# Tienda Generica Virtual

Entrega completa con:

- frontend en React desacoplado en [frontend](/Users/dannielparra/Downloads/TiendaGenerica/frontend)
- microservicios Spring Boot empaquetados como `war` o `jar`
- un balanceador Nginx para el frontend
- un balanceador Nginx para el backend
- un contenedor Docker para cada microservicio, para el frontend y para cada balanceador

## Topología final

- `frontend-load-balancer`: Nginx público en `http://localhost:8080`
- `frontend-1` y `frontend-2`: dos instancias del frontend React
- `backend-load-balancer`: Nginx público en `http://localhost:8081`
- `gateway-service` y `gateway-service-2`: dos instancias del gateway
- `usuarios-service`
- `clientes-service`
- `proveedores-service`
- `productos-service`
- `ventas-service`
- `report-service`
- `mysql`

Flujo:

`navegador -> frontend-load-balancer -> frontend React`

`navegador -> /api -> frontend-load-balancer -> backend-load-balancer -> gateway-service -> microservicio de dominio`

## Levantar todo con Docker

La orquestación principal ahora está en [docker-compose.yml](/Users/dannielparra/Downloads/TiendaGenerica/docker-compose.yml).

```bash
docker compose up --build
```

Puertos principales:

- `8080`: frontend balanceado
- `8081`: backend balanceado
- `3306`: MySQL

## Despliegue completo en Oracle

Para publicar frontend, balanceadores, microservicios y MySQL en una sola VM de Oracle usa:

- el override [docker-compose.oracle.yml](/Users/dannielparra/Downloads/TiendaGenerica/docker-compose.oracle.yml)
- el ejemplo de entorno [.env.oracle.example](/Users/dannielparra/Downloads/TiendaGenerica/.env.oracle.example)
- la guía [ORACLE_COMPOSE.md](/Users/dannielparra/Downloads/TiendaGenerica/docs/deployment/ORACLE_COMPOSE.md)
- el script [deploy-compose.sh](/Users/dannielparra/Downloads/TiendaGenerica/scripts/oracle/deploy-compose.sh)

Flujo corto:

```bash
cp .env.oracle.example .env.oracle
./scripts/oracle/deploy-compose.sh
```

## Despliegue en Render

El repo también quedó preparado con [render.yaml](/Users/dannielparra/Downloads/TiendaGenerica/render.yaml) para desplegar:

- `tienda-generica-frontend` como servicio web público
- `gateway`, microservicios y `mysql` como servicios privados
- el frontend consumiendo la API por proxy interno, sin exponer el backend al público

Botón directo:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Danniel0663/tienda-generica)

Nota importante:
Render indica que `free` no está disponible para private services, background workers o cron jobs, por lo que esta arquitectura requiere al menos planes `starter` para los servicios privados.

## Kubernetes en GCP

También quedó preparada una base de Kubernetes en [infra/k8s](/Users/dannielparra/Downloads/TiendaGenerica/infra/k8s) con:

- `Namespace`
- `ConfigMap` y `Secret`
- `StatefulSet` para MySQL
- `Deployment` + `Service` para `frontend`, `gateway` y microservicios
- `Ingress` para enrutar `/` y `/api`

La guía completa está en [GCP_KUBERNETES.md](/Users/dannielparra/Downloads/TiendaGenerica/docs/deployment/GCP_KUBERNETES.md) y los scripts de apoyo están en [scripts/gcp](/Users/dannielparra/Downloads/TiendaGenerica/scripts/gcp).

## Verificación rápida del balanceo

Balanceador del frontend:

```bash
curl -I http://localhost:8080/
```

Revisa los headers:

- `X-Frontend-Load-Balancer`
- `X-Frontend-Upstream`
- `X-Frontend-Instance`

Balanceador del backend:

```bash
curl -i http://localhost:8081/api/reportes/clientes
```

Repite varias veces y revisa:

- `X-Backend-Load-Balancer`
- `X-Backend-Upstream`
- `X-Upstream-Service`
- `X-Upstream-Instance`

Los dos primeros muestran la instancia de gateway elegida por Nginx. Los dos últimos muestran la instancia final del microservicio atendiendo la solicitud.

## Frontend React

El frontend nuevo vive en [frontend/src/App.jsx](/Users/dannielparra/Downloads/TiendaGenerica/frontend/src/App.jsx) y cubre:

- login con token
- dashboard con KPIs
- CRUD de usuarios, clientes, proveedores y productos
- carga CSV de productos
- registro de ventas
- reportes de usuarios, clientes y ventas por cliente
- visualización de headers de balanceo en tiempo real

Build local del frontend:

```bash
cd frontend
npm install
npm run build
```

## Microservicios incluidos

- `gateway-service`: puerta de entrada HTTP hacia la API
- `usuarios-service`: autenticación y CRUD de usuarios
- `clientes-service`: CRUD de clientes
- `proveedores-service`: CRUD de proveedores
- `productos-service`: CRUD de productos y carga CSV
- `ventas-service`: registro y consulta de ventas
- `report-service`: reportes administrativos
- `domain-kernel`: módulo compartido con entidades, DTOs, seguridad y reglas reutilizadas

## Construcción Maven

```bash
./mvnw -DskipTests package
```

## Despliegue en Ubuntu + Tomcat

La guía paso a paso para montar cada VM con Java, Tomcat y el `war` correspondiente está en [UBUNTU_TOMCAT.md](/Users/dannielparra/Downloads/TiendaGenerica/docs/deployment/UBUNTU_TOMCAT.md). El script base para preparar una VM está en [install-tomcat11.sh](/Users/dannielparra/Downloads/TiendaGenerica/scripts/ubuntu/install-tomcat11.sh).

## Postman

- [TiendaGenerica-Microservices.postman_collection.json](/Users/dannielparra/Downloads/TiendaGenerica/postman/TiendaGenerica-Microservices.postman_collection.json)
- [TiendaGenerica-Microservices.postman_environment.json](/Users/dannielparra/Downloads/TiendaGenerica/postman/TiendaGenerica-Microservices.postman_environment.json)
