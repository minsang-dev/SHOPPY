# Stage 1: 애플리케이션 빌드 단계 (Build Stage)
# linux/amd64 플랫폼에서 eclipse-temurin OpenJDK 17 JDK 이미지를 사용합니다.
FROM --platform=linux/amd64 eclipse-temurin:17-jdk-jammy AS build

# 작업 디렉토리를 /app으로 설정합니다.
WORKDIR /app

# Gradle Wrapper 관련 파일들을 복사합니다.
COPY gradlew .
COPY gradle gradle

# Gradle 빌드 파일들을 복사합니다.
COPY build.gradle settings.gradle ./

# 애플리케이션 소스 코드를 복사합니다.
COPY src src

# gradlew 실행 권한을 부여합니다.
RUN chmod +x ./gradlew

# Gradle을 사용하여 애플리케이션을 빌드합니다. (테스트는 건너뜝니다)
# --no-daemon 옵션은 Docker 환경에서 빌드 시 데몬을 사용하지 않도록 하여 빌드 속도를 높입니다.
RUN ./gradlew bootJar --no-daemon

# Stage 2: 애플리케이션 실행 단계 (Run Stage)
# linux/amd64 플랫폼에서 eclipse-temurin OpenJDK 17 JRE Alpine 이미지를 사용합니다.
# Alpine 이미지는 용량이 작아 배포 이미지로 적합합니다.
FROM --platform=linux/amd64 eclipse-temurin:17-jre-alpine AS runner

# 필수 패키지 설치: ca-certificates (HTTPS 통신 시 인증서 문제 해결)
# Alpine Linux의 패키지 매니저인 apk를 사용하여 ca-certificates를 설치합니다.
RUN apk add --no-cache ca-certificates && update-ca-certificates

# 작업 디렉토리를 /app으로 설정합니다.
WORKDIR /app

# 빌드 단계에서 생성된 JAR 파일을 복사합니다.
# /app/build/libs/ 디렉토리에서 .jar 확장자를 가진 파일을 찾아 app.jar로 복사합니다.
COPY --from=build /app/build/libs/*.jar app.jar

# Spring Boot 애플리케이션이 기본적으로 사용하는 8080 포트를 외부에 노출합니다.
EXPOSE 8090

# 애플리케이션을 실행하는 명령어를 정의합니다.
# java -jar app.jar 명령으로 Spring Boot 애플리케이션을 시작합니다.
# 운영 환경 프로필(prod)을 적용합니다.
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]