# 📘 LABORATORIO 07 - GUÍA COMPLETA DE REFACTORING Y TDD

**Universidad Nacional de San Agustín de Arequipa**
**Curso**: Ingeniería de Software II
**Proyecto**: Sistema de Monitoreo Minero
**Fecha**: 2025-01-XX

---

## 📊 RESUMEN EJECUTIVO

### Estado Actual del Proyecto (SonarQube Analysis)

| Métrica | Valor Actual | Objetivo | Estado |
|---------|--------------|----------|--------|
| **Quality Gate** | ✅ PASSED | PASSED | ✅ |
| **Code Smells** | 135 | < 50 | ⚠️ |
| **Security Hotspots** | 1 (Medium) | 0 | ⚠️ |
| **Bugs** | 0 | 0 | ✅ |
| **Vulnerabilities** | 0 | 0 | ✅ |
| **Coverage** | 43.5% | ≥ 80% | ⚠️ |
| **Duplications** | 0.0% | < 3% | ✅ |
| **Technical Debt** | 3h 49min | < 2h | ⚠️ |

### Priorización de Tareas

```
🔴 CRÍTICO (Hacer primero):
  1. Corregir Security Hotspot (Math.random inseguro)
  2. Completar TODOs en código de producción

🟡 IMPORTANTE (Segunda iteración):
  3. Eliminar clases/interfaces vacías
  4. Mejorar cobertura de código (43.5% → 80%)

🟢 MEJORÍA CONTINUA:
  5. Aplicar principios SOLID
  6. Refactorizar métodos largos
  7. Mejorar nombres de variables
```

---

## 🎯 PARTE 1: ANÁLISIS DETALLADO DE ISSUES

### 1.1 Security Hotspot: Weak Cryptography

**📍 Ubicación**: `aplicacion/casos-uso/equipos/CrearEquipo.ts:142`

**🔍 Código problemático**:
```typescript
private generarIdUnico(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);  // ⚠️ INSEGURO
    const id = `equipo-${timestamp}-${random}`;
    return id;
}
```

**❌ Problema**:
- `Math.random()` usa un generador pseudoaleatorio **NO criptográfico**
- Predecible si se conoce el estado interno
- No es adecuado para generar IDs únicos en producción
- Puede generar colisiones (duplicados)

**✅ Solución (Refactoring: Replace Algorithm)**:
```typescript
import { randomUUID } from 'crypto';

private generarIdUnico(): string {
    // UUID v4 - Cryptographically secure
    const id = `equipo-${randomUUID()}`;
    console.log(`🆔 ID generado: ${id}`);
    return id;
}
```

**📚 Concepto técnico**:
- **UUID v4**: Estándar RFC 4122, 128 bits de aleatoriedad
- **crypto.randomUUID()**: Usa fuente de entropía del SO
- **Colisiones**: Probabilidad prácticamente nula (2^-122)

**🧪 Prueba unitaria (TDD)**:
```typescript
describe('generarIdUnico', () => {
    it('debe generar IDs únicos en múltiples llamadas', () => {
        const caso = new CrearEquipo(mockRepo);
        const ids = new Set();

        // Generar 1000 IDs
        for (let i = 0; i < 1000; i++) {
            const id = (caso as any).generarIdUnico();
            ids.add(id);
        }

        // No debe haber duplicados
        expect(ids.size).toBe(1000);
    });

    it('debe seguir el formato equipo-[UUID]', () => {
        const caso = new CrearEquipo(mockRepo);
        const id = (caso as any).generarIdUnico();

        expect(id).toMatch(/^equipo-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });
});
```

**🔧 Pasos de implementación**:
1. ✅ Escribir pruebas (ya existen, pero agregar las nuevas)
2. ✅ Ejecutar pruebas → FALLAN (Red)
3. ✅ Modificar código → Usar crypto.randomUUID()
4. ✅ Ejecutar pruebas → PASAN (Green)
5. ✅ Refactorizar si es necesario (Refactor)
6. ✅ Commit: `fix: replace Math.random with crypto.randomUUID for secure ID generation. Fix #1`

---

### 1.2 Code Smell: Clases/Interfaces Vacías

