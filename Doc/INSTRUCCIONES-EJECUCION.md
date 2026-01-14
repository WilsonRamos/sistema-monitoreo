# Instrucciones de Ejecución - Sistema de Monitoreo Minero

## Guía Rápida para Ejecutar los Microservicios

> **Nota importante**: Si encuentras errores de Jest durante el build de Docker, consulta [SOLUCION-ERRORES-JEST.md](SOLUCION-ERRORES-JEST.md)

---

## Opción 1: Docker Compose (Recomendado - Más Fácil)

### Prerrequisitos
- Docker Desktop instalado
- Docker Compose instalado

### Pasos

```bash
# 1. Navegar a la raíz del proyecto
cd c:\Users\bug\Desktop\Wilson\sistema-monitoreo

# 2. Construir y ejecutar ambos servicios
docker-compose up --build

# O en modo detached (background)
docker-compose up -d --build
```

### Acceder a la aplicación

- **Aplicación Web**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Health Check Frontend**: http://localhost:3000/health
- **Health Check Backend**: http://localhost:4000/health

### Comandos útiles

```bash
# Ver logs de ambos servicios
docker-compose logs -f

# Ver logs solo del frontend
docker-compose logs -f frontend

# Ver logs solo del backend
docker-compose logs -f backend

# Detener servicios
docker-compose down

# Reconstruir desde cero
docker-compose down
docker-compose build --no-cache
docker-compose up
```

---

## Opción 2: Ejecución Local (Desarrollo)

### Prerrequisitos
- Node.js 18+ instalado
- npm instalado

### Terminal 1: Backend

```bash
# 1. Navegar al backend
cd c:\Users\bug\Desktop\Wilson\sistema-monitoreo\backend

# 2. Instalar dependencias
npm install

# 3. Ejecutar en modo desarrollo
npm run dev
```

**Salida esperada**:
```
🔧 ==========================================
   BACKEND MICROSERVICE INICIADO
🔧 ==========================================
🌐 API Base: http://localhost:4000
🔗 API Equipos: http://localhost:4000/api/equipos
🔗 API Operaciones: http://localhost:4000/api/operaciones
💚 Health Check: http://localhost:4000/health
✅ CORS habilitado para comunicación con Frontend
==========================================
```

### Terminal 2: Frontend

```bash
# 1. Navegar al frontend
cd c:\Users\bug\Desktop\Wilson\sistema-monitoreo\frontend

# 2. Instalar dependencias
npm install

# 3. Ejecutar en modo desarrollo
npm run dev
```

**Salida esperada**:
```
🎨 ==========================================
   FRONTEND MICROSERVICE INICIADO
🎨 ==========================================
📱 Aplicación Web: http://localhost:3000
💚 Health Check: http://localhost:3000/health
🔗 Proxy hacia Backend: http://localhost:4000
==========================================

⚠️  IMPORTANTE: Asegúrate de que el backend esté ejecutándose en el puerto 4000
```

### Acceder a la aplicación

Abre tu navegador en: **http://localhost:3000**

---

## Verificación de Funcionamiento

### 1. Verificar que los servicios estén corriendo

#### Backend
```bash
# En PowerShell o CMD
curl http://localhost:4000/health

# O abrir en navegador:
# http://localhost:4000/health
```

**Respuesta esperada**:
```json
{
  "success": true,
  "service": "Backend Microservice",
  "status": "OK",
  "message": "Sistema de Monitoreo funcionando correctamente",
  "timestamp": "2026-01-11T..."
}
```

#### Frontend
```bash
curl http://localhost:3000/health
```

**Respuesta esperada**:
```json
{
  "success": true,
  "service": "Frontend Microservice",
  "status": "OK",
  "timestamp": "2026-01-11T...",
  "backend": "http://localhost:4000"
}
```

### 2. Probar la aplicación

1. Abrir http://localhost:3000
2. Completar el formulario "Registrar Nuevo Equipo":
   - Código: `VOL-001`
   - Tipo: `VOLQUETE`
3. Click en "✅ Crear Equipo"
4. Verificar mensaje de éxito
5. Verificar que el equipo aparece en la lista "Equipos Registrados"

### 3. Verificar comunicación Frontend-Backend

Abrir las **DevTools del navegador** (F12) y ver la consola:

