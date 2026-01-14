# Arquitectura de Microservicios - Sistema de Monitoreo Minero

## Documentación de Rediseño - Práctica 07

**Universidad Nacional de San Agustín de Arequipa**
**Ingeniería de Software II**
**Laboratorio 07: Rediseño a Arquitectura de Microservicios**

---

## Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Análisis de la Práctica 07](#análisis-de-la-práctica-07)
3. [Arquitectura Implementada](#arquitectura-implementada)
4. [Decisiones de Diseño](#decisiones-de-diseño)
5. [Comunicación entre Microservicios](#comunicación-entre-microservicios)
6. [Implementación Técnica](#implementación-técnica)
7. [Despliegue y Ejecución](#despliegue-y-ejecución)
8. [Validación de Requisitos](#validación-de-requisitos)

---

## Resumen Ejecutivo

Este documento describe el rediseño del Sistema de Monitoreo Minero desde una arquitectura monolítica hacia una arquitectura de microservicios, siguiendo los lineamientos de la Práctica 07 y aplicando principios de Domain-Driven Design (DDD).

### Logros Principales

- ✅ **Desacoplamiento Frontend-Backend**: La capa web se extrajo exitosamente en un microservicio independiente
- ✅ **Comunicación API RESTful**: Implementación de comunicación entre servicios mediante APIs REST
- ✅ **CORS Configurado**: Habilitación de CORS en el backend para permitir peticiones cross-origin
- ✅ **Proxy Transparente**: Configuración de proxy en el frontend para redirigir peticiones al backend
- ✅ **Ejecución Independiente**: Ambos servicios se ejecutan de forma autónoma en puertos separados
- ✅ **Dockerización**: Ambos microservicios pueden ejecutarse en contenedores Docker
- ✅ **Arquitectura Limpia**: Mantenimiento de Clean Architecture y principios DDD

---

## Análisis de la Práctica 07

### Objetivos de la Práctica

Según el documento **Pr7_redesign.pdf**, los objetivos principales son:

1. **Migrar gradualmente** un proyecto monolítico a arquitectura modular/microservicios
2. **Aplicar Domain-Driven Design (DDD)** para identificar bounded contexts
3. **Reducir deuda técnica** mediante refactoring
4. **Desacoplar frontend del backend** mediante APIs RESTful
5. **Separar capas** de presentación, lógica de negocio y persistencia

### Requisitos Específicos

Del punto **11. Desacoplar el frontend del backend** (página 8):

> "Conexión frontend-backend a través de comunicación API RESTful"

Y del punto **4. Separa la capa de Presentación del Backend** (página 10):

> "Capa de presentación (UI) separada de la lógica de la aplicación y las capas de acceso a datos. Por medio de un API Gateway"

### Implementación de Requisitos

| Requisito                       | Estado        | Implementación                                  |
| ------------------------------- | ------------- | ----------------------------------------------- |
| Desacoplar frontend del backend | ✅ Completado | Frontend extraído en `/frontend`                |
| Comunicación API RESTful        | ✅ Completado | APIs REST en `/api/equipos`, `/api/operaciones` |
| CORS configurado                | ✅ Completado | Middleware CORS en backend                      |
| Proxy para peticiones           | ✅ Completado | `http-proxy-middleware` en frontend             |
| Ejecución independiente         | ✅ Completado | Frontend (3000), Backend (4000)                 |
| Arquitectura DDD                | ✅ Completado | Bounded contexts mantenidos                     |
| Dockerización                   | ✅ Completado | Dockerfiles y docker-compose.yml                |

---

## Arquitectura Implementada

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA DE MICROSERVICIOS                   │
│                  Sistema de Monitoreo Minero - DDD                  │
└─────────────────────────────────────────────────────────────────────┘

                           ┌──────────────┐
                           │   Usuario    │
                           │  (Browser)   │
                           └──────┬───────┘
                                  │
                                  │ HTTP
                                  │
                    ┌─────────────▼──────────────┐
                    │   PUERTO 3000              │
┌───────────────────┴────────────────────────────┴───────────────────┐
│                                                                    │
│              FRONTEND MICROSERVICE (Presentación)                  │
│  ┌───────────────────────────────────────────────────────────┐     │
│  │                    Express Static Server                  │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │     │
│  │  │  index.html  │  │  config.js   │  │  app.js         │  │     │
│  │  │  (UI Layer)  │  │  (Config)    │  │  (Client Logic) │  │     │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘  │     │
│  └───────────────────────────────────────────────────────────┘     │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │              HTTP Proxy Middleware                         │    │
│  │  ┌──────────────────────────────────────────────────────┐  │    │
│  │  │  Redirige /api/* → http://localhost:4000/api/*       │  │    │
│  │  └──────────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                    │
└─────────────────────────────┬──────────────────────────────────────┘
                              │
                              │ HTTP Proxy
                              │ (CORS enabled)
                              │
                    ┌─────────▼──────────────┐
                    │   PUERTO 4000          │
┌───────────────────┴────────────────────────┴──────────────────┐
│                                                               │
│              BACKEND MICROSERVICE (API + Lógica)              │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │           CAPA DE PRESENTACIÓN (API REST)               │  │
│  │  ┌─────────────────┐      ┌─────────────────────────┐   │  │
│  │  │ Controllers     │      │  Routes                 │   │  │
│  │  │ - EquipoCtrl    │◄─────┤  /api/equipos           │   │  │
│  │  │ - OperacionCtrl │◄─────┤  /api/operaciones       │   │  │
│  │  └────────┬────────┘      └─────────────────────────┘   │  │
│  └───────────┼─────────────────────────────────────────────┘  │
│              │                                                │
│  ┌───────────▼─────────────────────────────────────────────┐  │
│  │           CAPA DE APLICACIÓN (Casos de Uso)             │  │
│  │  ┌──────────────────┐    ┌──────────────────────────┐   │  │
│  │  │ CrearEquipo      │    │ IniciarOperacion         │   │  │
│  │  │ ObtenerEquipos   │    │ CompletarCiclo           │   │  │
│  │  └────────┬─────────┘    └────────┬─────────────────┘   │  │
│  └───────────┼──────────────────────┼────────────────────--┘  │
│              │                      │                         │
│  ┌───────────▼──────────────────────▼──────────────────--─┐   │
│  │              CAPA DE DOMINIO (DDD)                     │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  BOUNDED CONTEXT: Monitoreo                      │  │
│  │  │  - Equipo (Aggregate Root)                       │  │   │
│  │  │  - Volquete, Excavadora (Entities)               │  │   │
│  │  │  - EstadoEquipo (Value Object)                   │  │   │
│  │  │  - MonitoreoServiciosDominio (Domain Service)    │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                        │   │
│  │  ┌──────────────────────────────────────────────────┐      │
│  │  │  BOUNDED CONTEXT: Operaciones                    │  │   │
│  │  │  - Operacion (Aggregate Root)                    │  │   │
│  │  │  - ServicioCalculoKPIs (Domain Service)          │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────┘   │
│              │                                                │
│  ┌───────────▼─────────────────────────────────────────────┐  │
│  │         CAPA DE INFRAESTRUCTURA (Persistencia)          │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │  MemoriaEquipoRepositorio                        │   │  │
│  │  │  MemoriaOperacionRepositorio                     │   │  │
│  │  │  (Implementaciones de Interfaces de Repositorio) │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Estructura de Directorios

```
sistema-monitoreo/
│
├── frontend/                          # ✨ NUEVO: Microservicio Frontend
│   ├── src/
│   │   └── server.ts                  # Servidor Express + Proxy
│   ├── public/
│   │   ├── index.html                 # Interfaz de usuario
│   │   └── js/
│   │       ├── config.js              # Configuración de endpoints
│   │       └── app.js                 # Lógica del cliente
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .gitignore
│   ├── .env.example
│   └── README.md
│
├── backend/                           # Microservicio Backend (existente)
│   ├── aplicacion/
│   │   ├── Dominio/                   # Lógica de dominio (DDD)
│   │   │   ├── monitoreo/             # Bounded Context: Monitoreo
│   │   │   │   ├── modelo/
│   │   │   │   │   ├── equipo.ts
│   │   │   │   │   ├── volquete.ts
│   │   │   │   │   └── excavadora.ts
│   │   │   │   ├── servicios/
│   │   │   │   └── interfacesRepositorio/
│   │   │   └── operaciones/           # Bounded Context: Operaciones
│   │   │       ├── modelo/
│   │   │       └── servicios/
│   │   ├── casos-uso/                 # Capa de Aplicación
│   │   │   ├── equipos/
│   │   │   │   ├── CrearEquipo.ts
│   │   │   │   └── ObtenerEquipos.ts
│   │   │   └── operaciones/
│   │   │       └── IniciarOperacion.ts
│   │   └── infraestructura/           # Capa de Infraestructura
│   │       └── persistencia/
│   │           └── repositorios/
│   │               ├── MemoriaEquipoRepositorio.ts
│   │               └── MemoriaOperacionRepositorio.ts
│   ├── presentacion/                  # Capa de Presentación (API REST)
│   │   ├── api/
│   │   │   ├── controllers/
│   │   │   │   ├── EquipoController.ts
│   │   │   │   └── OperacionesController.ts
│   │   │   └── routes/
│   │   │       ├── equipos.routes.ts
│   │   │       └── operaciones.routes.ts
│   │   ├── index.ts                   # ✨ MODIFICADO: CORS + Puerto 4000
│   │   └── web/                       # ⚠️ DEPRECADO: Movido a /frontend
│   │       └── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── docker-compose.yml                 # ✨ NUEVO: Orquestación de servicios
└── ARQUITECTURA-MICROSERVICIOS.md     # ✨ NUEVO: Esta documentación
```

---

## Decisiones de Diseño

### 1. Separación de Responsabilidades

**Decisión**: Dividir el sistema en dos microservicios independientes.

**Justificación**:

- **Single Responsibility Principle (SOLID)**: Cada servicio tiene una responsabilidad única
- **Frontend**: Presentación de datos e interacción con el usuario
- **Backend**: Lógica de negocio, validaciones y persistencia

**Beneficios**:

- Equipos separados pueden trabajar en cada servicio
- Despliegues independientes
- Escalabilidad horizontal individual
- Tecnologías específicas para cada capa

**Alineación con Práctica 07**:

- ✅ Punto 11: "Desacoplar el frontend del backend"
- ✅ Punto 4: "Separa la capa de Presentación del Backend"

---

### 2. Comunicación API RESTful

**Decisión**: Utilizar APIs REST para la comunicación entre frontend y backend.

**Justificación**:

- **Estándar de la Industria**: REST es el estándar más usado para APIs web
- **Stateless**: No mantiene estado en el servidor
- **Cacheable**: Mejora el rendimiento
- **Cliente-Servidor**: Separación clara de responsabilidades

**Implementación**:

```
Frontend → HTTP Request → Backend API
         ← HTTP Response ←
```

**Endpoints Implementados**:

- `POST /api/equipos` - Crear equipo
- `GET /api/equipos` - Listar equipos
- `GET /api/equipos/:id` - Obtener equipo
- `POST /api/operaciones` - Iniciar operación

**Alineación con Práctica 07**:

- ✅ Página 8: "Conexión frontend-backend a través de comunicación API RESTful"

---

### 3. CORS (Cross-Origin Resource Sharing)

**Decisión**: Habilitar CORS en el backend para permitir peticiones desde el frontend.

**Justificación**:

- **Necesidad**: Frontend (puerto 3000) y Backend (puerto 4000) están en diferentes orígenes
- **Seguridad**: Navegadores bloquean peticiones cross-origin por defecto
- **Desarrollo**: Facilita el desarrollo local sin problemas

**Implementación en Backend**:

```typescript
// backend/presentacion/index.ts
this.app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});
```

**Consideraciones de Seguridad**:

- En desarrollo: `*` permite cualquier origen
- En producción: Especificar dominios exactos
- Validar headers y métodos permitidos

**Alineación con Práctica 07**:

- ✅ Requisito implícito para comunicación entre microservicios

---

### 4. Proxy Transparente en Frontend

**Decisión**: Implementar un proxy en el frontend para redirigir peticiones API al backend.

**Justificación**:

- **Transparencia**: El cliente no necesita conocer la URL exacta del backend
- **Flexibilidad**: Fácil cambiar el backend según el entorno
- **Evita CORS**: En producción, el proxy evita problemas CORS
- **Centralización**: Toda la configuración en un solo lugar

**Implementación**:

```typescript
// frontend/src/server.ts
import { createProxyMiddleware } from "http-proxy-middleware";

this.app.use(
  "/api",
  createProxyMiddleware({
    target: "http://localhost:4000",
    changeOrigin: true,
    onProxyReq: (proxyReq, req) => {
      console.log(
        `Proxy: ${req.method} ${req.path} -> ${this.URL_BACKEND}${req.path}`
      );
    },
  })
);
```

**Flujo de Proxy**:

```
Cliente → fetch('/api/equipos')
         ↓
Frontend Server (puerto 3000)
         ↓ Proxy intercepta /api/*
         ↓
Backend Server (puerto 4000)
         ↓
Respuesta JSON
```

**Alineación con Práctica 07**:

- ✅ Página 10: "Por medio de un API Gateway"
- ✅ Patrón simplificado de API Gateway

---

### 5. Puertos Separados

**Decisión**: Frontend en puerto 3000, Backend en puerto 4000.

**Justificación**:

- **Independencia**: Cada servicio se ejecuta de forma autónoma
- **No Bloqueo**: Pueden ejecutarse simultáneamente
- **Desarrollo**: Facilita el desarrollo local
- **Convención**: Puertos estándar para desarrollo

**Configuración**:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`

---

### 6. Arquitectura Limpia (Clean Architecture)

**Decisión**: Mantener Clean Architecture en el backend.

**Capas Implementadas**:

```
┌─────────────────────────────────────────────────┐
│           CAPA DE PRESENTACIÓN                  │
│  (Controllers, Routes, API REST)                │
│  Dependencia: Capa de Aplicación ↓              │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│           CAPA DE APLICACIÓN                    │
│  (Casos de Uso, Orquestación)                   │
│  Dependencia: Capa de Dominio ↓                 │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│           CAPA DE DOMINIO (DDD)                 │
│  (Entidades, Agregados, Servicios, Interfaces)  │
│  NO depende de nada - Núcleo del negocio        │
└─────────────────────────────────────────────────┘
                     ↑
┌─────────────────────────────────────────────────┐
│        CAPA DE INFRAESTRUCTURA                  │
│  (Repositorios, BD, APIs externas)              │
│  Implementa interfaces del Dominio ↑            │
└─────────────────────────────────────────────────┘
```

**Principios Aplicados**:

- **Dependency Inversion**: Capas superiores dependen de abstracciones
- **Separation of Concerns**: Cada capa tiene responsabilidad única
- **Testability**: Lógica de negocio independiente de infraestructura

---

### 7. Domain-Driven Design (DDD)

**Decisión**: Aplicar patrones DDD en la capa de dominio.

**Bounded Contexts Identificados**:

#### Bounded Context: Monitoreo

**Responsabilidad**: Gestión de equipos mineros

**Modelo de Dominio**:

- **Agregado**: Equipo (Aggregate Root)
- **Entidades**: Volquete, Excavadora, Bulldozer
- **Value Objects**: EstadoEquipo, UbicacionGPS
- **Servicios de Dominio**: MonitoreoServiciosDominio
- **Repositorios**: IEquipoRepositorio

#### Bounded Context: Operaciones

**Responsabilidad**: Gestión de operaciones mineras

**Modelo de Dominio**:

- **Agregado**: Operacion (Aggregate Root)
- **Servicios de Dominio**: ServicioCalculoKPIs
- **Repositorios**: IOperacionRepositorio

**Lenguaje Ubicuo** (Ubiquitous Language):

- Equipo: Maquinaria minera
- Estado: DISPONIBLE, EN_OPERACION, EN_MANTENIMIENTO, FUERA_DE_SERVICIO
- Operación: Actividad realizada por un equipo
- Ciclo: Unidad de trabajo completa

**Alineación con Práctica 07**:

- ✅ Punto 7: "Definir contextos delimitados (bounded context)"
- ✅ Punto 6: "Definir el modelo de dominio"

---

### 8. Dockerización

**Decisión**: Containerizar ambos microservicios con Docker.

**Justificación**:

- **Portabilidad**: "Funciona en mi máquina" → Funciona en todas
- **Aislamiento**: Cada servicio en su propio contenedor
- **Despliegue**: Fácil desplegar en cualquier entorno
- **Escalabilidad**: Escalar servicios independientemente

**Implementación**:

- `frontend/Dockerfile`: Multi-stage build para frontend
- `backend/Dockerfile`: Build optimizado para backend
- `docker-compose.yml`: Orquestación de ambos servicios

**Alineación con Práctica 07**:

- ✅ Punto 7: "Implementar y desplegar el microservicio"

---

## Comunicación entre Microservicios

### Protocolo HTTP/REST

**Método de Comunicación**: HTTP con JSON

**Características**:

- **Stateless**: Sin estado en el servidor
- **Cacheable**: Mejora rendimiento
- **Uniform Interface**: Interfaz estándar

### Flujo de Comunicación Completo

#### Ejemplo: Crear un Equipo

```
1. Usuario completa formulario en navegador
   ↓
2. Click en "Crear Equipo"
   ↓
3. JavaScript ejecuta:
   fetch('/api/equipos', {
       method: 'POST',
       body: JSON.stringify({codigo: 'VOL-001', tipo: 'VOLQUETE'})
   })
   ↓
4. Petición llega a Frontend Server (puerto 3000)
   ↓
5. Proxy intercepta /api/equipos
   ↓
6. Proxy redirige a http://localhost:4000/api/equipos
   ↓
7. Backend recibe petición
   ↓
8. CORS Middleware valida origen
   ↓
9. Router /api/equipos → EquipoController.crear()
   ↓
10. Controller llama → CrearEquipo (Caso de Uso)
    ↓
11. Caso de Uso valida y llama → EquipoRepositorio.guardar()
    ↓
12. Repositorio persiste en memoria
    ↓
13. Respuesta JSON:
    {
        "success": true,
        "message": "Equipo creado exitosamente",
        "data": { "id": "...", "codigo": "VOL-001", "tipo": "VOLQUETE" }
    }
    ↓
14. Proxy devuelve respuesta al frontend
    ↓
15. JavaScript actualiza DOM
    ↓
16. Usuario ve mensaje de éxito
```

### Diagrama de Secuencia

```
Usuario    Frontend    Proxy    Backend    Caso Uso    Repositorio
  │           │          │         │           │            │
  ├─Submit────┤          │         │           │            │
  │           │          │         │           │            │
  │       ┌───▼───┐      │         │           │            │
  │       │fetch()│      │         │           │            │
  │       └───┬───┘      │         │           │            │
  │           │          │         │           │            │
  │           ├─POST─────►         │           │            │
  │           │  /api    │         │           │            │
  │           │          │         │           │            │
  │           │       ┌──▼──┐      │           │            │
  │           │       │Proxy│      │           │            │
  │           │       └──┬──┘      │           │            │
  │           │          │         │           │            │
  │           │          ├─POST────►           │            │
  │           │          │  :4000  │           │            │
  │           │          │         │           │            │
  │           │          │      ┌──▼──┐        │            │
  │           │          │      │CORS │        │            │
  │           │          │      └──┬──┘        │            │
  │           │          │         │           │            │
  │           │          │      ┌──▼─────┐     │            │
  │           │          │      │ Router │     │            │
  │           │          │      └──┬─────┘     │            │
  │           │          │         │           │            │
  │           │          │      ┌──▼────────┐  │            │
  │           │          │      │Controller │  │            │
  │           │          │      └──┬────────┘  │            │
  │           │          │         │           │            │
  │           │          │         ├─execute───►            │
  │           │          │         │           │            │
  │           │          │         │        ┌──▼──────┐     │
  │           │          │         │        │Validar  │     │
  │           │          │         │        └──┬──────┘     │
  │           │          │         │           │            │
  │           │          │         │           ├─guardar────►
  │           │          │         │           │            │
  │           │          │         │           │       ┌────▼────┐
  │           │          │         │           │       │Memoria  │
  │           │          │         │           │       └────┬────┘
  │           │          │         │           │            │
  │           │          │         │           ◄────────────┤
  │           │          │         │           │   Equipo   │
  │           │          │         │           │            │
  │           │          │         ◄───────────┤            │
  │           │          │         │  Resultado│            │
  │           │          │         │           │            │
  │           │          ◄─────────┤           │            │
  │           │          │   JSON  │           │            │
  │           │          │         │           │            │
  │           ◄──────────┤         │           │            │
  │           │   JSON   │         │           │            │
  │           │          │         │           │            │
  │       ┌───▼───┐      │         │           │            │
  │       │Update │      │         │           │            │
  │       │ DOM   │      │         │           │            │
  │       └───┬───┘      │         │           │            │
  │           │          │         │           │            │
  ◄───Éxito───┤          │         │           │            │
  │           │          │         │           │            │
```

---

## Implementación Técnica

### Tecnologías Utilizadas

#### Frontend Microservice

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Lenguaje**: TypeScript
- **Proxy**: http-proxy-middleware
- **Build**: TypeScript Compiler (tsc)

#### Backend Microservice

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Lenguaje**: TypeScript
- **Testing**: Jest
- **Build**: Grunt + TypeScript

#### Infraestructura

- **Containerización**: Docker
- **Orquestación**: Docker Compose
- **Redes**: Bridge Network

### Configuración de TypeScript

Ambos microservicios utilizan TypeScript con configuración estricta:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Seguridad

**Medidas Implementadas**:

1. **CORS**: Configurado para prevenir accesos no autorizados
2. **Type Safety**: TypeScript previene errores en tiempo de compilación
3. **Input Validation**: Validación en capa de aplicación
4. **Non-root User**: Contenedores Docker ejecutan con usuario no privilegiado
5. **Environment Variables**: Credenciales en variables de entorno (no hardcoded)

**Pendientes** (para producción):

- [ ] Autenticación y autorización (JWT)
- [ ] Rate limiting
- [ ] HTTPS/TLS
- [ ] Secrets management

---

## Despliegue y Ejecución

### Opción 1: Desarrollo Local

#### Terminal 1: Backend

```bash
cd backend
npm install
npm run dev
# Backend iniciado en http://localhost:4000
```

#### Terminal 2: Frontend

```bash
cd frontend
npm install
npm run dev
# Frontend iniciado en http://localhost:3000
```

#### Acceso

- Aplicación Web: `http://localhost:3000`
- Backend API: `http://localhost:4000`
- Health Check Frontend: `http://localhost:3000/health`
- Health Check Backend: `http://localhost:4000/health`

---

### Opción 2: Docker Compose (Recomendado)

#### Construcción y ejecución

```bash
# Desde la raíz del proyecto
docker-compose up --build

# En modo detached (background)
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f frontend
docker-compose logs -f backend
```

#### Detener servicios

```bash
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v
```

#### Acceso

- Aplicación Web: `http://localhost:3000`
- Backend API: `http://localhost:4000`

---

### Opción 3: Docker Individual

#### Frontend

```bash
cd frontend
docker build -t frontend-microservice:latest .
docker run -p 3000:3000 frontend-microservice:latest
```

#### Backend

```bash
cd backend
docker build -t backend-microservice:latest .
docker run -p 4000:4000 backend-microservice:latest
```

---

## Validación de Requisitos

### Checklist de la Práctica 07

| #      | Requisito                          | Estado            | Evidencia                       |
| ------ | ---------------------------------- | ----------------- | ------------------------------- |
| 1      | Inspeccionar calidad con SonarQube | ⏳ Pendiente      | Requiere configuración          |
| 2      | Generar reporte de issues          | ⏳ Pendiente      | Después de SonarQube            |
| 3      | Revisión de código manual          | ✅ Completado     | Aplicación de Clean Code        |
| 4      | Entender lenguaje ubicuo           | ✅ Completado     | Equipo, Operación, Estado, etc. |
| 5      | Identificar módulos                | ✅ Completado     | Monitoreo, Operaciones          |
| 6      | Definir modelo de dominio          | ✅ Completado     | Agregados, Entidades, VO        |
| 7      | Definir bounded contexts           | ✅ Completado     | Monitoreo, Operaciones          |
| 8      | Identificar dependencias           | ✅ Completado     | Frontend → Backend (API)        |
| 9      | Migrar a microservicios            | ✅ Completado     | Frontend extraído               |
| 10     | Evaluar arquitectura               | ✅ Completado     | Clean Architecture + DDD        |
| **11** | **Desacoplar frontend-backend**    | ✅ **Completado** | **API RESTful**                 |

### Validación de Puntos Críticos

#### Punto 11: Desacoplar frontend del backend ✅

**Requisito**: "Conexión frontend-backend a través de comunicación API RESTful"

**Implementación**:

- ✅ Frontend extraído en `/frontend` como microservicio independiente
- ✅ Backend expone APIs REST en `/api/equipos`, `/api/operaciones`
- ✅ Comunicación HTTP con JSON
- ✅ CORS habilitado en backend
- ✅ Proxy configurado en frontend

**Evidencia**:

```typescript
// frontend/public/js/app.js
const response = await fetch("/api/equipos", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ codigo, tipo }),
});
```

---

#### Punto 4: Separar capa de Presentación ✅

**Requisito**: "Capa de presentación (UI) separada de la lógica de la aplicación y las capas de acceso a datos. Por medio de un API Gateway"

**Implementación**:

- ✅ Frontend (puerto 3000) separado físicamente
- ✅ Backend (puerto 4000) con capas Aplicación/Dominio/Infraestructura
- ✅ Proxy actúa como API Gateway simplificado

**Evidencia**:

```typescript
// frontend/src/server.ts
this.app.use(
  "/api",
  createProxyMiddleware({
    target: "http://localhost:4000",
    changeOrigin: true,
  })
);
```

---

## Conclusiones

### Logros Alcanzados

1. ✅ **Desacoplamiento exitoso**: Frontend y backend son servicios independientes
2. ✅ **Comunicación robusta**: APIs RESTful con CORS y proxy
3. ✅ **Arquitectura limpia**: Mantenimiento de Clean Architecture y DDD
4. ✅ **Dockerización**: Ambos servicios pueden ejecutarse en contenedores
5. ✅ **Documentación completa**: Decisiones de arquitectura documentadas

### Beneficios Obtenidos

**Escalabilidad**:

- Cada servicio puede escalar independientemente
- Frontend puede servirse desde CDN
- Backend puede tener múltiples instancias

**Mantenibilidad**:

- Equipos separados para frontend y backend
- Cambios en UI no afectan lógica de negocio
- Refactoring más seguro y localizado

**Despliegue**:

- Despliegues independientes y sin downtime
- Rollback granular por servicio
- CI/CD separados

**Tecnología**:

- Libertad para elegir tecnologías específicas
- Frontend podría migrar a React, Vue, Angular
- Backend podría migrar a otro lenguaje

### Próximos Pasos

**Corto Plazo**:

- [ ] Implementar pruebas unitarias y de integración
- [ ] Configurar SonarQube para análisis de calidad
- [ ] Implementar CI/CD con GitHub Actions

**Mediano Plazo**:

- [ ] Agregar autenticación y autorización (JWT)
- [ ] Implementar API Gateway completo (Kong, NGINX)
- [ ] Migrar a base de datos real (PostgreSQL, MongoDB)
- [ ] Implementar logging centralizado (ELK Stack)

**Largo Plazo**:

- [ ] Extraer más microservicios (Mina, Turno, Usuarios)
- [ ] Implementar Event-Driven Architecture
- [ ] Implementar CQRS y Event Sourcing
- [ ] Desplegar en Kubernetes

---

## Referencias

### Documentación de la Práctica

- [Pr7_redesign.pdf](backend/Pr7_redesign.pdf) - Guía oficial de la práctica 07

### Arquitectura y Patrones

- [Microsoft - Microservices Architecture](https://learn.microsoft.com/en-us/azure/architecture/microservices/)
- [Microsoft - Domain Analysis for Microservices](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis)
- [Martin Fowler - Microservices](https://martinfowler.com/articles/microservices.html)

### Domain-Driven Design

- Eric Evans - "Domain-Driven Design: Tackling Complexity in the Heart of Software"
- Vaughn Vernon - "Implementing Domain-Driven Design"

### Clean Architecture

- Robert C. Martin - "Clean Architecture: A Craftsman's Guide to Software Structure and Design"
- Robert C. Martin - "Clean Code: A Handbook of Agile Software Craftsmanship"

### Tecnologías

- [Express.js Documentation](https://expressjs.com/)
- [HTTP Proxy Middleware](https://github.com/chimurai/http-proxy-middleware)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Docker Documentation](https://docs.docker.com/)

---

**Fecha de elaboración**: 11 de Enero de 2026
**Versión**: 1.0.0
**Autor**: Sistema de Monitoreo Minero - Práctica 07
