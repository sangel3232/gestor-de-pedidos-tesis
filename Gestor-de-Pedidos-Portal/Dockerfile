# ============================================================
# Dockerfile - Frontend React (Vite)
# Multi-stage: build con Node, serve con Nginx
# ============================================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Argumentos de build para variables de entorno de Vite
ARG VITE_API_BASE_URL=http://localhost:8080
ARG VITE_ENV=dev

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_ENV=$VITE_ENV

COPY package*.json ./
RUN npm ci --silent

COPY . .
RUN npm run build

# Stage 2: Serve con Nginx
FROM nginx:alpine

# Copiar build de Vite
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuracion de Nginx para SPA (React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
