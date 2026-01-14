# 🏔️ Servicio de Monitoreo de Equipos Mineros

Microservicio independiente para gestión y monitoreo de equipos mineros en tiempo real.

## 📋 Descripción

Este microservicio maneja el **Bounded Context de Monitoreo**, incluyendo la gestión de equipos mineros (Volquetes, Excavadoras, Bulldozers), su estado operacional, alertas y KPIs.

## 🏗️ Arquitectura

- **Patrón**: Clean Architecture + Domain-Driven Design (DDD)
- **Puerto**: 5000
- **Base de Datos**: En memoria (MemoriaEquipoRepositorio) - Ready para PostgreSQL/MongoDB
- **Comunicación**: REST API + JSON

### Estructura de Capas

```
servicio-monitoreo/
├── dominio/                    # Capa de Dominio (DDD)
│   ├── entidades/              # Agregados y Entidades
│   │   ├── Equipo.ts           # Aggregate Root
│   │   ├── Excavadora.ts
│   │   └── Volquete.ts
│   ├── value-objects/          # Value Objects
│   │   ├── EstadoEquipo.ts
│   │   └── UbicacionGPS.ts
│   ├── repositorios/           # Interfaces de Repositorio
│   │   └── IEquipoRepositorio.ts
│   └── servicios/              # Servicios de Dominio
│       └── MonitoreoServiciosDominio.ts
│
├── aplicacion/                 # Capa de Aplicación
│   └── casos-uso/              # Use Cases
│       ├── CrearEquipo.ts
│       ├── ObtenerEquipos.ts
│       ├── ActualizarEstadoEquipo.ts
│       └── ObtenerAlertasEquipos.ts
│
├── infraestructura/            # Capa de Infraestructura
│   └── persistencia/
│       └── MemoriaEquipoRepositorio.ts
│
└── presentacion/               # Capa de Presentación
    ├── controllers/
    │   ├── EquipoController.ts
    │   └── MonitoreoController.ts
    └── routes/
        ├── equipos.routes.ts
        └── monitoreo.routes.ts
```

## 🚀 Inicio Rápido

### Requisitos

- Node.js 18+
- npm 8+
- TypeScript 5+

### Instalación

```bash
cd servicio-monitoreo
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

El servicio estará disponible en: `http://localhost:5000`

## 📚 API Endpoints

### Equipos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/equipos` | Crear un equipo nuevo |
| GET | `/api/equipos` | Listar equipos (con filtros opcionales) |
| PUT | `/api/equipos/:id/estado` | Actualizar estado de un equipo |

### Monitoreo

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/monitoreo/alertas` | Obtener alertas de equipos |
| GET | `/api/monitoreo/kpis` | Obtener KPIs de la flota |

### Utilidades

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Información del servicio |
| GET | `/health` | Health check |

## 💡 Ejemplos de Uso

### Crear un Equipo

```bash
curl -X POST http://localhost:5000/api/equipos \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "VOL-100",
    "tipo": "VOLQUETE",
    "nivelCombustible": 85,
    "horasOperacion": 120
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Equipo creado exitosamente",
  "data": {
    "id": "uuid-generado",
    "codigo": "VOL-100",
    "tipo": "VOLQUETE",
    "estado": "DISPONIBLE",
    "nivelCombustible": 85,
    "horasOperacion": 120
  }
}
```

### Listar Equipos

```bash
# Todos los equipos
curl http://localhost:5000/api/equipos

# Filtrar por tipo
curl http://localhost:5000/api/equipos?tipo=VOLQUETE

# Filtrar por estado
curl http://localhost:5000/api/equipos?estado=OPERANDO

# Filtrar por tipo y estado
curl http://localhost:5000/api/equipos?tipo=VOLQUETE&estado=DISPONIBLE
```

### Actualizar Estado

```bash
curl -X PUT http://localhost:5000/api/equipos/{id}/estado \
  -H "Content-Type: application/json" \
  -d '{"estado": "OPERANDO"}'
