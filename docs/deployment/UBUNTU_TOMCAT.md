# Despliegue en Ubuntu, Java y Tomcat

## Versiones objetivo

Esta guia asume:

- Ubuntu Server 24.04 o superior
- Java 17
- Apache Tomcat 11
- MySQL 8

La razon tecnica es que el proyecto usa Spring Boot `4.0.3`, que requiere Java 17+ y contenedor Servlet `6.1+`. Para esta entrega, Tomcat 11 cumple ese requisito.

## Distribucion sugerida

- `vm-gateway`: `gateway-service`
- `vm-usuarios`: `usuarios-service`
- `vm-clientes`: `clientes-service`
- `vm-proveedores`: `proveedores-service`
- `vm-productos`: `productos-service`
- `vm-ventas`: `ventas-service`
- `vm-mysql`: base de datos `tienda_generica`

## 1. Construir los WAR

En tu maquina de desarrollo:

```bash
./mvnw -DskipTests package
```

## 2. Preparar cada VM Ubuntu

En cada VM donde va un microservicio:

```bash
scp scripts/ubuntu/install-tomcat11.sh usuario@IP_VM:/tmp/install-tomcat11.sh
ssh usuario@IP_VM
chmod +x /tmp/install-tomcat11.sh
sudo /tmp/install-tomcat11.sh
```

El script instala Java 17, descarga Tomcat 11 y registra `tomcat.service`.

## 3. Configurar variables del servicio

En cada VM crea `/opt/tomcat/bin/setenv.sh` con permisos ejecutables:

```bash
sudo tee /opt/tomcat/bin/setenv.sh > /dev/null <<'EOF'
#!/usr/bin/env bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export SPRING_DATASOURCE_URL='jdbc:mysql://IP_MYSQL:3306/tienda_generica?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Bogota'
export SPRING_DATASOURCE_USERNAME='root'
export SPRING_DATASOURCE_PASSWORD='CLAVE_MYSQL'
export APP_SECURITY_TOKEN_SECRET='change-this-secret-in-production-32-characters'
EOF
sudo chmod +x /opt/tomcat/bin/setenv.sh
```

Si la VM corresponde a `gateway-service`, agrega tambien estas lineas al mismo `setenv.sh`:

```bash
export SERVICES_USUARIOS_BASE_URL='http://IP_USUARIOS:8080'
export SERVICES_CLIENTES_BASE_URL='http://IP_CLIENTES:8080'
export SERVICES_PROVEEDORES_BASE_URL='http://IP_PROVEEDORES:8080'
export SERVICES_PRODUCTOS_BASE_URL='http://IP_PRODUCTOS:8080'
export SERVICES_VENTAS_BASE_URL='http://IP_VENTAS:8080'
```

Si despliegas el WAR con otro nombre distinto de `ROOT.war`, agrega el contexto en cada URL, por ejemplo `http://IP_USUARIOS:8080/usuarios-service-0.0.1-SNAPSHOT`.

## 4. Copiar y desplegar el WAR

Ejemplo para `usuarios-service`:

```bash
scp microservices/usuarios-service/target/usuarios-service-0.0.1-SNAPSHOT.war usuario@IP_USUARIOS:/tmp/ROOT.war
ssh usuario@IP_USUARIOS
sudo systemctl stop tomcat
sudo rm -rf /opt/tomcat/webapps/ROOT /opt/tomcat/webapps/ROOT.war
sudo mv /tmp/ROOT.war /opt/tomcat/webapps/ROOT.war
sudo chown tomcat:tomcat /opt/tomcat/webapps/ROOT.war
sudo systemctl start tomcat
```

Repite lo mismo en cada VM con el WAR correspondiente.

## 5. Verificar el despliegue

En cada VM:

```bash
sudo systemctl status tomcat
curl http://localhost:8080/actuator/health
```

Servicios esperados:

- Gateway: `http://IP_GATEWAY:8080/actuator/health`
- Usuarios: `http://IP_USUARIOS:8080/actuator/health`
- Clientes: `http://IP_CLIENTES:8080/actuator/health`
- Proveedores: `http://IP_PROVEEDORES:8080/actuator/health`
- Productos: `http://IP_PRODUCTOS:8080/actuator/health`
- Ventas: `http://IP_VENTAS:8080/actuator/health`

## 6. Probar en Postman

1. Importa la coleccion [TiendaGenerica-Microservices.postman_collection.json](/Users/dannielparra/Downloads/TiendaGenerica/postman/TiendaGenerica-Microservices.postman_collection.json).
2. Importa el ambiente [TiendaGenerica-Microservices.postman_environment.json](/Users/dannielparra/Downloads/TiendaGenerica/postman/TiendaGenerica-Microservices.postman_environment.json).
3. Cambia `gateway_url` por `http://IP_GATEWAY:8080`.
4. Ejecuta `Auth/Login`.
5. Ejecuta las carpetas `Clientes`, `Proveedores`, `Productos` y `Ventas`.

Credenciales iniciales:

- Usuario: `admininicial`
- Contrasena: `admin123456`

## Observacion

La entrega queda empaquetada y lista para Tomcat externo. La persistencia se mantiene compartida en MySQL para no romper el modelo actual de datos.
