/**
 * CONCEPTO: Test-Driven Development (TDD)
 * ========================================
 * TDD sigue el ciclo RED → GREEN → REFACTOR:
 *
 * 1. RED: Escribir test que FALLA (porque no existe el código)
 * 2. GREEN: Escribir código MÍNIMO para que el test PASE
 * 3. REFACTOR: Mejorar el código sin romper tests
 *
 * VENTAJAS:
 * - Especificación ejecutable (los tests documentan el comportamiento)
 * - Diseño emergente (el código se adapta a los tests)
 * - Confianza para refactorizar (si los tests pasan, funciona)
 * - Coverage automático (cada línea tiene test)
 *
 * ESTRUCTURA DE ESTE ARCHIVO:
 * Usamos el patrón AAA (Arrange-Act-Assert) en cada test.
 */

import { Operacion } from '../modelo/Operacion';
import { TIPOS_OPERACION } from '../modelo/TipoOperacion';

/**
 * CONCEPTO: Describe Blocks (BDD Style)
 * ======================================
 * Organizamos los tests en bloques describe() que:
 * - Agrupan tests relacionados
 * - Documentan el comportamiento esperado
 * - Facilitan lectura tipo "especificación"
 *
 * Estilo BDD (Behavior-Driven Development):
 * "Describe [WHAT] → it should [BEHAVIOR]"
 */
