# API Gateway - Sistema de Monitoreo Minero

## Descripción

API Gateway implementado con **NGINX** que centraliza el acceso a todos los microservicios del sistema.

## Funcionalidades

### ✅ Implementadas

1. **Routing Centralizado**

   - Punto de entrada único en puerto 80
   - Enrutamiento inteligente a cada microservicio

2. **Autenticación JWT Centralizada** ⭐ NUEVO

   - Validación de tokens JWT en todas las rutas protegidas
   - Endpoint interno `/auth/validate`
   - Usa `auth_request` de NGINX para subrequests
   - Rutas protegidas: `/api/equipos`, `/api/monitoreo`, `/api/operaciones`, `/api/kpis`, `/api/usuarios`, `/api/mina`, `/api/turnos`
   - Rutas públicas: `/api/auth/login`, `/api/auth/register`

3. **Rate Limiting**

   - Límite general: 10 peticiones/segundo
   - Límite para autenticación: 5 peticiones/segundo

4. **CORS**

   - Configuración centralizada
   - Headers automáticos en todas las respuestas

5. **Load Balancing**

   - Preparado para múltiples instancias
   - Keepalive connections

6. **Health Checks**

   - `/health` - Gateway status
   - `/health/backend` - Backend status
   - `/health/monitoreo` - Monitoreo status
   - `/health/operaciones` - Operaciones status

7. **Logging**
   - Access logs
   - Error logs
   - Formato estándar

### ⏳ Pendientes (Fase 3)

1. **SSL/TLS**

   - Certificados HTTPS
   - HTTP/2

2. **Caché**
   - Caché de respuestas GET
   - Invalidación inteligente

## Arquitectura

```
Usuario (Browser)
      │
      │ HTTP :80
      ▼
┌─────────────────┐
│  API GATEWAY    │
│  (NGINX)        │
│  Puerto 80      │
└────────┬────────┘
         │
    ┌────┴────┬────────┬────────┐
    │         │        │        │
    ▼         ▼        ▼        ▼
Frontend  Backend  Monitoreo  Operaciones
 :3000     :4000     :5000      :6000
(interno) (interno) (interno)  (interno)
```

## Routing Map

| URL del Cliente        | Microservicio Destino | Puerto Interno |
| ---------------------- | --------------------- | -------------- |
| `GET /`                | Frontend              | 3000           |
| `POST /api/auth/login` | Backend Legacy        | 4000           |
| `GET /api/equipos`     | Servicio Monitoreo    | 5000           |
| `GET /api/monitoreo/*` | Servicio Monitoreo    | 5000           |
| `GET /api/operaciones` | Servicio Operaciones  | 6000           |
| `GET /api/kpis`        | Servicio Operaciones  | 6000           |
| `GET /api/usuarios`    | Backend Legacy        | 4000           |
| `GET /api/mina`        | Backend Legacy        | 4000           |
| `GET /api/turnos`      | Backend Legacy        | 4000           |

## Uso

### Docker Compose

El API Gateway se ejecuta automáticamente con:

```bash
docker-compose up --build
```

### Acceso

**Antes** (sin API Gateway):

```bash
curl http://localhost:5000/api/equipos  # Acceso directo
curl http://localhost:6000/api/operaciones
```

**Ahora** (con API Gateway + JWT):

```bash
# 1. Login para obtener token
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Respuesta: { "success": true, "token": "eyJhbGciOiJIUzI1NiIs..." }

# 2. Usar token en peticiones protegidas
curl http://localhost/api/equipos \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

curl http://localhost/api/operaciones \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Sin token válido:**

```bash
curl http://localhost/api/equipos
# Respuesta: 401 Unauthorized
```

### Health Checks

```bash
# Gateway principal
curl http://localhost/health

