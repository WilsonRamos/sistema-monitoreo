/**
 * IniciarOperacion - Pruebas de Integración
 *
 * CONCEPTO: Integration Test vs Unit Test
 * =========================================
 * - Unit Test: Prueba UNA clase aislada (usa mocks para dependencias)
 * - Integration Test: Prueba VARIAS clases trabajando juntas
 *
 * En este archivo:
 * - Testeamos IniciarOperacion (Use Case)
 * - Usa MemoriaOperacionRepositorio REAL (no mock)
 * - Verifica que la integración funcione correctamente
 */

import { IniciarOperacion } from '../IniciarOperacion';
import { MemoriaOperacionRepositorio } from '../../../infraestructura/persistencia/repositorios/MemoriaOperacionRepositorio';
import { TIPOS_OPERACION } from '../../../Dominio/operaciones/modelo/TipoOperacion';

describe('IniciarOperacion - Pruebas de Integración', () => {
    let useCase: IniciarOperacion;
    let repositorio: MemoriaOperacionRepositorio;

    /**
     * CONCEPTO: beforeEach
     * ====================
     * Se ejecuta ANTES de cada test.
     * Crea instancias frescas para evitar contaminación entre tests.
     */
    beforeEach(() => {
        repositorio = new MemoriaOperacionRepositorio();
        useCase = new IniciarOperacion(repositorio);
    });

    describe('Caso exitoso - Crear operación', () => {
        it('debe crear una operación de CARGUE correctamente', async () => {
            // ARRANGE: Preparar datos
            const tipo = TIPOS_OPERACION.CARGUE;
            const supervisorId = 'SUP-001';
            const frenteId = 'FRENTE-NORTE-01';

            // ACT: Ejecutar caso de uso
            const operacionId = await useCase.ejecutar(tipo, supervisorId, frenteId);

            // ASSERT: Verificar resultado
            expect(operacionId).toBeDefined();
            expect(operacionId).toContain('operacion-');

            // Verificar que se guardó en repositorio
            const operacionGuardada = await repositorio.obtenerPorId(operacionId);
            expect(operacionGuardada).not.toBeNull();
            expect(operacionGuardada?.tipo).toBe(tipo);
            expect(operacionGuardada?.supervisorId).toBe(supervisorId);
            expect(operacionGuardada?.frenteId).toBe(frenteId);
            expect(operacionGuardada?.estaActiva()).toBe(true);
        });

        it('debe crear una operación de TRANSPORTE correctamente', async () => {
            const tipo = TIPOS_OPERACION.TRANSPORTE;
            const supervisorId = 'SUP-002';
            const frenteId = 'FRENTE-SUR-02';

            const operacionId = await useCase.ejecutar(tipo, supervisorId, frenteId);

            const operacionGuardada = await repositorio.obtenerPorId(operacionId);
            expect(operacionGuardada?.tipo).toBe(TIPOS_OPERACION.TRANSPORTE);
        });

        it('debe crear una operación de DESCARGA correctamente', async () => {
            const tipo = TIPOS_OPERACION.DESCARGA;
            const supervisorId = 'SUP-003';
            const frenteId = 'PLANTA-PROCESADORA';

            const operacionId = await useCase.ejecutar(tipo, supervisorId, frenteId);

            const operacionGuardada = await repositorio.obtenerPorId(operacionId);
            expect(operacionGuardada?.tipo).toBe(TIPOS_OPERACION.DESCARGA);
        });
    });

    describe('Validación de datos de entrada', () => {
        it('debe lanzar error si el tipo está vacío', async () => {
            await expect(
                useCase.ejecutar('', 'SUP-001', 'FRENTE-01')
            ).rejects.toThrow('El tipo de operación es obligatorio');
        });

        it('debe lanzar error si el supervisorId está vacío', async () => {
            await expect(
                useCase.ejecutar(TIPOS_OPERACION.CARGUE, '', 'FRENTE-01')
            ).rejects.toThrow('El supervisor es obligatorio');
        });

        it('debe lanzar error si el frenteId está vacío', async () => {
            await expect(
                useCase.ejecutar(TIPOS_OPERACION.CARGUE, 'SUP-001', '')
            ).rejects.toThrow('El frente de trabajo es obligatorio');
        });

        it('debe lanzar error si el tipo es inválido', async () => {
            await expect(
                useCase.ejecutar('TIPO_INVALIDO', 'SUP-001', 'FRENTE-01')
            ).rejects.toThrow('Tipo de operación inválido');
        });
    });

    describe('Generación de IDs únicos (UUID)', () => {
        it('debe generar IDs únicos para cada operación', async () => {
            const id1 = await useCase.ejecutar(TIPOS_OPERACION.CARGUE, 'SUP-001', 'FRENTE-01');
            const id2 = await useCase.ejecutar(TIPOS_OPERACION.CARGUE, 'SUP-001', 'FRENTE-01');
            const id3 = await useCase.ejecutar(TIPOS_OPERACION.CARGUE, 'SUP-001', 'FRENTE-01');

            expect(id1).not.toBe(id2);
            expect(id1).not.toBe(id3);
            expect(id2).not.toBe(id3);
        });

        it('debe generar IDs en formato UUID v4', async () => {
            const id = await useCase.ejecutar(TIPOS_OPERACION.CARGUE, 'SUP-001', 'FRENTE-01');

            // Formato: operacion-{uuid}
            // UUID v4: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
            const uuidRegex = /^operacion-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            expect(id).toMatch(uuidRegex);
        });
    });

    describe('Integración con repositorio', () => {
        it('debe persistir la operación en el repositorio', async () => {
            // Antes: repositorio vacío
            const antesTotal = (await repositorio.obtenerTodas()).length;
            expect(antesTotal).toBe(0);

            // Crear operación
            await useCase.ejecutar(TIPOS_OPERACION.CARGUE, 'SUP-001', 'FRENTE-01');

            // Después: repositorio tiene 1 operación
            const despuesTotal = (await repositorio.obtenerTodas()).length;
            expect(despuesTotal).toBe(1);
        });

        it('debe permitir crear múltiples operaciones', async () => {
            await useCase.ejecutar(TIPOS_OPERACION.CARGUE, 'SUP-001', 'FRENTE-01');
            await useCase.ejecutar(TIPOS_OPERACION.TRANSPORTE, 'SUP-002', 'FRENTE-02');
            await useCase.ejecutar(TIPOS_OPERACION.DESCARGA, 'SUP-003', 'PLANTA');

            const total = (await repositorio.obtenerTodas()).length;
            expect(total).toBe(3);
        });

        it('debe poder recuperar la operación creada', async () => {
            const id = await useCase.ejecutar(TIPOS_OPERACION.CARGUE, 'SUP-001', 'FRENTE-01');

            const operacion = await repositorio.obtenerPorId(id);
            expect(operacion).not.toBeNull();
            expect(operacion?.id).toBe(id);
        });
    });

    describe('Manejo de errores', () => {
        it('debe propagar errores del repositorio', async () => {
            // Mockear el repositorio para que falle
            jest.spyOn(repositorio, 'crear').mockRejectedValue(
                new Error('Error de persistencia simulado')
            );

            await expect(
                useCase.ejecutar(TIPOS_OPERACION.CARGUE, 'SUP-001', 'FRENTE-01')
            ).rejects.toThrow('Error al iniciar operación');
        });
    });

    describe('Reglas de negocio', () => {
        it('debe crear operaciones activas por defecto', async () => {
            const id = await useCase.ejecutar(TIPOS_OPERACION.CARGUE, 'SUP-001', 'FRENTE-01');

            const operacion = await repositorio.obtenerPorId(id);
            expect(operacion?.estaActiva()).toBe(true);
        });

        it('debe crear operaciones sin equipos asignados', async () => {
            const id = await useCase.ejecutar(TIPOS_OPERACION.CARGUE, 'SUP-001', 'FRENTE-01');

            const operacion = await repositorio.obtenerPorId(id);
            expect(operacion?.obtenerCantidadEquipos()).toBe(0);
        });
    });
});

/**
 * CONCEPTOS APLICADOS EN ESTOS TESTS:
 * =====================================
 *
 * TESTING PATTERNS:
 * 1. ✅ AAA Pattern (Arrange-Act-Assert)
 * 2. ✅ Integration Testing (sin mocks)
 * 3. ✅ Test Isolation (beforeEach)
 * 4. ✅ Descriptive Test Names
 * 5. ✅ Edge Cases Testing
 *
 * JEST FEATURES:
 * 6. ✅ describe/it para organizar
 * 7. ✅ expect().toBe() comparaciones
 * 8. ✅ expect().toThrow() errores
 * 9. ✅ expect().toMatch() regex
 * 10. ✅ jest.spyOn() para mockear parcialmente
 *
 * DOMAIN TESTING:
 * 11. ✅ Validar tipos de operación
 * 12. ✅ Validar IDs únicos (UUID v4)
 * 13. ✅ Validar persistencia
 * 14. ✅ Validar estado inicial
 */
