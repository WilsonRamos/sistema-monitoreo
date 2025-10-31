# 📝 LABORATORIO 04 - PRUEBAS DE INTEGRACIÓN

**Sistema de Monitoreo Minero**
**Ingeniería de Software II**
**UNSA - Arequipa**

## 📂 ESTRUCTURA DE PRUEBAS

```
sistema-monitoreo/
├── Dominio/
│   └── monitoreo/
│       ├── Equipo.ts
│       ├── excavadora.ts
│       ├── volquete.ts
│       └── __tests__/                    ← PRUEBAS UNITARIAS DE DOMINIO
│           ├── Equipo.test.ts           (34 tests)
│           ├── Excavadora.test.ts       (8 tests)
│           └── Volquete.test.ts         (8 tests)
│
├── infraestructura/
│   └── persistencia/
│       └── repositorios/
│           ├── MemoriaEquipoRepositorio.ts
│           └── __tests__/                ← PRUEBAS DE INTEGRACIÓN REPOSITORY
│               └── MemoriaEquipoRepositorio.integration.test.ts  (24 tests)
│
├── aplicacion/
│   └── casos-uso/
│       └── equipos/
│           ├── CrearEquipo.ts
│           └── __tests__/                ← PRUEBAS DE INTEGRACIÓN CON MOCKS
│               └── CrearEquipo.integration.test.ts  (16 tests)
│
├── jest.config.js                        ← Configuración de Jest
├── coverage/                             ← Reportes de cobertura (generados)
└── LABORATORIO-04-TESTING.md            ← Esta documentación
```

## TIPOS DE PRUEBAS IMPLEMENTADAS

### **1. PRUEBAS UNITARIAS DE DOMINIO**

**Archivo**: `Dominio/monitoreo/__tests__/Equipo.test.ts`

**Objetivo**: Probar **INVARIANTES** (reglas de negocio) de las entidades de dominio.

**Características**:

- ✅ NO usan dobles/mocks (son pruebas puras)
- ✅ Prueban lógica de negocio aislada
- ✅ Rápidas de ejecutar
- ✅ Fáciles de mantener

**Ejemplo de pruebas**:

```typescript
describe("Equipo - Pruebas Unitarias", () => {
  test("INVARIANTE: El código no puede estar vacío", () => {
    expect(() => {
      new Equipo("EQ-001", "", "VOLQUETE");
    }).toThrow("El código del equipo es obligatorio");
  });

  test("INVARIANTE: El combustible no puede ser negativo", () => {
    const equipo = new Equipo("EQ-001", "VOL-001", "VOLQUETE");

    expect(() => {
      equipo.nivelCombustible = -10;
    }).toThrow("El nivel de combustible no puede ser negativo");
  });

  test("Debería consumir combustible correctamente", () => {
    const equipo = new Equipo("EQ-001", "VOL-001", "VOLQUETE", 100, 0);

    equipo.consumirCombustible(30);

    expect(equipo.nivelCombustible).toBe(70);
  });
});
```

**Categorías de pruebas**:

1. Constructor e Invariantes (5 tests)
2. Cambio de Estado (5 tests)
3. Manejo de Combustible (5 tests)
4. Horas de Operación (3 tests)
5. Sistema de Alertas (5 tests)
6. Comportamientos del Dominio (3 tests)
7. Historial de Cambios (3 tests)
8. Tipos de Equipos Válidos (5 tests)

**Total: 34 tests** ✅

---

### **2. PRUEBAS DE INTEGRACIÓN CON REPOSITORY**

**Archivo**: `infraestructura/persistencia/repositorios/__tests__/MemoriaEquipoRepositorio.integration.test.ts`

**Objetivo**: Probar la **integración entre Repository y Entidades de Dominio**.

**Características**:

- ✅ Usan implementación real del repositorio (en memoria)
- ✅ Verifican el contrato de la interfaz IEquipoRepositorio
- ✅ Prueban operaciones CRUD
- ✅ Validan integridad de datos

**Ejemplo de pruebas**:

```typescript
describe("MemoriaEquipoRepositorio - Pruebas de Integración", () => {
  let repository: IEquipoRepositorio;

  beforeEach(() => {
    repository = new MemoriaEquipoRepositorio();
  });

  test("Debería crear un equipo correctamente", async () => {
    // Arrange
    const equipo = new Equipo("EQ-001", "VOL-TEST-001", "VOLQUETE");

    // Act
    await repository.crear(equipo);
    const resultado = await repository.obtenerPorId("EQ-001");

    // Assert
    expect(resultado).not.toBeNull();
    expect(resultado?.codigo).toBe("VOL-TEST-001");
  });

  test("NO debería permitir códigos duplicados", async () => {
    const equipo1 = new Equipo("EQ-001", "VOL-DUP", "VOLQUETE");
    const equipo2 = new Equipo("EQ-002", "VOL-DUP", "VOLQUETE");

    await repository.crear(equipo1);

    await expect(repository.crear(equipo2)).rejects.toThrow("Ya existe");
  });
});
```

**Categorías de pruebas**:

1. Pruebas de Creación (3 tests)
2. Pruebas de Lectura (3 tests)
3. Pruebas de Actualización (2 tests)
4. Pruebas de Eliminación (3 tests)
5. Búsquedas Específicas (4 tests)
6. Integridad de Datos (2 tests)
7. Estadísticas (1 test)

**Total: 24 tests** ✅

---

### **3. PRUEBAS DE INTEGRACIÓN CON MOCKS**

**Archivo**: `aplicacion/casos-uso/equipos/__tests__/CrearEquipo.integration.test.ts`

**Objetivo**: Probar **servicios de aplicación** que dependen de repositorios usando **MOCKS**.

**Características**:

