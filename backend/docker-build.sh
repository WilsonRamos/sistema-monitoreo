#!/bin/bash

# ============================================
# Script de Build y Deploy a AWS ECR
# ============================================

set -e  # Salir si hay error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
IMAGE_NAME="sistema-monitoreo"
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-123456789012}"  # Cambiar por tu Account ID
ECR_REPOSITORY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${IMAGE_NAME}"

# Función para logging
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ============================================
# 1. BUILD LOCAL
# ============================================
log_info "Construyendo imagen Docker localmente..."
docker build -t ${IMAGE_NAME}:latest .

if [ $? -eq 0 ]; then
    log_info "✓ Build exitoso"
else
    log_error "✗ Build falló"
    exit 1
fi

# ============================================
# 2. VERIFICAR IMAGEN
# ============================================
log_info "Verificando imagen..."
docker images ${IMAGE_NAME}

IMAGE_SIZE=$(docker images ${IMAGE_NAME}:latest --format "{{.Size}}")
log_info "Tamaño de imagen: ${IMAGE_SIZE}"

# ============================================
# 3. PROBAR LOCALMENTE (OPCIONAL)
# ============================================
read -p "¿Deseas probar la imagen localmente? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Ejecutando contenedor en puerto 3000..."
    docker run -d -p 3000:3000 --name ${IMAGE_NAME}-test ${IMAGE_NAME}:latest
    
    sleep 3
    
    log_info "Probando health endpoint..."
    curl -f http://localhost:3000/health || log_warn "Health check falló"
    
    log_info "Deteniendo contenedor de prueba..."
    docker stop ${IMAGE_NAME}-test
    docker rm ${IMAGE_NAME}-test
fi

# ============================================
# 4. AUTENTICACIÓN AWS ECR
# ============================================
log_info "Autenticando con AWS ECR..."
aws ecr get-login-password --region ${AWS_REGION} | \
    docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

if [ $? -eq 0 ]; then
    log_info "✓ Autenticación exitosa"
else
    log_error "✗ Autenticación falló"
    exit 1
fi

# ============================================
# 5. TAG DE IMAGEN
# ============================================
log_info "Creando tags..."

# Tag latest
docker tag ${IMAGE_NAME}:latest ${ECR_REPOSITORY}:latest
log_info "✓ Tag: latest"

# Tag con versión (timestamp)
VERSION_TAG=$(date +%Y%m%d-%H%M%S)
docker tag ${IMAGE_NAME}:latest ${ECR_REPOSITORY}:${VERSION_TAG}
log_info "✓ Tag: ${VERSION_TAG}"

# Tag con git commit (si existe)
if [ -d .git ]; then
    GIT_COMMIT=$(git rev-parse --short HEAD)
    docker tag ${IMAGE_NAME}:latest ${ECR_REPOSITORY}:git-${GIT_COMMIT}
    log_info "✓ Tag: git-${GIT_COMMIT}"
fi

# ============================================
# 6. PUSH A ECR
# ============================================
log_info "Subiendo imágenes a ECR..."

docker push ${ECR_REPOSITORY}:latest
log_info "✓ Pushed: latest"

docker push ${ECR_REPOSITORY}:${VERSION_TAG}
log_info "✓ Pushed: ${VERSION_TAG}"

if [ -d .git ]; then
    docker push ${ECR_REPOSITORY}:git-${GIT_COMMIT}
    log_info "✓ Pushed: git-${GIT_COMMIT}"
fi

# ============================================
# 7. LIMPIEZA LOCAL (OPCIONAL)
# ============================================
read -p "¿Deseas limpiar imágenes locales? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Limpiando imágenes locales..."
    docker rmi ${IMAGE_NAME}:latest
    docker rmi ${ECR_REPOSITORY}:latest
    docker rmi ${ECR_REPOSITORY}:${VERSION_TAG}
    [ -d .git ] && docker rmi ${ECR_REPOSITORY}:git-${GIT_COMMIT}
fi

# ============================================
# 8. RESUMEN
# ============================================
log_info "======================================"
log_info "DEPLOY COMPLETADO EXITOSAMENTE"
log_info "======================================"
log_info "Repositorio ECR: ${ECR_REPOSITORY}"
log_info "Tags disponibles:"
log_info "  - latest"
log_info "  - ${VERSION_TAG}"
[ -d .git ] && log_info "  - git-${GIT_COMMIT}"
log_info "======================================"
log_info "Para desplegar en ECS/EKS usa:"
log_info "  ${ECR_REPOSITORY}:latest"
log_info "======================================"
