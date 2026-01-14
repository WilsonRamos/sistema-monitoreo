# Escenarios de Prueba Críticos - Sistema de Monitoreo Minero

## 📋 Índice

1. [Pruebas de Dominio (Entidades y Objetos de Valor)](#pruebas-de-dominio)
2. [Pruebas de Casos de Uso](#pruebas-de-casos-de-uso)
3. [Pruebas de Integración](#pruebas-de-integración)
4. [Pruebas de API (E2E)](#pruebas-de-api)
5. [Pruebas de Seguridad](#pruebas-de-seguridad)
6. [Matriz de Cobertura](#matriz-de-cobertura)

---

## 🎯 Pruebas de Dominio

### Backend - Entidades Core

#### 1.1 Entidad: Operacion

**Archivo**: `backend/aplicacion/Dominio/operaciones/__tests__/Operacion.test.ts`

**Escenarios Críticos**:

- ✅ **Creación válida**: Operación se crea con todos los atributos requeridos
- ✅ **Validación de turno**: Turno debe ser MAÑANA, TARDE o NOCHE
- ✅ **Validación de equipo**: No permitir equipos nulos o vacíos
- ✅ **Cálculo de duración**: Duración correcta entre fechaInicio y fechaFin
- ✅ **Finalización de operación**: Estado cambia correctamente al finalizar
- ✅ **Validación de estado**: Solo operaciones EN_PROCESO pueden finalizarse

**Reglas de Negocio Validadas**:

```typescript
// RN-001: Turno válido
expect(() => new Operacion({ turno: "INVALIDO" })).toThrow();

// RN-002: Duración mínima
const duracion = operacion.calcularDuracion();
expect(duracion).toBeGreaterThan(0);

// RN-003: Transición de estado
operacion.finalizar();
expect(operacion.estado).toBe("FINALIZADA");
```

#### 1.2 Entidad: Equipo (Servicio Monitoreo)

**Archivo**: `servicio-monitoreo/src/dominio/entidades/__tests__/Equipo.test.ts`

**Escenarios Críticos**:

- ✅ **Creación de Excavadora**: Validar capacidadCucharon y profundidadMaxima
- ✅ **Creación de Volquete**: Validar capacidadCarga y numeroEjes
- ✅ **Cambio de estado**: OPERATIVO → MANTENIMIENTO → FUERA_SERVICIO
- ✅ **Validación de identificadores**: Código único no vacío
- ✅ **Actualización de ubicación**: Coordenadas GPS válidas

**Reglas de Negocio Validadas**:

```typescript
// RN-004: Capacidades positivas
expect(excavadora.capacidadCucharon).toBeGreaterThan(0);

// RN-005: Estado inicial OPERATIVO
expect(equipo.estado).toBe("OPERATIVO");

// RN-006: Cambio de estado con motivo
equipo.cambiarEstado("MANTENIMIENTO", "Revisión programada");
expect(equipo.estado).toBe("MANTENIMIENTO");
```

#### 1.3 Entidad: Operacion (Servicio Operaciones)

**Archivo**: `servicio-operaciones/src/dominio/entidades/__tests__/Operacion.test.ts`

**Escenarios Críticos**:

- ✅ **Asignación de equipo**: Validar que equipo existe antes de asignar
- ✅ **Finalización con validaciones**: No permitir finalizar sin equipo asignado
- ✅ **Cálculo de toneladas por hora**: Rendimiento correcto basado en duración
- ✅ **Validación de fechas**: fechaFin debe ser posterior a fechaInicio
- ✅ **Estados coherentes**: Transiciones válidas de estado

---

## 🔄 Pruebas de Casos de Uso

### 2.1 Caso de Uso: Autenticación

**Ubicación**: `backend/aplicacion/casos-uso/auth/`

**Escenarios Críticos** (A IMPLEMENTAR):

```typescript
describe("LoginUseCase", () => {
  it("debe autenticar usuario válido y retornar JWT", async () => {
    // Arrange
    const credentials = { username: "admin", password: "admin123" };

    // Act
    const result = await loginUseCase.execute(credentials);

    // Assert
    expect(result.token).toBeDefined();
    expect(result.user.username).toBe("admin");
    expect(result.user.password).toBeUndefined(); // No exponer password
  });

  it("debe rechazar credenciales inválidas", async () => {
    // Arrange
    const credentials = { username: "admin", password: "wrong" };

    // Act & Assert
    await expect(loginUseCase.execute(credentials)).rejects.toThrow(
      "Credenciales inválidas"
    );
  });

  it("debe bloquear cuenta después de 5 intentos fallidos", async () => {
    // RN-007: Política de seguridad
    const credentials = { username: "admin", password: "wrong" };

    for (let i = 0; i < 5; i++) {
      try {
        await loginUseCase.execute(credentials);
      } catch (e) {
        /* Ignorar */
      }
    }

    await expect(loginUseCase.execute(credentials)).rejects.toThrow(
      "Cuenta bloqueada"
    );
  });
});
```

### 2.2 Caso de Uso: Registrar Operación

**Ubicación**: `backend/aplicacion/casos-uso/operaciones/`

**Escenarios Críticos** (A IMPLEMENTAR):

```typescript
describe("RegistrarOperacionUseCase", () => {
  it("debe registrar operación con todos los datos requeridos", async () => {
    // Arrange
    const dto = {
      tipo: "CARGA",
      turno: "MAÑANA",
      equipoId: "EXC-001",
      fecha: new Date(),
      toneladas: 50,
    };

    // Act
    const operacion = await registrarOperacion.execute(dto);

    // Assert
    expect(operacion.id).toBeDefined();
    expect(operacion.estado).toBe("EN_PROCESO");
  });

  it("debe validar que el equipo esté OPERATIVO", async () => {
    // RN-008: Solo equipos operativos pueden iniciar operaciones
    const dto = {
      tipo: "CARGA",
      equipoId: "EXC-MANTENIMIENTO", // Equipo en mantenimiento
    };

    await expect(registrarOperacion.execute(dto)).rejects.toThrow(
      "Equipo no disponible"
    );
  });
});
```

### 2.3 Caso de Uso: Monitorear Equipos

**Ubicación**: `servicio-monitoreo/src/aplicacion/casos-uso/`

**Escenarios Críticos** (A IMPLEMENTAR):

```typescript
describe("ObtenerEstadoEquiposUseCase", () => {
  it("debe retornar todos los equipos con sus estados", async () => {
    // Act
    const equipos = await obtenerEstadoEquipos.execute();

    // Assert
    expect(equipos.length).toBeGreaterThan(0);
    expect(equipos[0]).toHaveProperty("id");
    expect(equipos[0]).toHaveProperty("estado");
  });

  it("debe filtrar equipos por estado", async () => {
    // Act
    const equiposOperativos = await obtenerEstadoEquipos.execute({
      estado: "OPERATIVO",
    });

    // Assert
    equiposOperativos.forEach((equipo) => {
      expect(equipo.estado).toBe("OPERATIVO");
    });
  });

  it("debe incluir última ubicación GPS", async () => {
    // RN-009: Tracking en tiempo real
    const equipos = await obtenerEstadoEquipos.execute();

    equipos.forEach((equipo) => {
      expect(equipo.ubicacion).toHaveProperty("lat");
      expect(equipo.ubicacion).toHaveProperty("lng");
      expect(equipo.ubicacion).toHaveProperty("timestamp");
    });
  });
});
```

---

## 🔗 Pruebas de Integración

### 3.1 Integración: Repositorio de Operaciones

**Ubicación**: `backend/infraestructura/persistencia/__tests__/`

**Escenarios Críticos** (A IMPLEMENTAR):

```typescript
describe("OperacionRepositorio - Integración con DB", () => {
  beforeAll(async () => {
    // Setup de base de datos de prueba
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  it("debe guardar operación en base de datos", async () => {
    // Arrange
    const operacion = new Operacion({
      tipo: "CARGA",
      turno: "MAÑANA",
    });

    // Act
    await operacionRepo.save(operacion);

    // Assert
    const saved = await operacionRepo.findById(operacion.id);
    expect(saved).toBeDefined();
    expect(saved.tipo).toBe("CARGA");
  });

  it("debe manejar transacciones correctamente", async () => {
    // RN-010: Atomicidad en operaciones críticas
    await expect(async () => {
      await operacionRepo.transaction(async (tx) => {
        await tx.save(operacion1);
        await tx.save(operacion2);
        throw new Error("Rollback forzado");
      });
    }).rejects.toThrow();

    // Verificar que ninguna operación se guardó
    const count = await operacionRepo.count();
    expect(count).toBe(0);
  });
});
```

### 3.2 Integración: Comunicación entre Microservicios

**Ubicación**: `backend/infraestructura/__tests__/integration/`

**Escenarios Críticos** (A IMPLEMENTAR):

```typescript
describe("Comunicación Backend <-> Servicio Monitoreo", () => {
  it("debe obtener estado de equipo antes de registrar operación", async () => {
    // Arrange
    const equipoId = "EXC-001";

    // Act
    const estado = await monitoreoClient.getEquipoEstado(equipoId);

    // Assert
    expect(estado).toHaveProperty("id", equipoId);
    expect(estado).toHaveProperty("estado");
  });

  it("debe manejar timeouts de servicios externos", async () => {
    // RN-011: Resiliencia ante fallos
    jest.setTimeout(5000); // 5 segundos max

    await expect(
      monitoreoClient.getEquipoEstado("INVALID", { timeout: 100 })
    ).rejects.toThrow("Timeout");
  });

  it("debe implementar circuit breaker", async () => {
    // RN-012: Patrón Circuit Breaker
    // Simular 5 fallos consecutivos
    for (let i = 0; i < 5; i++) {
      try {
        await monitoreoClient.getEquipoEstado("FAIL");
      } catch (e) {
        /* Ignorar */
      }
    }

    // El sexto intento debe fallar inmediatamente (circuito abierto)
    const start = Date.now();
    try {
      await monitoreoClient.getEquipoEstado("FAIL");
    } catch (e) {
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100); // Fallo rápido
    }
  });
});
```

---

## 🌐 Pruebas de API (E2E)

### 4.1 Endpoints de Autenticación

**Ubicación**: `backend/__tests__/e2e/auth.test.ts`

**Escenarios Críticos** (A IMPLEMENTAR):

```typescript
describe("POST /auth/login", () => {
  it("debe retornar JWT válido con credenciales correctas", async () => {
    // Act
    const response = await request(app)
      .post("/auth/login")
      .send({ username: "admin", password: "admin123" })
      .expect(200);

    // Assert
    expect(response.body).toHaveProperty("token");
    expect(response.body.token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/); // JWT format
  });

  it("debe retornar 401 con credenciales incorrectas", async () => {
    await request(app)
      .post("/auth/login")
      .send({ username: "admin", password: "wrong" })
      .expect(401);
  });

  it("debe incluir información del usuario en el token", async () => {
    // Act
    const response = await request(app)
      .post("/auth/login")
      .send({ username: "admin", password: "admin123" });

    // Decodificar JWT
    const decoded = jwt.decode(response.body.token);

    // Assert
    expect(decoded).toHaveProperty("userId");
    expect(decoded).toHaveProperty("username");
    expect(decoded).toHaveProperty("role");
  });
});
```

### 4.2 Endpoints de Operaciones

**Ubicación**: `backend/__tests__/e2e/operaciones.test.ts`

**Escenarios Críticos** (A IMPLEMENTAR):

```typescript
describe("GET /operaciones", () => {
  let authToken: string;

  beforeAll(async () => {
    // Autenticar para obtener token
    const response = await request(app)
      .post("/auth/login")
      .send({ username: "admin", password: "admin123" });
    authToken = response.body.token;
  });

  it("debe retornar lista de operaciones con autenticación", async () => {
    const response = await request(app)
      .get("/operaciones")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it("debe rechazar peticiones sin token", async () => {
    await request(app).get("/operaciones").expect(401);
  });

  it("debe filtrar operaciones por turno", async () => {
    const response = await request(app)
      .get("/operaciones?turno=MAÑANA")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    response.body.forEach((op: any) => {
      expect(op.turno).toBe("MAÑANA");
    });
  });
});

describe("POST /operaciones", () => {
  it("debe crear operación válida", async () => {
    // Arrange
    const nuevaOperacion = {
      tipo: "CARGA",
      turno: "MAÑANA",
      equipoId: "EXC-001",
      toneladas: 50,
    };

    // Act
    const response = await request(app)
      .post("/operaciones")
      .set("Authorization", `Bearer ${authToken}`)
      .send(nuevaOperacion)
      .expect(201);

    // Assert
    expect(response.body).toHaveProperty("id");
    expect(response.body.estado).toBe("EN_PROCESO");
  });

  it("debe validar datos de entrada", async () => {
    const invalidData = {
      tipo: "INVALIDO", // Tipo no válido
      turno: "MAÑANA",
    };

    await request(app)
      .post("/operaciones")
      .set("Authorization", `Bearer ${authToken}`)
      .send(invalidData)
      .expect(400);
  });
});
```

### 4.3 Endpoints de Monitoreo

**Ubicación**: `servicio-monitoreo/__tests__/e2e/equipos.test.ts`

**Escenarios Críticos** (A IMPLEMENTAR):

```typescript
describe("GET /api/equipos", () => {
  it("debe retornar todos los equipos", async () => {
    const response = await request(app)
      .get("/api/equipos")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty("equipos");
    expect(Array.isArray(response.body.equipos)).toBe(true);
  });

  it("debe incluir métricas de cada equipo", async () => {
    const response = await request(app)
      .get("/api/equipos")
      .set("Authorization", `Bearer ${authToken}`);

    response.body.equipos.forEach((equipo: any) => {
      expect(equipo).toHaveProperty("horasOperacion");
      expect(equipo).toHaveProperty("combustibleRestante");
      expect(equipo).toHaveProperty("ultimoMantenimiento");
    });
  });
});

describe("PUT /api/equipos/:id/estado", () => {
  it("debe actualizar estado de equipo", async () => {
    const response = await request(app)
      .put("/api/equipos/EXC-001/estado")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        estado: "MANTENIMIENTO",
        motivo: "Mantenimiento preventivo",
      })
      .expect(200);

    expect(response.body.estado).toBe("MANTENIMIENTO");
  });

  it("debe validar transiciones de estado", async () => {
    // RN-013: No se puede pasar de FUERA_SERVICIO a OPERATIVO directamente
    await request(app)
      .put("/api/equipos/EXC-002/estado")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        estado: "OPERATIVO",
        estadoActual: "FUERA_SERVICIO",
      })
      .expect(400);
  });
});
```

---

## 🔒 Pruebas de Seguridad

### 5.1 Validación JWT (API Gateway)

**Ubicación**: `api-gateway/__tests__/security/jwt.test.ts`

**Escenarios Críticos** (A IMPLEMENTAR):

```typescript
describe("JWT Validation Middleware", () => {
  it("debe validar JWT válido", async () => {
    const validToken = generateTestToken({ userId: 1, role: "admin" });

    const response = await request(apiGateway)
      .get("/backend/operaciones")
      .set("Authorization", `Bearer ${validToken}`)
      .expect(200);
  });

  it("debe rechazar JWT expirado", async () => {
    const expiredToken = generateTestToken(
      { userId: 1 },
      { expiresIn: "-1h" } // Token expirado hace 1 hora
    );

    await request(apiGateway)
      .get("/backend/operaciones")
      .set("Authorization", `Bearer ${expiredToken}`)
      .expect(401);
  });

  it("debe rechazar JWT con firma inválida", async () => {
    const tamperedToken = validToken.slice(0, -5) + "XXXXX";

    await request(apiGateway)
      .get("/backend/operaciones")
      .set("Authorization", `Bearer ${tamperedToken}`)
      .expect(401);
  });

  it("debe validar roles en endpoints protegidos", async () => {
    // RN-014: Control de acceso basado en roles
    const userToken = generateTestToken({ userId: 2, role: "operator" });

    // Endpoint solo para admin
    await request(apiGateway)
      .delete("/backend/operaciones/1")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(403); // Forbidden
  });
});
```

### 5.2 Protección contra Ataques

**Ubicación**: `api-gateway/__tests__/security/attacks.test.ts`

**Escenarios Críticos** (A IMPLEMENTAR):

```typescript
describe("Protección contra SQL Injection", () => {
  it("debe sanitizar parámetros de consulta", async () => {
    const maliciousInput = "'; DROP TABLE operaciones; --";

    await request(app)
      .get(`/operaciones?turno=${encodeURIComponent(maliciousInput)}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(400); // Bad request
  });
});

describe("Protección contra XSS", () => {
  it("debe escapar contenido HTML en respuestas", async () => {
    const xssPayload = '<script>alert("XSS")</script>';

    const response = await request(app)
      .post("/operaciones")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        tipo: "CARGA",
        observaciones: xssPayload,
      });

    expect(response.body.observaciones).not.toContain("<script>");
    expect(response.body.observaciones).toContain("&lt;script&gt;");
  });
});