**📍 Archivos afectados**:
- `Dominio/mina/InterfacesRepositorio/iFrenteRepositorio.ts`
- `Dominio/mina/InterfacesRepositorio/iMinaRepositorio.ts`
- `Dominio/monitoreo/servicios/monitoreoServiciosDominio.ts`
- `Dominio/servicios-dominio/iMinaServicio.ts`
- `Dominio/servicios-dominio/iMonitoreoServicio.ts`
- `Dominio/servicios-dominio/iOperacionesServicio.ts`

**🔍 Código problemático**:
```typescript
// TODO: Definir métodos del repositorio de Frente
export class iFrenteRepositorio {
    // Clase completamente vacía ⚠️
}
```

**❌ Problema**:
- Interfaces/clases sin métodos no aportan valor
- Violan el principio **Interface Segregation (ISP)**
- Confunden a otros desarrolladores
- Incrementan deuda técnica

**✅ Solución 1: Extract Interface (definir métodos)**:
```typescript
/**
 * Repositorio de Frentes de trabajo
 * Patrón Repository - Abstracción de persistencia
 */
export interface IFrenteRepositorio {
    /**
     * Crear un nuevo frente de trabajo
     */
    crear(frente: Frente): Promise<void>;

    /**
     * Obtener frente por ID
     */
    obtenerPorId(id: string): Promise<Frente | null>;

    /**
     * Obtener todos los frentes de una mina
     */
    obtenerPorMina(minaId: string): Promise<Frente[]>;

    /**
     * Actualizar frente existente
     */
    actualizar(frente: Frente): Promise<void>;

    /**
     * Eliminar frente
     */
    eliminar(id: string): Promise<void>;

    /**
     * Verificar si existe un frente con cierto código
     */
    existeConCodigo(codigo: string): Promise<boolean>;
}
```

**✅ Solución 2: Inline Class (eliminar si no se usa)**:
```typescript
// Si la interfaz no se usa en ningún lado, eliminarla completamente
// y usar directamente la implementación concreta donde sea necesario
```

**📚 Concepto técnico - Repository Pattern**:
```
┌─────────────────────────────────────────┐
│   Capa de Aplicación (Casos de Uso)    │
│   - CrearFrente                         │
│   - ObtenerFrentes                      │
└─────────────┬───────────────────────────┘
              │ Depende de
              ▼
┌─────────────────────────────────────────┐
│   Capa de Dominio (Interfaces)          │
│   - IFrenteRepositorio (INTERFAZ)       │  ← Define el contrato
└─────────────┬───────────────────────────┘
              │ Implementa
              ▼
┌─────────────────────────────────────────┐
│   Capa de Infraestructura               │
│   - MemoriaFrenteRepositorio            │  ← Implementación en memoria
│   - PrismaFrenteRepositorio             │  ← Implementación con BD
└─────────────────────────────────────────┘
```

**Principio aplicado**: **Dependency Inversion Principle (DIP)**
- Las capas de alto nivel (Aplicación) no dependen de las de bajo nivel (Infraestructura)
- Ambas dependen de abstracciones (Interfaces)

**🔧 Pasos de implementación**:
1. ✅ Analizar responsabilidad de cada interfaz
2. ✅ Definir métodos basados en operaciones CRUD + específicas del dominio
3. ✅ Documentar cada método (JSDoc)
4. ✅ Actualizar implementaciones concretas si existen
5. ✅ Ejecutar pruebas
6. ✅ Commit: `refactor: add methods to empty repository interfaces. Fix #2`

---

### 1.3 Code Smell: TODOs no completados

**📍 Archivos afectados** (múltiples):

**Ejemplo 1**: `Dominio/mina/minaFabrica.ts`
```typescript
export class MinaFabrica {
    // TODO: Implementar método de creación de Mina
    constructor() {
        // TODO: Constructor vacío
    }

    // TODO: crearMina(nombre: string, ubicacion: string): Mina
    // TODO: validarDatosMina(...)
}
```

**❌ Problema**:
- TODOs sin implementar en código de producción
- Funcionalidad incompleta
- Técnicamente es deuda técnica acumulada

