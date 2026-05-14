# Despliegue completo en Oracle con Docker Compose

Esta ruta publica toda la version nueva en una sola VM de Oracle:

- frontend React balanceado por Nginx
- backend balanceado por Nginx
- microservicios de negocio
- `report-service`
- MySQL persistente en un volumen Docker

## 1. Preparar la VM

En Ubuntu 24.04 o superior:

```bash
scp -i TU_LLAVE scripts/oracle/install-docker.sh ubuntu@TU_IP:/tmp/install-docker.sh
ssh -i TU_LLAVE ubuntu@TU_IP
chmod +x /tmp/install-docker.sh
/tmp/install-docker.sh
```

Abre en el Security List o NSG de Oracle al menos:

- `22/tcp` para SSH
- `80/tcp` para el frontend publico

Mantén `3306` y `8081` privados salvo que necesites exponerlos.

## 2. Crear el archivo de entorno

En tu maquina local:

```bash
cp .env.oracle.example .env.oracle
```

Ajusta estos valores:

- `ORACLE_HOST`
- `ORACLE_SSH_USER`
- `ORACLE_SSH_KEY`
- `APP_SECURITY_TOKEN_SECRET`
- `MYSQL_ROOT_PASSWORD`
- `SPRING_DATASOURCE_PASSWORD`
- `APP_CORS_ALLOWED_ORIGINS`

Si publicas con dominio o HTTPS, usa ese origen real en `APP_CORS_ALLOWED_ORIGINS`.

## 3. Desplegar

Desde la raiz del proyecto:

```bash
./scripts/oracle/deploy-compose.sh
```

El script:

- empaqueta el proyecto
- lo sube por SSH
- actualiza el directorio remoto
- levanta `docker-compose.yml` junto con `docker-compose.oracle.yml`

El despliegue usa `docker compose down --remove-orphans`, por lo que el volumen `mysql_data` no se borra.

## 4. Verificar

Desde tu maquina:

```bash
curl -I http://TU_IP_O_DOMINIO/
```

Desde la VM:

```bash
cd ~/tienda-generica
docker compose -f docker-compose.yml -f docker-compose.oracle.yml --env-file .env.oracle ps
curl http://127.0.0.1:8081/health
curl http://127.0.0.1:3306 >/dev/null
```

Prueba funcional recomendada:

```bash
curl -i -X POST http://TU_IP_O_DOMINIO/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admininicial","password":"admin123456"}'
```

## 5. Logs utiles

```bash
docker compose -f docker-compose.yml -f docker-compose.oracle.yml --env-file .env.oracle logs -f frontend-load-balancer
docker compose -f docker-compose.yml -f docker-compose.oracle.yml --env-file .env.oracle logs -f backend-load-balancer
docker compose -f docker-compose.yml -f docker-compose.oracle.yml --env-file .env.oracle logs -f mysql
```