describe("Rate Limiting", () => {
  it("debe limitar peticiones por IP", async () => {
    // RN-015: Máximo 100 requests por minuto
    const promises = [];

    for (let i = 0; i < 101; i++) {
      promises.push(
        request(app)
          .get("/operaciones")
          .set("Authorization", `Bearer ${authToken}`)
      );
    }

    const results = await Promise.all(promises);
    const tooManyRequests = results.filter((r) => r.status === 429);

    expect(tooManyRequests.length).toBeGreaterThan(0);
  });
});
```

---

## 📊 Matriz de Cobertura

### Cobertura Mínima por Servicio

| Servicio                 | Líneas | Funciones | Branches | Statements | Estado         |
| ------------------------ | ------ | --------- | -------- | ---------- | -------------- |
| **Backend**              | 70%    | 70%       | 70%      | 70%        | ✅ CONFIGURADO |
| **Servicio Monitoreo**   | 70%    | 70%       | 70%      | 70%        | ✅ CONFIGURADO |
| **Servicio Operaciones** | 70%    | 70%       | 70%      | 70%        | ✅ CONFIGURADO |
| **API Gateway**          | N/A    | N/A       | N/A      | N/A        | ⚠️ SIN TESTS   |
| **Frontend**             | N/A    | N/A       | N/A      | N/A        | ⚠️ SIN TESTS   |

### Prioridad de Implementación

#### 🔴 PRIORIDAD ALTA (Bloqueantes para Deploy)

1. **Pruebas de Autenticación** - JWT validation, login, logout
2. **Pruebas de Operaciones CRUD** - Create, Read, Update, Delete operations
3. **Pruebas de Estado de Equipos** - Equipment status management
4. **Validación de Reglas de Negocio** - Business invariants

#### 🟡 PRIORIDAD MEDIA (Recomendadas)

5. **Pruebas de Integración** - Database transactions, service communication
6. **Pruebas de API E2E** - Full request/response cycle
7. **Pruebas de Seguridad** - XSS, SQL Injection, Rate Limiting

#### 🟢 PRIORIDAD BAJA (Opcionales)

8. **Pruebas de Rendimiento** - Load testing, stress testing
9. **Pruebas de UI** - Selenium/Cypress para frontend
10. **Pruebas de Resiliencia** - Chaos engineering

### Comandos de Ejecución

```bash
# Ejecutar todas las pruebas
npm run test:all

