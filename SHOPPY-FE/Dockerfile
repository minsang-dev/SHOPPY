# 1. Node 이미지 사용
FROM node:20-alpine

# 2. 작업 폴더 설정
WORKDIR /app

# 3. 패키지 파일 복사 및 설치
COPY package*.json ./
RUN npm install

# 4. 소스 코드 복사
COPY . .

# 5. 빌드 (dist 폴더 생성)
RUN npm run build

# 6. 정적 파일 서빙을 위한 패키지 설치
RUN npm install -g serve

# 7. 실행 포트 설정
EXPOSE 3000

# 8. 실행 명령어 (dist 폴더를 3000번 포트로 서빙)
CMD ["serve", "-s", "dist", "-l", "3000"]