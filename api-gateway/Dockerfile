# ==================================
# Dockerfile - API Gateway (NGINX)
# ==================================
# Imagen base: NGINX Alpine (ligera y segura)

FROM nginx:alpine

# Metadata
LABEL maintainer="Sistema de Monitoreo Minero"
LABEL description="API Gateway con NGINX para arquitectura de microservicios"
LABEL version="1.0.0"

# Copiar configuración de NGINX
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Crear directorios para logs
RUN mkdir -p /var/log/nginx

# Exponer puerto 80 (HTTP)
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Usuario no privilegiado (seguridad)
# NGINX ya ejecuta como nginx:nginx por defecto

# Comando para iniciar NGINX
CMD ["nginx", "-g", "daemon off;"]
