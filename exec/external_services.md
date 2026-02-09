# 2. 외부 서비스 정보 정리

## 2-1. Kakao OAuth (소셜 로그인)
- 목적: 사용자 로그인/회원가입
- 사용 위치
  - FE: 카카오 로그인 버튼 및 인가 코드 요청
  - BE: 인가 코드로 토큰 요청, 사용자 정보 조회
- 필요한 정보
  - Kakao JS Key: `VITE_KAKAO_JS_KEY=<secret>`
  - Kakao REST Key: `VITE_KAKAO_REST_KEY=<secret>` (FE에서 사용)
  - Kakao Client ID: `KAKAO_CLIENT_ID=<secret>` (BE에서 사용)
  - Kakao Client Secret: `KAKAO_CLIENT_SECRET=<secret>` (선택)
  - Redirect URI: `KAKAO_REDIRECT_URI=<url주소>`
- 관련 설정
  - `kakao.token-uri=https://kauth.kakao.com/oauth/token`
  - `kakao.user-info-uri=https://kapi.kakao.com/v2/user/me`
  - `kakao.authorization-uri=https://kauth.kakao.com/oauth/authorize`
- 관련 파일
  - `SHOPPY-BE/src/main/resources/application.yaml`
  - `SHOPPY-BE/src/main/java/ssafy/rtc/shoppy/auth/config/KakaoProperties.java`
  - `SHOPPY-FE/.env`

## 2-2. OpenVidu (WebRTC/영상통화)
- 목적: 화상통화, 실시간 세션 관리
- 필요한 정보
  - `OPENVIDU_URL=<url주소>`
  - `OPENVIDU_SECRET=<secret>`
  - SSL/도메인 설정 (OpenVidu .env)
- 관련 파일
  - `SHOPPY-BE/docker-compose.yml`
  - `SHOPPY-BE/openvidu/coturn/shared-secret-key`
  - `Jenkinsfile` (OpenVidu .env 생성)

## 2-3. Coturn (TURN 서버)
- 목적: NAT 환경에서 WebRTC 연결 보조
- 필요한 정보
  - `COTURN_SHARED_SECRET_KEY=<secret>`
  - `COTURN_PORT`, `COTURN_MIN_PORT`, `COTURN_MAX_PORT`
- 관련 파일
  - `SHOPPY-BE/openvidu/coturn/shared-secret-key`
  - `SHOPPY-BE/docker-compose.yml`

## 2-4. GMS (LLM/OCR)
- 목적: LLM 기반 체크리스트 생성, OCR 후처리
- 필요한 정보
  - `GMS_API_KEY=<secret>`
  - 또는 `ai/api/gms_key.json` 내 token 필드
  - `gms.base-url` (기본값: `https://gms.ssafy.io/gmsapi/api.openai.com/v1`)
  - `gms.ocr.model` (현재 `gpt-4.1-mini`)
- 관련 파일
  - `SHOPPY-BE/src/main/resources/application.yaml`
  - `SHOPPY-BE/src/main/java/ssafy/rtc/shoppy/ai/config/GmsProperties.java`

## 2-5. AWS S3
- 목적: 영수증/파일 저장
- 필요한 정보
  - `AWS_ACCESS_KEY=REDACTED`
  - `AWS_SECRET_KEY=REDACTED`
  - `AWS_S3_BUCKET=<bucket>`
  - `region=ap-northeast-2` (고정)
- 관련 파일
  - `SHOPPY-BE/src/main/resources/application.yaml`
  - `SHOPPY-BE/src/main/java/ssafy/rtc/shoppy/settlement/service/FileStorageService.java`

## 2-6. Monitoring
- 목적: JVM/앱 메트릭 수집 및 시각화
- 구성
  - Prometheus: `monitoring/prometheus/prometheus.yml` (metrics path: `/api/actuator/prometheus`)
  - Grafana: `monitoring/grafana/provisioning/datasources/datasource.yml`
