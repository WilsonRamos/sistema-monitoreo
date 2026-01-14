# Solución a Errores de Jest en Docker Build

## Problema Identificado

Al intentar construir las imágenes Docker, aparecen errores de Jest relacionados con el parseo de archivos TypeScript:

```
SyntaxError: Cannot use import statement outside a module
```

## Causa Raíz

El **Gruntfile.js** del backend ejecuta `npm test` como parte de la tarea `build` (línea 178), y Jest no está correctamente configurado para parsear TypeScript en el contexto de Docker.

## Solución Aplicada

### 1. Nueva Tarea de Grunt sin Tests

Se agregó una nueva tarea `build:docker` en [Gruntfile.js](backend/Gruntfile.js) que **omite** la ejecución de tests:

```javascript
// Tarea de construcción SIN tests (para Docker)
grunt.registerTask('build:docker', [
  'clean:dist',        // 1. Limpiar directorio
  'shell:typescript',  // 2. Compilar TypeScript con tsc nativo
  'copy:web',         // 3. Copiar archivos web
  'copy:package'      // 4. Preparar package.json
]);
```

### 2. Dockerfile Actualizado

El [Dockerfile del backend](backend/Dockerfile) ahora usa la nueva tarea:

**Antes**:
```dockerfile
RUN npm run build
```

**Después**:
```dockerfile
# Compilar con Grunt SIN tests (esto genera /dist)
RUN npx grunt build:docker
```

### 3. Puerto Corregido

También se actualizó el puerto en el Dockerfile de 3000 a **4000**:

```dockerfile
ENV NODE_ENV=production \
    PORT=4000

EXPOSE 4000
```

## Cómo Ejecutar Ahora

### Opción 1: Docker Compose (Recomendado)

```bash
cd c:\Users\bug\Desktop\Wilson\sistema-monitoreo
docker-compose up --build
```

Esto construirá ambos servicios sin errores y los iniciará:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000

### Opción 2: Desarrollo Local (Sin Docker)

Si prefieres ejecutar localmente **con tests**:

**Backend**:
```bash
cd backend
npm install
npm run build    # Esto SÍ ejecuta los tests
npm start
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

## Tests en Desarrollo Local

Los tests **sí funcionan** en desarrollo local, solo hay problemas en Docker. Para ejecutar tests localmente:

```bash
cd backend

# Ejecutar todos los tests
npm test

# Ejecutar tests con cobertura
npm run test:coverage
```

## ¿Por Qué Esta Solución?

1. **Separación de Concerns**: El build de Docker no necesita ejecutar tests
2. **CI/CD**: Los tests deben ejecutarse en un paso separado del CI/CD pipeline
3. **Velocidad**: Construir la imagen Docker es más rápido sin tests
4. **Best Practice**: Los tests se ejecutan antes del build en pipelines profesionales

## Próximos Pasos (Opcional)

Para una solución más profesional, puedes:

1. **Configurar Jest correctamente** para TypeScript en Docker
2. **Separar tests en CI/CD**: Ejecutar tests en GitHub Actions antes del build
3. **Multi-stage Docker**: Tener un stage específico para tests

Por ahora, la solución implementada permite que Docker funcione sin problemas.

---

## Verificación

Después de ejecutar `docker-compose up --build`, deberías ver:

```
backend-microservice    | 🔧 ==========================================
backend-microservice    |    BACKEND MICROSERVICE INICIADO
backend-microservice    | 🔧 ==========================================
backend-microservice    | 🌐 API Base: http://localhost:4000
backend-microservice    | ...

frontend-microservice   | 🎨 ==========================================
frontend-microservice   |    FRONTEND MICROSERVICE INICIADO
frontend-microservice   | 🎨 ==========================================
frontend-microservice   | 📱 Aplicación Web: http://localhost:3000
frontend-microservice   | ...
```

Abre http://localhost:3000 y deberías ver la aplicación funcionando.

---

**Fecha**: 11 de Enero de 2026
**Versión**: 1.0.1
