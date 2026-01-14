# Arquitectura de 4 Microservicios - Sistema de Monitoreo Minero

## Documentación de Evolución Arquitectónica - Práctica 07+

**Universidad Nacional de San Agustín de Arequipa**
**Ingeniería de Software II**
**Evolución: De 2 a 4 Microservicios**

---

## Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Evolución Arquitectónica](#evolución-arquitectónica)
3. [Arquitectura de 4 Microservicios](#arquitectura-de-4-microservicios)
4. [Microservicios Implementados](#microservicios-implementados)
5. [Comunicación entre Servicios](#comunicación-entre-servicios)
6. [Decisiones de Diseño](#decisiones-de-diseño)
7. [Despliegue y Ejecución](#despliegue-y-ejecución)
8. [Roadmap de Integración](#roadmap-de-integración)

---

## Resumen Ejecutivo

El Sistema de Monitoreo Minero ha evolucionado de una arquitectura de **2 microservicios** (Frontend + Backend monolítico) a una arquitectura de **4 microservicios independientes**, extrayendo los bounded contexts de **Monitoreo** y **Operaciones** como servicios autónomos.

### Logros Principales

- ✅ **4 Microservicios Independientes**: Frontend, Backend Legacy, Monitoreo, Operaciones
- ✅ **Clean Architecture + DDD**: Todos los servicios implementan patrones DDD
- ✅ **Comunicación REST**: APIs RESTful con JSON
- ✅ **Dockerización Completa**: Cada servicio con su Dockerfile
- ✅ **Orquestación con Docker Compose**: Los 4 servicios coordinados
- ✅ **Acoplamiento Débil**: Referencias por ID, no por objetos
- ✅ **Health Checks**: Todos los servicios con endpoints de salud
- ✅ **Seguridad Mejorada**: IDs con crypto.randomUUID()

---

## Evolución Arquitectónica

### Fase 1: Monolito (Estado Inicial)

```
┌────────────────────────────────────┐
│        APLICACIÓN MONOLÍTICA       │
│                                    │
│  UI + Lógica + Datos + API         │
│                                    │
│  - Difícil de escalar              │
│  - Deployments arriesgados         │
│  - Acoplamiento alto               │
└────────────────────────────────────┘
```

### Fase 2: Frontend Separado (2 Microservicios)

```
┌──────────────┐          ┌─────────────────┐
│   FRONTEND   │  HTTP    │  BACKEND (API)  │
│  Puerto 3000 │◄────────►│  Puerto 4000    │
│              │   REST   │                 │
│  - UI        │          │  - Dominio      │
│  - Proxy     │          │  - Casos Uso    │
└──────────────┘          │  - Repositorios │
                          └─────────────────┘
```

**Documentación**: Ver [ARQUITECTURA-MICROSERVICIOS.md](ARQUITECTURA-MICROSERVICIOS.md)

### Fase 3: 4 Microservicios (Estado Actual) ⭐

```
                    ┌──────────────┐
                    │   FRONTEND   │
                    │  Puerto 3000 │
                    └──────┬───────┘
                           │ HTTP/REST
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
   ┌────────────┐  ┌────────────┐  ┌────────────┐
   │  BACKEND   │  │ MONITOREO  │  │ OPERACIONES│
   │ (Legacy)   │  │ Puerto 5000│  │ Puerto 6000│
   │ Puerto 4000│  │            │  │            │
   │            │  │ - Equipos  │  │ - Operac.  │
   │ - Usuarios │  │ - Estados  │  │ - Ciclos   │
   │ - Mina     │  │ - Alertas  │  │ - KPIs     │
   │ - Turno    │  │ - KPIs     │  │            │
   └────────────┘  └────────────┘  └────────────┘
```

---

## Arquitectura de 4 Microservicios

### Diagrama Completo

```
┌───────────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA DE 4 MICROSERVICIOS               │
│                  Sistema de Monitoreo Minero - DDD                │
└───────────────────────────────────────────────────────────────────┘

                           ┌──────────────┐
                           │   Usuario    │
                           │  (Browser)   │
                           └──────┬───────┘
                                  │ HTTP
                                  ▼
                    ┌─────────────────────────┐
                    │   FRONTEND SERVICE      │
                    │   Puerto 3000           │
                    │                         │
                    │  ┌──────────────────┐  │
                    │  │ Express Static   │  │
                    │  │ + Proxy          │  │
                    │  │ + Routing        │  │
                    │  └──────────────────┘  │
                    └────────────┬────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
   ┌───────────────────┐ ┌──────────────┐ ┌──────────────┐
   │  BACKEND SERVICE  │ │  MONITOREO   │ │  OPERACIONES │
   │  (Monolito Legacy)│ │  SERVICE     │ │  SERVICE     │
   │  Puerto 4000      │ │  Puerto 5000 │ │  Puerto 6000 │
   │                   │ │              │ │              │
   │  ┌─────────────┐  │ │ ┌──────────┐ │ │ ┌──────────┐ │
   │  │ CONTEXTOS:  │  │ │ │CONTEXTO: │ │ │ │CONTEXTO: │ │
   │  │             │  │ │ │          │ │ │ │          │ │
   │  │ - Usuarios  │  │ │ │Monitoreo │ │ │ │Operacioes│ │
   │  │ - Mina      │  │ │ │          │ │ │ │          │ │
   │  │ - Turno     │  │ │ │ Equipos  │ │ │ │ Ciclos   │ │
   │  │             │  │ │ │ Estados  │ │ │ │ KPIs     │ │
   │  │             │  │ │ │ Alertas  │ │ │ │          │ │
   │  └─────────────┘  │ │ │ KPIs     │ │ │ │          │ │
   │                   │ │ └──────────┘ │ │ └──────────┘ │
   │  ┌─────────────┐  │ │              │ │              │
   │  │Clean Arch   │  │ │ Clean Arch   │ │ Clean Arch   │
   │  │+ DDD        │  │ │ + DDD        │ │ + DDD        │
   │  └─────────────┘  │ │              │ │              │
   └───────────────────┘ └──────────────┘ └──────────────┘
           │                    │                │
           └────────────────────┴────────────────┘
                                │
                   ┌─────────────▼──────────────┐
                   │  DOCKER NETWORK (Bridge)   │
                   │  sistema-monitoreo-network │
                   └────────────────────────────┘
```

### Matriz de Responsabilidades

| Servicio             | Puerto | Bounded Contexts      | Responsabilidades Principales                                          |
| -------------------- | ------ | --------------------- | ---------------------------------------------------------------------- |
| **Frontend**         | 3000   | Presentación          | UI, Proxy, Routing a servicios                                         |
| **Backend (Legacy)** | 4000   | Usuarios, Mina, Turno | Gestión usuarios, turnos, estructuras mineras                          |
| **Monitoreo**        | 5000   | Monitoreo             | Gestión de equipos, estados, alertas, KPIs de equipos                  |
| **Operaciones**      | 6000   | Operaciones           | Gestión de operaciones, ciclos, asignación equipos, KPIs operacionales |

---

## Microservicios Implementados

### 1. Frontend Microservice (Puerto 3000)

**Responsabilidad**: Capa de presentación

**Tecnologías**:

- Express.js (servidor estático)
- HTTP Proxy Middleware
- HTML/CSS/JavaScript

**Características**:

- Sirve interfaz de usuario
- Proxy transparente a todos los servicios backend
- Routing dinámico

**Documentación**: [frontend/README.md](../frontend/README.md)

---

### 2. Backend Legacy (Puerto 4000)

**Responsabilidad**: Monolito legacy con contextos restantes

**Bounded Contexts**:

- **Usuarios**: Autenticación, Operadores, Supervisores
- **Mina**: Estructura de minas, frentes, zonas
- **Turno**: Gestión de turnos, ciclos, rutas

**Estado**: Mantenimiento, eventual migración a microservicios

**Documentación**: Ver código en [backend/](../backend/)

---

### 3. Servicio de Monitoreo (Puerto 5000) ⭐ **NUEVO**

**Responsabilidad**: Bounded Context de Monitoreo de Equipos

**Arquitectura**:

```
servicio-monitoreo/
├── dominio/
│   ├── entidades/
│   │   ├── Equipo.ts (Aggregate Root)
│   │   ├── Excavadora.ts
│   │   └── Volquete.ts
│   ├── value-objects/
│   │   ├── EstadoEquipo.ts
│   │   └── UbicacionGPS.ts
│   ├── repositorios/
│   │   └── IEquipoRepositorio.ts
│   └── servicios/
│       └── MonitoreoServiciosDominio.ts
├── aplicacion/
│   └── casos-uso/
│       ├── CrearEquipo.ts
│       ├── ObtenerEquipos.ts
│       ├── ActualizarEstadoEquipo.ts
│       └── ObtenerAlertasEquipos.ts
├── infraestructura/
│   └── persistencia/
│       └── MemoriaEquipoRepositorio.ts
└── presentacion/
    ├── controllers/
    │   ├── EquipoController.ts
    │   └── MonitoreoController.ts
    └── routes/
        ├── equipos.routes.ts
        └── monitoreo.routes.ts
```

**API Endpoints**:

```
POST   /api/equipos - Crear equipo
GET    /api/equipos - Listar equipos (filtros: tipo, estado)
PUT    /api/equipos/:id/estado - Actualizar estado
GET    /api/monitoreo/alertas - Obtener alertas
GET    /api/monitoreo/kpis - Obtener KPIs de flota
```

**KPIs Implementados**:

- Tiempo de operación total
- Combustible total disponible
- Tasa de disponibilidad
- Equipos para mantenimiento
- Equipos con bajo combustible

**Documentación**: [servicio-monitoreo/README.md](../servicio-monitoreo/README.md)

---

### 4. Servicio de Operaciones (Puerto 6000) ⭐ **NUEVO**

**Responsabilidad**: Bounded Context de Operaciones Mineras

**Arquitectura**:

```
servicio-operaciones/
├── dominio/
│   ├── entidades/
│   │   └── Operacion.ts (Aggregate Root)
│   ├── value-objects/
│   │   └── TipoOperacion.ts (CARGUE, TRANSPORTE, DESCARGA)
│   ├── repositorios/
│   │   └── IOperacionRepositorio.ts
│   └── servicios/
│       └── OperacionesServiciosDominio.ts
├── aplicacion/
│   └── casos-uso/
│       ├── IniciarOperacion.ts
│       ├── FinalizarOperacion.ts
│       ├── AsignarEquipoAOperacion.ts
│       ├── ObtenerOperaciones.ts
│       └── ObtenerKPIsOperaciones.ts
├── infraestructura/
│   └── persistencia/
│       └── MemoriaOperacionRepositorio.ts
└── presentacion/
    ├── controllers/
    │   ├── OperacionController.ts
    │   └── KPIsController.ts
    └── routes/
        ├── operaciones.routes.ts
        └── kpis.routes.ts
```

**API Endpoints**:

```
POST   /api/operaciones - Iniciar operación
GET    /api/operaciones - Listar operaciones (filtros: supervisor, frente, activas)
PUT    /api/operaciones/:id/finalizar - Finalizar operación
POST   /api/operaciones/:id/equipos - Asignar equipo
GET    /api/kpis - Obtener KPIs operacionales
```

**KPIs Implementados**:

- Operaciones completadas
- Tiempo de ciclo promedio
- Equipos en operación
- Duración total de operaciones
- Tasa de completitud

**Documentación**: [servicio-operaciones/README.md](../servicio-operaciones/README.md)

---

## Comunicación entre Servicios

### Patrones de Comunicación

#### 1. Comunicación Síncrona (REST API)

**Estado Actual**: Implementado

```
Frontend → HTTP GET /api/equipos → Servicio Monitoreo
         ← JSON Response ←

Frontend → HTTP POST /api/operaciones → Servicio Operaciones
         ← JSON Response ←
```

**Ventajas**:

- Simple de implementar
- Fácil de depurar
- Respuesta inmediata

**Desventajas**:

- Acoplamiento temporal
- Riesgo de cascada de fallos

#### 2. Comunicación Asíncrona (Eventos) - **RECOMENDADO PARA PRODUCCIÓN**

**Estado Actual**: Pendiente de implementación

```
Servicio Operaciones
    │
    ├─ Publica evento: EquipoAsignadoAOperacion
    │  { operacionId, equipoId, tipo, timestamp }
    │
    ▼
Message Broker (RabbitMQ / Kafka)
    │
    ▼
Servicio Monitoreo
    │
    └─ Se suscribe al evento
       └─ Actualiza estado del equipo a "OPERANDO"
```

**Ventajas**:

- Desacoplamiento temporal
- Mayor resiliencia
- Escalabilidad

**Desventajas**:

- Complejidad adicional
- Eventual consistency

### Matriz de Dependencias

```
          ↓ Depende de (consume servicios de)

De ↓      Frontend  Backend  Monitoreo  Operaciones
────────────────────────────────────────────────────
Frontend     -        ✅       ✅         ✅
Backend      ❌       -        ⚠️         ⚠️
Monitoreo    ❌       ⚠️       -          ❌
Operaciones  ❌       ⚠️       ⚠️(ID)     -
────────────────────────────────────────────────────

Leyenda:
❌ = Sin dependencia
✅ = Consume servicios (HTTP)
⚠️ = Dependencia débil (futuro, eventos)
⚠️(ID) = Solo referencia por ID (no consume servicio)
```

### Flujo de Comunicación Típico

#### Escenario: Asignar Equipo a una Operación

**Flujo Actual (Síncrono)**:

```
1. Usuario en Frontend → Click "Asignar equipo VOL-001 a Operación-123"

2. Frontend → POST /api/operaciones/123/equipos
   Body: { equipoId: "uuid-vol-001" }
   → Servicio Operaciones (puerto 6000)

3. Servicio Operaciones:
   - Valida operación existe
   - Valida equipoId (formato UUID)
   - Agrega equipoId al array equiposAsignados[]
   - Persiste cambio
   → Responde: 200 OK

4. Frontend recibe respuesta
   → Muestra mensaje de éxito
```

**Flujo Recomendado (Asíncrono - Futuro)**:

```
1. Usuario en Frontend → Click "Asignar equipo VOL-001 a Operación-123"

2. Frontend → POST /api/operaciones/123/equipos
   → Servicio Operaciones (puerto 6000)

3. Servicio Operaciones:
   - Valida y persiste asignación
   - Publica evento: EquipoAsignadoAOperacion
     { operacionId: "123", equipoId: "uuid-vol-001", timestamp }
   - Responde inmediatamente: 202 Accepted

4. Message Broker (RabbitMQ):
   - Recibe evento
   - Enruta a suscriptores

5. Servicio Monitoreo (suscriptor):
   - Recibe evento EquipoAsignadoAOperacion
   - Busca equipo por ID
   - Cambia estado a "OPERANDO"
   - Registra en historial
   - Publica evento: EstadoEquipoCambiado

6. Frontend (WebSocket/SSE):
   - Recibe notificación en tiempo real
   - Actualiza UI sin refresh
```

---

## Decisiones de Diseño

### 1. Acoplamiento Débil por ID

**Decisión**: Los microservicios NO comparten objetos de dominio directamente. Solo se referencian por IDs.

**Ejemplo en Operaciones**:

```typescript
class Operacion {
  private _supervisorId: string; // ❌ NO: Supervisor objeto
  private _frenteId: string; // ❌ NO: Frente objeto
  private _equiposAsignados: string[]; // ✅ SÍ: Array de IDs

  asignarEquipo(equipoId: string): void {
    // Solo guarda el ID, no el objeto Equipo completo
    this._equiposAsignados.push(equipoId);
  }
}
```

**Ventajas**:

- Servicios independientes
- Sin dependencias de código compartido
- Facilita versionado
- Permite migración gradual

**Trade-offs**:

- Requiere validación de existencia en cada servicio
- Posible inconsistencia temporal
- Necesita eventos para sincronización

### 2. Clean Architecture en Todos los Servicios

**Decisión**: Todos los microservicios siguen Clean Architecture con 4 capas.

```
┌─────────────────────────────────────┐
│        PRESENTACIÓN (API REST)      │ ← Controllers, Routes
├─────────────────────────────────────┤
│        APLICACIÓN (Casos Uso)       │ ← Use Cases, DTOs
├─────────────────────────────────────┤
│        DOMINIO (Lógica Negocio)     │ ← Entidades, VOs, Servicios
├─────────────────────────────────────┤
│     INFRAESTRUCTURA (Persistencia)  │ ← Repositorios, DB
└─────────────────────────────────────┘
```

**Beneficios**:

- Testabilidad
- Mantenibilidad
- Independencia de frameworks
- Inversión de dependencias

### 3. Repositorios en Memoria (Desarrollo)

**Decisión**: Usar repositorios en memoria para desarrollo/testing, preparados para PostgreSQL/MongoDB.

**Ventajas**:

- Desarrollo rápido sin setup de BD
- Tests unitarios rápidos
- Sin dependencias externas

**Producción**:

```typescript
// Desarrollo
const repositorio = new MemoriaEquipoRepositorio();

// Producción
const repositorio = new PostgresEquipoRepositorio(connectionString);
```

### 4. IDs Seguros con crypto.randomUUID()

**Decisión**: Todos los IDs se generan con `crypto.randomUUID()`, NO con `Math.random()`.

**Razón**: Seguridad - Math.random() es predecible y vulnerable

```typescript
// ❌ INCORRECTO
const id = Math.random().toString();

// ✅ CORRECTO
import * as crypto from "crypto";
const id = crypto.randomUUID();
```

### 5. Health Checks en Todos los Servicios

**Decisión**: Endpoint `/health` en todos los servicios para monitoreo.

```bash
curl http://localhost:5000/health
# Response:
{
  "status": "healthy",
  "timestamp": "2026-01-14T...",
  "uptime": 12345.67,
  "service": "servicio-monitoreo"
}
```

**Uso**:

- Docker healthchecks
- Load balancers
- Monitoreo (Prometheus, etc.)

---

## Despliegue y Ejecución

### Opción 1: Docker Compose (Recomendado)

```bash
# Desde la raíz del proyecto
cd c:\Users\bug\Desktop\Wilson\sistema-monitoreo

# Construir y ejecutar todos los servicios
docker-compose up --build

# En modo detached (background)
docker-compose up -d

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f servicio-monitoreo
docker-compose logs -f servicio-operaciones

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v
```

**Acceso**:

- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Monitoreo: http://localhost:5000
- Operaciones: http://localhost:6000

### Opción 2: Desarrollo Local (4 Terminales)

**Terminal 1: Backend**

```bash
cd backend
npm install
npm run dev
# Backend en http://localhost:4000
```

**Terminal 2: Frontend**

```bash
cd frontend
npm install
npm run dev
# Frontend en http://localhost:3000
```

**Terminal 3: Servicio Monitoreo**

```bash
cd servicio-monitoreo
npm install
npm run dev
# Monitoreo en http://localhost:5000
```

**Terminal 4: Servicio Operaciones**

```bash
cd servicio-operaciones
npm install
npm run dev
# Operaciones en http://localhost:6000
```

### Opción 3: Docker Individual

```bash
# Monitoreo
cd servicio-monitoreo
docker build -t servicio-monitoreo:latest .
docker run -p 5000:5000 servicio-monitoreo:latest

# Operaciones
cd servicio-operaciones
docker build -t servicio-operaciones:latest .
docker run -p 6000:6000 servicio-operaciones:latest
```

---

## Roadmap de Integración

### Fase 1: Actual (Completado) ✅

- [x] Servicio de Monitoreo independiente
- [x] Servicio de Operaciones independiente
- [x] Docker Compose con 4 servicios
- [x] Comunicación REST entre servicios
- [x] Acoplamiento débil por ID
- [x] Documentación completa

### Fase 2: Comunicación Asíncrona (Próximo paso)

**Objetivo**: Implementar eventos de dominio para comunicación asíncrona

**Tecnologías**: RabbitMQ o Apache Kafka

**Eventos a implementar**:

```
Monitoreo:
- EquipoCreadoEvent
- EstadoEquipoCambiadoEvent
- AlertaGeneradaEvent
- EquipoEliminadoEvent

Operaciones:
- OperacionIniciadaEvent
- OperacionFinalizadaEvent
- EquipoAsignadoAOperacionEvent
- EquipoRemovidoDeOperacionEvent
```

**Implementación**:

```typescript
// En Servicio Operaciones
class AsignarEquipoAOperacion {
  async ejecutar(dto: AsignarEquipoDTO) {
    // 1. Persistir cambio
    operacion.asignarEquipo(dto.equipoId);
    await this.repositorio.actualizar(operacion);

    // 2. Publicar evento
    await this.eventBus.publish({
      type: "EquipoAsignadoAOperacion",
      data: {
        operacionId: operacion.id,
        equipoId: dto.equipoId,
        timestamp: new Date(),
      },
    });
  }
}

// En Servicio Monitoreo
class EquipoAsignadoEventHandler {
  async handle(event: EquipoAsignadoEvent) {
    const equipo = await this.equipoRepo.obtenerPorId(event.equipoId);
    equipo.cambiarEstado("OPERANDO");
    await this.equipoRepo.actualizar(equipo);

    // Propagar evento
    await this.eventBus.publish({
      type: "EstadoEquipoCambiado",
      data: { equipoId: equipo.id, nuevoEstado: "OPERANDO" },
    });
  }
}
```

### Fase 3: API Gateway (Mediano plazo)

**Objetivo**: Centralizar acceso a microservicios

**Tecnologías**: Kong, NGINX, AWS API Gateway

**Beneficios**:

- Punto de entrada único
- Autenticación centralizada
- Rate limiting
- Logging y monitoreo
- Transformación de peticiones

```
                  ┌────────────────┐
                  │  API GATEWAY   │
                  │  Puerto 80/443 │
                  └────────┬───────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
      [Monitoreo]   [Operaciones]   [Backend]
```

### Fase 4: Extraer Más Microservicios

**Candidatos**:

- **Servicio de Usuarios** (Autenticación, Operadores, Supervisores)
- **Servicio de Mina** (Estructura de minas, frentes, zonas)
- **Servicio de Turnos** (Gestión de turnos, ciclos, rutas)

### Fase 5: Observabilidad y Monitoreo

**Objetivo**: Implementar stack de observabilidad completo

**Tecnologías**:

- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Métricas**: Prometheus + Grafana
- **Tracing**: Jaeger o Zipkin
- **Alerting**: Prometheus Alertmanager

### Fase 6: Bases de Datos Independientes

**Objetivo**: Cada microservicio con su propia base de datos

```
Servicio Monitoreo → PostgreSQL (equipos_db)
Servicio Operaciones → MongoDB (operaciones_db)
Backend Legacy → PostgreSQL (sistema_db)
```

**Patrón**: Database per Service

---

## Conclusiones

### Logros Alcanzados

1. ✅ **Descomposición exitosa**: 2 bounded contexts extraídos como microservicios
2. ✅ **Arquitectura robusta**: Clean Architecture + DDD en todos los servicios
3. ✅ **Desacoplamiento**: Referencias por ID, no por objetos
4. ✅ **Dockerización completa**: Todos los servicios containerizados
5. ✅ **Documentación exhaustiva**: READMEs, diagramas, ejemplos

### Beneficios Obtenidos

**Escalabilidad**:

- Cada servicio escala independientemente
- Diferentes recursos por servicio (CPU, memoria)

**Desarrollo**:

- Equipos dedicados por bounded context
- Deploys independientes
- Menos conflictos en código

**Mantenibilidad**:

- Código más pequeño y manejable
- Cambios localizados
- Menos riesgo en modificaciones

**Resiliencia**:

- Fallos aislados (con eventos)
- Health checks para monitoreo
- Reintentos y circuit breakers (futuro)

### Próximos Pasos Recomendados

**Corto Plazo (2-4 semanas)**:

1. Implementar comunicación asíncrona con RabbitMQ
2. Agregar tests unitarios y de integración
3. Configurar CI/CD (GitHub Actions)

**Mediano Plazo (1-3 meses)**:

1. Implementar API Gateway (Kong/NGINX)
2. Migrar a bases de datos reales (PostgreSQL)
3. Implementar observabilidad (ELK + Prometheus)

**Largo Plazo (3-6 meses)**:

1. Extraer servicios de Usuarios, Mina, Turnos
2. Implementar CQRS + Event Sourcing
3. Desplegar en Kubernetes
4. Implementar service mesh (Istio)

---

## Referencias

### Arquitectura

- [Microsoft - Microservices Architecture](https://learn.microsoft.com/en-us/azure/architecture/microservices/)
- [Martin Fowler - Microservices](https://martinfowler.com/articles/microservices.html)
- [Sam Newman - Building Microservices](https://samnewman.io/books/building_microservices_2nd_edition/)

### Domain-Driven Design

- Eric Evans - "Domain-Driven Design: Tackling Complexity in the Heart of Software"
- Vaughn Vernon - "Implementing Domain-Driven Design"

### Clean Architecture

- Robert C. Martin - "Clean Architecture"
- Robert C. Martin - "Clean Code"

### Comunicación entre Microservicios

- [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)
- [Saga Pattern](https://microservices.io/patterns/data/saga.html)
- [API Gateway Pattern](https://microservices.io/patterns/apigateway.html)

### Tecnologías

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [RabbitMQ](https://www.rabbitmq.com/)
- [Apache Kafka](https://kafka.apache.org/)

---

**Fecha de elaboración**: 14 de Enero de 2026
**Versión**: 2.0.0
**Evolución**: De 2 a 4 Microservicios
**Autor**: Sistema de Monitoreo Minero - Práctica 07+
