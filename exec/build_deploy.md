# 1. GitLab 클론 이후 빌드/배포 문서 (정리본)

## 0) 대상 리포 구조
- `SHOPPY-BE/` : Spring Boot 백엔드 + OpenVidu 연동
- `SHOPPY-FE/` : Vite + React 프런트엔드
- `monitoring/` : Prometheus/Grafana 모니터링
- `Jenkinsfile` : CI/CD 파이프라인 정의

## 1) 사용 제품/버전 (JVM, 웹서버, WAS 등)
### Backend
- JVM/JDK: Eclipse Temurin OpenJDK 17 (Docker build stage)
- JVM/JRE: Eclipse Temurin OpenJDK 17 JRE Alpine (Docker runtime stage)
- Framework/WAS: Spring Boot 3.5.9 (내장 Tomcat)
- Realtime/WebRTC: OpenVidu Server 2.32.1
- Kurento Media Server: 7.3.0 (docker image)
- TURN Server: OpenVidu Coturn 2.32.1
- DB: MySQL (드라이버: `com.mysql:mysql-connector-j`, version: mysql 8.0.44)

### Frontend
- Build: Node.js 20-alpine
- Runtime Web Server: Nginx (nginx:alpine)

### Monitoring
- Prometheus (prom/prometheus)
- Grafana (grafana/grafana)

## 2) 빌드/배포 흐름 (Jenkins 기준)
### 2-1. Backend (Docker 빌드)
- 경로: `SHOPPY-BE/`
- 명령: `docker build -t shoppy-be:latest .`

### 2-2. Frontend (Docker 빌드)
- 경로: `SHOPPY-FE/`
- 명령: `docker build --no-cache ... -t shoppy-fe:latest .`
- 빌드 인자: `VITE_API_BASE_URL`, `VITE_WEBSOCKET_URL`, `VITE_WEBRTC_SIGNALING_URL`, `VITE_REALTIME_ENABLED`, `VITE_KAKAO_JS_KEY`, `VITE_KAKAO_REST_KEY`

### 2-3. 배포 (release 브랜치)
- FE 컨테이너 기동: `docker run -d --name shoppy-fe -p 3000:3000 --restart always shoppy-fe:latest`
- BE + OpenVidu: `SHOPPY-BE/.env` 생성 후 `docker compose up -d --no-build`
- 배포 종료 후 BE `.env` 삭제 (Jenkins post 단계)

## 3) 빌드 시 환경 변수/인자
### 3-1. Frontend (Vite build)
- `VITE_API_BASE_URL=https://i14c209.p.ssafy.io`
- `VITE_WEBSOCKET_URL=https://i14c209.p.ssafy.io/api/ws`
- `VITE_WEBRTC_SIGNALING_URL=https://i14c209.p.ssafy.io/api/ws`
- `VITE_REALTIME_ENABLED=true`
- `VITE_KAKAO_JS_KEY=fcaef89fee2a672b719a292edcdb9b66`
- `VITE_KAKAO_REST_KEY=fcaef89fee2a672b719a292edcdb9b66`

참고 파일
- `SHOPPY-FE/Dockerfile`
- `SHOPPY-FE/.env` (로컬 개발용 샘플)
- `Jenkinsfile` (빌드 인자 주입)

### 3-2. Backend (Spring / .env)
- 데이터소스
  - `DB_HOST=localhost`
  - `DB_PORT=3306`
  - `DB_NAME=shoppy_db`
  - `DB_USERNAME=root`
  - `DB_PASSWORD=ssafy`
  - 또는 `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` (docker-compose 사용 시)
- JPA
  - `JPA_DDL_AUTO=update`
  - `JPA_SHOW_SQL=false`
- JWT
  - `JWT_SECRET=OGU4MjRhNzFmMTQ4YjM3NDFmYTliNTU0NTI5YWE5ZTMwZmIzY2NiMzNmZDg0ZGNiMTc4MmNmYzliZmRlMGJlYw==`
  - `JWT_ACCESS_EXP=3600000`
  - `JWT_REFRESH_EXP=604800000`
- OpenVidu
  - `OPENVIDU_URL=https://i14c209.p.ssafy.io:5443`
  - `OPENVIDU_SECRET=MySuperSecretPasswordC209`
  - `OPENVIDU_RECORDING_PATH=./openvidu/recordings`
  - `OPENVIDU_RECORDING_CUSTOM_LAYOUT=./openvidu/custom-layout`
  - `OPENVIDU_CDR_PATH=./openvidu/cdr`
- Kakao OAuth
  - `KAKAO_CLIENT_ID=fcaef89fee2a672b719a292edcdb9b66`
  - `KAKAO_REDIRECT_URI=http://localhost:5173/auth/kakao/callback`

- AWS S3
  - `AWS_ACCESS_KEY=REDACTED`
  - `AWS_SECRET_KEY=REDACTED`
  - `AWS_S3_BUCKET=shoppy-rtc`
  - `AWS_REGION=ap-northeast-2`