- ✅ Usan mocks de Jest para simular dependencias
- ✅ Verifican orquestación del caso de uso
- ✅ Validan manejo de errores
- ✅ Prueban flujo completo de la aplicación

**Ejemplo de pruebas**:

```typescript
describe("CrearEquipo - Pruebas de Integración con Mocks", () => {
  let mockRepository: jest.Mocked<IEquipoRepositorio>;
  let crearEquipoUseCase: CrearEquipo;

  beforeEach(() => {
    // Crear MOCK del repositorio
    mockRepository = {
      crear: jest.fn(),
      obtenerTodos: jest.fn(),
      obtenerPorId: jest.fn(),
      actualizar: jest.fn(),
      eliminar: jest.fn(),
      buscarPorTipo: jest.fn(),
      buscarPorEstado: jest.fn(),
      existeConCodigo: jest.fn(),
    };

    crearEquipoUseCase = new CrearEquipo(mockRepository);
  });

  test("Debería crear un equipo válido", async () => {
    // Arrange
    mockRepository.existeConCodigo.mockResolvedValue(false);
    mockRepository.crear.mockResolvedValue(undefined);

    // Act
    const id = await crearEquipoUseCase.ejecutar("VOL-001", "VOLQUETE", 100, 0);

    // Assert
    expect(id).toBeDefined();
    expect(mockRepository.crear).toHaveBeenCalledTimes(1);
    expect(mockRepository.existeConCodigo).toHaveBeenCalledWith("VOL-001");
  });

  test("NO debería crear equipo con código duplicado", async () => {
    mockRepository.existeConCodigo.mockResolvedValue(true);

    await expect(
      crearEquipoUseCase.ejecutar("VOL-DUP", "VOLQUETE", 100, 0)
    ).rejects.toThrow("Ya existe");

    expect(mockRepository.crear).not.toHaveBeenCalled();
  });
});
```

**Categorías de pruebas**:

1. Caso exitoso (2 tests)
2. Validaciones de negocio (5 tests)
3. Manejo de errores (2 tests)
4. Verificación de comportamiento (2 tests)
5. Pruebas paramétricas (5 tests)

**Total: 16 tests** ✅

---

## ▶️ EJECUCIÓN DE PRUEBAS

### **Comandos disponibles**

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas con cobertura
npm run test:coverage

# Ejecutar pruebas con Grunt
grunt test

# Ejecutar pruebas con cobertura usando Grunt
grunt test:coverage

# Construcción completa (incluye pruebas)
npm run build
# o
grunt build
```

### **Resultado de la ejecución**

```
Test Suites: 4 passed, 4 total
Tests:       82 passed, 82 total
Snapshots:   0 total
Time:        13.227s
```

**Desglose por archivo**:

- ✅ Equipo.test.ts: 34 tests pasados
- ✅ Excavadora.test.ts: 8 tests pasados
- ✅ Volquete.test.ts: 8 tests pasados
- ✅ MemoriaEquipoRepositorio.integration.test.ts: 24 tests pasados
- ✅ CrearEquipo.integration.test.ts: 16 tests pasados

---

## 📊 REPORTES DE COBERTURA

### **Configuración de umbrales**

En `jest.config.js`:

```javascript
coverageThreshold: {
    global: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70
    }
}
```

### **Resultados de cobertura**

#### **Componentes principales probados:**

| Componente                      | Líneas | Funciones | Ramas  | Declaraciones |
| ------------------------------- | ------ | --------- | ------ | ------------- |
| **Equipo.ts**                   | 98.76% | 100%      | 94.11% | 98.75%        |
| **Excavadora.ts**               | 100%   | 100%      | 100%   | 100%          |
| **Volquete.ts**                 | 100%   | 100%      | 100%   | 100%          |
| **MemoriaEquipoRepositorio.ts** | 87.77% | 94.44%    | 100%   | 86.90%        |
| **CrearEquipo.ts**              | 91.89% | 83.33%    | 100%   | 91.42%        |

### **Tipos de reportes generados**

1. **Text**: En consola (stdout)
2. **LCOV**: Para herramientas de CI/CD
3. **HTML**: Navegable en `coverage/lcov-report/index.html`
4. **JSON**: Para análisis programático

### **Ver reporte HTML**

```bash
# Después de ejecutar test:coverage, abrir el reporte:
start coverage/lcov-report/index.html   # Windows
open coverage/lcov-report/index.html    # Mac
xdg-open coverage/lcov-report/index.html # Linux
```

---

## ⚙️ AUTOMATIZACIÓN CON GRUNT

### **Configuración en Gruntfile.js**

```javascript
shell: {
    // Ejecutar pruebas unitarias y de integración
    test: {
        command: 'npm test',
        options: {
            stdout: true,
            stderr: true
        }
    },

    // Ejecutar pruebas con cobertura
    testCoverage: {
        command: 'npm run test:coverage',
        options: {
            stdout: true,
            stderr: true
        }
    }
}
```

### **Tareas de Grunt disponibles**

```bash
# Ejecutar solo pruebas
grunt test

# Ejecutar pruebas con cobertura
grunt test:coverage

# Construcción completa (limpia + pruebas + compila)
grunt build

# Construcción y ejecución
grunt run

# Verificar configuración
grunt check

# Información del proyecto
grunt info
```

### **Flujo de construcción automatizado**

```
grunt build
    ↓
1. clean:dist          ← Limpiar directorio dist/
    ↓
2. shell:test          ← Ejecutar TODAS las pruebas
    ↓
3. shell:typescript    ← Compilar TypeScript
    ↓
4. copy:web           ← Copiar archivos web
    ↓
5. copy:package       ← Preparar package.json
```

**Ventaja**: Si las pruebas fallan, la construcción se detiene y NO se genera código compilado.

---