**✅ Solución: Implementar o eliminar**:

**Opción A - Implementar (Recomendado)**:
```typescript
/**
 * Fábrica para crear instancias de Mina
 * Patrón Factory - Encapsula lógica de creación compleja
 */
export class MinaFabrica {

    /**
     * Crear una nueva mina con validaciones
     */
    static crearMina(
        nombre: string,
        ubicacion: string,
        tipo: 'SUPERFICIAL' | 'SUBTERRANEA'
    ): Mina {
        // Validar datos
        this.validarDatosMina(nombre, ubicacion, tipo);

        // Crear ID único
        const id = randomUUID();

        // Crear instancia
        const mina = new Mina(id, nombre, ubicacion, tipo);

        console.log(`🏭 Mina creada: ${nombre} (${tipo})`);
        return mina;
    }

    /**
     * Validar datos de entrada para crear mina
     */
    private static validarDatosMina(
        nombre: string,
        ubicacion: string,
        tipo: string
    ): void {
        if (!nombre || nombre.trim().length === 0) {
            throw new Error('El nombre de la mina es obligatorio');
        }

        if (!ubicacion || ubicacion.trim().length === 0) {
            throw new Error('La ubicación de la mina es obligatoria');
        }

        const tiposValidos = ['SUPERFICIAL', 'SUBTERRANEA'];
        if (!tiposValidos.includes(tipo)) {
            throw new Error(`Tipo de mina inválido. Debe ser: ${tiposValidos.join(', ')}`);
        }
    }
}
```

**Opción B - Eliminar (si no se necesita)**:
```typescript
// Si la fábrica no se usa en el código, eliminar completamente el archivo
// y crear instancias directamente con "new Mina(...)"
```

**📚 Concepto técnico - Factory Pattern**:
```
¿Cuándo usar Factory?
✅ Cuando la creación del objeto es compleja (múltiples validaciones)
✅ Cuando necesitas centralizar lógica de inicialización
✅ Cuando tienes múltiples variantes del mismo objeto
❌ Cuando la creación es simple (solo "new Clase()")
```

**🧪 Prueba unitaria**:
```typescript
describe('MinaFabrica', () => {
    describe('crearMina', () => {
        it('debe crear una mina con datos válidos', () => {
            const mina = MinaFabrica.crearMina(
                'Mina San Rafael',
                'Arequipa, Perú',
                'SUPERFICIAL'
            );

            expect(mina.nombre).toBe('Mina San Rafael');
            expect(mina.ubicacion).toBe('Arequipa, Perú');
            expect(mina.tipo).toBe('SUPERFICIAL');
            expect(mina.id).toBeDefined();
        });

        it('debe lanzar error si nombre está vacío', () => {
            expect(() => {
                MinaFabrica.crearMina('', 'Arequipa', 'SUPERFICIAL');
            }).toThrow('El nombre de la mina es obligatorio');
        });

        it('debe lanzar error si tipo es inválido', () => {
            expect(() => {
                MinaFabrica.crearMina('Mina X', 'Lima', 'INVALIDO' as any);
            }).toThrow('Tipo de mina inválido');
        });
    });
});
```

**🔧 Ciclo TDD**:
```
1. RED   → Escribir prueba que falla
2. GREEN → Escribir código mínimo para pasar
3. REFACTOR → Mejorar el código manteniendo tests en verde
```

---

### 1.4 Code Smell: Constructores inútiles

**📍 Archivos afectados**:
- `Dominio/mina/minaFabrica.ts:5`
- `Dominio/monitoreo/modelo/frente.ts:4`

**🔍 Código problemático**:
```typescript
export class MinaFabrica {
    constructor() {
        // Constructor vacío sin lógica ⚠️
    }
}
```

