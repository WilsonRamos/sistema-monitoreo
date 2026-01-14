# ⚙️ Servicio de Operaciones Mineras

Microservicio independiente para gestión de operaciones mineras (Cargue, Transporte, Descarga).

## 📋 Descripción

Este microservicio maneja el **Bounded Context de Operaciones**, incluyendo la gestión de operaciones mineras, asignación de equipos, cálculo de KPIs y seguimiento de productividad.

## 🏗️ Arquitectura

- **Patrón**: Clean Architecture + Domain-Driven Design (DDD)
- **Puerto**: 6000
- **Base de Datos**: En memoria (MemoriaOperacionRepositorio) - Ready para PostgreSQL/MongoDB
- **Comunicación**: REST API + JSON

### Estructura de Capas

```
servicio-operaciones/
├── dominio/                    # Capa de Dominio (DDD)
│   ├── entidades/              # Agregados y Entidades
│   │   └── Operacion.ts        # Aggregate Root
│   ├── value-objects/          # Value Objects
│   │   └── TipoOperacion.ts
│   ├── repositorios/           # Interfaces de Repositorio
│   │   └── IOperacionRepositorio.ts
│   └── servicios/              # Servicios de Dominio
│       └── OperacionesServiciosDominio.ts
│
├── aplicacion/                 # Capa de Aplicación
│   └── casos-uso/              # Use Cases
│       ├── IniciarOperacion.ts
│       ├── FinalizarOperacion.ts
│       ├── AsignarEquipoAOperacion.ts
│       ├── ObtenerOperaciones.ts
│       └── ObtenerKPIsOperaciones.ts
│
├── infraestructura/            # Capa de Infraestructura
│   └── persistencia/
│       └── MemoriaOperacionRepositorio.ts
│
└── presentacion/               # Capa de Presentación
    ├── controllers/
    │   ├── OperacionController.ts
    │   └── KPIsController.ts
    └── routes/
        ├── operaciones.routes.ts
        └── kpis.routes.ts
```

## 🚀 Inicio Rápido

### Requisitos

- Node.js 18+
- npm 8+
- TypeScript 5+

### Instalación

```bash
cd servicio-operaciones
npm install
```

### Ejecución

```bash
# Desarrollo (con hot-reload)
npm run dev

# Producción
npm start

# Build
npm run build
```

El servicio estará disponible en: `http://localhost:6000`

## 📚 API Endpoints

### Operaciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/operaciones` | Iniciar una operación nueva |
| GET | `/api/operaciones` | Listar operaciones (con filtros opcionales) |
| PUT | `/api/operaciones/:id/finalizar` | Finalizar una operación |
| POST | `/api/operaciones/:id/equipos` | Asignar un equipo a una operación |

### KPIs

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/kpis` | Obtener KPIs de operaciones |

### Utilidades

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Información del servicio |
| GET | `/health` | Health check |

## 💡 Ejemplos de Uso

### Iniciar una Operación

```bash
curl -X POST http://localhost:6000/api/operaciones \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "CARGUE",
    "supervisorId": "uuid-supervisor",
    "frenteId": "uuid-frente",
    "equiposAsignados": ["uuid-equipo-1", "uuid-equipo-2"]
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Operación iniciada exitosamente",
  "data": {
    "id": "uuid-generado",
    "tipo": "CARGUE",
    "fechaInicio": "2025-01-14T10:00:00.000Z",
    "fechaFin": null,
    "supervisorId": "uuid-supervisor",
    "frenteId": "uuid-frente",
    "equiposAsignados": ["uuid-equipo-1", "uuid-equipo-2"],
    "cantidadEquipos": 2,
    "duracionMinutos": 0,
    "estaActiva": true
  }
}
```

### Listar Operaciones

```bash
# Todas las operaciones
curl http://localhost:6000/api/operaciones

# Filtrar por supervisor
curl http://localhost:6000/api/operaciones?supervisorId=uuid-supervisor

# Filtrar por frente
curl http://localhost:6000/api/operaciones?frenteId=uuid-frente

# Filtrar por estado (activas)
curl http://localhost:6000/api/operaciones?activas=true

# Filtrar por estado (finalizadas)
curl http://localhost:6000/api/operaciones?activas=false
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-operacion",
      "tipo": "CARGUE",
      "fechaInicio": "2025-01-14T10:00:00.000Z",
      "fechaFin": null,
      "supervisorId": "uuid-supervisor",
      "frenteId": "uuid-frente",
      "equiposAsignados": ["uuid-equipo-1"],
      "cantidadEquipos": 1,
      "duracionMinutos": 120,
      "estaActiva": true
    }
  ],
  "count": 1
}
```

### Finalizar una Operación

```bash
curl -X PUT http://localhost:6000/api/operaciones/{id}/finalizar \
  -H "Content-Type: application/json"
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Operación finalizada exitosamente",
  "data": {
    "id": "uuid-operacion",
    "tipo": "CARGUE",
    "fechaInicio": "2025-01-14T10:00:00.000Z",
    "fechaFin": "2025-01-14T12:00:00.000Z",
    "duracionMinutos": 120,
    "estaActiva": false
  }
}
```

### Asignar Equipo a Operación

```bash
curl -X POST http://localhost:6000/api/operaciones/{id}/equipos \
  -H "Content-Type: application/json" \
  -d '{"equipoId": "uuid-equipo-3"}'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Equipo asignado exitosamente",
  "data": {
    "id": "uuid-operacion",
    "equiposAsignados": ["uuid-equipo-1", "uuid-equipo-2", "uuid-equipo-3"],
    "cantidadEquipos": 3
  }
}
```

### Obtener KPIs

```bash
curl http://localhost:6000/api/kpis
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "operacionesCompletadas": 5,
    "tiempoCicloPromedioMinutos": 45,
    "equiposEnOperacion": 8,
    "duracionTotalMinutos": 225,
    "tasaCompletitud": "71%"
  }
}
```

## 🐳 Docker

### Construir Imagen

```bash
docker build -t servicio-operaciones:latest .
```

### Ejecutar Contenedor

```bash
docker run -p 6000:6000 \
  -e NODE_ENV=production \
  servicio-operaciones:latest
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

