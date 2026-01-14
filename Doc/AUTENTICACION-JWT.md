# Sistema de Autenticación JWT - Documentación Completa

Este sistema implementa **autenticación basada en JWT (JSON Web Tokens)** para el Sistema de Monitoreo Minero, siguiendo principios de **Clean Architecture** y **Domain-Driven Design (DDD)**.

### Características principales:

- Autenticación stateless con JWT
- Hash de contraseñas con bcrypt
- Control de acceso basado en roles (RBAC)
- Tokens con expiración configurable
- Protección de rutas en backend y frontend
- Gestión de sesión en localStorage
- Middleware de autenticación reutilizable

## Arquitectura del Sistema

### Capas del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (puerto 3000)                 │
├─────────────────────────────────────────────────────────┤
│  • login.html (UI de Login)                             │
│  • auth.service.js (Gestión de tokens y autenticación)  │
│  • app.js (Peticiones autenticadas al backend)          │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP + JWT Bearer Token
                   │
┌──────────────────▼──────────────────────────────────────┐
│             BACKEND (puerto 4000) - API REST            │
├─────────────────────────────────────────────────────────┤
│  CAPA DE PRESENTACIÓN                                   │
│  • AuthController (endpoints /api/auth/*)               │
│  • AuthMiddleware (validación JWT)                      │
├─────────────────────────────────────────────────────────┤
│  CAPA DE APLICACIÓN                                     │
│  • Login (caso de uso)                                  │
│  • Register (caso de uso)                               │
├─────────────────────────────────────────────────────────┤
│  CAPA DE DOMINIO                                        │
│  • Usuario (entidad del dominio)                        │
│  • IUsuarioRepositorio (interfaz)                       │
│  • PasswordServicio (servicio de dominio)               │
├─────────────────────────────────────────────────────────┤
│  CAPA DE INFRAESTRUCTURA                                │
│  • MemoriaUsuarioRepositorio (implementación)           │
└─────────────────────────────────────────────────────────┘
```

---

## Backend - Implementación

### 1. Dominio (Domain Layer)

#### Usuario (Entidad Agregada)

**Archivo:** `backend/aplicacion/Dominio/usuarios/modelo/usuario.ts`

Entidad raíz que encapsula la lógica de negocio de usuarios:

```typescript
export class Usuario {
  private _id: string;
  private _username: string;
  private _email: string;
  private _passwordHash: string;
  private _rol: RolUsuario; // 'ADMIN' | 'SUPERVISOR' | 'OPERADOR'
  private _activo: boolean;
  private _minaId?: string;

  // Métodos de negocio
  registrarAcceso(): void;
  cambiarPassword(nuevoPasswordHash: string): void;
  desactivar(): void;
  activar(): void;
  toJWTPayload(): object;
}
```

**Validaciones incorporadas:**

- Username: 3-30 caracteres alfanuméricos
- Email: formato válido
- Roles: ADMIN, SUPERVISOR, OPERADOR

#### PasswordServicio (Servicio de Dominio)

**Archivo:** `backend/aplicacion/Dominio/usuarios/servicios/passwordServicio.ts`

```typescript
export class PasswordServicio {
  static async hashear(password: string): Promise<string>;
  static async comparar(password: string, hash: string): Promise<boolean>;
  static validarPassword(password: string): void;
}
```

**Reglas de contraseña:**

- Mínimo 8 caracteres
- Al menos 1 mayúscula
- Al menos 1 minúscula
- Al menos 1 número
- Al menos 1 carácter especial (!@#$%^&\*)

#### IUsuarioRepositorio (Interface)

**Archivo:** `backend/aplicacion/Dominio/usuarios/interfacesRepositorio/iUsuarioRepositorio.ts`

## Contrato para persistencia de usuarios (siguiendo Dependency Inversion Principle).

### 2. Aplicación (Application Layer)

#### Caso de Uso: Login

**Archivo:** `backend/aplicacion/casos-uso/auth/Login.ts`

**Flujo:**

1. Validar datos de entrada
2. Buscar usuario por username
3. Verificar si usuario está activo
4. Verificar contraseña con bcrypt
5. Registrar último acceso
6. Generar JWT con payload
7. Retornar token y datos de usuario

**DTO de entrada:**

```typescript
interface LoginDTO {
  username: string;
  password: string;
}
```

**DTO de salida:**

```typescript
interface LoginResultado {
  success: boolean;
  message: string;
  token?: string;
  usuario?: {
    id: string;
    username: string;
    email: string;
    rol: string;
    minaId?: string;
  };
}
```

#### Caso de Uso: Register

**Archivo:** `backend/aplicacion/casos-uso/auth/Register.ts`

Similar al Login, pero crea un nuevo usuario después de validar:

- Username único
- Email único
- Contraseña válida según políticas

---

### 3. Infraestructura (Infrastructure Layer)

#### MemoriaUsuarioRepositorio

**Archivo:** `backend/aplicacion/infraestructura/persistencia/repositorios/MemoriaUsuarioRepositorio.ts`

Implementación en memoria del repositorio con índices optimizados:

- `Map<id, Usuario>` - Repositorio principal
- `Map<username, id>` - Índice de username
- `Map<email, id>` - Índice de email

**Usuarios por defecto inicializados:**
Ver sección [Usuarios de Prueba](#usuarios-de-prueba).

---

### 4. Presentación (Presentation Layer)

#### AuthMiddleware

**Archivo:** `backend/presentacion/api/middleware/authMiddleware.ts`

Middleware de Express para proteger rutas.

**Métodos:**

1. **requireAuth**: Valida JWT obligatorio

   ```typescript
   router.get("/api/equipos", authMiddleware.requireAuth, handler);
   ```

2. **requireRole**: Valida rol específico

   ```typescript
   router.post("/api/admin", authMiddleware.requireRole("ADMIN"), handler);
   ```

3. **optionalAuth**: JWT opcional (si existe, lo valida)
   ```typescript
   router.get("/api/public", authMiddleware.optionalAuth, handler);
   ```

**Extiende Request de Express:**

```typescript
req.user = {
    userId: string;
    username: string;
    email: string;
    rol: RolUsuario;
    minaId?: string;
}
```

#### AuthController

**Archivo:** `backend/presentacion/api/controllers/AuthController.ts`

Controlador HTTP para endpoints de autenticación.

**Endpoints:**

| Método | Endpoint             | Descripción            | Auth |
| ------ | -------------------- | ---------------------- | ---- |
| POST   | `/api/auth/login`    | Iniciar sesión         | No   |
| POST   | `/api/auth/register` | Registrar usuario      | No   |
| GET    | `/api/auth/me`       | Obtener usuario actual | Sí   |
| POST   | `/api/auth/logout`   | Cerrar sesión          | Sí   |

#### Rutas

**Archivo:** `backend/presentacion/api/routes/auth.routes.ts`

Configuración de rutas Express:

```typescript
router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/me", authMiddleware.requireAuth, authController.me);
router.post("/logout", authMiddleware.requireAuth, authController.logout);
```

---

### 5. Configuración

#### Variables de Entorno

**Archivo:** `backend/.env`

```env
# Puerto del backend
PORT=4000

# JWT Configuration
JWT_SECRET=tu_clave_secreta_super_segura_cambiala_en_produccion
JWT_EXPIRES_IN=24h
```

**⚠️ IMPORTANTE:**

- En producción, genera un JWT_SECRET seguro usando:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- Opciones de expiración: 1h, 24h, 7d, 30d

#### Dependencias

**Archivo:** `backend/package.json`

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.5"
  }
}
```

---

## Frontend - Implementación

### 1. Página de Login

**Archivo:** `frontend/public/login.html`

Interfaz de usuario con diseño moderno:

- Formulario de login con validación
- Spinner de carga
- Mensajes de éxito/error
- Lista de usuarios de prueba
- Auto-redirección si ya está autenticado

### 2. Servicio de Autenticación

**Archivo:** `frontend/public/js/auth.service.js`

**Métodos principales:**

#### Autenticación

```javascript
// Login
AuthService.login(username, password) → Promise<LoginResultado>

// Registro
AuthService.register(userData) → Promise<RegisterResultado>

// Logout
AuthService.logout() → void
```

#### Gestión de Token

```javascript
// Guardar/obtener token
AuthService.setToken(token)
AuthService.getToken() → string | null
AuthService.getAuthHeader() → "Bearer <token>" | null
```

#### Gestión de Usuario

```javascript
// Guardar/obtener datos de usuario
AuthService.setUser(usuario)
AuthService.getUser() → Usuario | null

// Obtener datos frescos del backend
AuthService.fetchCurrentUser() → Promise<Usuario>
```

#### Verificación

```javascript
// Verificar autenticación
AuthService.isAuthenticated() → boolean

// Verificar roles
AuthService.hasRole('ADMIN') → boolean
AuthService.hasRole(['ADMIN', 'SUPERVISOR']) → boolean

// Proteger páginas
AuthService.requireAuth() // Redirige a login si no autenticado
AuthService.requireRole('ADMIN') // Redirige si no tiene rol
```

#### Utilidades

```javascript
// Decodificar token (solo lectura, sin verificación)
AuthService.decodeToken(token) → Payload

// Crear headers autenticados
AuthService.createAuthHeaders(additionalHeaders)

// Fetch con autenticación automática
AuthService.authenticatedFetch(url, options)
```

**Almacenamiento:**

- Token: `localStorage.getItem('auth_token')`
- Usuario: `localStorage.getItem('auth_user')`

### 3. Aplicación Principal

**Archivo:** `frontend/public/index.html`

**Características:**

- Verificación de autenticación al cargar
- Información del usuario en UI
- Botón de cerrar sesión
- Redirección automática a login si no autenticado

**Archivo:** `frontend/public/js/app.js`

Función `apiRequest` actualizada para incluir JWT automáticamente:

```javascript
async function apiRequest(endpoint, options = {}) {
  // Agregar token JWT automáticamente
  const token = AuthService.getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Redirigir a login si 401
  if (response.status === 401) {
    AuthService.logout();
  }
}
```

---

## Flujo de Autenticación

### 1. Login - Flujo Completo

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │ 1. Ingresa credenciales
       │
┌──────▼──────────────────────────────────────────────┐
│  login.html                                          │
│  • Captura username/password                         │
│  • Llama AuthService.login()                         │
└──────┬──────────────────────────────────────────────┘
       │ 2. POST /api/auth/login
       │
┌──────▼──────────────────────────────────────────────┐
│  Backend - AuthController                            │
│  • Recibe credenciales                               │
│  • Llama caso de uso Login                           │
└──────┬──────────────────────────────────────────────┘
       │ 3. Ejecuta lógica
       │
┌──────▼──────────────────────────────────────────────┐
│  Caso de Uso: Login                                  │
│  1. Busca usuario en repositorio                     │
│  2. Verifica si está activo                          │
│  3. Compara password con bcrypt                      │
│  4. Registra último acceso                           │
│  5. Genera JWT con payload                           │
└──────┬──────────────────────────────────────────────┘
       │ 4. Retorna { success, token, usuario }
       │
┌──────▼──────────────────────────────────────────────┐
│  auth.service.js                                     │
│  • Guarda token en localStorage                      │
│  • Guarda datos de usuario                           │
│  • Retorna resultado                                 │
└──────┬──────────────────────────────────────────────┘
       │ 5. Redirige a index.html
       │
┌──────▼──────────────────────────────────────────────┐
│  index.html                                          │
│  • Verifica autenticación                            │
│  • Muestra información del usuario                   │
│  • Permite acceso a funcionalidades                  │
└─────────────────────────────────────────────────────┘
```

### 2. Petición Autenticada

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │ 1. Clic en "Crear Equipo"
       │
┌──────▼──────────────────────────────────────────────┐
│  app.js - apiRequest()                               │
│  • Obtiene token: AuthService.getToken()             │
│  • Agrega header: Authorization: Bearer <token>      │
│  • Envía petición                                    │
└──────┬──────────────────────────────────────────────┘
       │ 2. POST /api/equipos + JWT
       │
┌──────▼──────────────────────────────────────────────┐
│  Backend - AuthMiddleware.requireAuth                │
│  1. Extrae token del header Authorization            │
│  2. Verifica formato "Bearer <token>"                │
│  3. Decodifica y valida JWT                          │
│  4. Adjunta datos a req.user                         │
│  5. Llama next() si válido                           │
└──────┬──────────────────────────────────────────────┘
       │ 3. Token válido, procede
       │
┌──────▼──────────────────────────────────────────────┐
│  EquipoController                                    │
│  • Accede a req.user.userId                          │
│  • Ejecuta lógica de negocio                         │
│  • Retorna respuesta                                 │
└──────┬──────────────────────────────────────────────┘
       │ 4. Respuesta JSON
       │
┌──────▼──────────────────────────────────────────────┐
│  Frontend                                            │
│  • Recibe respuesta                                  │
│  • Actualiza UI                                      │
└─────────────────────────────────────────────────────┘
```

### 3. Token Expirado

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │ Petición con token expirado
       │
┌──────▼──────────────────────────────────────────────┐
│  Backend - AuthMiddleware                            │
│  • jwt.verify() lanza TokenExpiredError              │
│  • Retorna 401 con mensaje "Token expirado"          │
└──────┬──────────────────────────────────────────────┘
       │ 401 Unauthorized
       │
┌──────▼──────────────────────────────────────────────┐
│  Frontend - apiRequest()                             │
│  • Detecta status 401                                │
│  • Llama AuthService.logout()                        │
└──────┬──────────────────────────────────────────────┘
       │ Redirige a login.html
       │
┌──────▼──────────────────────────────────────────────┐
│  login.html                                          │
│  • Usuario debe iniciar sesión nuevamente            │
└─────────────────────────────────────────────────────┘
```

---

## Usuarios de Prueba

El sistema inicializa automáticamente 3 usuarios de prueba:

| Username      | Password    | Rol        | Email                 | Mina ID |
| ------------- | ----------- | ---------- | --------------------- | ------- |
| `admin`       | `Admin123!` | ADMIN      | admin@minera.com      | -       |
| `supervisor1` | `Super123!` | SUPERVISOR | supervisor@minera.com | mina-1  |
| `operador1`   | `Opera123!` | OPERADOR   | operador@minera.com   | mina-1  |

### Permisos por Rol

**ADMIN:**

- Acceso total al sistema
- Puede gestionar usuarios
- Puede acceder a todas las minas

**SUPERVISOR:**

- Gestión de operaciones en su mina
- Supervisión de equipos
- Reportes de su mina

**OPERADOR:**

- Registro de operaciones
- Visualización de equipos
- Consulta de información

---

## Seguridad

### Buenas Prácticas Implementadas

#### 1. Hash de Contraseñas

- ✅ Uso de bcrypt con 10 salt rounds
- ✅ Nunca se almacenan contraseñas en texto plano
- ✅ Hash único para cada contraseña (gracias al salt)

#### 2. JWT Seguro

- ✅ Secret key configurable vía variables de entorno
- ✅ Tokens con expiración (24h por defecto)
- ✅ Payload incluye issuer y audience
- ✅ Firma verificada en cada petición

#### 3. Validación de Contraseñas

- ✅ Mínimo 8 caracteres
- ✅ Requisitos de complejidad (mayúsculas, números, especiales)
- ✅ Validación en dominio y frontend

#### 4. Protección de Rutas

- ✅ Middleware requireAuth en todas las rutas protegidas
- ✅ Verificación de roles con requireRole
- ✅ Auto-logout en frontend si token inválido

#### 5. Headers HTTP

- ✅ CORS configurado para incluir Authorization
- ✅ Content-Type application/json
- ✅ Bearer token en Authorization header

### Recomendaciones para Producción

#### Backend:

1. **Cambiar JWT_SECRET**

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Usar HTTPS**

   - Nunca transmitir JWT sobre HTTP sin cifrar

3. **Implementar Rate Limiting**

   - Limitar intentos de login fallidos
   - Proteger contra ataques de fuerza bruta

4. **Implementar Refresh Tokens**

   - Access token corto (15min)
   - Refresh token largo (7 días)

5. **Logging y Monitoreo**

   - Registrar intentos de login
   - Alertas de accesos sospechosos

6. **Base de Datos Real**
   - Reemplazar MemoriaUsuarioRepositorio
   - Usar PostgreSQL, MySQL o MongoDB

#### Frontend:

1. **HttpOnly Cookies (Alternativa)**

   - Más seguro que localStorage
   - Protege contra XSS

2. **Content Security Policy**

   - Prevenir XSS attacks

3. **Input Sanitization**
   - Validar y sanitizar todas las entradas

---

## Guía de Uso

### Para Desarrolladores

#### 1. Configuración Inicial

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Editar .env con JWT_SECRET seguro
npm run dev

# Frontend
cd frontend
npm install
npm start
```

#### 2. Probar Autenticación

**Login con curl:**

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "Admin123!"}'
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "1",
    "username": "admin",
    "email": "admin@minera.com",
    "rol": "ADMIN"
  }
}
```

**Petición Autenticada:**

```bash
curl http://localhost:4000/api/equipos \
  -H "Authorization: Bearer <TOKEN>"
```

#### 3. Proteger Nuevas Rutas

**Backend:**

```typescript
// Ruta protegida (requiere autenticación)
router.get("/api/miRuta", authMiddleware.requireAuth, miController.handler);

// Ruta con rol específico
router.post(
  "/api/admin/accion",
  authMiddleware.requireAuth,
  authMiddleware.requireRole("ADMIN"),
  adminController.handler
);

// Acceder a usuario en controlador
handler = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const userRole = req.user?.rol;
  // ...
};
```

**Frontend:**

```javascript
// Proteger página
window.addEventListener("DOMContentLoaded", () => {
  AuthService.requireAuth();
  // o con rol específico
  AuthService.requireRole("ADMIN");
});

// Verificar en código
if (AuthService.hasRole("ADMIN")) {
  // Mostrar funcionalidad de admin
}

// Peticiones autenticadas (automático con apiRequest)
const result = await apiRequest("/api/miRuta");
```

#### 4. Crear Nuevo Usuario

**Desde código:**

```javascript
const resultado = await AuthService.register({
  username: "nuevo_usuario",
  email: "nuevo@minera.com",
  password: "Password123!",
  rol: "OPERADOR",
  minaId: "mina-1",
});
```

### Para Usuarios Finales

#### 1. Iniciar Sesión

1. Abrir `http://localhost:3000/login.html`
2. Ingresar credenciales (ver [Usuarios de Prueba](#usuarios-de-prueba))
3. Clic en "Iniciar Sesión"
4. Redirección automática a aplicación principal

#### 2. Usar la Aplicación

- Token se envía automáticamente en todas las peticiones
- No es necesario volver a autenticarse durante 24 horas (por defecto)

#### 3. Cerrar Sesión

- Clic en botón "🚪 Cerrar Sesión"
- Confirmación
- Redirección a login

---

## Resolución de Problemas

### Error: "No se proporcionó token de autenticación"

**Causa:** La petición no incluye el header Authorization.

**Solución:**

```javascript
// Asegúrate de usar apiRequest() que agrega el token automáticamente
const result = await apiRequest("/api/equipos");

// O manualmente:
fetch(url, {
  headers: {
    Authorization: AuthService.getAuthHeader(),
  },
});
```

### Error: "Token expirado"

**Causa:** El token JWT superó su tiempo de vida (24h por defecto).

**Solución:**

- El sistema redirige automáticamente a login
- Iniciar sesión nuevamente para obtener nuevo token

### Error: "Token inválido"

**Posibles causas:**

1. Token corrupto en localStorage
2. JWT_SECRET diferente entre sesiones
3. Token manipulado

**Solución:**

```javascript
// Limpiar localStorage
localStorage.removeItem("auth_token");
localStorage.removeItem("auth_user");
// Recargar página
window.location.reload();
```

### Error: "CORS policy: Request header field authorization is not allowed"

**Causa:** Backend no tiene configurado Authorization en CORS.

**Solución en backend:**

```typescript
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    exposedHeaders: ["Authorization"],
  })
);
```

### Error: "Usuario no autenticado" en req.user

**Causa:** Middleware requireAuth no está aplicado a la ruta.

**Solución:**

```typescript
// Agregar middleware a la ruta
router.get(
  "/api/miRuta",
  authMiddleware.requireAuth, // ← Agregar esto
  miController.handler
);
```

### Token no se guarda en localStorage

**Causa:** El navegador bloquea localStorage (modo incógnito o configuración).

**Solución:**

- Usar navegador en modo normal
- Verificar configuración de cookies/almacenamiento
- Considerar usar sessionStorage como alternativa

### Contraseña no cumple requisitos

**Requisitos mínimos:**

- ✅ Mínimo 8 caracteres
- ✅ Al menos 1 mayúscula
- ✅ Al menos 1 minúscula
- ✅ Al menos 1 número
- ✅ Al menos 1 carácter especial (!@#$%^&\*)

**Ejemplo válido:** `Password123!`

---

## Próximos Pasos

### Mejoras Sugeridas

1. **Refresh Tokens**

   - Implementar tokens de refresco
   - Renovación automática de access tokens

2. **Base de Datos Real**

   - Migrar de MemoriaUsuarioRepositorio a Prisma/TypeORM
   - Persistencia real de usuarios

3. **Recuperación de Contraseña**

   - Flujo "Olvidé mi contraseña"
   - Envío de email con token temporal

4. **Autenticación de Dos Factores (2FA)**

   - TOTP con Google Authenticator
   - SMS verification

5. **OAuth2 / SSO**

   - Login con Google, GitHub, etc.
   - Single Sign-On empresarial

6. **Auditoría**

   - Log de todos los accesos
   - Historial de cambios de contraseña

7. **Sesiones Activas**
   - Ver todas las sesiones activas
   - Revocar sesiones específicas

---

## Referencias

- [JWT.io](https://jwt.io/) - Documentación oficial de JWT
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) - Librería de hashing
- [Express.js](https://expressjs.com/) - Framework web
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

## Contacto y Soporte

Para preguntas o problemas:

1. Revisar esta documentación
2. Consultar logs del backend y frontend
3. Verificar configuración de .env

**Logs útiles:**

```bash
# Backend
npm run dev  # Ver logs en consola

# Frontend
# Abrir DevTools (F12) → Console
```

---

**© 2026 Sistema de Monitoreo Minero - UNSA**
**Ingeniería de Software II**