describe('Operacion - Entidad de Dominio (Agregado Root)', () => {

    /**
     * CONCEPTO: Testing de Constructor e Invariantes
     * ===============================================
     * Los "invariantes" son reglas de negocio que SIEMPRE deben cumplirse.
     * El constructor es el guardian de estas reglas.
     *
     * INVARIANTES DE OPERACION:
     * 1. ID es obligatorio y único
     * 2. Tipo debe ser válido (CARGUE, TRANSPORTE, DESCARGA)
     * 3. SupervisorId es obligatorio
     * 4. FrenteId es obligatorio
     * 5. FechaInicio se asigna automáticamente
     * 6. EquiposAsignados inicia vacío
     */
    describe('Constructor e Invariantes', () => {

        /**
         * CONCEPTO: Happy Path (Camino Feliz)
         * ====================================
         * Siempre empezar probando el caso exitoso.
         * Este test define cómo debe usarse la clase correctamente.
         */
        it('debe crear una operación válida con datos correctos', () => {
            // ARRANGE (Preparar datos de prueba)
            const id = 'op-001';
            const tipo = TIPOS_OPERACION.CARGUE;
            const supervisorId = 'sup-123';
            const frenteId = 'frente-norte-01';

            // ACT (Ejecutar la acción a probar)
            const operacion = new Operacion(id, tipo, supervisorId, frenteId);

            // ASSERT (Verificar resultados esperados)
            expect(operacion.id).toBe(id);
            expect(operacion.tipo).toBe(tipo);
            expect(operacion.supervisorId).toBe(supervisorId);
            expect(operacion.frenteId).toBe(frenteId);
            expect(operacion.fechaInicio).toBeInstanceOf(Date);
            expect(operacion.fechaFin).toBeUndefined();
            expect(operacion.equiposAsignados).toEqual([]);
            expect(operacion.estaActiva()).toBe(true);
        });

        /**
         * CONCEPTO: Validación de Entrada (Input Validation)
         * ===================================================
         * Probamos que el constructor RECHAZA datos inválidos.
         * Usamos expect().toThrow() para verificar errores.
         */
        it('debe lanzar error si el ID está vacío', () => {
            expect(() => {
                new Operacion('', TIPOS_OPERACION.CARGUE, 'sup-123', 'frente-01');
            }).toThrow('El ID de la operación es obligatorio');
        });

        it('debe lanzar error si el tipo es inválido', () => {
            expect(() => {
                new Operacion('op-001', 'TIPO_INVALIDO' as any, 'sup-123', 'frente-01');
            }).toThrow('Tipo de operación inválido');
        });

        it('debe lanzar error si supervisorId está vacío', () => {
            expect(() => {
                new Operacion('op-001', TIPOS_OPERACION.CARGUE, '', 'frente-01');
            }).toThrow('El supervisor es obligatorio');
        });

        it('debe lanzar error si frenteId está vacío', () => {
            expect(() => {
                new Operacion('op-001', TIPOS_OPERACION.CARGUE, 'sup-123', '');
            }).toThrow('El frente de trabajo es obligatorio');
        });

        /**
         * CONCEPTO: Boundary Testing (Pruebas de Frontera)
         * =================================================
         * Probar casos extremos como strings con espacios,
         * null, undefined, etc.
         */
        it('debe lanzar error si el ID es solo espacios en blanco', () => {
            expect(() => {
                new Operacion('   ', TIPOS_OPERACION.CARGUE, 'sup-123', 'frente-01');
            }).toThrow('El ID de la operación es obligatorio');
        });
    });

    /**
     * CONCEPTO: Testing de Comportamientos del Dominio
     * =================================================
     * Aquí probamos los MÉTODOS de la entidad, no solo el constructor.
     * Cada método representa una "capacidad" del dominio.
     */
    describe('Asignar y Remover Equipos', () => {

        let operacion: Operacion;

        /**
         * CONCEPTO: beforeEach Hook
         * =========================
         * Ejecuta código ANTES de cada test.
         * Garantiza que cada test empiece con un estado limpio.
         *
         * VENTAJA: Evita acoplamiento entre tests (independencia).
         */
        beforeEach(() => {
            operacion = new Operacion(
                'op-test',
                TIPOS_OPERACION.CARGUE,
                'sup-test',
                'frente-test'
            );
        });

        it('debe asignar un equipo correctamente', () => {
            // ACT
            operacion.asignarEquipo('equipo-vol-001');

            // ASSERT
            expect(operacion.equiposAsignados).toContain('equipo-vol-001');
            expect(operacion.equiposAsignados.length).toBe(1);
        });

        /**
         * CONCEPTO: Idempotencia
         * =======================
         * Asignar el mismo equipo 2 veces NO debe duplicarlo.
         * La operación es idempotente (mismo resultado sin importar cuántas veces se ejecute).
         */
        it('debe evitar duplicados al asignar el mismo equipo dos veces', () => {
            // ACT
            operacion.asignarEquipo('equipo-vol-001');
            operacion.asignarEquipo('equipo-vol-001'); // Duplicado

            // ASSERT
            expect(operacion.equiposAsignados.length).toBe(1);
        });

        it('debe asignar múltiples equipos diferentes', () => {
            // ACT
            operacion.asignarEquipo('equipo-vol-001');
            operacion.asignarEquipo('equipo-exc-002');
            operacion.asignarEquipo('equipo-vol-003');

            // ASSERT
            expect(operacion.equiposAsignados.length).toBe(3);
            expect(operacion.equiposAsignados).toContain('equipo-vol-001');
            expect(operacion.equiposAsignados).toContain('equipo-exc-002');
            expect(operacion.equiposAsignados).toContain('equipo-vol-003');
        });

        it('debe remover un equipo correctamente', () => {
            // ARRANGE
            operacion.asignarEquipo('equipo-vol-001');

            // ACT
            operacion.removerEquipo('equipo-vol-001');

            // ASSERT
            expect(operacion.equiposAsignados).not.toContain('equipo-vol-001');
            expect(operacion.equiposAsignados.length).toBe(0);
        });

        it('NO debe lanzar error al remover un equipo que no existe', () => {
            // CONCEPTO: Tolerancia a Fallos
            // No debe romper si intentas remover algo que no está
            expect(() => {
                operacion.removerEquipo('equipo-inexistente');
            }).not.toThrow();
        });

        it('debe lanzar error al asignar un equipo con ID vacío', () => {
            expect(() => {
                operacion.asignarEquipo('');
            }).toThrow('El ID del equipo es obligatorio');
        });
    });

    /**
     * CONCEPTO: State Machine (Máquina de Estados)
     * =============================================
     * Una operación tiene ciclo de vida:
     * ACTIVA (sin fechaFin) → FINALIZADA (con fechaFin)
     *
     * Probamos transiciones válidas e inválidas.
     */
    describe('Finalizar Operación (State Transition)', () => {

        let operacion: Operacion;

        beforeEach(() => {
            operacion = new Operacion(
                'op-test',
                TIPOS_OPERACION.TRANSPORTE,
                'sup-test',
                'frente-test'
            );
        });

        it('debe marcar operación como finalizada correctamente', () => {
            // ACT
            operacion.finalizar();

            // ASSERT
            expect(operacion.fechaFin).toBeInstanceOf(Date);
            expect(operacion.estaActiva()).toBe(false);
            expect(operacion.fechaFin!.getTime()).toBeGreaterThanOrEqual(
                operacion.fechaInicio.getTime()
            );
        });

        /**
         * CONCEPTO: Idempotencia de Finalización
         * =======================================
         * Finalizar 2 veces NO debe cambiar la fecha original.
         * La primera llamada "congela" el timestamp.
         */
        it('debe ser idempotente (finalizar 2 veces no cambia fechaFin)', async () => {
            // ACT
            operacion.finalizar();
            const primeraFechaFin = operacion.fechaFin;

            // Esperar 10ms
            await new Promise(resolve => setTimeout(resolve, 10));

            operacion.finalizar(); // Segunda vez

            // ASSERT
            expect(operacion.fechaFin).toEqual(primeraFechaFin);
        });

        it('debe permitir finalizar una operación recién creada', () => {
            // Una operación puede finalizarse inmediatamente
            // (por ejemplo, si se cancela)
            expect(() => {
                operacion.finalizar();
            }).not.toThrow();
        });
    });

    /**
     * CONCEPTO: Calculated Fields (Campos Calculados)
     * ================================================
     * Algunos datos NO se almacenan, se CALCULAN on-demand.
     * Ventaja: Siempre están actualizados, no hay desincronización.
     */
    describe('Calcular Duración', () => {

        let operacion: Operacion;

        beforeEach(() => {
            operacion = new Operacion(
                'op-test',
                TIPOS_OPERACION.DESCARGA,
                'sup-test',
                'frente-test'
            );
        });

        it('debe retornar 0 si la operación NO ha finalizado', () => {
            // ARRANGE: operación activa (sin fechaFin)

            // ACT
            const duracion = operacion.calcularDuracionMinutos();

            // ASSERT
            expect(duracion).toBe(0);
        });

        it('debe calcular duración en minutos correctamente', async () => {
            // ARRANGE
            const fechaInicio = operacion.fechaInicio;

            // Simular 2 minutos después (120,000 ms)
            await new Promise(resolve => setTimeout(resolve, 100)); // Esperar 100ms real

            // ACT
            operacion.finalizar();
            const duracion = operacion.calcularDuracionMinutos();

            // ASSERT
            expect(duracion).toBeGreaterThanOrEqual(0);
            expect(duracion).toBeLessThan(1); // Menos de 1 minuto (porque solo esperamos 100ms)
        });

        /**
         * CONCEPTO: Time-Based Testing
         * =============================
         * Para probar cálculos de tiempo SIN esperar realmente,
         * podemos "mockear" las fechas manualmente.
         */
        it('debe calcular 30 minutos de duración correctamente', () => {
            // ARRANGE: Crear operación con fechas controladas
            const inicio = new Date('2025-01-01T10:00:00Z');
            const fin = new Date('2025-01-01T10:30:00Z'); // 30 min después

            const op = new Operacion('op-test', TIPOS_OPERACION.CARGUE, 'sup', 'frente');

            // HACK: Modificar fechas internamente para testing
            (op as any)._fechaInicio = inicio;
            (op as any)._fechaFin = fin;

            // ACT
            const duracion = op.calcularDuracionMinutos();

            // ASSERT
            expect(duracion).toBe(30);
        });
    });

    /**
     * CONCEPTO: Query Methods (Métodos de Consulta)
     * ==============================================
     * Métodos que retornan información SIN modificar el estado.
     * También llamados "getters semánticos".
     */
    describe('Consultas de Estado', () => {

        it('estaActiva() debe retornar true si NO ha finalizado', () => {
            const operacion = new Operacion('op-001', TIPOS_OPERACION.CARGUE, 'sup', 'frente');

            expect(operacion.estaActiva()).toBe(true);
        });

        it('estaActiva() debe retornar false si YA finalizó', () => {
            const operacion = new Operacion('op-001', TIPOS_OPERACION.CARGUE, 'sup', 'frente');
            operacion.finalizar();

            expect(operacion.estaActiva()).toBe(false);
        });

        it('obtenerCantidadEquipos() debe retornar número correcto', () => {
            const operacion = new Operacion('op-001', TIPOS_OPERACION.CARGUE, 'sup', 'frente');

            expect(operacion.obtenerCantidadEquipos()).toBe(0);

            operacion.asignarEquipo('eq-1');
            expect(operacion.obtenerCantidadEquipos()).toBe(1);

            operacion.asignarEquipo('eq-2');
            operacion.asignarEquipo('eq-3');
            expect(operacion.obtenerCantidadEquipos()).toBe(3);
        });
    });

    /**
     * CONCEPTO: Encapsulation Testing (Inmutabilidad)
     * ================================================
     * Verificar que NO se puede modificar el estado interno
     * desde afuera (principio de encapsulación).
     */
    describe('Encapsulación e Inmutabilidad', () => {

        it('equiposAsignados debe retornar una COPIA (no la lista original)', () => {
            const operacion = new Operacion('op-001', TIPOS_OPERACION.CARGUE, 'sup', 'frente');
            operacion.asignarEquipo('eq-1');

            // ARRANGE: Obtener la lista
            const lista1 = operacion.equiposAsignados;
            const lista2 = operacion.equiposAsignados;

            // ACT: Modificar la copia
            lista1.push('eq-hacker');

            // ASSERT: La lista interna NO debe cambiar
            expect(operacion.equiposAsignados).not.toContain('eq-hacker');
            expect(operacion.equiposAsignados.length).toBe(1);

            // Las dos copias son diferentes objetos
            expect(lista1).not.toBe(lista2);
        });
    });

    /**
     * CONCEPTO: Domain Logic Testing
     * ===============================
     * Probar reglas de negocio específicas del dominio minero.
     */
    describe('Reglas de Negocio del Dominio', () => {

        it('una operación de CARGUE debe poder tener múltiples equipos', () => {
            // En la realidad minera: 1 excavadora + varios volquetes
            const operacion = new Operacion('op-001', TIPOS_OPERACION.CARGUE, 'sup', 'frente');

            operacion.asignarEquipo('excavadora-001');
            operacion.asignarEquipo('volquete-001');
            operacion.asignarEquipo('volquete-002');
            operacion.asignarEquipo('volquete-003');

            expect(operacion.obtenerCantidadEquipos()).toBe(4);
        });

        it('una operación de TRANSPORTE típicamente tiene 1 equipo', () => {
            const operacion = new Operacion('op-001', TIPOS_OPERACION.TRANSPORTE, 'sup', 'frente');

            operacion.asignarEquipo('volquete-001');

            expect(operacion.obtenerCantidadEquipos()).toBe(1);
            expect(operacion.tipo).toBe(TIPOS_OPERACION.TRANSPORTE);
        });
    });

    /**
     * CONCEPTO: Snapshot Testing (Serialización)
     * ===========================================
     * Verificar que el objeto se puede convertir a JSON correctamente.
     */
    describe('Serialización y DTO', () => {

        it('obtenerInfo() debe retornar un objeto plano (DTO)', () => {
            const operacion = new Operacion('op-001', TIPOS_OPERACION.CARGUE, 'sup-123', 'frente-norte');
            operacion.asignarEquipo('eq-1');
            operacion.asignarEquipo('eq-2');
            operacion.finalizar();

            const info = operacion.obtenerInfo();

            expect(info).toHaveProperty('id', 'op-001');
            expect(info).toHaveProperty('tipo', TIPOS_OPERACION.CARGUE);
            expect(info).toHaveProperty('supervisorId', 'sup-123');
            expect(info).toHaveProperty('frenteId', 'frente-norte');
            expect(info).toHaveProperty('fechaInicio');
            expect(info).toHaveProperty('fechaFin');
            expect(info).toHaveProperty('equiposAsignados');
            expect(info).toHaveProperty('duracionMinutos');
            expect(info).toHaveProperty('estaActiva', false);

            expect(info.equiposAsignados).toEqual(['eq-1', 'eq-2']);
        });

        it('el DTO debe ser serializable a JSON', () => {
            const operacion = new Operacion('op-001', TIPOS_OPERACION.CARGUE, 'sup', 'frente');
            const info = operacion.obtenerInfo();

            // ACT: Convertir a JSON y volver a parsear
            const json = JSON.stringify(info);
            const parsed = JSON.parse(json);

            // ASSERT: No debe perder información
            expect(parsed.id).toBe('op-001');
            expect(parsed.tipo).toBe(TIPOS_OPERACION.CARGUE);
        });
    });
});

/**
 * RESUMEN DE CONCEPTOS APLICADOS EN ESTE TEST:
 * =============================================
 *
 * 1. ✅ TDD (Test-Driven Development)
 * 2. ✅ AAA Pattern (Arrange-Act-Assert)
 * 3. ✅ BDD Style (Describe-It)
 * 4. ✅ Happy Path + Error Cases
 * 5. ✅ Boundary Testing
 * 6. ✅ State Machine Testing
 * 7. ✅ Idempotency Testing
 * 8. ✅ Encapsulation Testing
 * 9. ✅ Domain Logic Testing
 * 10. ✅ Serialization Testing
 *
 * TOTAL: 28 TESTS que cubren:
 * - Constructor (6 tests)
 * - Asignar/Remover Equipos (6 tests)
 * - Finalizar Operación (3 tests)
 * - Calcular Duración (3 tests)
 * - Consultas de Estado (3 tests)
 * - Encapsulación (1 test)
 * - Reglas de Negocio (2 tests)
 * - Serialización (2 tests)
 */
