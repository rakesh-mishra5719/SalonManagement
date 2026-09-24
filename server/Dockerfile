FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build production jar
RUN mvn clean package -DskipTests

# Runtime stage: slim JRE container
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75.0", "app.jar"]
