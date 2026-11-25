FROM node:22-alpine AS frontend
WORKDIR /src/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/src ./src
COPY frontend/index.html frontend/vite.config.js ./
ENV VITE_PORTFOLIO_DEMO=true
RUN npm run build

FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /src
COPY pom.xml .
COPY microservices ./microservices
COPY portfolio ./portfolio
COPY scripts/demo-portafolio.sql ./scripts/demo-portafolio.sql
COPY --from=frontend /src/frontend/dist ./frontend/dist
RUN mvn -B -ntp -Pportfolio -pl portfolio -am package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /src/portfolio/target/portfolio-*.jar /app/mostrador.jar
ENV SPRING_PROFILES_ACTIVE=portfolio
COPY portfolio/start.sh /app/start.sh
USER 10001
ENTRYPOINT ["sh", "/app/start.sh"]