```
🚀 Sistema de Monitoreo Minero - Frontend Microservice iniciado
⚙️ Configuración del Frontend cargada: {API_BASE_URL: "http://localhost:4000", ...}
🌐 Página cargada completamente
🔗 Backend configurado en: http://localhost:4000
📋 Cargando lista de equipos...
📡 API Request: GET http://localhost:4000/api/equipos
📊 Equipos obtenidos: {success: true, data: [...]}
```

---

## Solución de Problemas

### Error: "Cannot connect to backend"

**Síntoma**: El frontend muestra error de conexión

**Solución**:
1. Verificar que el backend esté ejecutándose:
   ```bash
   curl http://localhost:4000/health
   ```
2. Si no responde, iniciar el backend:
   ```bash
   cd backend
   npm run dev
   ```

### Error: "Port 3000 is already in use"

**Síntoma**: No se puede iniciar el frontend

**Solución**:
1. Encontrar el proceso usando el puerto:
   ```bash
   # Windows
   netstat -ano | findstr :3000

   # Ver qué aplicación es
   tasklist | findstr <PID>
   ```
2. Matar el proceso:
   ```bash
   taskkill /PID <PID> /F
   ```

### Error: "Port 4000 is already in use"

Similar al anterior, pero con puerto 4000.

### Error de CORS en el navegador

**Síntoma**: "Access to fetch at 'http://localhost:4000/api/equipos' from origin 'http://localhost:3000' has been blocked by CORS policy"

**Solución**:
1. Verificar que el backend tenga CORS habilitado
2. Reiniciar el backend
3. Limpiar caché del navegador (Ctrl + Shift + Del)

### Dependencias no instaladas

**Síntoma**: "Error: Cannot find module..."

**Solución**:
```bash
# En backend
cd backend
rm -rf node_modules
npm install

# En frontend
cd frontend
rm -rf node_modules
npm install
```

---

## Arquitectura de Comunicación

```
┌─────────────┐
│  Navegador  │
│  (Cliente)  │
└──────┬──────┘
       │
       │ HTTP GET http://localhost:3000
       │
┌──────▼───────────────────────┐
│  Frontend Microservice       │
│  Puerto: 3000                │
│  ┌────────────────────────┐ │
│  │  Express Static Server │ │
│  │  + Proxy Middleware    │ │
│  └────────────────────────┘ │
└──────┬───────────────────────┘
       │
       │ Proxy: /api/* → http://localhost:4000/api/*
       │
┌──────▼───────────────────────┐
│  Backend Microservice        │
│  Puerto: 4000                │
│  ┌────────────────────────┐ │
│  │  Express REST API      │ │
│  │  + CORS enabled        │ │
│  │  + Clean Architecture  │ │
│  │  + DDD                 │ │
│  └────────────────────────┘ │
└──────────────────────────────┘
```

---

## Scripts Disponibles

### Frontend

```bash
npm run dev          # Modo desarrollo con nodemon
npm run build        # Compilar TypeScript
npm start            # Ejecutar versión compilada
npm run start:prod   # Build + Start
```

### Backend

```bash
npm run dev          # Modo desarrollo con nodemon
npm run build        # Compilar con Grunt
npm start            # Build + Start
npm test             # Ejecutar tests
npm run test:coverage # Tests con cobertura
```

---

## Próximos Pasos

Después de verificar que todo funciona:

1. **Revisar el código**: Explorar la estructura de ambos microservicios
2. **Leer la documentación**: Ver [ARQUITECTURA-MICROSERVICIOS.md](ARQUITECTURA-MICROSERVICIOS.md)
3. **Agregar funcionalidades**: Seguir las guías en [frontend/README.md](frontend/README.md)
4. **Ejecutar tests**: `npm test` en el backend
5. **Configurar SonarQube**: Análisis de calidad de código

---

## Contacto y Soporte

Para problemas o preguntas:
- Revisar la documentación completa en [ARQUITECTURA-MICROSERVICIOS.md](ARQUITECTURA-MICROSERVICIOS.md)
- Revisar el README del frontend en [frontend/README.md](frontend/README.md)
- Consultar la Práctica 07: [backend/Pr7_redesign.pdf](backend/Pr7_redesign.pdf)

---

**Fecha**: 11 de Enero de 2026
**Versión**: 1.0.0
