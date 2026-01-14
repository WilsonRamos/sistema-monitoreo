#!/bin/bash
# ==================================
# Script para reconstruir Jenkins con Node.js
# ==================================

echo "========================================="
echo "Reconstruyendo Jenkins con Node.js + Docker"
echo "========================================="

# Detener y eliminar el contenedor de Jenkins actual
echo "1. Deteniendo contenedor Jenkins..."
docker stop jenkins-cicd 2>/dev/null || true
docker rm jenkins-cicd 2>/dev/null || true

# Reconstruir la imagen de Jenkins
echo "2. Construyendo nueva imagen de Jenkins..."
docker compose build jenkins

# Iniciar Jenkins con la nueva imagen
echo "3. Iniciando Jenkins..."
docker compose up -d jenkins

# Esperar a que Jenkins esté listo
echo "4. Esperando a que Jenkins inicie..."
sleep 30

echo "========================================="
echo "✓ Jenkins reconstruido exitosamente"
echo "========================================="
echo "Accede a: http://localhost:9090/jenkins"
echo ""
echo "Para ver los logs:"
echo "  docker logs -f jenkins-cicd"
echo "========================================="
