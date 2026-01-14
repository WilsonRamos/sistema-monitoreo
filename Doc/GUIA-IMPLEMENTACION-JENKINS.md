# Guía de Implementación CI/CD con Jenkins

## Sistema de Monitoreo Minero - AWS ECR Integration

---

## 📋 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación de Jenkins](#instalación-de-jenkins)
3. [Configuración de Plugins](#configuración-de-plugins)
4. [Configuración de Credenciales AWS](#configuración-de-credenciales-aws)
5. [Configuración del Job Jenkins](#configuración-del-job-jenkins)
6. [Configuración de Webhooks GitHub](#configuración-de-webhooks-github)
7. [Validación del Pipeline](#validación-del-pipeline)
8. [Troubleshooting](#troubleshooting)

---

## 1. Requisitos Previos

### 1.1 Software Requerido

| Software    | Versión Mínima | Propósito                |
| ----------- | -------------- | ------------------------ |
| **Jenkins** | 2.400+         | CI/CD Server             |
| **Docker**  | 20.10+         | Construcción de imágenes |
| **AWS CLI** | 2.0+           | Autenticación con ECR    |
| **Node.js** | 18.x           | Runtime para tests       |
| **Git**     | 2.30+          | Control de versiones     |

### 1.2 Credenciales AWS

Necesitarás las siguientes credenciales de AWS:

```bash
# Variables requeridas
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012
```

**⚠️ IMPORTANTE**: Nunca commitees estas credenciales al repositorio.

### 1.3 Permisos IAM Requeridos

Tu usuario IAM debe tener los siguientes permisos:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:GetRepositoryPolicy",
        "ecr:DescribeRepositories",
        "ecr:ListImages",
        "ecr:DescribeImages",
        "ecr:BatchGetImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:PutImage",
        "ecr:CreateRepository"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## 2. Instalación de Jenkins

### 2.1 Instalación en Windows

#### Opción A: Instalador MSI (Recomendado)

1. **Descargar Jenkins**:

   ```powershell
   # Abrir PowerShell como Administrador
   Start-Process "https://www.jenkins.io/download/"
   ```

2. **Ejecutar instalador**:

   - Descargar `jenkins.msi` (LTS version)
   - Ejecutar el instalador
   - Seleccionar puerto (default: 8080)
   - Completar wizard de instalación

3. **Iniciar Jenkins**:

   ```powershell
   # Jenkins se instala como servicio de Windows
   Start-Service Jenkins

   # Verificar estado
   Get-Service Jenkins
   ```

4. **Acceder a Jenkins**:
   - Abrir navegador: `http://localhost:8080`
   - Obtener password inicial:
     ```powershell
     Get-Content "C:\Program Files\Jenkins\secrets\initialAdminPassword"
     ```

#### Opción B: Docker (Desarrollo)

```powershell
# Crear volumen persistente
docker volume create jenkins_home

# Ejecutar Jenkins en Docker
docker run -d `
  --name jenkins `
  -p 8080:8080 `
  -p 50000:50000 `
  -v jenkins_home:/var/jenkins_home `
  -v //var/run/docker.sock:/var/run/docker.sock `
  jenkins/jenkins:lts

# Obtener password inicial
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### 2.2 Configuración Inicial

1. **Setup Wizard**:

   - Ingresar password inicial
   - Seleccionar "Install suggested plugins"
   - Esperar instalación (5-10 minutos)

2. **Crear usuario administrador**:

   ```
   Username: admin
   Password: [tu-password-seguro]
   Full name: Jenkins Admin
   Email: admin@tuempresa.com
   ```

3. **Configurar Jenkins URL**:
   ```
   http://localhost:8080/
   ```

---

## 3. Configuración de Plugins

### 3.1 Plugins Esenciales

Navegar a: **Manage Jenkins** > **Manage Plugins** > **Available**

Instalar los siguientes plugins:

#### Plugins de Docker

- ✅ **Docker Pipeline** - Para construir imágenes en pipeline
- ✅ **Docker** - Integración Docker general
- ✅ **CloudBees Docker Build and Publish** - Publicar a registries

#### Plugins de AWS

- ✅ **Amazon ECR** - Integración con AWS ECR
- ✅ **AWS Credentials** - Manejo de credenciales AWS

#### Plugins de Git/SCM

- ✅ **Git** - Integración Git (ya incluido)
- ✅ **GitHub** - Webhooks y PRs de GitHub
- ✅ **GitHub Pull Request Builder** - Triggers en PRs

#### Plugins de Testing

- ✅ **JUnit** - Reportes de tests
- ✅ **HTML Publisher** - Publicar reportes de cobertura
- ✅ **Cobertura** - Visualización de cobertura

#### Plugins de Utilidad

- ✅ **Pipeline** - Pipeline como código (ya incluido)
- ✅ **Credentials Binding** - Inyectar credenciales en builds
- ✅ **Workspace Cleanup** - Limpiar workspace

### 3.2 Instalación de Plugins

```groovy
// Alternativamente, instalar via Groovy Script Console
// Manage Jenkins > Script Console

def plugins = [
    'docker-workflow',
    'docker-plugin',
    'amazon-ecr',
    'aws-credentials',
    'github',
    'ghprb',
    'junit',
    'htmlpublisher',
    'cobertura',
    'ws-cleanup'
]

def instance = Jenkins.getInstance()
def pm = instance.getPluginManager()
def uc = instance.getUpdateCenter()

plugins.each { pluginName ->
    if (!pm.getPlugin(pluginName)) {
        def plugin = uc.getPlugin(pluginName)
        if (plugin) {
            plugin.deploy()
            println("Instalando: ${pluginName}")
        }
    }
}

instance.save()
println("Plugins instalados. Reiniciar Jenkins.")
```

### 3.3 Reiniciar Jenkins

```powershell
# Windows (como Administrador)
Restart-Service Jenkins

# Docker
docker restart jenkins

# Via Web UI
# Navegar a: http://localhost:8080/safeRestart
```

---

## 4. Configuración de Credenciales AWS

### 4.1 Agregar Credenciales de AWS

1. **Navegar a Credentials**:

   ```
   Manage Jenkins > Manage Credentials > (global) > Add Credentials
   ```

2. **Configurar AWS Access Key**:

   ```
   Kind: Username with password
   Scope: Global
   Username: [AWS_ACCESS_KEY_ID]
   Password: [AWS_SECRET_ACCESS_KEY]
   ID: aws-ecr-credentials
   Description: AWS ECR Credentials
   ```

   Click **OK**

3. **Agregar AWS Account ID**:

   ```
   Manage Jenkins > Manage Credentials > (global) > Add Credentials

   Kind: Secret text
   Scope: Global
   Secret: [AWS_ACCOUNT_ID]
   ID: aws-account-id
   Description: AWS Account ID
   ```

### 4.2 Instalar AWS CLI en Jenkins

#### En Jenkins Server (Windows)

```powershell
# Descargar e instalar AWS CLI
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# Verificar instalación
aws --version

# Configurar en Jenkins
# Manage Jenkins > Global Tool Configuration > Add AWS CLI
```

#### En Jenkins Docker

```dockerfile
# Crear Dockerfile custom
FROM jenkins/jenkins:lts

USER root

# Instalar AWS CLI
RUN apt-get update && \
    apt-get install -y awscli && \
    rm -rf /var/lib/apt/lists/*

# Instalar Docker CLI
RUN apt-get update && \
    apt-get install -y docker.io && \
    usermod -aG docker jenkins

USER jenkins
```

Construir y ejecutar:

```powershell
docker build -t jenkins-aws .
docker run -d `
  --name jenkins `
  -p 8080:8080 `
  -p 50000:50000 `
  -v jenkins_home:/var/jenkins_home `
  -v //var/run/docker.sock:/var/run/docker.sock `
  jenkins-aws
```

---

## 5. Configuración del Job Jenkins

### 5.1 Crear Pipeline Job

1. **Crear nuevo Item**:

   ```
   Jenkins Dashboard > New Item
   Name: sistema-monitoreo-pipeline
   Type: Pipeline
   Click OK
   ```

2. **Configurar General**:

   ```
   Description: CI/CD Pipeline para Sistema de Monitoreo Minero
   ✅ GitHub project: https://github.com/tu-usuario/sistema-monitoreo
   ✅ Discard old builds: Keep last 10 builds
   ```

3. **Configurar Build Triggers**:
   ```
   ✅ GitHub hook trigger for GITScm polling
   ```

### 5.2 Configurar Pipeline from SCM

1. **Pipeline Definition**:

   ```
   Definition: Pipeline script from SCM
   SCM: Git
   ```

2. **Repository Configuration**:

   ```
   Repository URL: https://github.com/tu-usuario/sistema-monitoreo.git
   Credentials: [Add GitHub token]
   Branch Specifier: */main
   ```

3. **Script Path**:
   ```
   Script Path: Jenkinsfile
   ```

### 5.3 Configurar GitHub Credentials

Si tu repositorio es privado:

1. **Generar Personal Access Token en GitHub**:

   ```
   GitHub > Settings > Developer settings > Personal access tokens > Generate new token

   Scopes:
   ✅ repo (Full control)
   ✅ admin:repo_hook (Webhooks)
   ```

2. **Agregar Token a Jenkins**:

   ```
   Manage Jenkins > Manage Credentials > Add Credentials

   Kind: Username with password
   Username: [tu-usuario-github]
   Password: [token-generado]
   ID: github-token
   Description: GitHub Access Token
   ```

---

## 6. Configuración de Webhooks GitHub

### 6.1 Obtener Jenkins Webhook URL

Tu webhook URL será:

```
http://[JENKINS_URL]/github-webhook/

# Ejemplo:
http://jenkins.tuempresa.com:8080/github-webhook/
```

### 6.2 Configurar Webhook en GitHub

1. **Navegar a Settings**:

   ```
   GitHub Repository > Settings > Webhooks > Add webhook
   ```

2. **Configurar Webhook**:

   ```
   Payload URL: http://[JENKINS_URL]/github-webhook/
   Content type: application/json
   Secret: [opcional, dejar vacío]

   Which events would you like to trigger this webhook?
   ✅ Just the push event
   ✅ Pull requests

   ✅ Active
   ```

3. **Guardar**:
   - Click **Add webhook**
   - Verificar que aparezca checkmark verde

### 6.3 Configurar Triggers en Jenkinsfile

El Jenkinsfile ya incluye:

```groovy
triggers {
    githubPullRequests(
        triggerMode: 'CRON',
        spec: 'H/5 * * * *'
    )
}
```

Esto ejecutará el pipeline:

- En cada **push** a ramas configuradas
- En cada **Pull Request** (cada 5 minutos revisa)

---

## 7. Validación del Pipeline

### 7.1 Test Manual del Pipeline

1. **Ejecutar Build Manual**:

   ```
   Jenkins > sistema-monitoreo-pipeline > Build Now
   ```

2. **Monitorear Console Output**:
   - Click en el build (#1)
   - Click en "Console Output"
   - Verificar que todos los stages pasen

### 7.2 Verificar Stages

El pipeline debe ejecutar los siguientes stages:

```
✅ Stage 1: Checkout
✅ Stage 2: Análisis Estático
    ✅ Lint Backend
    ✅ Lint Servicio Monitoreo
    ✅ Lint Servicio Operaciones
✅ Stage 3: Pruebas Unitarias
    ✅ Tests Backend
    ✅ Tests Servicio Monitoreo
    ✅ Tests Servicio Operaciones
✅ Stage 4: Build Docker Images
    ✅ Build Backend
    ✅ Build Servicio Monitoreo
    ✅ Build Servicio Operaciones
    ✅ Build Frontend
    ✅ Build API Gateway
✅ Stage 5: Push to AWS ECR
✅ Stage 6: Cleanup
```

### 7.3 Verificar Imágenes en ECR

```powershell
# Listar repositorios
aws ecr describe-repositories --region us-east-1

# Listar imágenes de un servicio
aws ecr list-images `
  --repository-name backend `
  --region us-east-1

# Verificar tags
aws ecr describe-images `
  --repository-name backend `
  --region us-east-1
```

Deberías ver:

```json
{
  "imageDetails": [
    {
      "imageTags": ["main-a1b2c3d-123", "latest"],
      "imageSizeInBytes": 450000000,
      "imagePushedAt": "2025-01-XX"
    }
  ]
}
```

### 7.4 Test de Push Event

1. **Hacer cambio en código**:

   ```powershell
   cd c:\Users\bug\Desktop\Wilson\sistema-monitoreo

   # Hacer cambio mínimo
   echo "# Test CI/CD" >> README.md

   git add README.md
   git commit -m "test: Validar pipeline CI/CD"
   git push origin main
   ```

2. **Verificar trigger automático**:
   - Ir a Jenkins Dashboard
   - El build debe iniciarse automáticamente
   - Verificar en Console Output que fue triggered by GitHub push

### 7.5 Test de Pull Request

1. **Crear rama y PR**:

   ```powershell
   git checkout -b feature/test-cicd

   echo "# Feature test" >> README.md
   git add README.md
   git commit -m "feat: Test PR trigger"
   git push origin feature/test-cicd
   ```

2. **Crear PR en GitHub**:

   - Ir a GitHub repository
   - Crear Pull Request de `feature/test-cicd` → `main`
   - El pipeline debe ejecutarse automáticamente

3. **Verificar status en PR**:
   - GitHub mostrará status check de Jenkins
   - ✅ Green checkmark si todo pasa
   - ❌ Red X si hay fallos

---

## 8. Troubleshooting

### 8.1 Problemas Comunes

#### Error: "Cannot connect to Docker daemon"

**Síntoma**:

```
Cannot connect to the Docker daemon at unix:///var/run/docker.sock
```

**Solución**:

```powershell
# En Jenkins Server Windows
# Asegurarse de que Docker Desktop está corriendo
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Verificar
docker ps

# En Jenkins Docker
# Montar socket correctamente
docker run -v //var/run/docker.sock:/var/run/docker.sock ...
```

#### Error: "AWS CLI not found"

**Síntoma**:

```
aws: command not found
```

**Solución**:

```groovy
// Agregar al Jenkinsfile
environment {
    PATH = "/usr/local/bin:${env.PATH}"
}

// O instalar AWS CLI en el agente
sh 'apt-get update && apt-get install -y awscli'
```

#### Error: "Authentication failed for ECR"

**Síntoma**:

```
Error response from daemon: Get https://123456789012.dkr.ecr.us-east-1.amazonaws.com/v2/
```

**Solución**:

```powershell
# Verificar credenciales
aws ecr get-login-password --region us-east-1

# Verificar permisos IAM
aws iam list-attached-user-policies --user-name jenkins-user

# Re-agregar credenciales en Jenkins
# Manage Jenkins > Manage Credentials > Update aws-ecr-credentials
```

#### Error: "Coverage threshold not met"

**Síntoma**:

```
❌ Cobertura insuficiente: 65% < 70%
```

**Solución**:

```bash
# Opción 1: Aumentar cobertura escribiendo más tests
cd backend
npm run test:coverage

# Opción 2: Ajustar threshold temporalmente (NO RECOMENDADO)
# Editar jest.config.js
coverageThreshold: {
  global: {
    lines: 60  // Reducir temporalmente
  }
}
```

### 8.2 Logs y Diagnóstico

#### Ver logs de Jenkins

```powershell
# Windows
Get-Content "C:\Program Files\Jenkins\jenkins.log" -Tail 50

# Docker
docker logs jenkins --tail 50 --follow
```

#### Debug de Pipeline

Agregar statements de debug en Jenkinsfile:

```groovy
stage('Debug') {
    steps {
        script {
            echo "=== ENVIRONMENT VARIABLES ==="
            sh 'printenv | sort'

            echo "=== DOCKER INFO ==="
            sh 'docker info'

            echo "=== AWS CLI VERSION ==="
            sh 'aws --version'

            echo "=== DISK SPACE ==="
            sh 'df -h'
        }
    }
}
```

#### Verificar Webhooks

```powershell
# Ver eventos recientes en GitHub
# GitHub > Settings > Webhooks > [tu webhook] > Recent Deliveries

# Buscar:
# - Status Code: 200 (OK)
# - Response: {"status": "ok"}
```

### 8.3 Optimización del Pipeline

#### Cachear dependencias npm

Agregar al Jenkinsfile:

```groovy
stage('Install Dependencies') {
    steps {
        dir('backend') {
            script {
                // Usar cache si package-lock.json no cambió
                def cacheKey = sh(
                    script: "md5sum package-lock.json | cut -d' ' -f1",
                    returnStdout: true
                ).trim()

                def cacheDir = "/tmp/npm-cache-${cacheKey}"

                if (fileExists(cacheDir)) {
                    echo "Usando cache de dependencias"
                    sh "cp -r ${cacheDir}/node_modules ."
                } else {
                    echo "Instalando dependencias"
                    sh 'npm ci'
                    sh "mkdir -p ${cacheDir}"
                    sh "cp -r node_modules ${cacheDir}/"
                }
            }
        }
    }
}
```

#### Paralelizar builds de Docker

El Jenkinsfile ya incluye paralelización:

```groovy
stage('Build Docker Images') {
    parallel {
        stage('Build Backend') { ... }
        stage('Build Monitoreo') { ... }
        stage('Build Operaciones') { ... }
        // Todos se ejecutan simultáneamente
    }
}
```

#### Usar Docker Layer Caching

```groovy
stage('Build Backend') {
    steps {
        script {
            // Usar --cache-from
            sh """
                docker pull ${ECR_REGISTRY}/backend:latest || true
                docker build \
                  --cache-from ${ECR_REGISTRY}/backend:latest \
                  -t backend:${BUILD_TAG} \
                  backend/
            """
        }
    }
}
```

---

## 9. Próximos Pasos

### 9.1 Mejoras Recomendadas

1. **Agregar Notificaciones**:

   ```groovy
   post {
       failure {
           emailext(
               subject: "Pipeline Falló: ${env.JOB_NAME}",
               body: "Ver detalles en ${env.BUILD_URL}",
               to: "team@tuempresa.com"
           )
       }
   }
   ```

2. **Integrar SonarQube**:

   ```groovy
   stage('Quality Gate') {
       steps {
           withSonarQubeEnv('SonarQube') {
               sh 'mvn sonar:sonar'
           }
       }
   }
   ```

3. **Deploy Automático**:
   ```groovy
   stage('Deploy to ECS') {
       when {
           branch 'main'
       }
       steps {
           sh '''
               aws ecs update-service \
                 --cluster sistema-monitoreo \
                 --service backend \
                 --force-new-deployment
           '''
       }
   }
   ```

### 9.2 Monitoreo del Pipeline

- Configurar **Blue Ocean** para mejor visualización
- Implementar **Pipeline Dashboard** para métricas
- Configurar **Datadog/Prometheus** para alertas

---

## 📚 Referencias

- [Jenkins Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [AWS ECR Documentation](https://docs.aws.amazon.com/ecr/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [GitHub Webhooks](https://docs.github.com/en/webhooks)

---

**Documento generado**: 2025-01-XX  
**Versión**: 1.0  
**Autor**: DevOps Team  
**Próxima revisión**: 2025-02-XX
