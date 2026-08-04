# ── Stage 1: Backend ─────────────────────────────────
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./

# ── Stage 2: Frontend ────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build:docker

# ── Stage 3: Runtime ─────────────────────────────────
FROM node:20-alpine
RUN apk add --no-cache nginx

COPY --from=backend-builder /app/backend /app/backend
COPY --from=frontend-builder /usr/share/nginx/html /usr/share/nginx/html

RUN printf 'server {\n\
  listen 80;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / { try_files $uri $uri/ /index.html; }\n\
  location /api/ {\n\
    proxy_pass http://127.0.0.1:5000;\n\
    proxy_set_header Host $host;\n\
    proxy_set_header X-Real-IP $remote_addr;\n\
    proxy_connect_timeout 30s;\n\
    proxy_read_timeout 30s;\n\
  }\n\
}\n' > /etc/nginx/http.d/default.conf

EXPOSE 80 5000
CMD sh -c "cd /app/backend && node server.js & sleep 3 && nginx -g 'daemon off;'"
