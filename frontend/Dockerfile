# ==================================
# Dockerfile para Frontend Microservice
# ==================================
#
# Este Dockerfile construye una imagen Docker para el microservicio frontend.
# Utiliza un enfoque multi-stage para optimizar el tamaño de la imagen.

# Etapa 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias (usar npm install ya que no hay package-lock.json)
RUN npm install && \
    npm cache clean --force

# Copiar código fuente
COPY src ./src
COPY public ./public

# Compilar TypeScript
RUN npm run build

# Etapa 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Copiar package.json primero
COPY package*.json ./

# Instalar SOLO dependencias de producción en runtime
RUN npm install --omit=dev && \
    npm cache clean --force

# Copiar archivos compilados desde el builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Exponer puerto del frontend
EXPOSE 3000

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Usuario no-root por seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

# Comando de inicio
CMD ["node", "dist/server.js"]

# Metadata
LABEL maintainer="Sistema Monitoreo Minero"
LABEL description="Frontend Microservice - Sistema de Monitoreo Minero"
LABEL version="1.0.0"
