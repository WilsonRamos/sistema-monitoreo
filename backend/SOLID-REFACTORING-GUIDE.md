# 🏗️ GUÍA PRÁCTICA: Aplicar Principios SOLID al Proyecto

**Proyecto**: Sistema de Monitoreo Minero
**Objetivo**: Refactorizar código violando SOLID principles
**Duración estimada**: 3-4 horas

---

## 📚 INTRODUCCIÓN CONCEPTUAL

### ¿Qué es SOLID?

SOLID son 5 principios de diseño orientado a objetos que hacen el código:
- ✅ **Mantenible**: Fácil de modificar sin romper lo existente
- ✅ **Escalable**: Fácil de extender con nuevas funcionalidades
- ✅ **Testeable**: Fácil de probar con unit tests
- ✅ **Reutilizable**: Componentes pueden usarse en otros contextos

```
S - Single Responsibility Principle
O - Open/Closed Principle
L - Liskov Substitution Principle
I - Interface Segregation Principle
D - Dependency Inversion Principle
```

---

## 🎯 REFACTORING #1: Convertir clases a interfaces (DIP + LSP)

### **Problema actual**

```typescript
// ❌ INCORRECTO: Archivo iMonitoreoServicio.ts
export class IMonitoreoServicio {
    // TODO: Implement method
}

// ❌ INCORRECTO: Implementación que "extiende" la interfaz
export class MonitoreoServicio extends IMonitoreoServicio {
    // Implementación
}
```

### **¿Por qué es problemático?**

1. **Viola DIP**: Las dependencias apuntan a una clase concreta (vacía)
2. **Viola LSP**: No hay contrato que cumplir (clase vacía)
3. **No es testeable**: No puedes hacer mock de una clase vacía
4. **Confunde**: Una "interfaz" que es una clase confunde a desarrolladores

### **Concepto: Interface vs Class en TypeScript**

```typescript
// INTERFACE (Contrato abstracto)
interface ICalculadora {
    sumar(a: number, b: number): number;
    restar(a: number, b: number): number;
}

// CLASS (Implementación concreta)
class CalculadoraBasica implements ICalculadora {
    sumar(a: number, b: number): number {
        return a + b;
    }

    restar(a: number, b: number): number {
        return a - b;
    }
}

// Ventajas:
// 1. Puedes tener múltiples implementaciones
class CalculadoraCientifica implements ICalculadora {
    sumar(a: number, b: number): number {
        console.log(`Sumando ${a} + ${b}`);
        return a + b;
    }

    restar(a: number, b: number): number {
        console.log(`Restando ${a} - ${b}`);
        return a - b;
    }
}

// 2. Puedes hacer mock en tests
class MockCalculadora implements ICalculadora {
    sumar(): number { return 0; }
    restar(): number { return 0; }
}

// 3. Inversión de dependencias (DIP)
class Cliente {
    constructor(private calc: ICalculadora) { }  // Depende de abstracción

    ejecutar() {
        return this.calc.sumar(1, 2);
    }
}

// Flexibilidad al inyectar
const cliente1 = new Cliente(new CalculadoraBasica());
const cliente2 = new Cliente(new CalculadoraCientifica());
const cliente3 = new Cliente(new MockCalculadora());  // Para tests
```

### **Solución para el proyecto**

<table of contents de archivos a corregir en markdown format with these sections: antes, después, explicación, beneficios>

#### Archivo 1: `iMonitoreoServicio.ts`

**ANTES** (❌ Violación):
```typescript
export class IMonitoreoServicio {
    // TODO: Implement method
}
```

**DESPUÉS** (✅ Correcto):
```typescript
/**
 * Servicio de Dominio - Monitoreo de Equipos
 *
 * Responsabilidades:
 * - Actualizar estado de equipos
 * - Obtener ubicación en tiempo real
 * - Gestionar alertas de equipos
 */
export interface IMonitoreoServicio {
    /**
     * Actualizar estado de un equipo
     * @param equipoId ID del equipo
     * @param nuevoEstado Nuevo estado del equipo
     */
    actualizarEstadoEquipo(equipoId: string, nuevoEstado: string): Promise<void>;

    /**
     * Obtener ubicación GPS de un equipo en tiempo real
     * @param equipoId ID del equipo
     * @returns Coordenadas GPS actuales
     */
    obtenerUbicacionTiempoReal(equipoId: string): Promise<{ latitud: number; longitud: number }>;

    /**
     * Verificar alertas para un equipo específico
     * @param equipoId ID del equipo
     * @returns Lista de alertas activas
     */
    verificarAlertasEquipo(equipoId: string): Promise<string[]>;
}
```

