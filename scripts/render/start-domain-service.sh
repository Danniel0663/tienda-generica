#!/usr/bin/env sh

set -eu

MYSQL_HOSTPORT="${MYSQL_HOSTPORT:-mysql:3306}"
MYSQL_DATABASE="${MYSQL_DATABASE:-tienda_generica}"

export SPRING_DATASOURCE_URL="jdbc:mysql://${MYSQL_HOSTPORT}/${MYSQL_DATABASE}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Bogota"

exec java -jar /app/app.war
