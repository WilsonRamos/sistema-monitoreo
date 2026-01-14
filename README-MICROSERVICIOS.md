# Sistema de Monitoreo Minero - 4 Microservicios

[![Clean Architecture](https://img.shields.io/badge/Architecture-Clean-blue)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
[![DDD](https://img.shields.io/badge/Design-Domain--Driven-green)](https://martinfowler.com/tags/domain%20driven%20design.html)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![Microservices](https://img.shields.io/badge/Microservices-4-orange)](https://microservices.io/)

Sistema de monitoreo de equipos mineros con **arquitectura de 4 microservicios independientes**, implementando **Clean Architecture**, **Domain-Driven Design (DDD)** y **Event-Driven Architecture**.

---

## 🚀 Inicio Rápido

### Opción 1: Docker Compose (Recomendado)

```bash
# 1. Clonar/Navegar al proyecto
cd sistema-monitoreo

# 2. Ejecutar todos los servicios
docker-compose up --build

# 3. Verificar servicios
# Frontend:    http://localhost:3000
# Backend:     http://localhost:4000
# Monitoreo:   http://localhost:5000
# Operaciones: http://localhost:6000

##  Contenidos

- [Arquitectura](#arquitectura)
- [Los 4 Microservicios](#los-4-microservicios)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [APIs Disponibles](#apis-disponibles)
- [Comunicación entre Servicios](#comunicación-entre-servicios)
- [Documentación](#documentación)
- [Tecnologías](#tecnologías)
- [Roadmap](#roadmap)

---

## 🏗️ Arquitectura

### Diagrama de 4 Microservicios

```

                    ┌──────────────┐
                    │   Usuario    │
                    │  (Browser)   │
                    └──────┬───────┘
                           │ HTTP
                           ▼
             ┌─────────────────────────┐
             │  FRONTEND SERVICE       │
             │  Puerto 3000            │
             │  ┌──────────────────┐   │
             │  │ Express + Proxy  │   │
             │  └──────────────────┘   │
             └────────────┬────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
         ▼                ▼                ▼

┌────────────────┐ ┌──────────────┐ ┌──────────────┐
│ BACKEND │ │ MONITOREO │ │ OPERACIONES │
│ (Legacy) │ │ SERVICE │ │ SERVICE │
│ Puerto 4000 │ │ Puerto 5000 │ │ Puerto 6000 │
│ │ │ │ │ │
│ Usuarios │ │ Equipos │ │ Operaciones │
│ Mina │ │ Estados │ │ Ciclos │
│ Turno │ │ Alertas │ │ KPIs │
└────────────────┘ └──────────────┘ └──────────────┘

```

### Principios Aplicados

- ✅ **Clean Architecture**: 4 capas en cada servicio
- ✅ **Domain-Driven Design**: Bounded Contexts separados
- ✅ **SOLID Principles**: Inversión de dependencias
- ✅ **Microservices Pattern**: Servicios independientes
- ✅ **API RESTful**: Comunicación HTTP/JSON
- ✅ **Event-Driven** (Ready): Preparado para eventos asincrónicos

---

## 🔧 Los 4 Microservicios

### 1. Frontend Service (Puerto 3000)

**Responsabilidad**: Interfaz de usuario y routing

**Stack**:
- Express.js (servidor estático)
- HTTP Proxy Middleware
- HTML/CSS/JavaScript

**Características**:
- Sirve archivos estáticos
- Proxy transparente a servicios backend
- Configuración dinámica de endpoints

[Ver documentación →](frontend/README.md)

---

### 2. Backend Service (Puerto 4000)

**Responsabilidad**: Monolito legacy con contextos restantes

**Bounded Contexts**:
- **Usuarios**: Autenticación, Operadores, Supervisores
- **Mina**: Estructura de minas, frentes, zonas
- **Turno**: Gestión de turnos, ciclos, rutas

**Estado**: Mantenimiento, migración gradual

---

### 3. Servicio Monitoreo (Puerto 5000) ⭐ NUEVO

**Responsabilidad**: Bounded Context de Monitoreo de Equipos

**Stack**:
- Node.js + Express + TypeScript
- Clean Architecture + DDD
- Repositorio en memoria (ready para PostgreSQL)

**Modelo de Dominio**:
```

Equipo (Aggregate Root)
├── Excavadora
└── Volquete

EstadoEquipo (Value Object)
UbicacionGPS (Value Object)

```

**API Endpoints**:
```

POST /api/equipos - Crear equipo
GET /api/equipos - Listar equipos
PUT /api/equipos/:id/estado - Actualizar estado
GET /api/monitoreo/alertas - Obtener alertas
GET /api/monitoreo/kpis - Obtener KPIs

```

**KPIs**:
- Tiempo de operación total
- Combustible total disponible
- Tasa de disponibilidad (%)
- Equipos requiriendo mantenimiento
- Equipos con bajo combustible

[Ver documentación completa →](servicio-monitoreo/README.md)

---

### 4. Servicio Operaciones (Puerto 6000) ⭐ NUEVO

**Responsabilidad**: Bounded Context de Operaciones Mineras

**Stack**:
- Node.js + Express + TypeScript
- Clean Architecture + DDD
- Repositorio en memoria (ready para MongoDB)

**Modelo de Dominio**:
```

Operacion (Aggregate Root)
├── tipo: CARGUE | TRANSPORTE | DESCARGA
├── equiposAsignados: string[]
├── supervisorId: string
└── frenteId: string

TipoOperacion (Value Object)

```

**API Endpoints**:
```

POST /api/operaciones - Iniciar operación
GET /api/operaciones - Listar operaciones
PUT /api/operaciones/:id/finalizar - Finalizar operación
POST /api/operaciones/:id/equipos - Asignar equipo
GET /api/kpis - Obtener KPIs

```

**KPIs**:
- Operaciones completadas
- Tiempo de ciclo promedio (min)
- Equipos en operación activa
- Duración total de operaciones
- Tasa de completitud (%)

[Ver documentación completa →](servicio-operaciones/README.md)

---

## 📁 Estructura del Proyecto

```

sistema-monitoreo/
│
├── frontend/ # Microservicio 1: Frontend (3000)
│ ├── src/server.ts
│ ├── public/index.html
│ ├── Dockerfile
│ └── README.md
│
├── backend/ # Microservicio 2: Backend Legacy (4000)
│ ├── aplicacion/
│ │ ├── Dominio/ # Usuarios, Mina, Turno
│ │ ├── casos-uso/
│ │ └── infraestructura/
│ ├── presentacion/
│ ├── Dockerfile
│ └── README.md
│
├── servicio-monitoreo/ # ⭐ Microservicio 3: Monitoreo (5000)
│ ├── src/
│ │ ├── dominio/
│ │ │ ├── entidades/ # Equipo, Excavadora, Volquete
│ │ │ ├── value-objects/ # EstadoEquipo, UbicacionGPS
│ │ │ ├── repositorios/ # IEquipoRepositorio
│ │ │ └── servicios/ # MonitoreoServiciosDominio
│ │ ├── aplicacion/
│ │ │ └── casos-uso/ # CrearEquipo, ObtenerEquipos, etc.
│ │ ├── infraestructura/
│ │ │ └── persistencia/ # MemoriaEquipoRepositorio
│ │ ├── presentacion/
│ │ │ ├── controllers/ # EquipoController, MonitoreoController
│ │ │ └── routes/
│ │ └── index.ts # Servidor principal
│ ├── Dockerfile
│ └── README.md
│
├── servicio-operaciones/ # ⭐ Microservicio 4: Operaciones (6000)
│ ├── src/
│ │ ├── dominio/
│ │ │ ├── entidades/ # Operacion
│ │ │ ├── value-objects/ # TipoOperacion
│ │ │ ├── repositorios/ # IOperacionRepositorio
│ │ │ └── servicios/ # OperacionesServiciosDominio
│ │ ├── aplicacion/
│ │ │ └── casos-uso/ # IniciarOperacion, FinalizarOperacion, etc.
│ │ ├── infraestructura/
│ │ │ └── persistencia/ # MemoriaOperacionRepositorio
│ │ ├── presentacion/
│ │ │ ├── controllers/ # OperacionController, KPIsController
│ │ │ └── routes/
│ │ └── index.ts # Servidor principal
│ ├── Dockerfile
│ └── README.md
│
├── Doc/ # Documentación
│ ├── ARQUITECTURA-4-MICROSERVICIOS.md
│ ├── GUIA-INTEGRACION-MICROSERVICIOS.md
│ └── AUTENTICACION-JWT.md
│
├── docker-compose.yml # ✨ Orquestación de 4 servicios
└── README-MICROSERVICIOS.md # Este archivo

```

---

## 📊 APIs Disponibles

### Frontend (http://localhost:3000)

| Endpoint | Descripción |
|----------|-------------|
| `GET /` | Aplicación web |
| `GET /health` | Health check |
| `/api/*` | Proxy a servicios backend |

### Backend Legacy (http://localhost:4000)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/auth/login` | Autenticación |
| GET | `/api/usuarios` | Gestión de usuarios |
| GET | `/api/mina` | Gestión de minas |
| GET | `/api/turnos` | Gestión de turnos |

### Servicio Monitoreo (http://localhost:5000)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| **Equipos** |
| POST | `/api/equipos` | Crear equipo |
| GET | `/api/equipos` | Listar equipos (filtros: tipo, estado) |
| PUT | `/api/equipos/:id/estado` | Actualizar estado |
| **Monitoreo** |
| GET | `/api/monitoreo/alertas` | Obtener alertas |
| GET | `/api/monitoreo/kpis` | Obtener KPIs de flota |
| **Utilidades** |
| GET | `/` | Info del servicio |
| GET | `/health` | Health check |

### Servicio Operaciones (http://localhost:6000)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| **Operaciones** |
| POST | `/api/operaciones` | Iniciar operación |
| GET | `/api/operaciones` | Listar (filtros: supervisor, frente, activas) |
| PUT | `/api/operaciones/:id/finalizar` | Finalizar operación |
| POST | `/api/operaciones/:id/equipos` | Asignar equipo |
| **KPIs** |
| GET | `/api/kpis` | Obtener KPIs operacionales |
| **Utilidades** |
| GET | `/` | Info del servicio |
| GET | `/health` | Health check |

---

## 🔄 Comunicación entre Servicios

### Patrón Actual: REST Síncrona

```

Frontend → HTTP GET /api/equipos → Servicio Monitoreo
← JSON Response ←

Frontend → HTTP POST /api/operaciones → Servicio Operaciones
← JSON Response ←

```

### Patrón Recomendado: Event-Driven (Futuro)

```

Servicio Operaciones
│
├─ Publica: EquipoAsignadoAOperacionEvent
│ { operacionId, equipoId, timestamp }
│
▼
RabbitMQ / Kafka
│
▼
Servicio Monitoreo
│
└─ Se suscribe
└─ Actualiza estado del equipo

````

### Matriz de Dependencias

| De → A | Frontend | Backend | Monitoreo | Operaciones |
|--------|----------|---------|-----------|-------------|
| **Frontend** | - | ✅ | ✅ | ✅ |
| **Backend** | ❌ | - | ⚠️ | ⚠️ |
| **Monitoreo** | ❌ | ⚠️ | - | ❌ |
| **Operaciones** | ❌ | ⚠️ | ⚠️ (ID) | - |

**Leyenda**:
- ❌ Sin dependencia
- ✅ Consume servicios (HTTP)
- ⚠️ Dependencia futura (eventos)
- ⚠️ (ID) Solo referencia por ID

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [ARQUITECTURA-4-MICROSERVICIOS.md](Doc/ARQUITECTURA-4-MICROSERVICIOS.md) | 📘 Arquitectura completa, diagramas, decisiones de diseño |
| [GUIA-INTEGRACION-MICROSERVICIOS.md](Doc/GUIA-INTEGRACION-MICROSERVICIOS.md) | 🛠️ Patrones de comunicación, mejores prácticas, ejemplos |
| [servicio-monitoreo/README.md](servicio-monitoreo/README.md) | 📖 Documentación específica del servicio de Monitoreo |
| [servicio-operaciones/README.md](servicio-operaciones/README.md) | 📖 Documentación específica del servicio de Operaciones |

---

## 💻 Tecnologías

### Runtime & Frameworks
- Node.js 18+
- Express.js 4.18+
- TypeScript 5.0+

### Arquitectura
- Clean Architecture
- Domain-Driven Design (DDD)
- Event-Driven Architecture (Ready)
- REST API

### DevOps
- Docker
- Docker Compose
- Health Checks

### Testing (Próximo)
- Jest
- Supertest
- Integration Tests

### Observabilidad (Próximo)
- Prometheus (métricas)
- Grafana (dashboards)
- ELK Stack (logging)
- Jaeger (tracing)

---

## 🎯 Características Principales

### Arquitectura
- ✅ **4 Microservicios Independientes**
- ✅ **Clean Architecture** en todos los servicios
- ✅ **Domain-Driven Design** con bounded contexts
- ✅ **Acoplamiento débil** (referencias por ID)
- ✅ **SOLID Principles**

### Comunicación
- ✅ **REST API** síncrona (implementado)
- ⏳ **Event-Driven** asíncrona (pendiente)
- ✅ **CORS** configurado
- ✅ **Health Checks** en todos los servicios

### Seguridad
- ✅ IDs seguros con `crypto.randomUUID()`
- ✅ Validación de entrada
- ✅ Type Safety (TypeScript)
- ✅ Usuarios no privilegiados en Docker
- ⏳ JWT Authentication (pendiente)
- ⏳ Rate Limiting (pendiente)

### DevOps
- ✅ Dockerización completa
- ✅ Docker Compose con 4 servicios
- ✅ Health checks
- ⏳ CI/CD (pendiente)
- ⏳ Kubernetes (pendiente)

---

## 🚢 Despliegue

### Docker Compose

```bash
# Construir y ejecutar
docker-compose up --build

# Modo detached
docker-compose up -d

# Ver logs
docker-compose logs -f

# Logs de un servicio específico
docker-compose logs -f servicio-monitoreo

# Detener
docker-compose down
````

### Docker Individual

```bash
# Monitoreo
cd servicio-monitoreo
docker build -t servicio-monitoreo .
docker run -p 5000:5000 servicio-monitoreo

# Operaciones
cd servicio-operaciones
docker build -t servicio-operaciones .
docker run -p 6000:6000 servicio-operaciones
```

---

## 🗺️ Roadmap

### Fase 1: Completado ✅

- [x] Servicio de Monitoreo
- [x] Servicio de Operaciones
- [x] Docker Compose con 4 servicios
- [x] Documentación completa

### Fase 2: Comunicación Asíncrona (Próximo)

- [ ] Implementar RabbitMQ / Kafka
- [ ] Eventos de dominio
- [ ] Handlers de eventos
- [ ] Dead Letter Queue

### Fase 3: API Gateway

- [ ] Kong o NGINX
- [ ] Autenticación centralizada
- [ ] Rate limiting
- [ ] Logging centralizado

### Fase 4: Observabilidad

- [ ] Prometheus + Grafana
- [ ] ELK Stack
- [ ] Jaeger (tracing)
- [ ] Alertas automáticas

### Fase 5: Más Microservicios

- [ ] Servicio de Usuarios
- [ ] Servicio de Mina
- [ ] Servicio de Turnos

### Fase 6: Bases de Datos

- [ ] PostgreSQL para Monitoreo
- [ ] MongoDB para Operaciones
- [ ] Redis para cache

### Fase 7: Kubernetes

- [ ] Deployment manifests
- [ ] Service mesh (Istio)
- [ ] Auto-scaling
- [ ] Rolling updates

---

## 🐛 Troubleshooting

### Puerto en uso

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

### Error de CORS

1. Verificar configuración en cada servicio
2. Reiniciar servicios
3. Limpiar caché del navegador

### Servicio no responde

```bash
# Verificar health checks
curl http://localhost:5000/health
curl http://localhost:6000/health

# Ver logs
docker-compose logs servicio-monitoreo
docker-compose logs servicio-operaciones
```

---

## 📖 Referencias

### Arquitectura

- [Microsoft - Microservices Architecture](https://learn.microsoft.com/en-us/azure/architecture/microservices/)
- [Martin Fowler - Microservices](https://martinfowler.com/articles/microservices.html)
- [Sam Newman - Building Microservices](https://samnewman.io/books/building_microservices_2nd_edition/)

### Domain-Driven Design

- Eric Evans - "Domain-Driven Design"
- Vaughn Vernon - "Implementing Domain-Driven Design"

### Clean Architecture

- Robert C. Martin - "Clean Architecture"
- Robert C. Martin - "Clean Code"

---

## 👥 Contribución

Este proyecto es parte de la **Práctica 07+** del curso de **Ingeniería de Software II** de la **Universidad Nacional de San Agustín de Arequipa (UNSA)**.

---

## 📄 Licencia

MIT

---

## 📞 Contacto

Para dudas o sugerencias, consultar:

- [Documentación completa](Doc/ARQUITECTURA-4-MICROSERVICIOS.md)
- [Guía de integración](Doc/GUIA-INTEGRACION-MICROSERVICIOS.md)

---

**Universidad Nacional de San Agustín de Arequipa**
**Escuela Profesional de Ciencia de la Computación**
**Ingeniería de Software II - Práctica 07+**

**Evolución**: De Monolito → 2 Microservicios → **4 Microservicios**
**Versión**: 2.0.0
**Fecha**: Enero 2026