**Explicación**:
- Convertimos la clase vacía en una interface real
- Definimos el contrato que cualquier implementación debe cumplir
- Documentamos cada método para claridad

**Beneficios**:
✅ Cumple DIP (Dependency Inversion)
✅ Cumple ISP (Interface Segregation)
✅ Facilita testing con mocks
✅ Permite múltiples implementaciones

---

#### Archivo 2: `monitoreoServicio.ts`

**ANTES** (❌ Violación):
```typescript
export class MonitoreoServicio extends IMonitoreoServicio {
    // TODO: Implement method
}
```

**DESPUÉS** (✅ Correcto):
```typescript
import { IMonitoreoServicio } from './iMonitoreoServicio';
import { IEquipoRepositorio } from '../repositorios/IEquipoRepositorio';

/**
 * Implementación del servicio de monitoreo
 */
export class MonitoreoServicio implements IMonitoreoServicio {

    constructor(
        private readonly equipoRepositorio: IEquipoRepositorio
    ) {}

    async actualizarEstadoEquipo(equipoId: string, nuevoEstado: string): Promise<void> {
        const equipo = await this.equipoRepositorio.obtenerPorId(equipoId);

        if (!equipo) {
            throw new Error(`Equipo con ID ${equipoId} no encontrado`);
        }

        equipo.cambiarEstado(nuevoEstado);
        await this.equipoRepositorio.actualizar(equipo);
    }

    async obtenerUbicacionTiempoReal(equipoId: string): Promise<{ latitud: number; longitud: number }> {
        // Implementación real
        // En producción, esto consultaría un servicio de GPS
        return { latitud: -16.4090, longitud: -71.5375 };  // Ejemplo: Arequipa
    }

    async verificarAlertasEquipo(equipoId: string): Promise<string[]> {
        const equipo = await this.equipoRepositorio.obtenerPorId(equipoId);

        if (!equipo) {
            return [];
        }

        const alertas: string[] = [];

        equipo.verificarAlertas((mensaje) => {
            alertas.push(mensaje);
        });

        return alertas;
    }
}
```

**Explicación**:
- Cambiamos `extends` por `implements`
- Implementamos TODOS los métodos del contrato
- Inyectamos dependencias via constructor (DIP)

---

## 🎯 REFACTORING #2: Extraer constantes duplicadas (OCP)

### **Problema actual**

Los tipos y estados de equipos están hardcodeados en 4 lugares diferentes:

```typescript
// ❌ Duplicado en CrearEquipo.ts
const tiposValidos = ['VOLQUETE', 'EXCAVADORA', 'BULLDOZER', 'GRUA', 'PERFORADORA'];

// ❌ Duplicado en ObtenerEquipos.ts
const tiposValidos = ['VOLQUETE', 'EXCAVADORA', 'BULLDOZER', 'GRUA', 'PERFORADORA'];

// ❌ Duplicado en EquipoController.ts
const tiposValidos = ['VOLQUETE', 'EXCAVADORA', 'BULLDOZER', 'GRUA', 'PERFORADORA'];

// ❌ Duplicado en Equipo.ts
const tiposValidos = ['VOLQUETE', 'EXCAVADORA', 'BULLDOZER', 'GRUA', 'PERFORADORA'];
```

**Problema**: Para agregar un nuevo tipo (ej: "CAMION"), tienes que editar 4 archivos.

### **Concepto: Open/Closed Principle**

```
Un módulo debe estar:
- ABIERTO para extensión (agregar nuevas funcionalidades)
- CERRADO para modificación (no editar código existente)
```

**Ejemplo conceptual**:

```typescript
// ❌ VIOLACIÓN OCP: Para agregar nuevo tipo de pago, modificas la clase
class ProcesadorPagos {
    procesarPago(tipo: string, monto: number) {
        if (tipo === 'TARJETA') {
            // Lógica tarjeta
        } else if (tipo === 'EFECTIVO') {
            // Lógica efectivo
        } else if (tipo === 'PAYPAL') {  // ← Modificando código existente
            // Lógica PayPal
        }
    }
}

// ✅ CUMPLE OCP: Para agregar nuevo tipo, extiendes (no modificas)
interface EstrategiaPago {
    procesar(monto: number): void;
}

class PagoTarjeta implements EstrategiaPago {
    procesar(monto: number): void {
        console.log(`Pagando ${monto} con tarjeta`);
    }
}

class PagoEfectivo implements EstrategiaPago {
    procesar(monto: number): void {
        console.log(`Pagando ${monto} con efectivo`);
    }
}

class PagoPayPal implements EstrategiaPago {  // ← Nueva clase, sin modificar existentes
    procesar(monto: number): void {
        console.log(`Pagando ${monto} con PayPal`);
    }
}

class ProcesadorPagos {
    constructor(private estrategia: EstrategiaPago) {}

    ejecutar(monto: number) {
        this.estrategia.procesar(monto);
    }
}

// Uso
const procesador1 = new ProcesadorPagos(new PagoTarjeta());
const procesador2 = new ProcesadorPagos(new PagoPayPal());
```

