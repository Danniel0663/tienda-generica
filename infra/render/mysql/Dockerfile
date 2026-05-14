FROM mysql:8.4

COPY microservices/domain-kernel/src/main/resources/db/migration/V1__init_schema.sql /docker-entrypoint-initdb.d/01-init-schema.sql