**❌ Problema**:
- Constructor que no hace nada
- Código innecesario que aumenta complejidad
- Violación de principio YAGNI (You Aren't Gonna Need It)

**✅ Solución: Inline Method (eliminar constructor)**:
```typescript
export class MinaFabrica {
    // Sin constructor - TypeScript crea uno por defecto

    static crearMina(...) { ... }
}
```

**📚 Concepto técnico**:
En TypeScript/JavaScript:
- Si no defines constructor, se crea uno vacío automáticamente
- Solo debes definir constructor si necesitas:
  - Inicializar propiedades
  - Inyectar dependencias
  - Ejecutar lógica de inicialización

**🔧 Refactoring aplicado**: **Inline Method**

---

## 🧪 PARTE 2: MEJORAR COBERTURA DE CÓDIGO (43.5% → 80%)

### 2.1 Análisis de archivos sin cobertura

Según SonarQube, faltan **521 líneas** por cubrir. Archivos prioritarios:

```
📂 aplicacion/casos-uso/
  ├── monitoreo/
  │   ├── ActualizarEstadoEquipo.ts      ❌ 0% coverage
  │   └── ObtenerUbicacionTiempoReal.ts  ❌ 0% coverage
  ├── operaciones/
  │   ├── IniciarOperacionCargue.ts      ❌ 0% coverage
  │   └── CompletarCicloTransporte.ts    ❌ 0% coverage
  └── equipos/
      └── ObtenerEquipos.ts              ⚠️ 60% coverage
```

### 2.2 Ejemplo: Crear pruebas para ActualizarEstadoEquipo.ts

**Paso 1: Leer el caso de uso**
```typescript
// aplicacion/casos-uso/monitoreo/ActualizarEstadoEquipo.ts
export class ActualizarEstadoEquipo {
    constructor(
        private readonly equipoRepositorio: IEquipoRepositorio
    ) {}

    async ejecutar(equipoId: string, nuevoEstado: string): Promise<void> {
        // Validar entrada
        this.validarDatos(equipoId, nuevoEstado);

        // Obtener equipo
        const equipo = await this.equipoRepositorio.obtenerPorId(equipoId);
        if (!equipo) {
            throw new Error(`Equipo con ID ${equipoId} no encontrado`);
        }

        // Cambiar estado (lógica de dominio)
        equipo.cambiarEstado(nuevoEstado);

        // Persistir
        await this.equipoRepositorio.actualizar(equipo);

        console.log(`✅ Estado actualizado: ${equipoId} → ${nuevoEstado}`);
    }

    private validarDatos(equipoId: string, nuevoEstado: string): void {
        if (!equipoId || equipoId.trim().length === 0) {
            throw new Error('El ID del equipo es obligatorio');
        }
        if (!nuevoEstado || nuevoEstado.trim().length === 0) {
            throw new Error('El nuevo estado es obligatorio');
        }
    }
}
```

**Paso 2: Diseñar casos de prueba**

| ID | Escenario | Valores de entrada | Resultado esperado |
|----|-----------|-------------------|-------------------|
| TC01 | Caso exitoso | equipoId válido, estado válido | Estado actualizado sin error |
| TC02 | Equipo no encontrado | ID inexistente | Error "no encontrado" |
| TC03 | ID vacío | "", "OPERANDO" | Error "ID obligatorio" |
| TC04 | Estado vacío | "eq-123", "" | Error "estado obligatorio" |
| TC05 | Transición inválida | De "DISPONIBLE" a "INACTIVO" | Error de dominio |

**Paso 3: Implementar pruebas (Patrón AAA)**

```typescript
// aplicacion/casos-uso/monitoreo/__tests__/ActualizarEstadoEquipo.test.ts
import { ActualizarEstadoEquipo } from '../ActualizarEstadoEquipo';
import { IEquipoRepositorio } from '../../../Dominio/repositorios/IEquipoRepositorio';
import { Equipo } from '../../../Dominio/monitoreo/modelo/Equipo';

describe('ActualizarEstadoEquipo', () => {
    let mockRepositorio: jest.Mocked<IEquipoRepositorio>;
    let casoDeUso: ActualizarEstadoEquipo;
    let equipoMock: Equipo;

    beforeEach(() => {
        // Arrange - Configuración común
        mockRepositorio = {
            obtenerPorId: jest.fn(),
            actualizar: jest.fn(),
        } as any;

        casoDeUso = new ActualizarEstadoEquipo(mockRepositorio);

        equipoMock = new Equipo(
            'equipo-123',
            'EQ-001',
            'VOLQUETE',
            100,
            0
        );
    });

    describe('TC01: Caso exitoso', () => {
        it('debe actualizar el estado del equipo correctamente', async () => {
            // Arrange
            mockRepositorio.obtenerPorId.mockResolvedValue(equipoMock);
            mockRepositorio.actualizar.mockResolvedValue(undefined);

            // Act
            await casoDeUso.ejecutar('equipo-123', 'OPERANDO');

            // Assert
            expect(mockRepositorio.obtenerPorId).toHaveBeenCalledWith('equipo-123');
            expect(equipoMock.estado).toBe('OPERANDO');
            expect(mockRepositorio.actualizar).toHaveBeenCalledWith(equipoMock);
        });
    });

    describe('TC02: Equipo no encontrado', () => {
        it('debe lanzar error si el equipo no existe', async () => {
            // Arrange
            mockRepositorio.obtenerPorId.mockResolvedValue(null);

            // Act & Assert
            await expect(
                casoDeUso.ejecutar('eq-inexistente', 'OPERANDO')
            ).rejects.toThrow('Equipo con ID eq-inexistente no encontrado');
        });
    });

    describe('TC03: Validación de ID vacío', () => {
        it('debe lanzar error si el ID está vacío', async () => {
            // Act & Assert
            await expect(
                casoDeUso.ejecutar('', 'OPERANDO')
            ).rejects.toThrow('El ID del equipo es obligatorio');
        });

        it('debe lanzar error si el ID es solo espacios', async () => {
            await expect(
                casoDeUso.ejecutar('   ', 'OPERANDO')
            ).rejects.toThrow('El ID del equipo es obligatorio');
        });
    });

    describe('TC04: Validación de estado vacío', () => {
        it('debe lanzar error si el estado está vacío', async () => {
            await expect(
                casoDeUso.ejecutar('equipo-123', '')
            ).rejects.toThrow('El nuevo estado es obligatorio');
        });
    });

    describe('TC05: Transición de estado inválida', () => {
        it('debe lanzar error si la transición no está permitida', async () => {
            // Arrange
            equipoMock.cambiarEstado('DISPONIBLE');
            mockRepositorio.obtenerPorId.mockResolvedValue(equipoMock);

            // Act & Assert
            await expect(
                casoDeUso.ejecutar('equipo-123', 'INACTIVO')  // Transición no permitida
            ).rejects.toThrow('No se puede cambiar');
        });
    });

    describe('Verificación de comportamiento', () => {
        it('debe llamar obtenerPorId antes de actualizar', async () => {
            // Arrange
            mockRepositorio.obtenerPorId.mockResolvedValue(equipoMock);
            mockRepositorio.actualizar.mockResolvedValue(undefined);

            // Act
            await casoDeUso.ejecutar('equipo-123', 'OPERANDO');

            // Assert - Verificar orden de llamadas
            const obtenerPorIdCall = mockRepositorio.obtenerPorId.mock.invocationCallOrder[0];
            const actualizarCall = mockRepositorio.actualizar.mock.invocationCallOrder[0];
            expect(obtenerPorIdCall).toBeLessThan(actualizarCall);
        });
    });
});
```

**Paso 4: Ejecutar pruebas**
```bash
npm test -- ActualizarEstadoEquipo.test.ts
```

**Paso 5: Ver reporte de cobertura**
```bash
npm run test:coverage
```

**Resultado esperado**:
```
ActualizarEstadoEquipo.ts
  Statements: 100% (15/15)
  Branches: 100% (8/8)
  Functions: 100% (2/2)
  Lines: 100% (14/14)
```

---

## 🏗️ PARTE 3: APLICAR PRINCIPIOS SOLID

### 3.1 Single Responsibility Principle (SRP)

**❌ Violación detectada**:
Una clase que hace múltiples cosas:

```typescript
// ❌ MALO - Clase con múltiples responsabilidades
export class EquipoService {
    crearEquipo() { }
    validarEquipo() { }
    enviarNotificacion() { }  // ⚠️ Responsabilidad diferente
    generarReporte() { }       // ⚠️ Responsabilidad diferente
    calcularKPIs() { }         // ⚠️ Responsabilidad diferente
}
```

**✅ Refactoring: Extract Class**

```typescript
// ✅ BUENO - Una clase, una responsabilidad

// Clase 1: Gestión de equipos
export class EquipoService {
    crearEquipo() { }
    validarEquipo() { }
    actualizarEquipo() { }
}

// Clase 2: Notificaciones
export class NotificacionService {
    enviarNotificacion() { }
    enviarAlerta() { }
}

// Clase 3: Reportes
export class ReporteService {
    generarReporte() { }
    exportarPDF() { }
}

// Clase 4: Análisis de KPIs
export class KPIService {
    calcularKPIs() { }
    analizarTendencias() { }
}
```

**Beneficios**:
- ✅ Cada clase tiene una sola razón para cambiar
- ✅ Más fácil de mantener y testear
- ✅ Reutilización de componentes

### 3.2 Open/Closed Principle (OCP)

**❌ Violación detectada**:
Código que necesita modificación para extender:

```typescript
// ❌ MALO - Necesitas modificar esta clase para agregar tipos
export class EquipoFactory {
    crear(tipo: string) {
        if (tipo === 'VOLQUETE') {
            return new Volquete();
        } else if (tipo === 'EXCAVADORA') {
            return new Excavadora();
        } else if (tipo === 'PERFORADORA') {  // ⚠️ Modificando código existente
            return new Perforadora();
        }
        throw new Error('Tipo no soportado');
    }
}
```

**✅ Refactoring: Replace Conditional with Polymorphism**

```typescript
// ✅ BUENO - Abierto a extensión, cerrado a modificación

interface IEquipoFactory {
    crear(): Equipo;
}

class VolqueteFactory implements IEquipoFactory {
    crear(): Equipo {
        return new Volquete();
    }
}

class ExcavadoraFactory implements IEquipoFactory {
    crear(): Equipo {
        return new Excavadora();
    }
}

// Agregar nuevo tipo SIN modificar código existente
class PerforadoraFactory implements IEquipoFactory {
    crear(): Equipo {
        return new Perforadora();
    }
}

// Registry pattern
export class EquipoFactoryRegistry {
    private static factories = new Map<string, IEquipoFactory>([
        ['VOLQUETE', new VolqueteFactory()],
        ['EXCAVADORA', new ExcavadoraFactory()],
        ['PERFORADORA', new PerforadoraFactory()],
    ]);

    static crear(tipo: string): Equipo {
        const factory = this.factories.get(tipo);
        if (!factory) {
            throw new Error(`Tipo ${tipo} no soportado`);
        }
        return factory.crear();
    }

    // Extensión sin modificación
    static registrar(tipo: string, factory: IEquipoFactory): void {
        this.factories.set(tipo, factory);
    }
}
```

### 3.3 Dependency Inversion Principle (DIP)

**❌ Violación detectada**:
Dependencia directa de implementación concreta:

```typescript
// ❌ MALO - Depende de implementación concreta
export class CrearEquipo {
    private repositorio = new MemoriaEquipoRepositorio();  // ⚠️ Acoplamiento alto

    async ejecutar(codigo: string, tipo: string) {
        const equipo = new Equipo(codigo, tipo);
        await this.repositorio.crear(equipo);
    }
}
```

**✅ Refactoring: Extract Interface + Constructor Injection**

```typescript
// ✅ BUENO - Depende de abstracción

// 1. Interfaz en capa de Dominio
export interface IEquipoRepositorio {
    crear(equipo: Equipo): Promise<void>;
    obtenerPorId(id: string): Promise<Equipo | null>;
}

// 2. Caso de uso depende de interfaz
export class CrearEquipo {
    constructor(
        private readonly repositorio: IEquipoRepositorio  // ✅ Inyección de dependencia
    ) {}

    async ejecutar(codigo: string, tipo: string): Promise<string> {
        const equipo = new Equipo(codigo, tipo);
        await this.repositorio.crear(equipo);
        return equipo.id;
    }
}

// 3. Inyección en punto de entrada
const repositorio = new MemoriaEquipoRepositorio();  // O PrismaEquipoRepositorio
const casoDeUso = new CrearEquipo(repositorio);
```

**Beneficios**:
- ✅ Fácil cambiar implementación (memoria → BD)
- ✅ Testeable con mocks
- ✅ Desacoplamiento de capas

---

## 📦 PARTE 4: ESTRATEGIAS DE REFACTORING

### 4.1 Extract Method (Extraer Método)

**Cuándo aplicar**: Método largo (>20 líneas) con múltiples responsabilidades

**Ejemplo**:
```typescript
// ❌ ANTES - Método de 50 líneas
async ejecutar(codigo, tipo, combustible, horas) {
    // Validación (10 líneas)
    if (!codigo) throw new Error('...');
    if (!tipo) throw new Error('...');
    // ...

    // Verificación de negocio (10 líneas)
    const existe = await this.repo.existeConCodigo(codigo);
    if (existe) throw new Error('...');
    // ...

    // Creación (10 líneas)
    const id = this.generarId();
    const equipo = new Equipo(id, codigo, tipo);
    // ...

    // Persistencia (10 líneas)
    await this.repo.crear(equipo);
    console.log('...');
    // ...
}

// ✅ DESPUÉS - Métodos pequeños y enfocados
async ejecutar(codigo, tipo, combustible, horas) {
    this.validarDatosDeEntrada(codigo, tipo);
    await this.verificarReglasDeNegocio(codigo);
    const equipo = this.crearEquipo(codigo, tipo, combustible, horas);
    await this.persistirEquipo(equipo);
    return equipo.id;
}

private validarDatosDeEntrada(codigo, tipo) { ... }
private async verificarReglasDeNegocio(codigo) { ... }
private crearEquipo(codigo, tipo, combustible, horas) { ... }
private async persistirEquipo(equipo) { ... }
```

**Beneficios**:
- ✅ Legibilidad mejorada
- ✅ Reutilización de métodos
- ✅ Más fácil de testear

### 4.2 Simplify Conditional Expressions

**Cuándo aplicar**: Condicionales complejos difíciles de entender

**Ejemplo**:
```typescript
// ❌ ANTES - Condicional complejo
if (equipo.estado === 'DISPONIBLE' && equipo.combustible > 20 &&
    equipo.horasOperacion < 8000 && !equipo.enMantenimiento) {
    return true;
}

// ✅ DESPUÉS - Extract Method con nombre descriptivo
private puedeOperar(equipo: Equipo): boolean {
    return equipo.estado === 'DISPONIBLE' &&
           this.tieneCombustibleSuficiente(equipo) &&
           this.noNecesitaMantenimiento(equipo);
}

private tieneCombustibleSuficiente(equipo: Equipo): boolean {
    return equipo.combustible > 20;
}

private noNecesitaMantenimiento(equipo: Equipo): boolean {
    return equipo.horasOperacion < 8000 && !equipo.enMantenimiento;
}
```

### 4.3 Replace Magic Numbers with Constants

**Ejemplo**:
```typescript
// ❌ ANTES - Números mágicos
if (equipo.combustible < 20) { }  // ¿Qué significa 20?
if (equipo.horasOperacion > 8000) { }  // ¿Por qué 8000?

// ✅ DESPUÉS - Constantes con nombre
const COMBUSTIBLE_MINIMO = 20;  // Litros
const HORAS_MAXIMAS_SIN_MANTENIMIENTO = 8000;

if (equipo.combustible < COMBUSTIBLE_MINIMO) { }
if (equipo.horasOperacion > HORAS_MAXIMAS_SIN_MANTENIMIENTO) { }
```

---

## 🔄 PARTE 5: WORKFLOW COMPLETO (Paso a Paso)

### FASE 1: Configuración (30 minutos)

```bash
# 1. Verificar rama development
git checkout development
git pull origin development

# 2. Crear rama de trabajo personal
git checkout -b refactoring/security-hotspot-fix

# 3. Instalar dependencias si es necesario
npm install

# 4. Ejecutar pruebas para establecer baseline
npm test

# 5. Ver cobertura inicial
npm run test:coverage
```

### FASE 2: Implementación (2-3 horas por tarea)

**Ejemplo: Corregir Security Hotspot**

```bash
# Paso 1: RED - Escribir prueba que falla
# Editar: aplicacion/casos-uso/equipos/__tests__/CrearEquipo.integration.test.ts
# Agregar prueba de formato UUID

npm test -- CrearEquipo.integration.test.ts
# ❌ FALLA - Test rojo

# Paso 2: GREEN - Implementar solución mínima
# Editar: aplicacion/casos-uso/equipos/CrearEquipo.ts
# Cambiar Math.random() por crypto.randomUUID()

npm test -- CrearEquipo.integration.test.ts
# ✅ PASA - Test verde

# Paso 3: REFACTOR - Mejorar código
# Agregar comentarios, mejorar nombres, etc.

npm test
# ✅ Todos los tests pasan

# Paso 4: Verificar con SonarQube
npx sonar-scanner

# Paso 5: Commit con mensaje descriptivo
git add .
git commit -m "fix: replace Math.random with crypto.randomUUID for secure ID generation

- Replaced insecure Math.random() with crypto.randomUUID()
- Added unit tests to verify UUID format
- Security hotspot resolved

Fix #1"
```

### FASE 3: Validación (15 minutos)

```bash
# Ejecutar todas las pruebas
npm test

# Ver reporte de cobertura
npm run test:coverage

# Compilar proyecto
npm run build

# Ejecutar análisis SonarQube
npx sonar-scanner
```

### FASE 4: Integración (20 minutos)

```bash
# Push a rama personal
git push origin refactoring/security-hotspot-fix

# Crear Pull Request en GitHub
# Title: [Lab07] Fix Security Hotspot - Replace Math.random
# Description: [Usar template del proyecto]
# Reviewers: [Asignar compañeros]
# Labels: refactoring, security, lab07

# Esperar aprobación

# Merge a development
# Actualizar GitHub Project (mover tarea a DONE)
# Cerrar GitHub Issue
```

---

## 📊 PARTE 6: MÉTRICAS DE ÉXITO

### Antes vs Después

| Métrica | Antes | Objetivo | Después |
|---------|-------|----------|---------|
| Code Smells | 135 | < 50 | ??? |
| Security Hotspots | 1 | 0 | ??? |
| Coverage | 43.5% | 80% | ??? |
| Technical Debt | 3h 49min | < 2h | ??? |

### Checklist de Validación

- [ ] Todos los tests pasan (100%)
- [ ] Cobertura ≥ 80%
- [ ] 0 Security Hotspots
- [ ] Code Smells < 50
- [ ] Build exitoso (`npm run build`)
- [ ] SonarQube Quality Gate: PASSED
- [ ] Commits descriptivos con `Fix #issue-number`
- [ ] Pull Requests revisados y aprobados
- [ ] GitHub Project actualizado
- [ ] Issues cerrados

---

## 📚 RECURSOS ADICIONALES

### Enlaces útiles

- **Refactoring Catalog**: https://refactoring.guru/refactoring
- **Clean Code Cheatsheet**: https://gist.github.com/wojteklu/73c6914cc446146b8b533c0988cf8d29
- **SOLID Principles**: https://www.freecodecamp.org/espanol/news/los-principios-solid-explicados-en-espanol/
- **Jest Documentation**: https://jestjs.io/docs/getting-started
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/handbook/

### Libros recomendados

1. **Clean Code** - Robert C. Martin
2. **Refactoring** - Martin Fowler
3. **Clean Architecture** - Robert C. Martin
4. **Test Driven Development** - Kent Beck

---

## ✅ CONCLUSIÓN

Este laboratorio te enseña a:

1. **Identificar problemas** de calidad con SonarQube
2. **Priorizar** issues por severidad e impacto
3. **Aplicar TDD** (Red-Green-Refactor)
4. **Refactorizar** con patrones probados
5. **Seguir SOLID** principles
6. **Trabajar en equipo** con GitHub Projects/Issues
7. **Medir progreso** con métricas objetivas

**El código limpio no es un lujo, es una necesidad profesional.**

---

*Generado para el Laboratorio 07 - Ingeniería de Software II - UNSA*
*Fecha: 2025*