# Pruebas con cobertura
npm run test:coverage

# Solo Backend
cd backend && npm test

# Solo Servicio Monitoreo
cd servicio-monitoreo && npm test

# Solo Servicio Operaciones
cd servicio-operaciones && npm test

# Pruebas en modo watch (desarrollo)
npm run test:watch

# Verificar cobertura mínima
npm run test:coverage -- --coverageThreshold='{"global":{"lines":70,"functions":70,"branches":70,"statements":70}}'
```

### Criterios de Aceptación del Pipeline

Para que el pipeline CI/CD pase exitosamente:

1. ✅ **Todas las pruebas unitarias deben pasar** (0 fallos)
2. ✅ **Cobertura >= 70%** en todos los servicios con tests
3. ✅ **Sin vulnerabilidades críticas** detectadas por npm audit
4. ✅ **Sin errores de compilación TypeScript**
5. ✅ **Imágenes Docker construidas exitosamente**
6. ⚠️ **Warnings no bloquean el deploy** (solo se registran)

---

## 📝 Notas de Implementación

### Tests Existentes

- ✅ Backend tiene 11 archivos de tests con cobertura completa
- ✅ Servicio Monitoreo tiene tests de dominio (Equipo, Excavadora, Volquete)
- ✅ Servicio Operaciones tiene tests de dominio (Operacion)

### Tests Pendientes

- ⚠️ Casos de uso (Use Cases) - 0% implementado
- ⚠️ Repositorios (Integración) - 0% implementado
- ⚠️ API E2E - 0% implementado
- ⚠️ Seguridad - 0% implementado

### Recomendaciones

1. Implementar tests de casos de uso antes del próximo sprint
2. Agregar tests E2E para flujos críticos (login → crear operación → finalizar)
3. Configurar SonarQube para análisis de calidad de código
4. Implementar mutation testing para validar calidad de tests

---

**Documento generado**: 2025-01-XX  
**Versión**: 1.0  
**Autor**: DevOps Team
