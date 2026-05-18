# ============================================================
# Dockerfile - Backend Spring Boot
# Multi-stage: build con Maven, run con JRE
# ============================================================

# Stage 1: Build con Maven
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copiar pom.xml primero para cachear dependencias
COPY pom.xml .
RUN mvn dependency:go-offline -B 2>/dev/null || true

# Copiar codigo fuente y compilar
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime con JRE (imagen mas liviana)
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Usuario no-root por seguridad
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copiar el JAR del stage anterior
COPY --from=builder /app/target/*.jar app.jar

# Directorio de logs
RUN mkdir -p /app/logs && chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