# Cada microservicio
curl http://localhost/health/backend
curl http://localhost/health/monitoreo
curl http://localhost/health/operaciones
curl http://localhost/health/frontend
```

## Rate Limiting

El gateway implementa límites de peticiones:

```
API General: 10 req/s + burst de 20
Autenticación: 5 req/s + burst de 3
```

Si excedes el límite, recibirás:

```json
{
  "error": "Demasiadas peticiones, intenta más tarde"
}
```

HTTP Status: 429 (Too Many Requests)

## Configuración

### nginx.conf

Ubicación: `api-gateway/nginx/nginx.conf`

**Upstreams** (definición de servicios):

```nginx
upstream servicio_monitoreo {
    server servicio-monitoreo:5000;
    keepalive 32;
}
```

**Locations** (routing):

```nginx
location /api/equipos {
    limit_req zone=api_limit burst=20 nodelay;
    proxy_pass http://servicio_monitoreo/api/equipos;
    # ... headers ...
}
```

### Agregar Nuevo Endpoint

1. Definir upstream (si es nuevo servicio):

```nginx
upstream mi_nuevo_servicio {
    server mi-servicio:7000;
}
```

2. Agregar location:

```nginx
location /api/mi-endpoint {
    limit_req zone=api_limit burst=20 nodelay;
    proxy_pass http://mi_nuevo_servicio/api/mi-endpoint;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

3. Reconstruir contenedor:

```bash
docker-compose up --build api-gateway
```

## Logs

### Ver logs en tiempo real

```bash
# Todos los logs
docker-compose logs -f api-gateway

# Solo access logs
docker exec api-gateway tail -f /var/log/nginx/access.log

# Solo error logs
docker exec api-gateway tail -f /var/log/nginx/error.log
```

### Formato de logs

```
192.168.1.1 - - [14/Jan/2026:10:30:00 +0000] "GET /api/equipos HTTP/1.1" 200 1234 "-" "Mozilla/5.0"
```

## Métricas

### NGINX Status

Accesible desde red interna:

```bash
curl http://localhost/nginx_status
```

Respuesta:

```
Active connections: 5
server accepts handled requests
 100 100 150
Reading: 0 Writing: 1 Waiting: 4
```

## Seguridad

### Implementado

- ✅ Rate limiting por IP
- ✅ CORS configurado
- ✅ Timeouts configurados
- ✅ Headers de seguridad
- ✅ Usuario no privilegiado

### Pendiente

- ⏳ Validación JWT
- ⏳ SSL/TLS
- ⏳ IP whitelisting
- ⏳ Request signing

## Troubleshooting

### Gateway no responde

```bash
# Verificar que el contenedor está corriendo
docker ps | grep api-gateway

# Ver logs de error
docker-compose logs api-gateway

# Reiniciar gateway
docker-compose restart api-gateway
```

### Error 502 Bad Gateway

Significa que NGINX no puede conectar con el microservicio backend.

**Solución**:

1. Verificar que el microservicio está corriendo
2. Verificar health check del servicio
3. Revisar configuración de upstream

```bash
curl http://localhost/health/monitoreo
```

### Error 429 Too Many Requests

Has excedido el rate limit.

**Solución**:

- Esperar unos segundos
- Implementar retry con backoff
- Ajustar límites en nginx.conf si es legítimo

## Próximos Pasos

### Fase 2: Autenticación JWT

Agregar validación JWT:

```nginx
location /api/equipos {
    # Validar token antes de proxy
    auth_request /auth/validate;

    proxy_pass http://servicio_monitoreo/api/equipos;
}

# Endpoint de validación
location = /auth/validate {
    internal;
    proxy_pass http://backend_legacy/api/auth/validate;
    proxy_pass_request_body off;
    proxy_set_header Content-Length "";
    proxy_set_header X-Original-URI $request_uri;
}
```

### Fase 3: SSL/TLS

Configurar HTTPS:

```nginx
server {
    listen 443 ssl http2;
    server_name api.minamonitoreo.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
}
```

---

**Puerto**: 80
**Versión**: 1.0.0
**Mantenedor**: Sistema de Monitoreo Minero
