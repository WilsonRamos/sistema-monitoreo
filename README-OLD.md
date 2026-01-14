# Sistema de Monitoreo Minero - Arquitectura de Microservicios

[![Clean Architecture](https://img.shields.io/badge/Architecture-Clean-blue)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
[![DDD](https://img.shields.io/badge/Design-Domain--Driven-green)](https://martinfowler.com/tags/domain%20driven%20design.html)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)

Sistema de monitoreo de equipos mineros implementado con **Clean Architecture**, **Domain-Driven Design (DDD)** y arquitectura de **Microservicios**.

---

## 🚀 Inicio Rápido

### Opción 1: Docker Compose (Recomendado)

```bash
# 1. Clonar/Navegar al proyecto
cd c:\Users\bug\Desktop\Wilson\sistema-monitoreo

# 2. Ejecutar con Docker Compose
docker-compose up --build

# 3. Abrir navegador
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000
```

### Opción 2: Desarrollo Local

**Terminal 1 - Backend**:
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm install
npm run dev
```

**Abrir**: http://localhost:3000

---

## 📋 Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Microservicios](#microservicios)
- [Documentación](#documentación)
- [Tecnologías](#tecnologías)
- [Práctica 07](#práctica-07)

---

## 🏗️ Arquitectura

### Diagrama de Microservicios

```
┌──────────────┐
│   Usuario    │
└──────┬───────┘
       │
       │ HTTP
       ▼
┌─────────────────────────┐        ┌─────────────────────────┐
│  FRONTEND SERVICE       │        │  BACKEND SERVICE        │
│  Puerto: 3000           │◄──────►│  Puerto: 4000           │
│                         │  Proxy │                         │
│  ┌──────────────────┐  │   +    │  ┌──────────────────┐  │
│  │ Express Static   │  │  CORS  │  │ REST API         │  │
│  │ + Proxy          │  │        │  │ + DDD            │  │
│  └──────────────────┘  │        │  └──────────────────┘  │
└─────────────────────────┘        └─────────────────────────┘
```

### Principios Aplicados

- ✅ **Clean Architecture**: Separación de capas (Presentación, Aplicación, Dominio, Infraestructura)
- ✅ **Domain-Driven Design**: Bounded Contexts (Monitoreo, Operaciones)
- ✅ **SOLID Principles**: Inyección de dependencias, Single Responsibility
- ✅ **Microservices**: Servicios independientes, comunicación API REST
- ✅ **API RESTful**: Comunicación entre frontend y backend

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

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [ARQUITECTURA-MICROSERVICIOS.md](ARQUITECTURA-MICROSERVICIOS.md) | Análisis exhaustivo de la arquitectura, decisiones de diseño, diagramas completos |
| [INSTRUCCIONES-EJECUCION.md](INSTRUCCIONES-EJECUCION.md) | Guía paso a paso para ejecutar los servicios, troubleshooting |
| [RESUMEN-IMPLEMENTACION.md](RESUMEN-IMPLEMENTACION.md) | Resumen ejecutivo de la implementación y validación de requisitos |
| [frontend/README.md](frontend/README.md) | Documentación específica del microservicio frontend |

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

| Endpoint | Descripción |
|----------|-------------|
| `GET /` | Aplicación web |
| `GET /health` | Health check del frontend |
| `/api/*` | Proxy hacia backend |

### Backend (http://localhost:4000)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Información del API |
| GET | `/health` | Health check del backend |
| **Equipos** |
| POST | `/api/equipos` | Crear equipo |
| GET | `/api/equipos` | Listar equipos |
| GET | `/api/equipos/:id` | Obtener equipo por ID |
| **Operaciones** |
| POST | `/api/operaciones` | Iniciar operación |
| GET | `/api/operaciones` | Listar operaciones |

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
