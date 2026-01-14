/**
 * ===============================================
 * PRUEBAS DE INTEGRACIÓN - REPOSITORY CON DOBLES
 * ===============================================
 *
 * Objetivo del Laboratorio 04:
 * - Probar la integración entre Repository y Entidades de Dominio
 * - Usar DOBLES DE PRUEBA (Stubs/Mocks) cuando sea necesario
 * - Verificar que el repositorio cumple el contrato de la interfaz
 *
 * Tipo de prueba: INTEGRACIÓN
 * - Se prueba la interacción entre múltiples componentes
 * - Se verifica el contrato del Repository
 */

import { MemoriaEquipoRepositorio } from '../MemoriaEquipoRepositorio';
import { Equipo } from '../../../../Dominio/monitoreo/Equipo';
import { IEquipoRepositorio } from '../../../../Dominio/repositorios/IEquipoRepositorio';

describe('MemoriaEquipoRepositorio - Pruebas de Integración', () => {

    let repository: IEquipoRepositorio;

    // ===================================
    // SETUP Y TEARDOWN
    // ===================================

    beforeEach(() => {
        // Arrange: Crear una instancia nueva del repositorio antes de cada prueba
        repository = new MemoriaEquipoRepositorio();
    });

    afterEach(async () => {
        // Cleanup: Limpiar el repositorio después de cada prueba
        if (repository instanceof MemoriaEquipoRepositorio) {
            await repository.limpiar();
        }
    });

    // ===================================
    // 1. PRUEBAS DE CREACIÓN
    // ===================================

    describe('crear() - Creación de equipos', () => {

        test('Debería crear un equipo correctamente', async () => {
            // Arrange
            const equipo = new Equipo('EQ-001', 'VOL-TEST-001', 'VOLQUETE');

            // Act
            await repository.crear(equipo);
            const resultado = await repository.obtenerPorId('EQ-001');

            // Assert
            expect(resultado).not.toBeNull();
            expect(resultado?.id).toBe('EQ-001');
            expect(resultado?.codigo).toBe('VOL-TEST-001');
        });

        test('NO debería permitir crear equipos con código duplicado', async () => {
            // Arrange
            const equipo1 = new Equipo('EQ-001', 'VOL-DUP-001', 'VOLQUETE');
            const equipo2 = new Equipo('EQ-002', 'VOL-DUP-001', 'VOLQUETE');

            // Act
            await repository.crear(equipo1);

            // Assert
            await expect(repository.crear(equipo2)).rejects.toThrow('Ya existe un equipo con el código');
        });

        test('Debería permitir crear múltiples equipos con códigos diferentes', async () => {
            // Arrange
            const equipo1 = new Equipo('EQ-001', 'VOL-001', 'VOLQUETE');
            const equipo2 = new Equipo('EQ-002', 'EXC-001', 'EXCAVADORA');
            const equipo3 = new Equipo('EQ-003', 'BUL-001', 'BULLDOZER');

            // Act
            await repository.crear(equipo1);
            await repository.crear(equipo2);
            await repository.crear(equipo3);

            const todos = await repository.obtenerTodos();

            // Assert
            expect(todos.length).toBeGreaterThanOrEqual(3);
        });
    });

    // ===================================
    // 2. PRUEBAS DE LECTURA
    // ===================================

    describe('obtenerPorId() - Búsqueda por ID', () => {

        test('Debería obtener un equipo existente por ID', async () => {
            // Arrange
            const equipo = new Equipo('EQ-FIND-001', 'VOL-FIND-001', 'VOLQUETE');
            await repository.crear(equipo);

            // Act
            const resultado = await repository.obtenerPorId('EQ-FIND-001');

            // Assert
            expect(resultado).not.toBeNull();
            expect(resultado?.id).toBe('EQ-FIND-001');
        });

        test('Debería retornar null si el equipo no existe', async () => {
            // Act
            const resultado = await repository.obtenerPorId('ID-INEXISTENTE');

            // Assert
            expect(resultado).toBeNull();
        });
    });

    describe('obtenerTodos() - Listar todos los equipos', () => {

        test('Debería retornar todos los equipos creados', async () => {
            // Arrange
            const equipo1 = new Equipo('EQ-ALL-001', 'VOL-ALL-001', 'VOLQUETE');
            const equipo2 = new Equipo('EQ-ALL-002', 'EXC-ALL-001', 'EXCAVADORA');

            await repository.crear(equipo1);
            await repository.crear(equipo2);

            // Act
            const todos = await repository.obtenerTodos();

            // Assert
            expect(todos.length).toBeGreaterThanOrEqual(2);
            expect(todos.some(e => e.id === 'EQ-ALL-001')).toBe(true);
            expect(todos.some(e => e.id === 'EQ-ALL-002')).toBe(true);
        });

        test('Debería retornar array vacío si no hay equipos (después de limpiar)', async () => {
            // Arrange
            if (repository instanceof MemoriaEquipoRepositorio) {
                await repository.limpiar();
            }

            // Act
            const todos = await repository.obtenerTodos();

            // Assert
            expect(todos).toEqual([]);
        });
    });

    // ===================================
    // 3. PRUEBAS DE ACTUALIZACIÓN
    // ===================================

    describe('actualizar() - Actualización de equipos', () => {

        test('Debería actualizar un equipo existente', async () => {
            // Arrange
            const equipo = new Equipo('EQ-UPD-001', 'VOL-UPD-001', 'VOLQUETE', 100, 0);
            await repository.crear(equipo);

            // Modificar el equipo
            equipo.cambiarEstado('OPERANDO');
            equipo.consumirCombustible(30);

            // Act
            await repository.actualizar(equipo);
            const resultado = await repository.obtenerPorId('EQ-UPD-001');

            // Assert
            expect(resultado?.estado).toBe('OPERANDO');
            expect(resultado?.nivelCombustible).toBe(70);
        });

        test('NO debería actualizar un equipo inexistente', async () => {
            // Arrange
            const equipo = new Equipo('EQ-NOEXISTE', 'VOL-NOEXISTE', 'VOLQUETE');

            // Act & Assert
            await expect(repository.actualizar(equipo)).rejects.toThrow('No se encontró equipo con ID');
        });
    });

    // ===================================
    // 4. PRUEBAS DE ELIMINACIÓN
    // ===================================

    describe('eliminar() - Eliminación de equipos', () => {

        test('Debería eliminar un equipo existente', async () => {
            // Arrange
            const equipo = new Equipo('EQ-DEL-001', 'VOL-DEL-001', 'VOLQUETE');
            await repository.crear(equipo);

            // Act
            await repository.eliminar('EQ-DEL-001');
            const resultado = await repository.obtenerPorId('EQ-DEL-001');

            // Assert
            expect(resultado).toBeNull();
        });

        test('NO debería eliminar un equipo inexistente', async () => {
            // Act & Assert
            await expect(repository.eliminar('ID-INEXISTENTE')).rejects.toThrow('No se encontró equipo con ID');
        });

        test('Debería reducir el total de equipos al eliminar', async () => {
            // Arrange
            const equipo1 = new Equipo('EQ-CNT-001', 'VOL-CNT-001', 'VOLQUETE');
            const equipo2 = new Equipo('EQ-CNT-002', 'EXC-CNT-001', 'EXCAVADORA');

            await repository.crear(equipo1);
            await repository.crear(equipo2);
            const cantidadInicial = (await repository.obtenerTodos()).length;

            // Act
            await repository.eliminar('EQ-CNT-001');
            const cantidadFinal = (await repository.obtenerTodos()).length;

            // Assert
            expect(cantidadFinal).toBe(cantidadInicial - 1);
        });
    });

    // ===================================
    // 5. PRUEBAS DE BÚSQUEDAS ESPECÍFICAS
    // ===================================

    describe('buscarPorTipo() - Búsqueda por tipo de equipo', () => {

        test('Debería encontrar todos los equipos de tipo VOLQUETE', async () => {
            // Arrange
            const volquete1 = new Equipo('VOL-1', 'VOL-TYPE-001', 'VOLQUETE');
            const volquete2 = new Equipo('VOL-2', 'VOL-TYPE-002', 'VOLQUETE');
            const excavadora = new Equipo('EXC-1', 'EXC-TYPE-001', 'EXCAVADORA');

            await repository.crear(volquete1);
            await repository.crear(volquete2);
            await repository.crear(excavadora);

            // Act
            const volquetes = await repository.buscarPorTipo('VOLQUETE');

            // Assert
            expect(volquetes.length).toBeGreaterThanOrEqual(2);
            expect(volquetes.every(e => e.tipo === 'VOLQUETE')).toBe(true);
        });

        test('Debería retornar array vacío si no hay equipos del tipo solicitado', async () => {
            // Arrange
            const volquete = new Equipo('VOL-1', 'VOL-ALONE-001', 'VOLQUETE');
            await repository.crear(volquete);

            // Act
            const gruas = await repository.buscarPorTipo('GRUA');

            // Assert
            expect(gruas).toEqual([]);
        });
    });

    describe('buscarPorEstado() - Búsqueda por estado', () => {

        test('Debería encontrar todos los equipos DISPONIBLES', async () => {
            // Arrange
            const equipo1 = new Equipo('EQ-ST-001', 'VOL-ST-001', 'VOLQUETE');
            const equipo2 = new Equipo('EQ-ST-002', 'EXC-ST-001', 'EXCAVADORA');
            const equipo3 = new Equipo('EQ-ST-003', 'BUL-ST-001', 'BULLDOZER');

            equipo2.cambiarEstado('OPERANDO');

            await repository.crear(equipo1);
            await repository.crear(equipo2);
            await repository.crear(equipo3);

            // Act
            const disponibles = await repository.buscarPorEstado('DISPONIBLE');

            // Assert
            expect(disponibles.length).toBeGreaterThanOrEqual(2);
            expect(disponibles.every(e => e.estado === 'DISPONIBLE')).toBe(true);
        });

        test('Debería encontrar equipos en MANTENIMIENTO', async () => {
            // Arrange
            const equipo = new Equipo('EQ-MANT-001', 'VOL-MANT-001', 'VOLQUETE');
            equipo.cambiarEstado('MANTENIMIENTO');
            await repository.crear(equipo);

            // Act
            const enMantenimiento = await repository.buscarPorEstado('MANTENIMIENTO');

            // Assert
            expect(enMantenimiento.length).toBeGreaterThanOrEqual(1);
            expect(enMantenimiento[0].estado).toBe('MANTENIMIENTO');
        });
    });

    describe('existeConCodigo() - Verificación de existencia', () => {

        test('Debería retornar true si existe un equipo con el código', async () => {
            // Arrange
            const equipo = new Equipo('EQ-EXIST-001', 'VOL-EXIST-001', 'VOLQUETE');
            await repository.crear(equipo);

            // Act
            const existe = await repository.existeConCodigo('VOL-EXIST-001');

            // Assert
            expect(existe).toBe(true);
        });

        test('Debería retornar false si NO existe un equipo con el código', async () => {
            // Act
            const existe = await repository.existeConCodigo('CODIGO-INEXISTENTE');

            // Assert
            expect(existe).toBe(false);
        });
    });

    // ===================================
    // 6. PRUEBAS DE INTEGRIDAD
    // ===================================

    describe('Integridad de Datos', () => {

        test('Debería preservar todos los datos del equipo al guardarlo y recuperarlo', async () => {
            // Arrange
            const equipo = new Equipo('EQ-INT-001', 'VOL-INT-001', 'VOLQUETE', 75, 150);
            equipo.cambiarEstado('OPERANDO');

            // Act
            await repository.crear(equipo);
            const recuperado = await repository.obtenerPorId('EQ-INT-001');

            // Assert
            expect(recuperado?.id).toBe(equipo.id);
            expect(recuperado?.codigo).toBe(equipo.codigo);
            expect(recuperado?.tipo).toBe(equipo.tipo);
            expect(recuperado?.estado).toBe(equipo.estado);
            expect(recuperado?.nivelCombustible).toBe(equipo.nivelCombustible);
            expect(recuperado?.horasOperacion).toBe(equipo.horasOperacion);
        });

        test('Debería retornar copias independientes en obtenerTodos()', async () => {
            // Arrange
            const equipo = new Equipo('EQ-COPY-001', 'VOL-COPY-001', 'VOLQUETE');
            await repository.crear(equipo);

            // Act
            const lista1 = await repository.obtenerTodos();
            const lista2 = await repository.obtenerTodos();

            // Assert
            expect(lista1).toEqual(lista2);
            expect(lista1).not.toBe(lista2); // No deben ser la misma referencia
        });
    });

    // ===================================
    // 7. PRUEBAS DE ESTADÍSTICAS (método auxiliar)
    // ===================================

    describe('obtenerEstadisticas() - Método auxiliar', () => {

        test('Debería generar estadísticas correctas', async () => {
            // Arrange
            if (repository instanceof MemoriaEquipoRepositorio) {
                await repository.limpiar();

                const vol1 = new Equipo('V1', 'VOL-STAT-001', 'VOLQUETE');
                const vol2 = new Equipo('V2', 'VOL-STAT-002', 'VOLQUETE');
                const exc1 = new Equipo('E1', 'EXC-STAT-001', 'EXCAVADORA');

                vol2.cambiarEstado('OPERANDO');

                await repository.crear(vol1);
                await repository.crear(vol2);
                await repository.crear(exc1);

                // Act
                const stats = repository.obtenerEstadisticas();

                // Assert
                expect(stats.totalEquipos).toBe(3);
                expect(stats.porTipo['VOLQUETE']).toBe(2);
                expect(stats.porTipo['EXCAVADORA']).toBe(1);
                expect(stats.porEstado['DISPONIBLE']).toBe(2);
                expect(stats.porEstado['OPERANDO']).toBe(1);
            }
        });
    });
});