- GMS (LLM/OCR)
  - `GMS_API_KEY=S14P12C209-b7ac85da-9a60-46df-bd5c-673453151052`
- CORS
  - `CORS_ALLOWED_ORIGINS=https://i14c209.p.ssafy.io,http://localhost:5173`


참고 파일
- `SHOPPY-BE/src/main/resources/application.yaml`
- `SHOPPY-BE/docker-compose.yml`
- `Jenkinsfile`

### 3-3. OpenVidu/Coturn 관련 `.env`
- `DOMAIN_OR_PUBLIC_IP=i14c209.p.ssafy.io`
- `OPENVIDU_DOMAIN_OR_PUBLIC_IP=i14c209.p.ssafy.io`
- `SERVER_SSL_ENABLED=true|false`
- `HTTPS_PORT=5443`
- `CERTIFICATE_TYPE=letsencrypt`
- `LETSENCRYPT_EMAIL=your_email@ssafy.com`
- `OPENVIDU_SECRET=MySuperSecretPasswordC209`
- `OPENVIDU_RECORDING=false|true`
- `OPENVIDU_RECORDING_PATH=./openvidu/recordings`
- `OPENVIDU_RECORDING_CUSTOM_LAYOUT=./openvidu/custom-layout`
- `OPENVIDU_RECORDING_PUBLIC_ACCESS=false|true`
- `OPENVIDU_RECORDING_NOTIFICATION=publisher_moderator`
- `OPENVIDU_RECORDING_AUTOSTOP_TIMEOUT=120`
- `OPENVIDU_STREAMS_VIDEO_MIN_RECV_BANDWIDTH=300`
- `OPENVIDU_STREAMS_VIDEO_MAX_SEND_BANDWIDTH=1000`
- `OPENVIDU_STREAMS_VIDEO_MIN_SEND_BANDWIDTH=300`
- `OPENVIDU_WEBHOOK=false|true`
- `OPENVIDU_WEBHOOK_EVENTS=[...]`
- `OPENVIDU_SESSIONS_GARBAGE_INTERVAL=900`
- `OPENVIDU_SESSIONS_GARBAGE_THRESHOLD=3600`
- `OPENVIDU_CDR=false|true`
- `OPENVIDU_CDR_PATH=./openvidu/cdr`
- `COTURN_SHARED_SECRET_KEY=OSumXjY5gKWZeuW9fgHMUekfnVocjx1jUcP` (파일 `SHOPPY-BE/openvidu/coturn/shared-secret-key` 또는 .env)

DB/인증 관련
- `MYSQL_ROOT_PASSWORD=ssafy`
- `MYSQL_DATABASE=shoppy`
- `MYSQL_USER=root`
- `MYSQL_PASSWORD=ssafy`
- `SERVER_SSL_KEY_STORE=/opt/openvidu/owncert/keystore.p12`
- `SERVER_SSL_KEY_STORE_PASSWORD=changeit`
- `SERVER_SSL_KEY_STORE_TYPE=PKCS12`
- `SERVER_SSL_KEY_ALIAS=tomcat`

## 4) 배포 시 특이사항
- `SHOPPY-BE/docker-compose.yml`은 외부 네트워크 `shoppy-net` 사용: 배포 전 `docker network create shoppy-net` 필요
- OpenVidu는 `network_mode: host`로 동작: 포트 충돌 주의
  - 5443(HTTPS), 3478(TURN), 57001-65535(UDP relay) 사용 가능해야 함
- BE 컨테이너 포트 매핑: `8090:8080`
- FE 컨테이너 포트: `3000`
- BE API 기본 경로: `/api`
- SSL 인증서 경로: `/opt/openvidu/owncert` (호스트에 파일 존재 필요)
- Jenkins 배포 후 `.env` 삭제됨 (운영 장애 분석 시 별도 백업 권장)
- FE 빌드에서 `VITE_WEBRTC_SIGNALING_URL`은 Jenkins에서 주입하지만 `SHOPPY-FE/Dockerfile`에서 ARG/ENV 정의가 누락되어 있음 (필요 시 추가 권장)

## 5) DB 접속 정보 및 주요 계정/프로퍼티 정의 파일 목록
- `Jenkinsfile` (CI/CD Credentials 매핑, .env 생성)
- `SHOPPY-BE/src/main/resources/application.yaml` (Spring 설정/환경 변수 참조)
- `SHOPPY-BE/docker-compose.yml` (BE 런타임 env, OpenVidu 설정)
- `SHOPPY-BE/openvidu/coturn/shared-secret-key` (TURN shared secret)
- `SHOPPY-FE/.env` (프런트 로컬 환경 변수)
- `SHOPPY-FE/Dockerfile` (Vite build ARG/ENV)
- `monitoring/prometheus/prometheus.yml` (metrics target)
- `monitoring/grafana/provisioning/datasources/datasource.yml`
