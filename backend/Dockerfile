# ============================================
# STAGE 1: DEPENDENCIES
# ============================================
FROM node:18-alpine AS deps

WORKDIR /build

# Solo archivos de dependencias (capa cacheable)
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci

# ============================================
# STAGE 2: BUILDER (Compilación + Grunt)
# ============================================
FROM node:18-alpine AS builder

WORKDIR /build

# Copiar node_modules del stage anterior
COPY --from=deps /build/node_modules ./node_modules

# Copiar archivos de configuración
COPY package.json ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY jest.config.js ./
COPY Gruntfile.js ./

# Copiar código fuente (Clean Architecture intacta)
COPY aplicacion/ ./aplicacion/
COPY presentacion/ ./presentacion/
COPY app.ts ./

# Compilar con Grunt SIN tests (esto genera /dist)
RUN npx grunt build:docker

# Verificar que dist/ se generó
RUN ls -la dist/

# ============================================
# STAGE 3: PRODUCTION (Imagen final)
# ============================================
FROM node:18-alpine AS production

# Metadata
LABEL maintainer="sistema-monitoreo@example.com"
LABEL version="1.0.0"
LABEL description="Sistema de Monitoreo Minero - Clean Architecture"

# Variables de entorno
ENV NODE_ENV=production \
    PORT=4000

# Crear usuario no-root (seguridad)
RUN addgroup -g 1001 appgroup && \
    adduser -D -u 1001 -G appgroup appuser

WORKDIR /usr/src/app

# Copiar solo package.json para instalar deps de producción
COPY --chown=appuser:appgroup package.json package-lock.json ./

# Instalar SOLO dependencias de producción
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar SOLO el código compilado desde /dist
COPY --from=builder --chown=appuser:appgroup /build/dist ./

# Verificar estructura final
RUN ls -la

# Cambiar a usuario no-root
USER appuser

# Exponer puerto 4000 (Backend API)
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Ejecutar aplicación compilada
CMD ["node", "app.js"]
