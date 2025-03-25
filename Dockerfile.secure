# 보안이 강화된 Dockerfile - 멀티 스테이지 빌드와 보안 모범 사례 적용

# 빌드 단계: 최신 LTS 버전의 Node.js 사용
FROM node:20-alpine AS build

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json만 먼저 복사하여 의존성 캐싱 활용
COPY package*.json ./

# 의존성 설치
RUN npm install

# 소스 코드 복사 (불필요한 파일 제외)
COPY public ./public
COPY src ./src

# 앱 빌드
RUN npm run build

# 실행 단계: 경량 Nginx 이미지 사용
FROM nginx:1.25.4-alpine

# 보안 강화를 위해 비root 사용자 생성
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Nginx 설정 파일 복사 (최소 권한 설정)
COPY --chown=appuser:appgroup nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 단계에서 생성된 정적 파일만 복사
COPY --from=build --chown=appuser:appgroup /app/build /usr/share/nginx/html

# 필요한 폴더에 대한 권한 설정
RUN chown -R appuser:appgroup /var/cache/nginx && \
    chown -R appuser:appgroup /var/log/nginx && \
    chown -R appuser:appgroup /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appgroup /var/run/nginx.pid && \
    # Nginx conf 폴더 권한 설정
    chmod -R 755 /usr/share/nginx/html

# 보안을 위해 비root 사용자로 전환
USER appuser

# 환경 변수는 런타임에 주입 (Dockerfile에 하드코딩하지 않음)
# Docker 실행 시 --env-file 또는 -e 옵션을 사용하여 전달

# 필요한 포트만 노출
EXPOSE 8080

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]