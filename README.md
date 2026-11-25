# Mostrador

Sistema de gestión para comercios. Permite registrar ventas con IVA, mantener un catálogo de productos, importar precios por CSV y consultar los movimientos por cliente. El resumen semanal permite explorar las ventas por día y cambiar de semana. La muestra del acceso utiliza datos ilustrativos.

Para personalizar el nombre visible de la tienda, define `VITE_STORE_NAME` al compilar el frontend.

## Arquitectura
- frontend en React desacoplado en [frontend](./frontend)
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

La orquestación principal ahora está en [docker-compose.yml](./docker-compose.yml).

```bash
docker compose up --build
```

Puertos principales:

- `8080`: frontend balanceado
- `8081`: backend balanceado
- `3306`: MySQL

## Despliegue completo en Oracle

Para publicar frontend, balanceadores, microservicios y MySQL en una sola VM de Oracle usa:

- el override [docker-compose.oracle.yml](./docker-compose.oracle.yml)
- el ejemplo de entorno [.env.oracle.example](./.env.oracle.example)
- la guía [ORACLE_COMPOSE.md](./docs/deployment/ORACLE_COMPOSE.md)
- el script [deploy-compose.sh](./scripts/oracle/deploy-compose.sh)

Flujo corto:

```bash
cp .env.oracle.example .env.oracle
./scripts/oracle/deploy-compose.sh
```

## Despliegue en Render

El repo también quedó preparado con [render.yaml](./render.yaml) para desplegar:

- `tienda-generica-frontend` como servicio web público
- `gateway`, microservicios y `mysql` como servicios privados
- el frontend consumiendo la API por proxy interno, sin exponer el backend al público

Botón directo:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Danniel0663/tienda-generica)

Nota importante:
Render indica que `free` no está disponible para private services, background workers o cron jobs, por lo que esta arquitectura requiere al menos planes `starter` para los servicios privados.

## Kubernetes en GCP

También quedó preparada una base de Kubernetes en [infra/k8s](./infra/k8s) con:

- `Namespace`
- `ConfigMap` y `Secret`
- `StatefulSet` para MySQL
- `Deployment` + `Service` para `frontend`, `gateway` y microservicios
- `Ingress` para enrutar `/` y `/api`

La guía completa está en [GCP_KUBERNETES.md](./docs/deployment/GCP_KUBERNETES.md) y los scripts de apoyo están en [scripts/gcp](./scripts/gcp).

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

El frontend nuevo vive en [frontend/src/App.jsx](./frontend/src/App.jsx) y cubre:

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

La guía paso a paso para montar cada VM con Java, Tomcat y el `war` correspondiente está en [UBUNTU_TOMCAT.md](./docs/deployment/UBUNTU_TOMCAT.md). El script base para preparar una VM está en [install-tomcat11.sh](./scripts/ubuntu/install-tomcat11.sh).

## Postman

- [TiendaGenerica-Microservices.postman_collection.json](./postman/TiendaGenerica-Microservices.postman_collection.json)
- [TiendaGenerica-Microservices.postman_environment.json](./postman/TiendaGenerica-Microservices.postman_environment.json)

## Demo de portafolio

En una base de demostración con el esquema de Mostrador ya inicializado, ejecuta
`scripts/demo-portafolio.sql` con el cliente de MySQL 8.4 en modo batch. Por ejemplo, desde la raíz del proyecto y con Bash:

```bash
mysql -h 127.0.0.1 -P 3307 -u mostrador -p tienda_generica < scripts/demo-portafolio.sql
```

La carga crea dos usuarios ficticios (`demo.caja` y `demo.turno`, contraseña compartida `MostradorDemo26!`), seis clientes, tres proveedores, diez productos y catorce ventas con detalle. Las fechas son relativas al día de la primera carga, en hora de Colombia. Volver a ejecutar el archivo conserva los cambios que se hayan hecho durante la demo.

Para mostrar el acceso de visitante, configura `VITE_PORTFOLIO_DEMO=true` en el entorno de Vite durante el desarrollo o la compilación. Usa una base exclusiva para la demo: las cuentas de prueba pueden modificar los datos con los mismos permisos que los demás usuarios de la aplicación.

## Demo compacta en Render y Aiven

El perfil Maven `portfolio` reúne el frontend compilado, las operaciones de tienda y las consultas de reportes en un proceso Java. El despliegue distribuido conserva sus módulos y su Docker Compose.

Para la demo selecciona **portfolio/render.yaml** como ruta del Blueprint en Render. El archivo de la raíz define servicios de pago para otro despliegue. Usa una base MySQL vacía y exclusiva del plan Free de Aiven. Configura el usuario, la contraseña y el certificado CA en los campos privados de Render. El valor de `AIVEN_CA_PEM` es el contenido del certificado CA de Aiven. Usa como `SPRING_DATASOURCE_URL`:

```text
jdbc:mysql://HOST:PUERTO/defaultdb?sslMode=VERIFY_IDENTITY&connectionTimeZone=America/Bogota
```

El primer arranque crea las tablas y los datos de muestra. La ruta de disponibilidad es `/actuator/health/readiness`. Todas las cuentas de demostración comparten los datos del entorno.

Para desplegar con PostgreSQL (Neon), usa el Blueprint de portafolio con los perfiles portfolio,postgres. Usa una base vacía y una URL JDBC PostgreSQL con sslmode=verify-full. Las migraciones crean el esquema y los datos ficticios únicamente en la base de la demo. El perfil MySQL sigue disponible para la ejecución local.