```

### Obtener Alertas

```bash
curl http://localhost:5000/api/monitoreo/alertas
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "equipoId": "uuid",
      "codigo": "VOL-001",
      "tipo": "VOLQUETE",
      "alertas": [
        "ALERTA: El equipo VOL-001 tiene bajo nivel de combustible."
      ]
    }
  ],
  "count": 1
}
```

### Obtener KPIs

```bash
curl http://localhost:5000/api/monitoreo/kpis
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "tiempoOperacionTotal": 670,
    "combustibleTotalDisponible": 245,
    "tasaDisponibilidad": "66.67%",
    "equiposRequierenMantenimiento": 1,
    "equiposBajoCombustible": 0
  }
}
```

## 🐳 Docker

### Construir Imagen

```bash
docker build -t servicio-monitoreo:latest .
```

### Ejecutar Contenedor

```bash
docker run -p 5000:5000 \
  -e NODE_ENV=production \
  servicio-monitoreo:latest
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

## 📊 Modelo de Dominio

### Equipo (Aggregate Root)

```typescript
class Equipo {
  - id: string
  - codigo: string
  - tipo: string
  - estado: string
  - nivelCombustible: number
  - horasOperacion: number
  - fechaCreacion: Date
  - fechaActualizacion: Date

  + cambiarEstado(nuevoEstado: string): void
  + consumirCombustible(cantidad: number): void
  + sumarHorasOperacion(horas: number): void
  + puedeOperar(): boolean
  + verificarAlertas(): void
}
```

### Estados Válidos

- `DISPONIBLE` - Equipo listo para operar
- `OPERANDO` - Equipo en operación
- `MANTENIMIENTO` - Equipo en mantenimiento
- `INACTIVO` - Equipo fuera de servicio

### Transiciones de Estado

```
DISPONIBLE → OPERANDO, MANTENIMIENTO, INACTIVO
OPERANDO → DISPONIBLE, MANTENIMIENTO
MANTENIMIENTO → DISPONIBLE, INACTIVO
INACTIVO → DISPONIBLE, MANTENIMIENTO
```

## 🔄 Integración con Otros Servicios

Este microservicio puede publicar eventos de dominio para comunicarse con otros servicios:

- **Evento**: `EquipoCambiado Estado`
- **Evento**: `EquipoCreadoEvent`
- **Evento**: `AlertaGeneradaEvent`

## 📈 KPIs Disponibles

1. **Tiempo de operación total** - Suma de horas de todos los equipos
2. **Combustible total disponible** - Suma de combustible de todos los equipos
3. **Tasa de disponibilidad** - Porcentaje de equipos disponibles
4. **Equipos para mantenimiento** - Cantidad de equipos que superan umbral de horas
5. **Equipos con bajo combustible** - Cantidad de equipos con combustible bajo umbral

## 🛠️ Variables de Entorno

```bash
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://...
CORS_ORIGIN=http://localhost:3000
OPERACIONES_SERVICE_URL=http://localhost:6000
RABBITMQ_URL=amqp://localhost:5672
LOG_LEVEL=info
```

## 📖 Documentación Adicional

- [Arquitectura de Microservicios](../Doc/ARQUITECTURA-MICROSERVICIOS.md)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

## 📝 Notas de Implementación

- El repositorio actual es en memoria para desarrollo/testing
- En producción, reemplazar `MemoriaEquipoRepositorio` con implementación de PostgreSQL/MongoDB
- Los datos de prueba se inicializan automáticamente al iniciar el servicio
- Se recomienda implementar eventos de dominio para comunicación asincrónica

## 🤝 Contribución

Este microservicio es parte del Sistema de Monitoreo Minero - Práctica 07 de Ingeniería de Software II (UNSA).

---

**Puerto**: 5000
**Versión**: 1.0.0
**Licencia**: MIT
