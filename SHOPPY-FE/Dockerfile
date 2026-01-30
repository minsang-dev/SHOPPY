# 1. Build Stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./

# 빌드 인자(ARG) 정의 및 환경 변수(ENV) 설정
ARG VITE_API_BASE_URL
ARG VITE_WEBSOCKET_URL
ARG VITE_REALTIME_ENABLED
ARG VITE_KAKAO_JS_KEY
ARG VITE_KAKAO_REST_KEY

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WEBSOCKET_URL=$VITE_WEBSOCKET_URL
ENV VITE_REALTIME_ENABLED=$VITE_REALTIME_ENABLED
ENV VITE_KAKAO_JS_KEY=$VITE_KAKAO_JS_KEY
ENV VITE_KAKAO_REST_KEY=$VITE_KAKAO_REST_KEY

RUN npm install
COPY . .
# 빌드 시 환경 변수는 Jenkinsfile에서 .env 파일로 주입됨
RUN npm run build

# 2. Production Stage (Nginx)
FROM nginx:alpine
# 빌드된 정적 파일 복사
COPY --from=build /app/dist /usr/share/nginx/html
# Nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]