# Frontend Microservice - Sistema de Monitoreo Minero

Microservicio frontend independiente que consume las APIs del backend mediante comunicación RESTful.

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                 ARQUITECTURA DE MICROSERVICIOS          │
└─────────────────────────────────────────────────────────┘

    ┌──────────────┐                    ┌──────────────┐
    │   Browser    │                    │   Browser    │
    │  (Cliente)   │                    │  (Cliente)   │
    └──────┬───────┘                    └──────┬───────┘
           │                                   │
           │ HTTP (puerto 3000)                │
           ▼                                   │
    ┌─────────────────────┐                   │
    │  Frontend Service   │                   │
    │  ┌───────────────┐  │                   │
    │  │  Express      │  │                   │
    │  │  Static Files │  │                   │
    │  └───────────────┘  │                   │
    │  ┌───────────────┐  │                   │
    │  │  Proxy        │◄─┼───────────────────┘
    │  │  Middleware   │  │  /api/* requests
    │  └───────┬───────┘  │
    └──────────┼──────────┘
               │
               │ HTTP Proxy
               │ (puerto 4000)
               ▼
    ┌─────────────────────┐
    │  Backend Service    │
    │  ┌───────────────┐  │
    │  │  REST API     │  │
    │  │  CORS enabled │  │
    │  └───────┬───────┘  │
    │          │          │
    │  ┌───────▼───────┐  │
    │  │  Business     │  │
    │  │  Logic (DDD)  │  │
    │  └───────┬───────┘  │
    │          │          │
    │  ┌───────▼───────┐  │
    │  │  Repository   │  │
    │  │  (Memory)     │  │
    │  └───────────────┘  │
    └─────────────────────┘
```

## Características

- **Servidor Express**: Sirve archivos estáticos HTML/CSS/JS
- **Proxy Transparente**: Redirige peticiones `/api/*` al backend
- **CORS Configurado**: Permite comunicación entre servicios
- **Independiente**: Se ejecuta en puerto separado del backend
- **TypeScript**: Código tipado y robusto
- **Docker Ready**: Incluye Dockerfile para despliegue

## Estructura del Proyecto

```
frontend/
├── src/
│   └── server.ts          # Servidor Express con proxy
├── public/
│   ├── index.html         # Aplicación web
│   └── js/
│       ├── config.js      # Configuración de endpoints
│       └── app.js         # Lógica de la aplicación
├── dist/                  # Código compilado (generado)
├── package.json
├── tsconfig.json
├── Dockerfile
└── README.md
```

## Instalación y Ejecución

### Desarrollo Local

```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar en modo desarrollo
npm run dev

# 3. El frontend estará disponible en http://localhost:3000
```

**IMPORTANTE**: Asegúrate de que el backend esté ejecutándose en el puerto 4000.

### Producción

```bash
# 1. Compilar TypeScript
npm run build

# 2. Ejecutar en producción
npm start
```

### Docker

```bash
# Construir imagen
docker build -t frontend-microservice:latest .

# Ejecutar contenedor
docker run -p 3000:3000 frontend-microservice:latest
```

### Docker Compose (Recomendado)

Desde la raíz del proyecto:

```bash
# Iniciar ambos microservicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

## Configuración

### Variables de Entorno

Crear archivo `.env` basado en `.env.example`:

```env
PORT=3000
BACKEND_URL=http://localhost:4000
NODE_ENV=development
```

### Configuración del Proxy

El archivo `src/server.ts` configura el proxy para redirigir peticiones:

```typescript
// Todas las peticiones /api/* se redirigen al backend
this.app.use('/api', createProxyMiddleware({
    target: 'http://localhost:4000',
    changeOrigin: true
}));
```

## Endpoints

### Frontend

- `GET /` - Aplicación web principal
- `GET /health` - Health check del frontend
- `GET /api/*` - Proxy hacia el backend

### Backend (via Proxy)

- `POST /api/equipos` - Crear equipo
- `GET /api/equipos` - Listar equipos
- `GET /api/equipos/:id` - Obtener equipo por ID
- `POST /api/operaciones` - Iniciar operación

## Decisiones de Arquitectura

### 1. Desacoplamiento Frontend-Backend

**Decisión**: Separar el frontend en un microservicio independiente.

**Razones**:
- **Escalabilidad**: Cada servicio puede escalar de forma independiente
- **Mantenibilidad**: Equipos separados pueden trabajar en cada servicio
- **Despliegue**: Se pueden actualizar servicios sin afectar al otro
- **Tecnología**: Permite usar diferentes stacks en frontend y backend

### 2. Proxy Middleware

**Decisión**: Usar `http-proxy-middleware` para redirigir peticiones al backend.

**Razones**:
- **Transparencia**: El frontend no necesita conocer la URL exacta del backend
- **Seguridad**: Evita problemas de CORS en producción
- **Flexibilidad**: Fácil cambiar la URL del backend según el entorno
- **Centralización**: Toda la configuración de proxy en un solo lugar

### 3. CORS en Backend

**Decisión**: Habilitar CORS en el backend para permitir peticiones desde el frontend.

**Razones**:
- **Comunicación Cross-Origin**: Frontend (puerto 3000) y Backend (puerto 4000) están en diferentes orígenes
- **Desarrollo Local**: Facilita el desarrollo local sin problemas de CORS
- **APIs Públicas**: Permite que otras aplicaciones consuman el API

### 4. Servidor Express para Frontend

**Decisión**: Usar Express en lugar de un servidor estático simple.

**Razones**:
- **Proxy**: Express facilita la configuración del proxy middleware
- **Flexibilidad**: Permite agregar middleware adicional en el futuro
- **Logging**: Facilita el logging de peticiones
- **Health Checks**: Permite endpoints de monitoreo

## Comunicación Frontend-Backend

### Flujo de una Petición

```
1. Usuario hace click en "Crear Equipo"
   ↓
2. JavaScript ejecuta fetch('/api/equipos', {...})
   ↓
3. Petición llega al servidor frontend (puerto 3000)
   ↓
4. Proxy intercepta la petición /api/*
   ↓
5. Proxy redirige a http://localhost:4000/api/equipos
   ↓
6. Backend procesa la petición
   ↓
7. Backend devuelve respuesta JSON
   ↓
8. Proxy devuelve respuesta al frontend
   ↓
9. JavaScript actualiza el DOM
```

### Ejemplo de Código

```javascript
// En public/js/app.js
async function crearEquipo(codigo, tipo) {
    const response = await fetch('/api/equipos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo, tipo })
    });

    return await response.json();
}
```

## Principios DDD Aplicados

### Bounded Context

- **Frontend Context**: UI, presentación de datos, interacción con usuario
- **Backend Context**: Lógica de negocio, validaciones, persistencia

### Lenguaje Ubicuo

- **Equipo**: Maquinaria minera (volquete, excavadora, bulldozer)
- **Operación**: Actividad realizada por un equipo
- **Estado**: Condición actual del equipo

## Testing

```bash
# Ejecutar tests (cuando estén implementados)
npm test
```

## Mantenimiento

### Agregar Nuevas Funcionalidades

1. Actualizar `public/index.html` con nuevos elementos UI
2. Agregar lógica en `public/js/app.js`
3. Asegurar que el backend tenga los endpoints necesarios

### Cambiar URL del Backend

Editar `public/js/config.js`:

```javascript
const CONFIG = {
    API_BASE_URL: 'https://api.produccion.com'
};
```

## Troubleshooting

### Error: "Cannot connect to backend"

- Verificar que el backend esté ejecutándose en el puerto 4000
- Revisar la configuración de CORS en el backend
- Verificar la URL en `public/js/config.js`

### Error: "CORS policy"

- Asegurar que el backend tenga CORS habilitado
- Verificar que las cabeceras CORS incluyan el origen del frontend

## Referencias

- [Práctica 07 - Rediseño a Microservicios](../backend/Pr7_redesign.pdf)
- [Express.js Documentation](https://expressjs.com/)
- [HTTP Proxy Middleware](https://github.com/chimurai/http-proxy-middleware)
- [Domain-Driven Design](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis)

## Licencia

MIT