## 🔐 Seguridad

- ✅ Generación de IDs con `crypto.randomUUID()` (no Math.random)
- ✅ Validación de entrada en capa de aplicación
- ✅ Type Safety con TypeScript
- ✅ Contenedor Docker con usuario no privilegiado
- ✅ CORS configurado
- ✅ Acoplamiento débil (equipos referenciados por ID, no objetos completos)

## 📊 Modelo de Dominio

### Operacion (Aggregate Root)

```typescript
class Operacion {
  - id: string
  - tipo: string (CARGUE, TRANSPORTE, DESCARGA)
  - fechaInicio: Date
  - fechaFin: Date | null
  - supervisorId: string
  - frenteId: string
  - equiposAsignados: string[]  // IDs de equipos (acoplamiento débil)
  - fechaCreacion: Date
  - fechaActualizacion: Date

  + asignarEquipo(equipoId: string): void
  + removerEquipo(equipoId: string): void
  + finalizar(): void
  + calcularDuracionMinutos(): number
  + estaActiva(): boolean
  + cantidadEquiposAsignados(): number
  + tieneEquipoAsignado(equipoId: string): boolean
}
```

### Tipos de Operación

- `CARGUE` - Operación de carga de material
- `TRANSPORTE` - Operación de transporte de material
- `DESCARGA` - Operación de descarga de material

### Invariantes de Dominio

- Una operación debe tener al menos un tipo válido (CARGUE, TRANSPORTE, DESCARGA)
- Una operación debe tener un supervisor y un frente asignados
- No se pueden asignar equipos duplicados a una operación
- No se pueden modificar operaciones finalizadas
- Los equipos se referencian por ID (no objetos completos) para mantener acoplamiento débil

## 🔄 Integración con Otros Servicios

Este microservicio se comunica con:

- **Servicio de Monitoreo** (puerto 5000) - Para consultar disponibilidad de equipos
- **Servicio de Usuarios** (puerto 7000) - Para validar supervisores

Eventos de dominio que puede publicar:

- **OperacionIniciadaEvent** - Cuando se inicia una operación
- **OperacionFinalizadaEvent** - Cuando se finaliza una operación
- **EquipoAsignadoEvent** - Cuando se asigna un equipo a una operación

## 📈 KPIs Disponibles

1. **Operaciones Completadas** - Total de operaciones finalizadas
2. **Tiempo de Ciclo Promedio** - Duración promedio de operaciones en minutos
3. **Equipos en Operación** - Cantidad de equipos asignados a operaciones activas
4. **Duración Total** - Suma total de minutos de operaciones finalizadas
5. **Tasa de Completitud** - Porcentaje de operaciones finalizadas vs. totales

## 🛠️ Variables de Entorno

```bash
PORT=6000
NODE_ENV=development
DATABASE_URL=postgresql://...
CORS_ORIGIN=http://localhost:3000
MONITOREO_SERVICE_URL=http://localhost:5000
USUARIOS_SERVICE_URL=http://localhost:7000
RABBITMQ_URL=amqp://localhost:5672
LOG_LEVEL=info
```

## 📖 Documentación Adicional

- [Arquitectura de Microservicios](../Doc/ARQUITECTURA-MICROSERVICIOS.md)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

## 📝 Notas de Implementación

- El repositorio actual es en memoria para desarrollo/testing
- En producción, reemplazar `MemoriaOperacionRepositorio` con implementación de PostgreSQL/MongoDB
- Los datos de prueba se inicializan automáticamente al iniciar el servicio (3 operaciones)
- Se recomienda implementar eventos de dominio para comunicación asincrónica con otros servicios
- Los equipos se almacenan como IDs (strings) en lugar de objetos completos para mantener bajo acoplamiento

## 🎯 Patrones de Diseño Implementados

- **Clean Architecture** - Separación de capas con dependencias hacia el dominio
- **DDD (Domain-Driven Design)** - Entidades, Value Objects, Aggregate Roots, Repositories
- **Use Case Pattern** - Casos de uso como orquestadores de lógica de aplicación
- **Repository Pattern** - Abstracción de persistencia
- **Dependency Injection** - Inyección de dependencias en constructores
- **DTO Pattern** - Objetos de transferencia de datos para API

## 🤝 Contribución

Este microservicio es parte del Sistema de Monitoreo Minero - Práctica de Ingeniería de Software II (UNSA).

---

**Puerto**: 6000
**Versión**: 1.0.0
**Licencia**: MIT
