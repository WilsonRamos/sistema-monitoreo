# ==================================
# Script para reconstruir Jenkins con Node.js
# ==================================

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Reconstruyendo Jenkins con Node.js + Docker" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Detener y eliminar el contenedor de Jenkins actual
Write-Host "1. Deteniendo contenedor Jenkins..." -ForegroundColor Yellow
docker stop jenkins-cicd 2>$null
docker rm jenkins-cicd 2>$null

# Reconstruir la imagen de Jenkins
Write-Host "2. Construyendo nueva imagen de Jenkins..." -ForegroundColor Yellow
docker compose build jenkins

# Iniciar Jenkins con la nueva imagen
Write-Host "3. Iniciando Jenkins..." -ForegroundColor Yellow
docker compose up -d jenkins

# Esperar a que Jenkins esté listo
Write-Host "4. Esperando a que Jenkins inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "=========================================" -ForegroundColor Green
Write-Host "✓ Jenkins reconstruido exitosamente" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Accede a: http://localhost:9090/jenkins" -ForegroundColor White
Write-Host ""
Write-Host "Para ver los logs:" -ForegroundColor White
Write-Host "  docker logs -f jenkins-cicd" -ForegroundColor Gray
Write-Host "=========================================" -ForegroundColor Green
