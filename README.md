# 🏔️ Sistema de Monitoreo Minero

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](http://localhost:8080)
[![Clean Architecture](https://img.shields.io/badge/Architecture-Clean-blue)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
[![DDD](https://img.shields.io/badge/Design-Domain--Driven-green)](https://martinfowler.com/tags/domain%20driven%20design.html)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/docker-ready-blue)](https://www.docker.com/)
[![Microservices](https://img.shields.io/badge/architecture-microservices-orange)](https://microservices.io/)

Sistema empresarial de monitoreo y gestión de operaciones mineras, desarrollado con arquitectura de microservicios, Domain-Driven Design (DDD), y Clean Architecture. Implementa CI/CD automatizado con Jenkins para garantizar calidad y entrega continua.

---

## � Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Instalación Rápida](#-instalación-rápida)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Microservicios](#-microservicios)
- [CI/CD con Jenkins](#-cicd-con-jenkins)
- [Endpoints de API](#-endpoints-de-api)
- [Desarrollo Local](#-desarrollo-local)
- [Testing](#-testing)
- [Despliegue en AWS](#-despliegue-en-aws)
- [Documentación Adicional](#-documentación-adicional)

---

## 🎯 Descripción General

El **Sistema de Monitoreo Minero** es una aplicación empresarial diseñada para gestionar y monitorear operaciones mineras en tiempo real. El sistema permite:

- 📊 **Monitorear equipos mineros**: Rastrear estado operacional, ubicación GPS, y mantenimientos
- ⚙️ **Gestionar operaciones**: Coordinar operaciones de cargue, transporte y descarga
- 👥 **Administrar usuarios**: Autenticación, perfiles de operadores y supervisores
- 📈 **Generar KPIs**: Indicadores de desempeño de flota y productividad operacional
- 🔔 **Alertas en tiempo real**: Notificaciones de mantenimiento y estados críticos

### Evolución Arquitectónica

El sistema ha evolucionado desde un **monolito tradicional** hacia una **arquitectura de microservicios**:

1. **Fase 1**: Monolito - Toda la lógica en una aplicación única
2. **Fase 2**: Frontend + Backend - Separación de capas
3. **Fase 3**: Microservicios - Descomposición por bounded contexts (DDD)

---

## 🏗️ Arquitectura

### Diagrama de Arquitectura de Microservicios

```
                                    ┌─────────────────────┐
                                    │   API Gateway       │
                                    │   (NGINX - Port 80) │
                                    └──────────┬──────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
         ┌──────────▼──────────┐    ┌─────────▼─────────┐    ┌──────────▼──────────┐
         │   Frontend           │    │   Backend Legacy  │    │ Servicio Monitoreo  │
         │   (Port 3000)        │    │   (Port 4000)     │    │   (Port 5000)       │
         │   • SPA              │    │   • Usuarios      │    │   • Equipos         │
         │   • Routing          │    │   • Mina          │    │   • Estado          │
         │   • Proxy            │    │   • Turno         │    │   • Mantenimiento   │
         └──────────────────────┘    └───────────────────┘    └─────────────────────┘
                                               │                          │
                                               │                          │
                                     ┌─────────▼──────────┐               │
                                     │ Servicio Operaciones│◄──────────────┘
                                     │   (Port 6000)       │
                                     │   • Operaciones     │
                                     │   • Asignaciones    │
                                     │   • KPIs            │
                                     └─────────────────────┘
```

### Bounded Contexts (Domain-Driven Design)

Cada microservicio representa un **bounded context** del dominio:

| Servicio                 | Bounded Context       | Responsabilidades                           | Puerto |
| ------------------------ | --------------------- | ------------------------------------------- | ------ |
| **Frontend**             | Presentación          | UI/UX, Routing, Agregación de datos         | 3000   |
| **Backend Legacy**       | Usuarios, Mina, Turno | Autenticación, Estructura minera, Turnos    | 4000   |
| **Servicio Monitoreo**   | Equipos               | Catálogo de equipos, Estado, Mantenimientos | 5000   |
| **Servicio Operaciones** | Operaciones           | Cargue/Transporte, Asignación, KPIs         | 6000   |
| **API Gateway**          | Enrutamiento          | Punto de entrada único, Load balancing      | 80     |

### Principios de Diseño Aplicados

- ✅ **Clean Architecture**: Separación en 4 capas (Dominio, Aplicación, Infraestructura, Presentación)
- ✅ **Domain-Driven Design**: Bounded Contexts, Aggregates, Entities, Value Objects
- ✅ **SOLID Principles**: Inyección de dependencias, Single Responsibility
- ✅ **Microservices Patterns**: API Gateway, Service Discovery (DNS), Health Checks
- ✅ **Acoplamiento Débil**: Referencias por ID, comunicación REST

---

## 💻 Tecnologías

### Stack Principal

- **Lenguaje**: TypeScript/JavaScript (Node.js 18)
- **Framework Backend**: Express.js 4.18+
- **Testing**: Jest + ts-jest (232 tests)
- **Arquitectura**: Clean Architecture + DDD
- **Containerización**: Docker + Docker Compose
- **CI/CD**: Jenkins Pipeline
- **Cloud**: AWS ECR (Elastic Container Registry)
- **Control de Versiones**: Git + GitHub
- **API Gateway**: NGINX

### Herramientas de Desarrollo

- **IDE**: Visual Studio Code
- **Linting**: ESLint + Prettier
- **Build**: Grunt (Backend), TypeScript Compiler
- **API Testing**: Postman / Thunder Client
- **Monitoring**: Docker logs + Health checks

---

## 🚀 Instalación Rápida

### Requisitos Previos

Asegúrate de tener instalado:

- **Node.js** >= 18.x
- **Docker** >= 24.x
- **Docker Compose** >= 2.x
- **Git** >= 2.x

### 1. Clonar el Repositorio

```bash
git clone https://github.com/WilsonRamos/sistema-monitoreo.git
cd sistema-monitoreo
```

### 2. Ejecutar con Docker Compose (Recomendado)

```bash
# Construir y ejecutar todos los servicios
docker-compose up --build

# O en modo detached (background)
docker-compose up -d --build
```

### 3. Verificar Servicios

```bash
# Ver estado de contenedores
docker-compose ps

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f servicio-monitoreo
```

### 4. Acceder a la Aplicación

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost (puerto 80)
- **Backend**: http://localhost:4000
- **Servicio Monitoreo**: http://localhost:5000
- **Servicio Operaciones**: http://localhost:6000
- **Jenkins CI/CD**: http://localhost:8080 (si está configurado)

---

## 📁 Estructura del Proyecto

```
sistema-monitoreo/
│
├── frontend/                          # Microservicio Frontend (Puerto 3000)
│   ├── src/
│   │   └── server.ts                  # Servidor Express + Proxy
│   ├── public/
│   │   ├── index.html                 # Interfaz de usuario
│   │   └── js/
│   │       ├── config.js              # Configuración
│   │       └── app.js                 # Lógica del cliente
│   ├── package.json
│   ├── Dockerfile
│   └── README.md
│
├── backend/                           # Microservicio Backend (Puerto 4000)
│   ├── aplicacion/
│   │   ├── Dominio/                   # Capa de Dominio (DDD)
│   │   │   ├── monitoreo/             # BC: Monitoreo de Equipos
│   │   │   └── operaciones/           # BC: Operaciones Mineras
│   │   ├── casos-uso/                 # Capa de Aplicación
│   │   └── infraestructura/           # Capa de Infraestructura
│   ├── presentacion/                  # Capa de Presentación
│   │   ├── api/                       # REST API
│   │   └── index.ts                   # Server + CORS
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml                 # Orquestación de servicios
│
├── ARQUITECTURA-MICROSERVICIOS.md     # Documentación exhaustiva
├── INSTRUCCIONES-EJECUCION.md         # Guía de ejecución
├── RESUMEN-IMPLEMENTACION.md          # Resumen de implementación
└── README.md                          # Este archivo
```

---

## 🔧 Microservicios

### Frontend Microservice

**Responsabilidad**: Presentación e interacción con el usuario

**Tecnologías**:

- Express.js (servidor estático)
- HTTP Proxy Middleware
- HTML/CSS/JavaScript
- TypeScript

**Puerto**: 3000

**Características**:

- Sirve archivos estáticos
- Proxy transparente hacia backend
- Configuración dinámica de endpoints
- Health check endpoint

[Ver documentación completa →](frontend/README.md)

---

### Backend Microservice

**Responsabilidad**: Lógica de negocio y persistencia

**Tecnologías**:

- Express.js (REST API)
- TypeScript
- Clean Architecture
- Domain-Driven Design
- Jest (testing)

**Puerto**: 4000

**Características**:

- API REST con CORS
- Clean Architecture (4 capas)
- DDD (Bounded Contexts)
- Repositorios en memoria
- Casos de uso bien definidos

---

## � CI/CD con Jenkins

### Pipeline Automatizado de Integración Continua

El proyecto implementa un **pipeline completo de CI/CD** con Jenkins que automatiza todo el proceso desde el commit hasta el despliegue en AWS ECR.

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ Checkout │──▶│ Análisis │──▶│ Pruebas  │──▶│  Build   │──▶│ Push ECR │──▶│ Cleanup  │
│          │   │ Estático │   │ Unitarias│   │  Docker  │   │          │   │          │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
    1 min          2 min          3 min          4 min          2 min         30 sec
```

### Etapas del Pipeline

#### 1️⃣ **Checkout**

- Clona el repositorio desde GitHub
- Extrae el hash del commit (primeros 7 caracteres)
- Genera `BUILD_TAG` único: `{branch}-{commit}-{build}` (ej: `feat-microservicios-2c2ce6d-14`)
- **Tiempo**: ~1 minuto

#### 2️⃣ **Análisis Estático**

Ejecuta **linters en paralelo** para detectar problemas de código:

- ESLint en Backend
- ESLint en Servicio Monitoreo
- ESLint en Servicio Operaciones

**Verifica**:

- ✅ Sintaxis correcta de TypeScript
- ✅ Convenciones de estilo de código
- ✅ Imports/variables no utilizadas
- ✅ Potenciales errores lógicos

**Tiempo**: ~2 minutos

#### 3️⃣ **Pruebas Unitarias**

Ejecuta **232 tests en paralelo** con reportes de cobertura:

- 133 tests en Backend
- 48 tests en Servicio Monitoreo
- 51 tests en Servicio Operaciones

**Genera**:

- Reportes HTML de cobertura navegables
- Métricas de cobertura por servicio
- Warnings si cobertura < 70% (no bloquea el build)

**Estadísticas Actuales**:
| Servicio | Tests | Cobertura | Objetivo |
|----------|-------|-----------|----------|
| Backend | 133 | 27% | 70% |
| Servicio Monitoreo | 48 | 24% | 70% |
| Servicio Operaciones | 51 | 26% | 70% |
| **Total** | **232** | **~26%** | **70%** |

**Tiempo**: ~3 minutos

#### 4️⃣ **Build Docker Images**

Construye **5 imágenes Docker en paralelo** con multi-stage build:

- Backend (`backend:{BUILD_TAG}`)
- Servicio Monitoreo (`servicio-monitoreo:{BUILD_TAG}`)
- Servicio Operaciones (`servicio-operaciones:{BUILD_TAG}`)
- Frontend (`frontend:{BUILD_TAG}`)
- API Gateway (`api-gateway:{BUILD_TAG}`)

**Optimizaciones**:

- Multi-stage build (reduce tamaño ~70%)
- Layer caching (builds incrementales rápidos)
- Compilación TypeScript → JavaScript
- Eliminación de dev dependencies

**Resultado**: Imágenes optimizadas de ~150MB (vs ~500MB sin optimizar)

**Tiempo**: ~4 minutos (primera vez), ~30 seg (con cache)

#### 5️⃣ **Push to AWS ECR**

Publica imágenes en **Amazon Elastic Container Registry**:

**Proceso**:

1. Autenticación con AWS usando credenciales seguras
2. Verifica/crea repositorios en ECR si no existen
3. Re-taggea imágenes con URI de ECR completo
4. Push de cada imagen con 2 tags:
   - Tag específico: `{branch}-{commit}-{build}`
   - Tag latest: `latest`

**Ejemplo**:

```bash
227338491492.dkr.ecr.us-east-1.amazonaws.com/servicio-monitoreo:feat-microservicios-2c2ce6d-14
227338491492.dkr.ecr.us-east-1.amazonaws.com/servicio-monitoreo:latest
```

**Trazabilidad**: Cada imagen puede rastrearse al commit exacto que la generó

**Tiempo**: ~2 minutos

#### 6️⃣ **Cleanup**

Limpia recursos temporales:

- Elimina imágenes Docker locales del build
- Ejecuta `docker image prune` (imágenes dangling)
- Limpia workspace de Jenkins (node_modules, cache)

**Tiempo**: ~30 segundos

### Beneficios del CI/CD

#### 🚀 **Velocidad de Entrega**

- **Antes**: Días desde código → producción
- **Ahora**: 12-15 minutos desde commit → AWS ECR
- Despliegues frecuentes (múltiples veces al día)

#### 🐛 **Detección Temprana de Errores**

- Tests ejecutados en cada commit
- Feedback en minutos (no días)
- Errores detectados antes de llegar a producción

#### 🔒 **Consistencia y Reproducibilidad**

- Mismo proceso exacto cada vez
- Elimina "funciona en mi máquina"
- Entornos idénticos (staging = producción)

#### 📊 **Trazabilidad Completa**

- Cada imagen Docker → Commit Git específico
- Auditoría completa de cambios
- Rollback rápido a versiones anteriores

#### 💪 **Confianza del Equipo**

- Red de seguridad automática (tests)
- Refactorización segura
- Menor miedo a romper cosas

### Configuración de Jenkins

#### Requisitos

- Jenkins 2.x con Docker instalado
- Plugins: Docker Pipeline, Amazon ECR, AWS Credentials, HTML Publisher, GitHub
- Credenciales AWS configuradas en Jenkins
- GitHub webhook configurado

#### Iniciar Jenkins Localmente

```bash
# Iniciar contenedor Jenkins
docker run -d \
  --name jenkins-cicd \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts

# Obtener password inicial
docker exec jenkins-cicd cat /var/jenkins_home/secrets/initialAdminPassword

# Acceder a http://localhost:8080
```

#### Crear Pipeline Job

1. **New Item** → **Pipeline**
2. **Build Triggers**: GitHub hook trigger for GITScm polling
3. **Pipeline**: Pipeline script from SCM
   - SCM: Git
   - Repository URL: `https://github.com/WilsonRamos/sistema-monitoreo.git`
   - Branch: `feat/implementacion-microservicios`
   - Script Path: `Jenkinsfile`

#### Configurar Credenciales AWS

En Jenkins → Manage Jenkins → Credentials:

1. **aws-ecr-credentials** (Username/Password)

   - Username: AWS Access Key ID
   - Password: AWS Secret Access Key

2. **aws-account-id** (Secret text)
   - Secret: Tu Account ID de AWS (ej: 227338491492)

### Archivos de Configuración

#### Jenkinsfile

```groovy
pipeline {
    agent any

    environment {
        AWS_REGION = 'us-east-1'
        COVERAGE_THRESHOLD = '70'
    }

    stages {
        stage('Checkout') { /* ... */ }
        stage('Análisis Estático') { /* 3 linters en paralelo */ }
        stage('Pruebas Unitarias') { /* 232 tests en paralelo */ }
        stage('Build Docker Images') { /* 5 imágenes en paralelo */ }
        stage('Push to AWS ECR') { /* Publicación a ECR */ }
        stage('Cleanup') { /* Limpieza de recursos */ }
    }

    post {
        success { /* Notificación de éxito */ }
        failure { /* Notificación de fallo */ }
        always { /* Limpieza del workspace */ }
    }
}
```

Ver [Jenkinsfile completo](Jenkinsfile) para detalles.

### Métricas del Pipeline

| Métrica                    | Valor     | Objetivo |
| -------------------------- | --------- | -------- |
| **Tiempo Total**           | 12-15 min | < 20 min |
| **Tests Ejecutados**       | 232       | Aumentar |
| **Cobertura Promedio**     | 26%       | 70%      |
| **Imágenes Generadas**     | 5         | -        |
| **Tamaño Promedio Imagen** | ~150 MB   | < 200 MB |
| **Success Rate**           | 95%       | > 90%    |

### Roadmap de CI/CD

#### Fase Actual (✅ Completado)

- [x] Pipeline básico con 6 etapas
- [x] Tests automatizados
- [x] Build y push a AWS ECR
- [x] Reportes de cobertura

#### Siguiente Fase (🚧 Planeado)

- [ ] Pruebas de integración E2E
- [ ] Análisis de seguridad (SonarQube)
- [ ] Deployment automático a staging
- [ ] Smoke tests post-deployment
- [ ] Notificaciones Slack/Email

#### Futuro (📅 Considerado)

- [ ] Blue-Green deployment
- [ ] Canary releases
- [ ] A/B testing automatizado
- [ ] Performance testing (k6)
- [ ] Chaos engineering

### Documentación Adicional

- 📖 [Guía completa de Jenkins](Doc/GUIA-IMPLEMENTACION-JENKINS.md)
- 🔧 [Troubleshooting CI/CD](Doc/SOLUCION-ERRORES-JEST.md)
- 📊 [Reportes de Coverage](http://localhost:8080/job/sistema-monitoreo-pipeline/Coverage_Report/)

---

## 📚 Documentación

| Documento                                                                | Descripción                                                                       |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| [ARQUITECTURA-MICROSERVICIOS.md](ARQUITECTURA-MICROSERVICIOS.md)         | Análisis exhaustivo de la arquitectura, decisiones de diseño, diagramas completos |
| [INSTRUCCIONES-EJECUCION.md](INSTRUCCIONES-EJECUCION.md)                 | Guía paso a paso para ejecutar los servicios, troubleshooting                     |
| [RESUMEN-IMPLEMENTACION.md](RESUMEN-IMPLEMENTACION.md)                   | Resumen ejecutivo de la implementación y validación de requisitos                 |
| [frontend/README.md](frontend/README.md)                                 | Documentación específica del microservicio frontend                               |
| [Doc/GUIA-IMPLEMENTACION-JENKINS.md](Doc/GUIA-IMPLEMENTACION-JENKINS.md) | Guía completa de configuración de Jenkins CI/CD                                   |

---

## 💻 Tecnologías

### Runtime & Frameworks

- Node.js 18+
- Express.js 4.18+
- TypeScript 5.0+

### Herramientas de Desarrollo

- npm
- Nodemon
- ts-node
- Grunt (backend build)

### Testing

- Jest
- Supertest

### DevOps

- Docker
- Docker Compose

### Arquitectura

- Clean Architecture
- Domain-Driven Design
- REST API
- CORS
- HTTP Proxy Middleware

---

## 🎓 Práctica 07 - Rediseño a Microservicios

Este proyecto implementa los requisitos de la **Práctica 07** de Ingeniería de Software II (UNSA):

### Objetivos Cumplidos

✅ **Punto 11**: Desacoplar frontend del backend

- Frontend extraído en `/frontend`
- Comunicación API RESTful
- CORS configurado
- Proxy implementado

✅ **Arquitectura de Microservicios**

- Servicios independientes
- Ejecución en puertos separados
- Dockerización completa

✅ **Domain-Driven Design**

- Bounded Contexts identificados
- Lenguaje ubicuo aplicado
- Agregados y Entidades definidos

✅ **Clean Architecture**

- 4 capas bien separadas
- Dependency Inversion
- Casos de uso aislados

[Ver análisis completo de la práctica →](ARQUITECTURA-MICROSERVICIOS.md)

---

## 📊 APIs Disponibles

### Frontend (http://localhost:3000)

| Endpoint      | Descripción               |
| ------------- | ------------------------- |
| `GET /`       | Aplicación web            |
| `GET /health` | Health check del frontend |
| `/api/*`      | Proxy hacia backend       |

### Backend (http://localhost:4000)

| Método          | Endpoint           | Descripción              |
| --------------- | ------------------ | ------------------------ |
| GET             | `/`                | Información del API      |
| GET             | `/health`          | Health check del backend |
| **Equipos**     |
| POST            | `/api/equipos`     | Crear equipo             |
| GET             | `/api/equipos`     | Listar equipos           |
| GET             | `/api/equipos/:id` | Obtener equipo por ID    |
| **Operaciones** |
| POST            | `/api/operaciones` | Iniciar operación        |
| GET             | `/api/operaciones` | Listar operaciones       |

---

## 🔐 Seguridad

### Implementado

- ✅ CORS configurado
- ✅ Type Safety con TypeScript
- ✅ Input validation
- ✅ Non-root Docker users
- ✅ Environment variables

### Pendiente (Producción)

- [ ] Autenticación JWT
- [ ] Rate limiting
- [ ] HTTPS/TLS
- [ ] Secrets management

---

## 🧪 Testing

```bash
# Backend
cd backend
npm test
npm run test:coverage
```

---

## 🚢 Despliegue

### Docker Compose (Recomendado)

```bash
# Construir y ejecutar
docker-compose up --build

# Modo detached
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

### Docker Individual

```bash
# Frontend
cd frontend
docker build -t frontend-ms .
docker run -p 3000:3000 frontend-ms

# Backend
cd backend
docker build -t backend-ms .
docker run -p 4000:4000 backend-ms
```

---

## 🛠️ Desarrollo

### Requisitos

- Node.js 18+
- npm 8+
- Docker (opcional)
- Docker Compose (opcional)

### Instalación Local

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Scripts Disponibles

**Frontend**:

```bash
npm run dev          # Desarrollo con hot-reload
npm run build        # Compilar TypeScript
npm start            # Ejecutar versión compilada
```

**Backend**:

```bash
npm run dev          # Desarrollo con hot-reload
npm run build        # Compilar con Grunt
npm start            # Build + Start
npm test             # Ejecutar tests
```

---

## 🐛 Troubleshooting

### Puerto en uso

```bash
# Windows - Encontrar proceso
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### Error de CORS

1. Verificar que el backend tenga CORS habilitado
2. Reiniciar backend
3. Limpiar caché del navegador

### Cannot connect to backend

1. Verificar que el backend esté corriendo:
   ```bash
   curl http://localhost:4000/health
   ```
2. Verificar configuración en `frontend/public/js/config.js`

[Ver guía completa de troubleshooting →](INSTRUCCIONES-EJECUCION.md#solución-de-problemas)

---

## 🗺️ Roadmap

### Corto Plazo

- [ ] Implementar tests en frontend
- [ ] Configurar SonarQube
- [ ] CI/CD con GitHub Actions

### Mediano Plazo

- [ ] Autenticación JWT
- [ ] API Gateway completo (Kong/NGINX)
- [ ] Base de datos real (PostgreSQL)
- [ ] Logging centralizado (ELK)

### Largo Plazo

- [ ] Extraer más microservicios
- [ ] Event-Driven Architecture
- [ ] CQRS + Event Sourcing
- [ ] Kubernetes deployment

---

## 📖 Referencias

### Arquitectura

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design - Eric Evans](https://domainlanguage.com/ddd/)
- [Microservices Pattern - Chris Richardson](https://microservices.io/)

### Microsoft Docs

- [Microservices Architecture](https://learn.microsoft.com/en-us/azure/architecture/microservices/)
- [Domain Analysis for Microservices](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis)

### Tecnologías

- [Express.js](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Docker](https://docs.docker.com/)

---

## 👥 Contribución

Este proyecto es parte de la **Práctica 07** del curso de **Ingeniería de Software II** de la **Universidad Nacional de San Agustín de Arequipa (UNSA)**.

---

## 📄 Licencia

MIT

---

## 📞 Contacto

Para dudas o sugerencias, consultar:

- [Documentación completa](ARQUITECTURA-MICROSERVICIOS.md)
- [Guía de la práctica](backend/Pr7_redesign.pdf)
- Instructor: DSc. Edgar Sarmiento Calisaya

---

**Universidad Nacional de San Agustín de Arequipa**
**Escuela Profesional de Ciencia de la Computación**
**Ingeniería de Software II - Práctica 07**

Versión: 1.0.0 | Fecha: Enero 2026
