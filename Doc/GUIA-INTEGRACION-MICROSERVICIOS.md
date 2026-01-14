# Guía de Integración y Mejores Prácticas - Microservicios

## Sistema de Monitoreo Minero

**Universidad Nacional de San Agustín de Arequipa**
**Ingeniería de Software II**
**Guía Práctica de Implementación**

---

## Índice

1. [Estrategia de Integración](#estrategia-de-integración)
2. [Patrones de Comunicación](#patrones-de-comunicación)
3. [Mejores Prácticas](#mejores-prácticas)
4. [Guía de Implementación Paso a Paso](#guía-de-implementación-paso-a-paso)
5. [Manejo de Errores y Resiliencia](#manejo-de-errores-y-resiliencia)
6. [Seguridad](#seguridad)
7. [Testing](#testing)
8. [Monitoreo y Observabilidad](#monitoreo-y-observabilidad)
9. [Checklist de Producción](#checklist-de-producción)

---

## Estrategia de Integración

### 1. Integración Actual (Síncrona)

**Estado**: Implementado y funcional

Los microservicios se comunican mediante llamadas HTTP/REST síncronas cuando el frontend necesita datos.

```
Frontend → HTTP GET /api/equipos → Servicio Monitoreo
         ← JSON { equipos: [...] } ←

Frontend → HTTP POST /api/operaciones → Servicio Operaciones
         ← JSON { operacion: {...} } ←
```

**Ventajas**:
- ✅ Simple de implementar
- ✅ Fácil de depurar
- ✅ Respuesta inmediata
- ✅ No requiere infraestructura adicional

**Desventajas**:
- ❌ Acoplamiento temporal
- ❌ Servicio bloqueado hasta recibir respuesta
- ❌ Cascada de fallos si un servicio cae
- ❌ No escala bien bajo alta carga

### 2. Integración Recomendada (Asíncrona con Eventos)

**Estado**: Pendiente - Alta prioridad para producción

Los microservicios se comunican mediante eventos de dominio a través de un message broker.

```
Servicio Operaciones
    │
    ├─ Publica: EquipoAsignadoAOperacionEvent
    │  { operacionId, equipoId, timestamp }
    │
    ▼
RabbitMQ / Kafka
    │
    ▼
Servicio Monitoreo
    │
    └─ Se suscribe al evento
       └─ Actualiza estado del equipo
          └─ Publica: EstadoEquipoCambiadoEvent
```

**Ventajas**:
- ✅ Desacoplamiento temporal
- ✅ Alta escalabilidad
- ✅ Resiliencia ante fallos
- ✅ Procesamiento asíncrono
- ✅ Auditoría completa (event log)

**Trade-offs**:
- ⚠️ Complejidad adicional
- ⚠️ Eventual consistency
- ⚠️ Requiere infraestructura (message broker)
- ⚠️ Debugging más complejo

---

## Patrones de Comunicación

### Patrón 1: API REST Síncrona (Implementado)

**Cuándo usar**:
- Consultas simples sin efectos secundarios
- Necesidad de respuesta inmediata
- Operaciones idempotentes

**Ejemplo de implementación**:

```typescript
// Frontend/Cliente
async function obtenerEquipos() {
    const response = await fetch('http://localhost:5000/api/equipos');
    const data = await response.json();
    return data;
}

// Servicio Monitoreo
router.get('/api/equipos', async (req, res) => {
    const equipos = await obtenerEquipos.ejecutar();
    res.json({ success: true, data: equipos });
});
```

**Mejores prácticas**:
1. Implementar timeouts
2. Retry con backoff exponencial
3. Circuit breaker para evitar cascada de fallos
4. Cachear respuestas cuando sea posible

### Patrón 2: Event-Driven Architecture (Recomendado)

**Cuándo usar**:
- Operaciones que afectan múltiples servicios
- Necesidad de auditoría completa
- Alta escalabilidad requerida
- Comunicación de cambios de estado

**Ejemplo de implementación**:

```typescript
// ===================================
// 1. Definir Eventos de Dominio
// ===================================

// shared/events/EquipoAsignadoEvent.ts
export interface EquipoAsignadoEvent {
    type: 'EquipoAsignadoAOperacion';
    data: {
        operacionId: string;
        equipoId: string;
        timestamp: Date;
        supervisorId: string;
    };
}

// ===================================
// 2. Publicar Evento (Servicio Operaciones)
// ===================================

// servicio-operaciones/src/aplicacion/casos-uso/AsignarEquipoAOperacion.ts
import { IEventBus } from '../../infraestructura/eventos/IEventBus';

export class AsignarEquipoAOperacion {
    constructor(
        private operacionRepo: IOperacionRepositorio,
        private eventBus: IEventBus
    ) {}

    async ejecutar(dto: AsignarEquipoDTO) {
        // 1. Validar y persistir
        const operacion = await this.operacionRepo.obtenerPorId(dto.operacionId);
        if (!operacion) {
            throw new Error('Operación no encontrada');
        }

        operacion.asignarEquipo(dto.equipoId);
        await this.operacionRepo.actualizar(operacion);

        // 2. Publicar evento
        await this.eventBus.publish({
            type: 'EquipoAsignadoAOperacion',
            data: {
                operacionId: operacion.id,
                equipoId: dto.equipoId,
                timestamp: new Date(),
                supervisorId: operacion.supervisorId
            }
        });

        return { success: true, data: operacion.obtenerInfo() };
    }
}

// ===================================
// 3. Implementar Event Bus (RabbitMQ)
// ===================================

// infraestructura/eventos/RabbitMQEventBus.ts
import * as amqp from 'amqplib';

export class RabbitMQEventBus implements IEventBus {
    private connection: amqp.Connection | null = null;
    private channel: amqp.Channel | null = null;

    async connect(url: string) {
        this.connection = await amqp.connect(url);
        this.channel = await this.connection.createChannel();
        await this.channel.assertExchange('domain-events', 'topic', { durable: true });
    }

    async publish(event: any) {
        if (!this.channel) {
            throw new Error('Channel not initialized');
        }

        const routingKey = event.type;
        const message = JSON.stringify(event);

        this.channel.publish(
            'domain-events',
            routingKey,
            Buffer.from(message),
            { persistent: true }
        );

        console.log(`📤 Evento publicado: ${event.type}`);
    }

    async subscribe(eventType: string, handler: (event: any) => Promise<void>) {
        if (!this.channel) {
            throw new Error('Channel not initialized');
        }

        const queue = await this.channel.assertQueue('', { exclusive: true });
        await this.channel.bindQueue(queue.queue, 'domain-events', eventType);

        this.channel.consume(queue.queue, async (msg) => {
            if (msg) {
                const event = JSON.parse(msg.content.toString());
                console.log(`📥 Evento recibido: ${event.type}`);

                try {
                    await handler(event);
                    this.channel!.ack(msg);
                } catch (error) {
                    console.error('Error procesando evento:', error);
                    // Reintento o Dead Letter Queue
                    this.channel!.nack(msg, false, false);
                }
            }
        });
    }
}

// ===================================
// 4. Suscribirse al Evento (Servicio Monitoreo)
// ===================================

// servicio-monitoreo/src/aplicacion/event-handlers/EquipoAsignadoEventHandler.ts
export class EquipoAsignadoEventHandler {
    constructor(private equipoRepo: IEquipoRepositorio) {}

    async handle(event: EquipoAsignadoEvent) {
        console.log(`🔄 Procesando evento: EquipoAsignadoAOperacion`);
        console.log(`   Operación: ${event.data.operacionId}`);
        console.log(`   Equipo: ${event.data.equipoId}`);

        try {
            // 1. Obtener equipo
            const equipo = await this.equipoRepo.obtenerPorId(event.data.equipoId);
            if (!equipo) {
                console.error(`❌ Equipo no encontrado: ${event.data.equipoId}`);
                return;
            }

            // 2. Cambiar estado
            equipo.cambiarEstado('OPERANDO');

            // 3. Persistir
            await this.equipoRepo.actualizar(equipo);

            console.log(`✅ Estado del equipo actualizado a OPERANDO`);

            // 4. Publicar evento de estado cambiado (opcional)
            // await this.eventBus.publish({
            //     type: 'EstadoEquipoCambiado',
            //     data: { equipoId: equipo.id, nuevoEstado: 'OPERANDO' }
            // });

        } catch (error) {
            console.error(`❌ Error procesando evento:`, error);
            throw error; // Reintento automático
        }
    }
}

// ===================================
// 5. Configurar en el Servidor Principal
// ===================================

// servicio-monitoreo/src/index.ts
import { RabbitMQEventBus } from './infraestructura/eventos/RabbitMQEventBus';
import { EquipoAsignadoEventHandler } from './aplicacion/event-handlers/EquipoAsignadoEventHandler';

class ServicioMonitoreo {
    private eventBus: RabbitMQEventBus;

    constructor() {
        this.eventBus = new RabbitMQEventBus();
        // ...
    }

    async iniciar() {
        // 1. Conectar a RabbitMQ
        await this.eventBus.connect(process.env.RABBITMQ_URL || 'amqp://localhost');

        // 2. Suscribirse a eventos
        const handler = new EquipoAsignadoEventHandler(this.equipoRepositorio);
        await this.eventBus.subscribe('EquipoAsignadoAOperacion', (event) =>
            handler.handle(event)
        );

        // 3. Iniciar servidor HTTP
        this.app.listen(this.puerto, () => {
            console.log(`✅ Servicio Monitoreo iniciado en puerto ${this.puerto}`);
            console.log(`📡 Suscrito a eventos de dominio`);
        });
    }
}
```

**Dependencias necesarias**:
```bash
npm install amqplib
npm install --save-dev @types/amqplib
```

**Docker Compose con RabbitMQ**:
```yaml
services:
  rabbitmq:
    image: rabbitmq:3-management
    container_name: rabbitmq
    ports:
      - "5672:5672"   # AMQP
      - "15672:15672" # Management UI
    environment:
      - RABBITMQ_DEFAULT_USER=admin
      - RABBITMQ_DEFAULT_PASS=admin
    networks:
      - microservices-network
```

### Patrón 3: Saga Pattern (Transacciones Distribuidas)

**Cuándo usar**:
- Operaciones que involucran múltiples servicios
- Necesidad de rollback automático
- Transacciones de larga duración

**Ejemplo**: Crear Operación + Asignar Equipo + Notificar Supervisor

```typescript
// Saga Coordinada (Orquestación)
export class CrearOperacionSaga {
    async ejecutar(dto: CrearOperacionDTO) {
        let operacionId: string | null = null;

        try {
            // Paso 1: Crear operación
            operacionId = await this.operacionesService.crear(dto);

            // Paso 2: Asignar equipo
            await this.operacionesService.asignarEquipo(operacionId, dto.equipoId);

            // Paso 3: Actualizar estado equipo
            await this.monitoreoService.cambiarEstado(dto.equipoId, 'OPERANDO');

            // Paso 4: Notificar supervisor
            await this.notificacionService.notificar(dto.supervisorId, {
                tipo: 'OPERACION_INICIADA',
                operacionId
            });

            return { success: true, operacionId };

        } catch (error) {
            // Rollback
            console.error('Error en saga, iniciando rollback');

            if (operacionId) {
                await this.rollback(operacionId, dto);
            }

            throw error;
        }
    }

    private async rollback(operacionId: string, dto: CrearOperacionDTO) {
        try {
            await this.monitoreoService.cambiarEstado(dto.equipoId, 'DISPONIBLE');
            await this.operacionesService.cancelar(operacionId);
        } catch (rollbackError) {
            console.error('Error en rollback:', rollbackError);
            // Alertar al equipo de operaciones
        }
    }
}
```

---

## Mejores Prácticas

### 1. Diseño de APIs REST

#### ✅ Buenas Prácticas

```typescript
// 1. Usar verbos HTTP correctos
POST   /api/equipos         // Crear
GET    /api/equipos         // Listar
GET    /api/equipos/:id     // Obtener uno
PUT    /api/equipos/:id     // Actualizar completo
PATCH  /api/equipos/:id     // Actualizar parcial
DELETE /api/equipos/:id     // Eliminar

// 2. Respuestas consistentes
{
    "success": true | false,
    "data": {...} | [...],
    "message": "Mensaje descriptivo",
    "errors": [...] // Solo si hay errores
}

// 3. Códigos HTTP apropiados
200 OK - Éxito
201 Created - Recurso creado
204 No Content - Éxito sin contenido
400 Bad Request - Error del cliente
404 Not Found - Recurso no encontrado
500 Internal Server Error - Error del servidor

// 4. Paginación para listas grandes
GET /api/equipos?page=1&limit=20

// 5. Filtros mediante query params
GET /api/equipos?tipo=VOLQUETE&estado=DISPONIBLE

// 6. Versionado de API
GET /api/v1/equipos
GET /api/v2/equipos
```

#### ❌ Anti-patrones

```typescript
// NO: Verbos en la URL
POST /api/createEquipo
GET /api/getEquipos

// NO: Respuestas inconsistentes
// A veces: { data: [...] }
// Otras veces: [...] directo

// NO: Ignorar códigos HTTP
// Siempre 200 OK, incluso con errores

// NO: Exponer implementación
GET /api/equipos/buscarEnMemoria
```

### 2. Manejo de Errores

```typescript
// ===================================
// Error Middleware Global
// ===================================

// src/presentacion/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public isOperational: boolean = true
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export function errorHandler(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.error('❌ Error:', error);

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }

    // Error no esperado
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
}

// Uso en casos de uso
export class CrearEquipo {
    async ejecutar(dto: CrearEquipoDTO) {
        const existe = await this.repositorio.existeConCodigo(dto.codigo);
        if (existe) {
            throw new AppError(400, `Ya existe un equipo con el código: ${dto.codigo}`);
        }

        // ...
    }
}
```

### 3. Validación de Entrada

```typescript
// ===================================
// Validación con DTOs
// ===================================

// src/aplicacion/dtos/CrearEquipoDTO.ts
export interface CrearEquipoDTO {
    codigo: string;
    tipo: 'VOLQUETE' | 'EXCAVADORA' | 'BULLDOZER' | 'GRUA' | 'PERFORADORA';
    nivelCombustible?: number;
    horasOperacion?: number;
}

export function validarCrearEquipoDTO(dto: any): CrearEquipoDTO {
    // Validar código
    if (!dto.codigo || typeof dto.codigo !== 'string') {
        throw new AppError(400, 'El código es obligatorio y debe ser un string');
    }
    if (dto.codigo.length < 3) {
        throw new AppError(400, 'El código debe tener al menos 3 caracteres');
    }

    // Validar tipo
    const tiposValidos = ['VOLQUETE', 'EXCAVADORA', 'BULLDOZER', 'GRUA', 'PERFORADORA'];
    if (!dto.tipo || !tiposValidos.includes(dto.tipo)) {
        throw new AppError(400, `Tipo inválido. Valores permitidos: ${tiposValidos.join(', ')}`);
    }

    // Validar nivel combustible (opcional)
    if (dto.nivelCombustible !== undefined) {
        if (typeof dto.nivelCombustible !== 'number' || dto.nivelCombustible < 0 || dto.nivelCombustible > 100) {
            throw new AppError(400, 'Nivel de combustible debe ser un número entre 0 y 100');
        }
    }

    // Validar horas operación (opcional)
    if (dto.horasOperacion !== undefined) {
        if (typeof dto.horasOperacion !== 'number' || dto.horasOperacion < 0) {
            throw new AppError(400, 'Horas de operación debe ser un número positivo');
        }
    }

    return {
        codigo: dto.codigo.trim().toUpperCase(),
        tipo: dto.tipo,
        nivelCombustible: dto.nivelCombustible || 100,
        horasOperacion: dto.horasOperacion || 0
    };
}

// Uso en controller
router.post('/api/equipos', async (req, res, next) => {
    try {
        const dto = validarCrearEquipoDTO(req.body);
        const resultado = await crearEquipo.ejecutar(dto);
        res.status(201).json(resultado);
    } catch (error) {
        next(error);
    }
});
```

### 4. Logging Estructurado

```typescript
// ===================================
// Logger con Winston
// ===================================

// src/infraestructura/logging/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: process.env.SERVICE_NAME || 'servicio-monitoreo' },
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// Uso
logger.info('Equipo creado', { equipoId: equipo.id, codigo: equipo.codigo });
logger.error('Error creando equipo', { error: error.message, stack: error.stack });
logger.warn('Equipo con bajo combustible', { equipoId, nivel: equipo.nivelCombustible });
```

### 5. Configuración con Variables de Entorno

```typescript
// ===================================
// Configuración Centralizada
// ===================================

// src/config/index.ts
import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: parseInt(process.env.PORT || '5000'),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || '*',

    // Otros servicios
    operacionesServiceUrl: process.env.OPERACIONES_SERVICE_URL || 'http://localhost:6000',
    usuariosServiceUrl: process.env.USUARIOS_SERVICE_URL || 'http://localhost:4000',

    // Message broker
    rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://localhost:5672',

    // Logging
    logLevel: process.env.LOG_LEVEL || 'info',

    // Database (futuro)
    databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/monitoreo_db',

    // Validación
    validate() {
        if (!this.port) {
            throw new Error('PORT es requerido');
        }
        // Más validaciones...
    }
};

// Validar al inicio
config.validate();

// Uso
const app = express();
app.listen(config.port, () => {
    console.log(`Servidor iniciado en puerto ${config.port}`);
});
```

---

## Guía de Implementación Paso a Paso

### Paso 1: Instalar Dependencias

```bash
# Servicio Monitoreo
cd servicio-monitoreo
npm install

# Servicio Operaciones
cd ../servicio-operaciones
npm install
```

### Paso 2: Configurar Variables de Entorno

```bash
# Copiar archivos de ejemplo
cp servicio-monitoreo/.env.example servicio-monitoreo/.env
cp servicio-operaciones/.env.example servicio-operaciones/.env
```

### Paso 3: Ejecutar con Docker Compose

```bash
# Desde la raíz
docker-compose up --build
```

### Paso 4: Verificar Health Checks

```bash
# Monitoreo
curl http://localhost:5000/health

# Operaciones
curl http://localhost:6000/health

# Backend
curl http://localhost:4000/health

# Frontend
curl http://localhost:3000/health
```

### Paso 5: Probar Endpoints

```bash
# Crear equipo
curl -X POST http://localhost:5000/api/equipos \
  -H "Content-Type: application/json" \
  -d '{"codigo":"VOL-200","tipo":"VOLQUETE"}'

# Listar equipos
curl http://localhost:5000/api/equipos

# Iniciar operación
curl -X POST http://localhost:6000/api/operaciones \
  -H "Content-Type: application/json" \
  -d '{
    "tipo":"CARGUE",
    "supervisorId":"SUP-001",
    "frenteId":"FRENTE-A"
  }'

# Asignar equipo a operación
curl -X POST http://localhost:6000/api/operaciones/{operacionId}/equipos \
  -H "Content-Type: application/json" \
  -d '{"equipoId":"uuid-del-equipo"}'
```

---

## Manejo de Errores y Resiliencia

### 1. Circuit Breaker Pattern

Previene cascada de fallos cerrando el "circuito" cuando un servicio falla repetidamente.

```typescript
// ===================================
// Circuit Breaker Simple
// ===================================

export class CircuitBreaker {
    private failures: number = 0;
    private lastFailureTime: number = 0;
    private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

    constructor(
        private threshold: number = 5,
        private timeout: number = 60000 // 1 minuto
    ) {}

    async call<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime > this.timeout) {
                this.state = 'HALF_OPEN';
            } else {
                throw new Error('Circuit breaker is OPEN');
            }
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private onSuccess() {
        this.failures = 0;
        this.state = 'CLOSED';
    }

    private onFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();

        if (this.failures >= this.threshold) {
            this.state = 'OPEN';
            console.warn(`⚠️ Circuit breaker OPEN (${this.failures} failures)`);
        }
    }
}

// Uso
const breaker = new CircuitBreaker();

try {
    const response = await breaker.call(() =>
        fetch('http://servicio-operaciones:6000/api/operaciones')
    );
} catch (error) {
    console.error('Servicio no disponible:', error);
    // Fallback: usar cache o respuesta por defecto
}
```

### 2. Retry con Backoff Exponencial

```typescript
// ===================================
// Retry con Backoff Exponencial
// ===================================

export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;

            if (i < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, i); // Exponencial
                console.warn(`Reintentando en ${delay}ms (intento ${i + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError!;
}

// Uso
const equipos = await retryWithBackoff(
    () => fetch('http://servicio-monitoreo:5000/api/equipos').then(r => r.json()),
    3,
    1000
);
```

### 3. Timeout

```typescript
// ===================================
// Timeout para Peticiones
// ===================================

export async function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Timeout después de ${timeoutMs}ms`)), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
}

// Uso
try {
    const response = await withTimeout(
        fetch('http://servicio-operaciones:6000/api/operaciones'),
        5000 // 5 segundos
    );
} catch (error) {
    console.error('Timeout o error:', error);
}
```

---

## Seguridad

### 1. Autenticación JWT (Recomendado)

```typescript
// ===================================
// Middleware de Autenticación
// ===================================

import jwt from 'jsonwebtoken';

export interface JWTPayload {
    userId: string;
    role: 'OPERADOR' | 'SUPERVISOR' | 'ADMIN';
}

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'Token no proporcionado'
        });
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
        req.user = payload;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Token inválido'
        });
    }
}

// Uso
router.post('/api/equipos', authenticateJWT, (req, res) => {
    // req.user está disponible
    const { userId, role } = req.user;
    // ...
});
```

### 2. Rate Limiting

```typescript
// ===================================
// Rate Limiting con express-rate-limit
// ===================================

import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Máximo 100 peticiones por ventana
    message: 'Demasiadas peticiones, intenta más tarde'
});

app.use('/api/', limiter);
```

### 3. Validación de CORS

```typescript
// ===================================
// CORS Configurado
// ===================================

import cors from 'cors';

const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? ['https://mi-dominio.com']
        : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

---

## Testing

### 1. Tests Unitarios

```typescript
// ===================================
// Test de Entidad de Dominio
// ===================================

// src/dominio/entidades/__tests__/Equipo.test.ts
import { Equipo } from '../Equipo';

describe('Equipo', () => {
    it('debería crear un equipo correctamente', () => {
        const equipo = new Equipo('uuid', 'VOL-001', 'VOLQUETE');

        expect(equipo.id).toBe('uuid');
        expect(equipo.codigo).toBe('VOL-001');
        expect(equipo.tipo).toBe('VOLQUETE');
        expect(equipo.estado).toBe('DISPONIBLE');
    });

    it('debería cambiar estado correctamente', () => {
        const equipo = new Equipo('uuid', 'VOL-001', 'VOLQUETE');

        equipo.cambiarEstado('OPERANDO');

        expect(equipo.estado).toBe('OPERANDO');
    });

    it('debería lanzar error al cambiar a estado inválido', () => {
        const equipo = new Equipo('uuid', 'VOL-001', 'VOLQUETE');

        expect(() => {
            equipo.cambiarEstado('ESTADO_INVALIDO');
        }).toThrow('Estado ESTADO_INVALIDO no es válido');
    });
});
```

### 2. Tests de Integración

```typescript
// ===================================
// Test de Caso de Uso
// ===================================

// src/aplicacion/casos-uso/__tests__/CrearEquipo.integration.test.ts
import { CrearEquipo } from '../CrearEquipo';
import { MemoriaEquipoRepositorio } from '../../../infraestructura/persistencia/MemoriaEquipoRepositorio';

describe('CrearEquipo', () => {
    let repositorio: MemoriaEquipoRepositorio;
    let crearEquipo: CrearEquipo;

    beforeEach(() => {
        repositorio = new MemoriaEquipoRepositorio();
        crearEquipo = new CrearEquipo(repositorio);
    });

    it('debería crear un equipo correctamente', async () => {
        const resultado = await crearEquipo.ejecutar({
            codigo: 'TEST-001',
            tipo: 'VOLQUETE'
        });

        expect(resultado.success).toBe(true);
        expect(resultado.data.codigo).toBe('TEST-001');
    });

    it('debería fallar si el código ya existe', async () => {
        await crearEquipo.ejecutar({
            codigo: 'TEST-001',
            tipo: 'VOLQUETE'
        });

        const resultado = await crearEquipo.ejecutar({
            codigo: 'TEST-001',
            tipo: 'EXCAVADORA'
        });

        expect(resultado.success).toBe(false);
        expect(resultado.error).toContain('Ya existe');
    });
});
```

### 3. Tests de API (End-to-End)

```typescript
// ===================================
// Test E2E con Supertest
// ===================================

import request from 'supertest';
import { app } from '../../../index';

describe('API de Equipos', () => {
    it('POST /api/equipos debería crear un equipo', async () => {
        const response = await request(app)
            .post('/api/equipos')
            .send({
                codigo: 'VOL-E2E',
                tipo: 'VOLQUETE'
            })
            .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.codigo).toBe('VOL-E2E');
    });

    it('GET /api/equipos debería listar equipos', async () => {
        const response = await request(app)
            .get('/api/equipos')
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
    });
});
```

---

## Monitoreo y Observabilidad

### 1. Métricas con Prometheus

```typescript
// ===================================
// Exportar Métricas
// ===================================

import { register, Counter, Histogram } from 'prom-client';

// Contadores
const httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total de peticiones HTTP',
    labelNames: ['method', 'route', 'status']
});

// Histogramas (duraciones)
const httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duración de peticiones HTTP',
    labelNames: ['method', 'route']
});

// Middleware para registrar métricas
app.use((req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;

        httpRequestsTotal.inc({
            method: req.method,
            route: req.route?.path || req.path,
            status: res.statusCode
        });

        httpRequestDuration.observe({
            method: req.method,
            route: req.route?.path || req.path
        }, duration);
    });

    next();
});

// Endpoint de métricas
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.send(await register.metrics());
});
```

### 2. Distributed Tracing con Jaeger

```typescript
// ===================================
// Configurar Tracing
// ===================================

import { initTracer } from 'jaeger-client';

const config = {
    serviceName: 'servicio-monitoreo',
    sampler: {
        type: 'const',
        param: 1
    },
    reporter: {
        logSpans: true,
        agentHost: process.env.JAEGER_AGENT_HOST || 'localhost',
        agentPort: 6831
    }
};

const tracer = initTracer(config, {});

// Uso en controllers
app.get('/api/equipos', async (req, res) => {
    const span = tracer.startSpan('obtener_equipos');

    try {
        const equipos = await obtenerEquipos.ejecutar();
        span.setTag('equipos_count', equipos.length);
        res.json(equipos);
    } catch (error) {
        span.setTag('error', true);
        span.log({ event: 'error', message: error.message });
        throw error;
    } finally {
        span.finish();
    }
});
```

---

## Checklist de Producción

### Seguridad
- [ ] Implementar autenticación JWT
- [ ] Configurar CORS restrictivo
- [ ] Implementar rate limiting
- [ ] Validar todas las entradas
- [ ] Usar HTTPS/TLS
- [ ] Secrets en variables de entorno (no en código)
- [ ] Escanear dependencias (npm audit)

### Resiliencia
- [ ] Implementar circuit breaker
- [ ] Configurar retry con backoff
- [ ] Establecer timeouts
- [ ] Implementar health checks
- [ ] Configurar graceful shutdown
- [ ] Implementar fallbacks

### Datos
- [ ] Migrar a base de datos real (PostgreSQL/MongoDB)
- [ ] Configurar backups automáticos
- [ ] Implementar migrations
- [ ] Configurar índices de BD
- [ ] Implementar soft deletes

### Comunicación
- [ ] Implementar eventos de dominio
- [ ] Configurar RabbitMQ/Kafka
- [ ] Implementar Dead Letter Queue
- [ ] Configurar reintentos automáticos
- [ ] Implementar idempotencia

### Observabilidad
- [ ] Configurar logging estructurado
- [ ] Implementar métricas (Prometheus)
- [ ] Configurar alertas
- [ ] Implementar distributed tracing
- [ ] Configurar dashboards (Grafana)

### Deployment
- [ ] Configurar CI/CD
- [ ] Implementar tests automáticos
- [ ] Configurar staging environment
- [ ] Implementar blue-green deployment
- [ ] Configurar rollback automático

### Documentación
- [ ] Documentar todas las APIs (OpenAPI/Swagger)
- [ ] Crear guía de deployment
- [ ] Documentar runbooks para incidentes
- [ ] Crear diagramas de arquitectura actualizados

---

## Conclusión

Esta guía proporciona las herramientas y patrones necesarios para integrar y operar los microservicios de manera efectiva.

**Próximos pasos recomendados**:
1. Implementar comunicación asíncrona con eventos
2. Agregar tests de integración completos
3. Configurar observabilidad con Prometheus + Grafana
4. Migrar a bases de datos reales
5. Implementar API Gateway

---

**Fecha**: 14 de Enero de 2026
**Versión**: 1.0.0
**Autor**: Sistema de Monitoreo Minero - UNSA