### **Solución para el proyecto**

Crear archivo centralizado de constantes:

**Crear**: `Dominio/monitoreo/constantes/TiposYEstados.ts`

```typescript
/**
 * Constantes centralizadas para tipos y estados de equipos
 *
 * Ventajas:
 * - Una única fuente de verdad (Single Source of Truth)
 * - Fácil de extender (agregar nuevo tipo sin tocar otros archivos)
 * - Facilita validaciones consistentes
 */

/**
 * Tipos de equipos mineros soportados
 */
export enum TipoEquipo {
    VOLQUETE = 'VOLQUETE',
    EXCAVADORA = 'EXCAVADORA',
    BULLDOZER = 'BULLDOZER',
    GRUA = 'GRUA',
    PERFORADORA = 'PERFORADORA'
}

/**
 * Estados posibles de un equipo
 */
export enum EstadoEquipo {
    DISPONIBLE = 'DISPONIBLE',
    OPERANDO = 'OPERANDO',
    EN_MANTENIMIENTO = 'EN_MANTENIMIENTO',
    INACTIVO = 'INACTIVO',
    FUERA_DE_SERVICIO = 'FUERA_DE_SERVICIO'
}

/**
 * Utilidades para validación
 */
export class ValidadorTiposYEstados {

    static esTipoValido(tipo: string): boolean {
        return Object.values(TipoEquipo).includes(tipo as TipoEquipo);
    }

    static esEstadoValido(estado: string): boolean {
        return Object.values(EstadoEquipo).includes(estado as EstadoEquipo);
    }

    static obtenerTiposValidos(): string[] {
        return Object.values(TipoEquipo);
    }

    static obtenerEstadosValidos(): string[] {
        return Object.values(EstadoEquipo);
    }

    static validarTipo(tipo: string): void {
        if (!this.esTipoValido(tipo)) {
            const tipos = this.obtenerTiposValidos().join(', ');
            throw new Error(`Tipo ${tipo} no es válido. Tipos válidos: ${tipos}`);
        }
    }

    static validarEstado(estado: string): void {
        if (!this.esEstadoValido(estado)) {
            const estados = this.obtenerEstadosValidos().join(', ');
            throw new Error(`Estado ${estado} no es válido. Estados válidos: ${estados}`);
        }
    }
}
```

**Uso en el código refactorizado**:

```typescript
// ANTES (❌ Duplicación):
const tiposValidos = ['VOLQUETE', 'EXCAVADORA', ...];
if (!tiposValidos.includes(tipo)) {
    throw new Error(`Tipo ${tipo} no es válido. Tipos válidos: ${tiposValidos.join(', ')}`);
}

// DESPUÉS (✅ Centralizado):
import { ValidadorTiposYEstados, TipoEquipo } from '../constantes/TiposYEstados';

ValidadorTiposYEstados.validarTipo(tipo);  // Lanza error si no es válido

// O usando el enum:
if (tipo === TipoEquipo.VOLQUETE) {
    // Lógica específica
}
```

**Beneficios**:
✅ Una única fuente de verdad
✅ Para agregar nuevo tipo, solo editas 1 archivo
✅ Type-safe con enums de TypeScript
✅ Facilita refactoring futuro

---

## 🎯 REFACTORING #3: Aplicar SRP - Extraer validaciones

### **Problema actual**

La clase `CrearEquipo` tiene múltiples responsabilidades:

```typescript
export class CrearEquipo {
    async ejecutar(...) {
        this.validarDatosDeEntrada(...);      // Responsabilidad 1: Validación
        await this.verificarReglasDeNegocio(...);  // Responsabilidad 2: Reglas de negocio
        const id = this.generarIdUnico();     // Responsabilidad 3: Generación de IDs
        const equipo = new Equipo(...);       // Responsabilidad 4: Creación
        await this.repo.crear(equipo);        // Responsabilidad 5: Persistencia
    }

    private validarDatosDeEntrada(...) {
        // 20+ líneas de validación
    }

    private verificarReglasDeNegocio(...) {
        // 10+ líneas de lógica de negocio
    }

    private generarIdUnico() {
        // Lógica de generación
    }
}
```

