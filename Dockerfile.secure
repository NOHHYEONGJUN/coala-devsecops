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

# 비root 사용자 생성
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Nginx 설정 파일 복사
COPY --chown=appuser:appgroup nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 단계에서 생성된 정적 파일 복사
COPY --from=build --chown=appuser:appgroup /app/build /usr/share/nginx/html

# 사용자 지정 nginx.conf 파일을 생성하여 PID 경로 수정
RUN echo 'pid /tmp/nginx.pid;' > /etc/nginx/nginx.conf && \
    echo 'worker_processes auto;' >> /etc/nginx/nginx.conf && \
    echo 'events { worker_connections 1024; }' >> /etc/nginx/nginx.conf && \
    echo 'http { include /etc/nginx/conf.d/*.conf; }' >> /etc/nginx/nginx.conf && \
    # 필요한 디렉토리 생성 및 권한 설정
    mkdir -p /tmp/nginx/client_body && \
    mkdir -p /tmp/nginx/proxy && \
    mkdir -p /tmp/nginx/fastcgi && \
    mkdir -p /tmp/nginx/uwsgi && \
    mkdir -p /tmp/nginx/scgi && \
    # 권한 설정
    chown -R appuser:appgroup /tmp/nginx && \
    chown -R appuser:appgroup /var/cache/nginx && \
    chown -R appuser:appgroup /var/log/nginx && \
    chown -R appuser:appgroup /etc/nginx && \
    chmod -R 755 /usr/share/nginx/html

# 비root 사용자로 전환
USER appuser

# 임시 디렉토리 경로 설정
ENV NGINX_ENTRYPOINT_QUIET_LOGS=1
ENV TEMP=/tmp
ENV TMP=/tmp
ENV TMPDIR=/tmp

# 필요한 포트만 노출
EXPOSE 8080

# Nginx 실행 (임시 디렉토리 사용)
CMD ["nginx", "-g", "daemon off;"]