# Guía Completa del API Gateway con NGINX

## Sistema de Monitoreo Minero

**Universidad Nacional de San Agustín de Arequipa**
**Ingeniería de Software II**

---

## 📋 Índice

1. [¿Qué es un API Gateway?](#qué-es-un-api-gateway)
2. [Explicación Conceptual](#explicación-conceptual)
3. [Cómo Funciona NGINX](#cómo-funciona-nginx)
4. [Implementación en el Proyecto](#implementación-en-el-proyecto)
5. [Guía de Uso](#guía-de-uso)
6. [Ejemplos Prácticos](#ejemplos-prácticos)
7. [Comparación: Antes vs Después](#comparación-antes-vs-después)

---

## ¿Qué es un API Gateway?

### Definición Simple

Un **API Gateway** es como la **recepción de un edificio de oficinas**.

**Analogía del Edificio**:

```
                    🏢 EDIFICIO DE OFICINAS
                          │
                          │
                ┌─────────▼─────────┐
                │   RECEPCIONISTA   │ ← API Gateway
                │   (Entrada única) │
                └─────────┬─────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
   [Oficina 1]       [Oficina 2]       [Oficina 3]
   Recursos         Contabilidad       Marketing
   Humanos
```

**¿Qué hace la recepcionista?**

1. **Identificación**: ¿Quién eres? (Autenticación)
2. **Autorización**: ¿Tienes permiso para entrar? (Autorización)
3. **Dirección**: "La oficina de contabilidad está en el piso 3" (Routing)
4. **Registro**: Anota quién entró y a qué hora (Logging)
5. **Límites**: "Solo puedes entrar 10 veces por día" (Rate Limiting)

**En sistemas de software**:

- **Visitantes** = Peticiones HTTP del usuario
- **Recepcionista** = API Gateway (NGINX)
- **Oficinas** = Microservicios (Monitoreo, Operaciones, Backend)

---

## Explicación Conceptual

### ¿Por qué necesitamos un API Gateway?

#### Problema 1: Múltiples Puertas de Entrada

**SIN API Gateway**:

```
Usuario
  │
  ├── http://localhost:3000  → Frontend
  ├── http://localhost:4000  → Backend
  ├── http://localhost:5000  → Monitoreo
  └── http://localhost:6000  → Operaciones

Problemas:
❌ Usuario debe conocer 4 URLs diferentes
❌ Cada servicio implementa su propia autenticación
❌ CORS configurado en cada servicio
❌ Rate limiting duplicado
❌ Difícil de monitorear
```

**CON API Gateway**:

```
Usuario
  │
  └── http://localhost  → API Gateway
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
        Frontend         Monitoreo       Operaciones
        (interno)        (interno)       (interno)

Ventajas:
✅ Usuario solo conoce 1 URL
✅ Autenticación centralizada
✅ CORS en un solo lugar
✅ Rate limiting unificado
✅ Logs centralizados
```

#### Problema 2: Seguridad

**SIN API Gateway**:

```
Usuario Malicioso
  │
  └── http://localhost:5000/api/equipos
            ↓
      ❌ Acceso directo sin autenticación
      ❌ Puede hacer 1000 peticiones/segundo
      ❌ Puede descubrir servicios internos
```

**CON API Gateway**:

```
Usuario Malicioso
  │
  └── http://localhost/api/equipos
            ↓
      API Gateway
            ↓
      ✅ Valida JWT token
      ✅ Limita a 10 peticiones/segundo
      ✅ Bloquea si detecta abuso
      ✅ Servicios internos ocultos
```

---

## Cómo Funciona NGINX

### ¿Qué es NGINX?

**NGINX** es un servidor web extremadamente rápido y ligero que puede funcionar como:

1. **Servidor Web**: Sirve archivos HTML, CSS, JS
2. **Reverse Proxy**: Redirige peticiones a otros servidores
3. **Load Balancer**: Distribuye carga entre múltiples servidores
4. **API Gateway**: Punto de entrada único (nuestro caso)

### Arquitectura de NGINX como API Gateway

```
┌───────────────────────────────────────────────────────┐
│                   NGINX (API Gateway)                 │
│                                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │  1. RECEPCIÓN DE PETICIÓN                   │    │
│  │     - Cliente hace: GET http://localhost/   │    │
│  │       api/equipos                           │    │
│  └─────────────────┬───────────────────────────┘    │
│                    │                                 │
│  ┌─────────────────▼───────────────────────────┐    │
│  │  2. RATE LIMITING                           │    │
│  │     - Verifica: ¿Cuántas peticiones hizo?  │    │
│  │     - Si > 10/seg: Responde 429 (Too Many) │    │
│  └─────────────────┬───────────────────────────┘    │
│                    │                                 │
│  ┌─────────────────▼───────────────────────────┐    │
│  │  3. AUTENTICACIÓN (Fase 2 - pendiente)     │    │
│  │     - Valida JWT token                      │    │
│  │     - Si inválido: Responde 401             │    │
│  └─────────────────┬───────────────────────────┘    │
│                    │                                 │
│  ┌─────────────────▼───────────────────────────┐    │
│  │  4. ROUTING (Lo que hace ahora)             │    │
│  │     - Lee la URL: /api/equipos              │    │
│  │     - Busca en configuración:               │    │
│  │       location /api/equipos {               │    │
│  │         proxy_pass http://monitoreo:5000    │    │
│  │       }                                      │    │
│  └─────────────────┬───────────────────────────┘    │
│                    │                                 │
│  ┌─────────────────▼───────────────────────────┐    │
│  │  5. PROXY PASS                              │    │
│  │     - Redirige petición a servicio interno  │    │
│  │     - Agrega headers: X-Real-IP, etc.       │    │
│  └─────────────────┬───────────────────────────┘    │
└────────────────────┼───────────────────────────────┘
                     │
           ┌─────────▼─────────┐
           │ Servicio Monitoreo│
           │   Puerto 5000     │
           └─────────┬─────────┘
                     │
           ┌─────────▼─────────┐
           │  Procesa petición │
           │  Responde JSON    │
           └─────────┬─────────┘
                     │
           ┌─────────▼─────────┐
           │  NGINX recibe     │
           │  respuesta        │
           └─────────┬─────────┘
                     │
           ┌─────────▼─────────┐
           │  Agrega headers   │
           │  CORS, etc.       │
           └─────────┬─────────┘
                     │
                     ▼
                  Usuario
           (recibe JSON final)
```

### Conceptos Clave de NGINX

#### 1. **Upstream**

Define los servidores backend a los que NGINX puede enviar peticiones.

```nginx
# Definición de "upstream" (servidores destino)
upstream servicio_monitoreo {
    server servicio-monitoreo:5000;  # Servidor 1
    # server servicio-monitoreo-2:5000;  # Servidor 2 (load balancing)
    keepalive 32;  # Mantener 32 conexiones abiertas
}
```

**Analogía**: Es como tener la lista de números de teléfono de cada oficina.

#### 2. **Location**

Define qué hacer cuando llegue una petición a una URL específica.

```nginx
# Cuando llegue una petición a /api/equipos
location /api/equipos {
    # 1. Aplicar rate limiting
    limit_req zone=api_limit burst=20 nodelay;

    # 2. Redirigir al upstream definido
    proxy_pass http://servicio_monitoreo/api/equipos;

    # 3. Agregar headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

**Analogía**: "Si alguien pregunta por contabilidad, dirígelo al piso 3, oficina 301"

#### 3. **Proxy Pass**

Redirige la petición a otro servidor.

```nginx
proxy_pass http://servicio_monitoreo/api/equipos;
```

**Desglose**:
- `http://` - Protocolo
- `servicio_monitoreo` - Nombre del upstream (o hostname)
- `/api/equipos` - Path que se mantiene

**Ejemplo completo**:

```
Cliente hace:     GET http://localhost/api/equipos
                      ↓
NGINX recibe:     GET /api/equipos
                      ↓
proxy_pass a:     http://servicio_monitoreo:5000/api/equipos
                      ↓
Servicio recibe:  GET /api/equipos
```

#### 4. **Rate Limiting**

Limita cuántas peticiones puede hacer un usuario en un tiempo determinado.

```nginx
# Definir zona de memoria para tracking
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
#              └─ IP del cliente      └─ nombre  └─mem └─ 10 req/segundo

# Aplicar en un location
location /api/equipos {
    limit_req zone=api_limit burst=20 nodelay;
    #         └─ usar zona  └─ permite ráfagas  └─ sin delay
}
```

**Cómo funciona**:

```
Usuario hace 30 peticiones en 1 segundo:

Petición 1-10:  ✅ Permitidas (10 req/s)
Petición 11-30: ✅ Permitidas (burst de 20)
Petición 31:    ❌ Rechazada (429 Too Many Requests)

Después de 1 segundo:
El contador se resetea, puede hacer 30 más.
```

#### 5. **Headers**

NGINX puede agregar, modificar o eliminar headers HTTP.

```nginx
# Agregar headers CORS
add_header 'Access-Control-Allow-Origin' '*' always;
add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE' always;

# Agregar información del cliente al backend
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
```

**¿Por qué es importante?**

Cuando NGINX hace proxy, el backend ve la petición viniendo de NGINX, no del usuario real.

**SIN proxy_set_header**:
```
Usuario real IP: 192.168.1.100
                    ↓
NGINX recibe de: 192.168.1.100
                    ↓
Backend ve: 172.18.0.5 (IP de NGINX en Docker)
            ❌ Perdimos la IP real del usuario
```

**CON proxy_set_header X-Real-IP**:
```
Usuario real IP: 192.168.1.100
                    ↓
NGINX recibe de: 192.168.1.100
NGINX agrega header: X-Real-IP: 192.168.1.100
                    ↓
Backend lee header X-Real-IP: 192.168.1.100
                    ✅ Backend sabe la IP real
```

---

## Implementación en el Proyecto

### Estructura Creada

```
sistema-monitoreo/
├── api-gateway/                    # ⭐ NUEVO
│   ├── nginx/
│   │   └── nginx.conf              # Configuración de NGINX
│   ├── Dockerfile                  # Imagen Docker
│   ├── .dockerignore
│   └── README.md
│
├── docker-compose.yml              # ✨ ACTUALIZADO con API Gateway
└── [otros servicios...]
```

### Configuración de docker-compose.yml

**Cambio principal**: Agregamos el servicio `api-gateway`

```yaml
services:
  api-gateway:
    build:
      context: ./api-gateway
      dockerfile: Dockerfile
    container_name: api-gateway
    ports:
      - "80:80"      # ⭐ Puerto público principal
    depends_on:      # Espera a que estos servicios estén listos
      - backend
      - frontend
      - servicio-monitoreo
      - servicio-operaciones
    networks:
      - microservices-network
```

**¿Por qué puerto 80?**

- Puerto estándar para HTTP
- No necesitas especificar puerto en el navegador
- `http://localhost/api/equipos` en lugar de `http://localhost:80/api/equipos`

### Rutas Configuradas en NGINX

| URL del Cliente | Servicio Destino | Puerto Interno |
|----------------|------------------|----------------|
| `GET /` | Frontend | :3000 |
| `POST /api/auth/login` | Backend | :4000 |
| `GET /api/equipos` | Monitoreo | :5000 |
| `GET /api/monitoreo/*` | Monitoreo | :5000 |
| `POST /api/operaciones` | Operaciones | :6000 |
| `GET /api/kpis` | Operaciones | :6000 |
| `GET /api/usuarios` | Backend | :4000 |
| `GET /health` | API Gateway | - |
| `GET /health/monitoreo` | Monitoreo | :5000 |

---

## Guía de Uso

### Paso 1: Ejecutar el Sistema

```bash
cd c:\Users\bug\Desktop\Wilson\sistema-monitoreo

# Ejecutar TODOS los servicios (incluyendo API Gateway)
docker-compose up --build
```

**¿Qué sucede?**

1. Docker construye 5 imágenes:
   - api-gateway (NGINX)
   - frontend
   - backend
   - servicio-monitoreo
   - servicio-operaciones

2. Docker inicia 5 contenedores en esta red:
```
sistema-monitoreo-network (Bridge)
├── api-gateway (80)
├── frontend (3000)
├── backend (4000)
├── servicio-monitoreo (5000)
└── servicio-operaciones (6000)
```

3. API Gateway espera en puerto 80

### Paso 2: Verificar que Funciona

```bash
# Health check del Gateway
curl http://localhost/health

# Respuesta:
# API Gateway is healthy
```

```bash
# Health check de cada servicio
curl http://localhost/health/backend
curl http://localhost/health/monitoreo
curl http://localhost/health/operaciones
curl http://localhost/health/frontend
```

### Paso 3: Hacer Peticiones

**ANTES** (sin API Gateway):
```bash
curl http://localhost:5000/api/equipos
```

**AHORA** (con API Gateway):
```bash
curl http://localhost/api/equipos
```

**¿Qué pasa internamente?**

```
1. Usuario: curl http://localhost/api/equipos
      ↓
2. NGINX recibe en puerto 80
      ↓
3. NGINX busca en configuración:
   location /api/equipos → proxy_pass http://servicio_monitoreo
      ↓
4. NGINX envía petición a servicio-monitoreo:5000
      ↓
5. Servicio Monitoreo procesa y responde
      ↓
6. NGINX recibe respuesta
      ↓
7. NGINX agrega headers CORS
      ↓
8. Usuario recibe respuesta final
```

---

## Ejemplos Prácticos

### Ejemplo 1: Crear un Equipo

**Con API Gateway**:

```bash
curl -X POST http://localhost/api/equipos \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "VOL-300",
    "tipo": "VOLQUETE",
    "nivelCombustible": 90
  }'
```

**Flujo interno**:

```
1. curl → http://localhost:80/api/equipos
          ↓
2. API Gateway (NGINX) puerto 80
   - Recibe POST /api/equipos
   - Aplica rate limiting
   - Busca location /api/equipos
          ↓
3. proxy_pass http://servicio-monitoreo:5000/api/equipos
          ↓
4. Servicio Monitoreo puerto 5000
   - Express recibe POST /api/equipos
   - EquipoController.crear()
   - CrearEquipo (caso de uso)
   - MemoriaEquipoRepositorio.crear()
          ↓
5. Responde: { success: true, data: {...} }
          ↓
6. NGINX recibe respuesta
   - Agrega CORS headers
   - Agrega headers de seguridad
          ↓
7. curl recibe respuesta final
```

### Ejemplo 2: Listar Operaciones

```bash
curl http://localhost/api/operaciones
```

**Routing en NGINX**:

```nginx
# nginx.conf
location /api/operaciones {
    limit_req zone=api_limit burst=20 nodelay;
    proxy_pass http://servicio_operaciones/api/operaciones;
    # ↑ Redirige a servicio-operaciones:6000
}
```

### Ejemplo 3: Rate Limiting en Acción

```bash
# Script para probar rate limiting
for i in {1..50}; do
  curl http://localhost/api/equipos
  echo "Petición $i"
done
```

**Resultado esperado**:

```
Petición 1-10: ✅ 200 OK
Petición 11-30: ✅ 200 OK (burst)
Petición 31-50: ❌ 429 Too Many Requests
{
  "error": "Demasiadas peticiones, intenta más tarde"
}
```

### Ejemplo 4: Ver Logs del Gateway

```bash
# Ver logs en tiempo real
docker-compose logs -f api-gateway

# Ver solo access logs
docker exec api-gateway tail -f /var/log/nginx/access.log

# Resultado:
# 172.18.0.1 - - [14/Jan/2026:10:30:00 +0000] "GET /api/equipos HTTP/1.1" 200 1234
# 172.18.0.1 - - [14/Jan/2026:10:30:01 +0000] "POST /api/operaciones HTTP/1.1" 201 567
```

---

## Comparación: Antes vs Después

### ANTES (Sin API Gateway)

**Arquitectura**:
```
Usuario
  │
  ├── http://localhost:3000 → Frontend
  ├── http://localhost:4000 → Backend
  ├── http://localhost:5000 → Monitoreo
  └── http://localhost:6000 → Operaciones
```

**Problemas**:

1. **Múltiples puntos de entrada**
   ```javascript
   // Frontend debe conocer todas las URLs
   const MONITOREO_URL = 'http://localhost:5000';
   const OPERACIONES_URL = 'http://localhost:6000';
   const BACKEND_URL = 'http://localhost:4000';
   ```

2. **CORS configurado en cada servicio**
   ```typescript
   // servicio-monitoreo/src/index.ts
   app.use(cors({ origin: '*' }));

   // servicio-operaciones/src/index.ts
   app.use(cors({ origin: '*' }));

   // backend/presentacion/index.ts
   app.use(cors({ origin: '*' }));
   ```

3. **Sin rate limiting unificado**
   - Cada servicio debe implementar su propio rate limiting
   - Usuario puede hacer 10 req/s a cada servicio = 40 req/s total

4. **Sin autenticación centralizada**
   - Cada servicio valida JWT por su cuenta
   - Código duplicado

5. **Difícil de monitorear**
   - Logs distribuidos en 4 servicios
   - No hay vista unificada

### DESPUÉS (Con API Gateway)

**Arquitectura**:
```
Usuario
  │
  └── http://localhost → API Gateway :80
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
        Frontend          Monitoreo        Operaciones
        (interno)         (interno)        (interno)
```

**Beneficios**:

1. **Punto de entrada único**
   ```javascript
   // Frontend solo necesita conocer una URL
   const API_URL = 'http://localhost';  // Puerto 80 implícito

   fetch(`${API_URL}/api/equipos`);      // → Monitoreo
   fetch(`${API_URL}/api/operaciones`);  // → Operaciones
   fetch(`${API_URL}/api/usuarios`);     // → Backend
   ```

2. **CORS centralizado**
   ```nginx
   # api-gateway/nginx/nginx.conf
   # Una sola configuración para todos
   add_header 'Access-Control-Allow-Origin' '*' always;
   ```

3. **Rate limiting unificado**
   ```nginx
   # Límite global: 10 req/s para TODOS los servicios
   limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
   ```

4. **Preparado para autenticación centralizada** (Fase 2)
   ```nginx
   location /api/equipos {
       # Validar JWT en un solo lugar
       auth_request /auth/validate;
       proxy_pass http://servicio_monitoreo;
   }
   ```

5. **Logs centralizados**
   ```bash
   # Un solo lugar para ver todos los logs
   docker exec api-gateway tail -f /var/log/nginx/access.log
   ```

6. **Servicios internos ocultos**
   - Puertos 4000, 5000, 6000 NO expuestos públicamente (en producción)
   - Solo puerto 80 es público
   - Mayor seguridad

### Tabla Comparativa

| Aspecto | SIN API Gateway | CON API Gateway |
|---------|----------------|-----------------|
| **Puntos de entrada** | 4 URLs diferentes | 1 URL única |
| **CORS** | Configurado 4 veces | Configurado 1 vez |
| **Rate Limiting** | Duplicado/ausente | Centralizado |
| **Autenticación** | Duplicada en cada servicio | Centralizada (Fase 2) |
| **Logging** | 4 archivos separados | 1 archivo central |
| **Seguridad** | Servicios expuestos | Servicios ocultos |
| **Mantenimiento** | Difícil | Fácil |
| **Monitoreo** | Complejo | Simple |
| **Load Balancing** | Manual | Automático (NGINX) |

---

## Próximos Pasos (Fase 2)

### 1. Agregar Autenticación JWT

**Objetivo**: Validar tokens JWT en el API Gateway antes de permitir acceso.

**Implementación**:

```nginx
# nginx.conf
location /api/equipos {
    # Validar JWT antes de proxy
    auth_request /auth/validate;

    # Si la validación falla, devolver 401
    error_page 401 = @error401;

    # Si pasa, hacer proxy
    proxy_pass http://servicio_monitoreo/api/equipos;
}

# Endpoint interno de validación
location = /auth/validate {
    internal;  # Solo accesible internamente
    proxy_pass http://backend/api/auth/validate;
    proxy_pass_request_body off;
    proxy_set_header Content-Length "";
    proxy_set_header X-Original-URI $request_uri;
    proxy_set_header Authorization $http_authorization;
}

location @error401 {
    return 401 '{"error": "No autenticado"}';
    add_header Content-Type application/json;
}
```

### 2. Agregar SSL/TLS (HTTPS)

**Objetivo**: Cifrar comunicación con certificados SSL.

```nginx
server {
    listen 443 ssl http2;
    server_name api.minamonitoreo.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # ... resto de configuración ...
}

# Redirigir HTTP a HTTPS
server {
    listen 80;
    return 301 https://$host$request_uri;
}
```

### 3. Agregar Caché

**Objetivo**: Cachear respuestas GET para mejorar performance.

```nginx
# Definir zona de caché
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m;

location /api/equipos {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;  # Cachear 200 OK por 5 minutos
    proxy_cache_key "$request_uri";

    add_header X-Cache-Status $upstream_cache_status;

    proxy_pass http://servicio_monitoreo/api/equipos;
}
```

---

## Conclusión

### ¿Qué Hemos Logrado?

1. ✅ **API Gateway implementado** con NGINX
2. ✅ **Punto de entrada único** en puerto 80
3. ✅ **Rate limiting** configurado
4. ✅ **CORS centralizado**
5. ✅ **Routing automático** a cada microservicio
6. ✅ **Health checks** para monitoreo
7. ✅ **Logs centralizados**
8. ✅ **Preparado para autenticación JWT** (Fase 2)

### Conceptos Clave Aprendidos

1. **API Gateway**: Punto de entrada único para microservicios
2. **NGINX**: Servidor web/proxy reverso de alto rendimiento
3. **Upstream**: Definición de servidores backend
4. **Location**: Reglas de routing por URL
5. **Proxy Pass**: Redirección de peticiones
6. **Rate Limiting**: Control de tasa de peticiones
7. **CORS**: Configuración de recursos compartidos

### Beneficios para el Proyecto

- 🎯 **Simplicidad**: Una sola URL para todo
- 🔒 **Seguridad**: Servicios internos ocultos
- ⚡ **Performance**: NGINX es extremadamente rápido
- 📊 **Observabilidad**: Logs centralizados
- 🛡️ **Protección**: Rate limiting y CORS unificados
- 🚀 **Escalabilidad**: Preparado para load balancing

---

**Fecha**: 14 de Enero de 2026
**Versión**: 1.0.0
**Universidad**: UNSA - Ingeniería de Software II