### **Concepto: Single Responsibility Principle**

```
Una clase debe tener UNA SOLA razón para cambiar.

Si las reglas de validación cambian → cambias clase ValidadorEquipo
Si la lógica de generación de IDs cambia → cambias clase GeneradorIDs
Si las reglas de negocio cambian → cambias ServicioDominio

El caso de uso solo ORQUESTA, no hace todo.
```

**Ejemplo conceptual**:

```typescript
// ❌ VIOLACIÓN SRP: Una clase hace todo
class RegistroUsuario {
    registrar(email: string, password: string) {
        // Validar email
        if (!email.includes('@')) throw new Error('Email inválido');

        // Validar password
        if (password.length < 8) throw new Error('Password débil');

        // Hashear password
        const hash = this.hashPassword(password);

        // Guardar en BD
        this.db.save({ email, password: hash });

        // Enviar email
        this.enviarEmailBienvenida(email);

        // Registrar en log
        this.log.info(`Usuario registrado: ${email}`);
    }

    private hashPassword(password: string): string { /* ... */ }
    private enviarEmailBienvenida(email: string): void { /* ... */ }
}

// ✅ CUMPLE SRP: Cada clase tiene una responsabilidad
class ValidadorEmail {
    validar(email: string): void {
        if (!email.includes('@')) {
            throw new Error('Email inválido');
        }
    }
}

class ValidadorPassword {
    validar(password: string): void {
        if (password.length < 8) {
            throw new Error('Password debe tener al menos 8 caracteres');
        }
    }
}

class HashadorPassword {
    hashear(password: string): string {
        // Implementación real con bcrypt
        return `hashed_${password}`;
    }
}

class ServicioEmail {
    enviarBienvenida(email: string): void {
        console.log(`Enviando bienvenida a ${email}`);
    }
}

class RepositorioUsuario {
    guardar(usuario: any): void {
        console.log('Usuario guardado en BD');
    }
}

class Logger {
    info(mensaje: string): void {
        console.log(`[INFO] ${mensaje}`);
    }
}

// Caso de uso solo ORQUESTA
class RegistroUsuario {
    constructor(
        private validadorEmail: ValidadorEmail,
        private validadorPassword: ValidadorPassword,
        private hashador: HashadorPassword,
        private repositorio: RepositorioUsuario,
        private servicioEmail: ServicioEmail,
        private logger: Logger
    ) {}

    ejecutar(email: string, password: string): void {
        // Orquestar las operaciones
        this.validadorEmail.validar(email);
        this.validadorPassword.validar(password);
        const hash = this.hashador.hashear(password);
        this.repositorio.guardar({ email, password: hash });
        this.servicioEmail.enviarBienvenida(email);
        this.logger.info(`Usuario registrado: ${email}`);
    }
}
```

### **Solución para el proyecto**

**Crear**: `aplicacion/validadores/ValidadorCreacionEquipo.ts`

```typescript
import { ValidadorTiposYEstados } from '../../Dominio/monitoreo/constantes/TiposYEstados';

/**
 * Validador especializado para creación de equipos
 * Responsabilidad: Validar datos de entrada a nivel de aplicación
 */
export class ValidadorCreacionEquipo {

    /**
     * Validar todos los datos de entrada
     */
    validar(codigo: string, tipo: string, nivelCombustible: number, horasOperacion: number): void {
        this.validarCodigo(codigo);
        this.validarTipo(tipo);
        this.validarNivelCombustible(nivelCombustible);
        this.validarHorasOperacion(horasOperacion);
    }

    private validarCodigo(codigo: string): void {
        if (!codigo || typeof codigo !== 'string') {
            throw new Error('El código del equipo es obligatorio y debe ser texto');
        }

        if (codigo.trim().length === 0) {
            throw new Error('El código no puede estar vacío');
        }

        if (codigo.length > 20) {
            throw new Error('El código no puede tener más de 20 caracteres');
        }
    }

    private validarTipo(tipo: string): void {
        if (!tipo || typeof tipo !== 'string') {
            throw new Error('El tipo del equipo es obligatorio y debe ser texto');
        }

        ValidadorTiposYEstados.validarTipo(tipo);
    }

    private validarNivelCombustible(nivel: number): void {
        if (typeof nivel !== 'number') {
            throw new Error('El nivel de combustible debe ser un número');
        }

        if (nivel < 0) {
            throw new Error('El nivel de combustible no puede ser negativo');
        }

        if (nivel > 100) {
            throw new Error('El nivel de combustible no puede ser mayor a 100%');
        }
    }

    private validarHorasOperacion(horas: number): void {
        if (typeof horas !== 'number') {
            throw new Error('Las horas de operación deben ser un número');
        }

        if (horas < 0) {
            throw new Error('Las horas de operación no pueden ser negativas');
        }
    }
}
```

