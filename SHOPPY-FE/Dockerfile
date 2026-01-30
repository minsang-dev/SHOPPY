# 1. Build Stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
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