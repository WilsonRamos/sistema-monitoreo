# ============================================
# Script de Build y Deploy a AWS ECR (PowerShell)
# ============================================

param(
    [string]$AwsRegion = "us-east-1",
    [string]$AwsAccountId = "123456789012",  # Cambiar por tu Account ID
    [switch]$SkipTest,
    [switch]$SkipPush
)

$ErrorActionPreference = "Stop"

# Configuración
$IMAGE_NAME = "sistema-monitoreo"
$ECR_REPOSITORY = "$AwsAccountId.dkr.ecr.$AwsRegion.amazonaws.com/$IMAGE_NAME"

# Funciones de logging
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# ============================================
# 1. BUILD LOCAL
# ============================================
Write-Info "Construyendo imagen Docker localmente..."
docker build -t "${IMAGE_NAME}:latest" .

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build falló"
    exit 1
}
Write-Info "✓ Build exitoso"

# ============================================
# 2. VERIFICAR IMAGEN
# ============================================
Write-Info "Verificando imagen..."
docker images $IMAGE_NAME

$imageInfo = docker images "${IMAGE_NAME}:latest" --format "{{.Size}}"
Write-Info "Tamaño de imagen: $imageInfo"

# ============================================
# 3. PROBAR LOCALMENTE (OPCIONAL)
# ============================================
if (-not $SkipTest) {
    $response = Read-Host "¿Deseas probar la imagen localmente? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Info "Ejecutando contenedor en puerto 3000..."
        docker run -d -p 3000:3000 --name "$IMAGE_NAME-test" "${IMAGE_NAME}:latest"
        
        Start-Sleep -Seconds 3
        
        Write-Info "Probando health endpoint..."
        try {
            $result = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 5
            Write-Info "✓ Health check exitoso: $($result.StatusCode)"
        } catch {
            Write-Warn "Health check falló: $_"
        }
        
        Write-Info "Deteniendo contenedor de prueba..."
        docker stop "$IMAGE_NAME-test"
        docker rm "$IMAGE_NAME-test"
    }
}

# ============================================
# 4. AUTENTICACIÓN AWS ECR
# ============================================
if (-not $SkipPush) {
    Write-Info "Autenticando con AWS ECR..."
    
    $password = aws ecr get-login-password --region $AwsRegion
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Error obteniendo password de ECR"
        exit 1
    }
    
    $password | docker login --username AWS --password-stdin "$AwsAccountId.dkr.ecr.$AwsRegion.amazonaws.com"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Autenticación falló"
        exit 1
    }
    Write-Info "✓ Autenticación exitosa"
    
    # ============================================
    # 5. TAG DE IMAGEN
    # ============================================
    Write-Info "Creando tags..."
    
    # Tag latest
    docker tag "${IMAGE_NAME}:latest" "${ECR_REPOSITORY}:latest"
    Write-Info "✓ Tag: latest"
    
    # Tag con versión (timestamp)
    $VERSION_TAG = Get-Date -Format "yyyyMMdd-HHmmss"
    docker tag "${IMAGE_NAME}:latest" "${ECR_REPOSITORY}:${VERSION_TAG}"
    Write-Info "✓ Tag: $VERSION_TAG"
    
    # Tag con git commit (si existe)
    if (Test-Path .git) {
        $GIT_COMMIT = git rev-parse --short HEAD
        docker tag "${IMAGE_NAME}:latest" "${ECR_REPOSITORY}:git-${GIT_COMMIT}"
        Write-Info "✓ Tag: git-$GIT_COMMIT"
    }
    
    # ============================================
    # 6. PUSH A ECR
    # ============================================
    Write-Info "Subiendo imágenes a ECR..."
    
    docker push "${ECR_REPOSITORY}:latest"
    Write-Info "✓ Pushed: latest"
    
    docker push "${ECR_REPOSITORY}:${VERSION_TAG}"
    Write-Info "✓ Pushed: $VERSION_TAG"
    
    if (Test-Path .git) {
        docker push "${ECR_REPOSITORY}:git-${GIT_COMMIT}"
        Write-Info "✓ Pushed: git-$GIT_COMMIT"
    }
    
    # ============================================
    # 7. LIMPIEZA LOCAL (OPCIONAL)
    # ============================================
    $response = Read-Host "¿Deseas limpiar imágenes locales? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Info "Limpiando imágenes locales..."
        docker rmi "${IMAGE_NAME}:latest" -ErrorAction SilentlyContinue
        docker rmi "${ECR_REPOSITORY}:latest" -ErrorAction SilentlyContinue
        docker rmi "${ECR_REPOSITORY}:${VERSION_TAG}" -ErrorAction SilentlyContinue
        if (Test-Path .git) {
            docker rmi "${ECR_REPOSITORY}:git-${GIT_COMMIT}" -ErrorAction SilentlyContinue
        }
    }
    
    # ============================================
    # 8. RESUMEN
    # ============================================
    Write-Info "======================================"
    Write-Info "DEPLOY COMPLETADO EXITOSAMENTE"
    Write-Info "======================================"
    Write-Info "Repositorio ECR: $ECR_REPOSITORY"
    Write-Info "Tags disponibles:"
    Write-Info "  - latest"
    Write-Info "  - $VERSION_TAG"
    if (Test-Path .git) {
        Write-Info "  - git-$GIT_COMMIT"
    }
    Write-Info "======================================"
    Write-Info "Para desplegar en ECS/EKS usa:"
    Write-Info "  ${ECR_REPOSITORY}:latest"
    Write-Info "======================================"
}

Write-Info "Proceso completado"