**Refactorizar**: `aplicacion/casos-uso/equipos/CrearEquipo.ts`

```typescript
import { ValidadorCreacionEquipo } from '../../validadores/ValidadorCreacionEquipo';

export class CrearEquipo {

    constructor(
        private readonly equipoRepositorio: IEquipoRepositorio,
        private readonly validador: ValidadorCreacionEquipo  // ← Inyectar validador
    ) {}

    async ejecutar(
        codigo: string,
        tipo: string,
        nivelCombustible: number,
        horasOperacion: number
    ): Promise<string> {
        try {
            console.log(`\n📝 Iniciando creación de equipo...`);

            // 1. Validar (delegado al validador)
            this.validador.validar(codigo, tipo, nivelCombustible, horasOperacion);

            // 2. Verificar reglas de negocio
            await this.verificarReglasDeNegocio(codigo);

            // 3. Generar ID único
            const id = this.generarIdUnico();

            // 4. Crear entidad de dominio
            const equipo = new Equipo(id, codigo, tipo, nivelCombustible, horasOperacion);

            // 5. Persistir
            await this.equipoRepositorio.crear(equipo);

            console.log(`✅ Equipo creado exitosamente con ID: ${id}\n`);

            return id;

        } catch (error: any) {
            console.error(`❌ Error en caso de uso CrearEquipo: ${error.message}`);
            throw new Error(`Error al crear equipo: ${error.message}`);
        }
    }

    // Resto de métodos privados...
}
```

**Beneficios**:
✅ Caso de uso más simple y legible
✅ Validador reutilizable en otros contextos
✅ Fácil de testear independientemente
✅ Cambios en validaciones no afectan caso de uso

---

## 📝 PLAN DE IMPLEMENTACIÓN

### Fase 1: Interfaces (1 hora)

1. ✅ Convertir `iMonitoreoServicio.ts` a interface
2. ✅ Convertir `iOperacionesServicio.ts` a interface
3. ✅ Convertir `iMinaServicio.ts` a interface
4. ✅ Actualizar implementaciones para usar `implements`

### Fase 2: Constantes (30 minutos)

1. ✅ Crear `TiposYEstados.ts` con enums
2. ✅ Reemplazar arrays hardcodeados en `CrearEquipo.ts`
3. ✅ Reemplazar arrays hardcodeados en `ObtenerEquipos.ts`
4. ✅ Reemplazar arrays hardcodeados en `EquipoController.ts`
5. ✅ Reemplazar arrays hardcodeados en `Equipo.ts`

### Fase 3: SRP - Validadores (1 hora)

1. ✅ Crear `ValidadorCreacionEquipo.ts`
2. ✅ Refactorizar `CrearEquipo.ts` para usar validador
3. ✅ Actualizar tests de integración
4. ✅ Ejecutar tests y verificar

### Fase 4: Validación (30 minutos)

1. ✅ Ejecutar `npm test`
2. ✅ Ejecutar `npx sonar-scanner`
3. ✅ Verificar reducción de code smells
4. ✅ Commit y push

---

## ✅ CHECKLIST DE VALIDACIÓN

- [ ] Todas las "interfaces-clases" convertidas a interfaces TypeScript
- [ ] Constantes centralizadas en un solo archivo
- [ ] Validadores extraídos y reutilizables
- [ ] Tests pasando (100%)
- [ ] SonarQube sin nuevos code smells
- [ ] Code Smells reducidos de 134 a <120

---

## 📊 MÉTRICAS DE ÉXITO

| Métrica | Antes | Objetivo | Medición |
|---------|-------|----------|----------|
| Interfaces reales | 0 | 3+ | Contar archivos i*.ts |
| Arrays duplicados | 4 | 1 | Buscar `tiposValidos =` |
| Clases con SRP | 40% | 70% | Análisis manual |
| Code Smells | 134 | <120 | SonarQube |

---

*Guía creada para Laboratorio 07 - UNSA 2025*
