# ==========================================
# Etapa 1: Build (Compilación y Empaquetado)
# ==========================================
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copiar descriptor de Maven y wrapper
COPY pom.xml mvnw ./
COPY .mvn .mvn

# Asegurar permisos de ejecución y terminación LF para compatibilidad con Alpine
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw

# Descargar dependencias para cachear capas de Docker
RUN ./mvnw dependency:go-offline -B

# Copiar código fuente y compilar JAR
COPY src src
RUN ./mvnw clean package -DskipTests

# ==========================================
# Etapa 2: Runtime (Imagen Ligera de Producción)
# ==========================================
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# Crear usuario y grupo sin privilegios para ejecución segura
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser:appgroup

# Copiar el artefacto generado
COPY --from=build /app/target/*.jar app.jar

# Puerto de servicio
EXPOSE 8080

# Arranque de la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]
