# Tienda Generica Virtual - Referencia de Microservicios

## Estado de la entrega

La entrega ahora incluye además:

- frontend React desacoplado
- `frontend-load-balancer` con Nginx
- `backend-load-balancer` con Nginx
- dos instancias de frontend y dos instancias del gateway para demostrar balanceo
- un [docker-compose.yml](/Users/dannielparra/Downloads/TiendaGenerica/docker-compose.yml) raíz con toda la arquitectura

## Servicios

- `gateway-service`: proxy HTTP hacia los servicios de dominio.
- `usuarios-service`: login, token y administracion de usuarios.
- `clientes-service`: administracion de clientes.
- `proveedores-service`: administracion de proveedores.
- `productos-service`: administracion de productos y carga CSV.
- `ventas-service`: ventas y consulta de ventas registradas.
- `domain-kernel`: modulo interno compartido.

## Topologia sugerida para la entrega

- VM 1: `gateway-service`
- VM 2: `usuarios-service`
- VM 3: `clientes-service`
- VM 4: `proveedores-service`
- VM 5: `productos-service`
- VM 6: `ventas-service`
- VM 7: MySQL

Si el curso permite menos maquinas, tambien puedes usar varias VMs con mas de un servicio, pero en ese caso no despliegues todos como `ROOT.war` dentro del mismo Tomcat.

## Rutas publicadas por el gateway

- `/api/auth/login`
- `/api/usuarios/**`
- `/api/clientes/**`
- `/api/proveedores/**`
- `/api/productos/**`
- `/api/ventas/**`

## Artefactos

Todos se generan con:

```bash
./mvnw -DskipTests package
```

## Docker

Arquitectura principal recomendada para la entrega:

```bash
docker compose up --build
```

Puertos:

- `8080`: frontend balanceado por Nginx
- `8081`: backend balanceado por Nginx
- `3306`: MySQL

Notas de la topología dockerizada final:

- `frontend-load-balancer` reparte tráfico entre `frontend-1` y `frontend-2`.
- `backend-load-balancer` reparte tráfico entre `gateway-service` y `gateway-service-2`.
- cada microservicio de negocio corre en su propio contenedor.
- `mysql` inicializa el esquema automáticamente con `V1__init_schema.sql`.
- las respuestas del frontend incluyen `X-Frontend-Load-Balancer`, `X-Frontend-Upstream` y `X-Frontend-Instance`.
- las respuestas de la API incluyen `X-Backend-Load-Balancer`, `X-Backend-Upstream`, `X-Upstream-Service` y `X-Upstream-Instance`.

## Oracle en una sola VM

Si la nueva entrega debe quedar completa en Oracle sobre una sola VM, usa:

- [docker-compose.oracle.yml](/Users/dannielparra/Downloads/TiendaGenerica/docker-compose.oracle.yml)
- [.env.oracle.example](/Users/dannielparra/Downloads/TiendaGenerica/.env.oracle.example)
- [ORACLE_COMPOSE.md](/Users/dannielparra/Downloads/TiendaGenerica/docs/deployment/ORACLE_COMPOSE.md)
- [deploy-compose.sh](/Users/dannielparra/Downloads/TiendaGenerica/scripts/oracle/deploy-compose.sh)

Eso publica el frontend en `80`, deja backend y MySQL privados por defecto, y conserva los datos en el volumen `mysql_data`.

Si necesitas conservar los `compose` previos como referencia, siguen disponibles en [microservices/docker-compose.yml](/Users/dannielparra/Downloads/TiendaGenerica/microservices/docker-compose.yml) y [microservices/docker-compose.load-balanced.yml](/Users/dannielparra/Downloads/TiendaGenerica/microservices/docker-compose.load-balanced.yml).

WARs de la entrega:

- [usuarios-service-0.0.1-SNAPSHOT.war](/Users/dannielparra/Downloads/TiendaGenerica/microservices/usuarios-service/target/usuarios-service-0.0.1-SNAPSHOT.war)
- [clientes-service-0.0.1-SNAPSHOT.war](/Users/dannielparra/Downloads/TiendaGenerica/microservices/clientes-service/target/clientes-service-0.0.1-SNAPSHOT.war)
- [proveedores-service-0.0.1-SNAPSHOT.war](/Users/dannielparra/Downloads/TiendaGenerica/microservices/proveedores-service/target/proveedores-service-0.0.1-SNAPSHOT.war)
- [productos-service-0.0.1-SNAPSHOT.war](/Users/dannielparra/Downloads/TiendaGenerica/microservices/productos-service/target/productos-service-0.0.1-SNAPSHOT.war)
- [ventas-service-0.0.1-SNAPSHOT.war](/Users/dannielparra/Downloads/TiendaGenerica/microservices/ventas-service/target/ventas-service-0.0.1-SNAPSHOT.war)
- [gateway-service-0.0.1-SNAPSHOT.war](/Users/dannielparra/Downloads/TiendaGenerica/microservices/gateway-service/target/gateway-service-0.0.1-SNAPSHOT.war)

## Pruebas

- Coleccion Postman: [TiendaGenerica-Microservices.postman_collection.json](/Users/dannielparra/Downloads/TiendaGenerica/postman/TiendaGenerica-Microservices.postman_collection.json)
- Ambiente Postman: [TiendaGenerica-Microservices.postman_environment.json](/Users/dannielparra/Downloads/TiendaGenerica/postman/TiendaGenerica-Microservices.postman_environment.json)
- Guia Ubuntu/Tomcat: [UBUNTU_TOMCAT.md](/Users/dannielparra/Downloads/TiendaGenerica/docs/deployment/UBUNTU_TOMCAT.md)

Prueba rápida del balanceo del backend:

```bash
curl -i http://localhost:8081/api/reportes/clientes
```

Prueba rápida del balanceo del frontend:

```bash
curl -I http://localhost:8080/
```

Repite ambas peticiones y revisa los headers de upstream para evidenciar qué instancia respondió.
