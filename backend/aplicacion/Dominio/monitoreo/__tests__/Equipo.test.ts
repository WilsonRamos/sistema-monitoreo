/**
 * ===============================================
 * PRUEBAS UNITARIAS - ENTIDAD EQUIPO (DOMINIO)
 * ===============================================
 *
 * Objetivo del Laboratorio 04:
 * - Probar INVARIANTES (reglas de negocio) de la entidad
 * - Probar comportamientos del dominio
 * - NO usar dobles/mocks (son pruebas unitarias puras)
 *
 * Patrón AAA:
 * - Arrange (Preparar): Configurar datos de prueba
 * - Act (Actuar): Ejecutar el comportamiento
 * - Assert (Afirmar): Verificar el resultado
 */

import { Equipo } from '../Equipo';

describe('Equipo - Pruebas Unitarias de Dominio', () => {

    // ===================================
    // 1. PRUEBAS DE CREACIÓN E INVARIANTES
    // ===================================

    describe('Constructor e Invariantes', () => {

        test('Debería crear un equipo válido con datos correctos', () => {
            // Arrange & Act
            const equipo = new Equipo('EQ-001', 'VOL-001', 'VOLQUETE', 100, 0);

            // Assert
            expect(equipo.id).toBe('EQ-001');
            expect(equipo.codigo).toBe('VOL-001');
            expect(equipo.tipo).toBe('VOLQUETE');
            expect(equipo.estado).toBe('DISPONIBLE');
            expect(equipo.nivelCombustible).toBe(100);
            expect(equipo.horasOperacion).toBe(0);
        });

        test('INVARIANTE: El código no puede estar vacío', () => {
            // Arrange & Act & Assert
            expect(() => {
                new Equipo('EQ-001', '', 'VOLQUETE');
            }).toThrow('El código del equipo es obligatorio');
        });

        test('INVARIANTE: El código debe tener al menos 3 caracteres', () => {
            // Arrange & Act & Assert
            expect(() => {
                new Equipo('EQ-001', 'AB', 'VOLQUETE');
            }).toThrow('El código debe tener al menos 3 caracteres');
        });

        test('INVARIANTE: El tipo debe ser válido', () => {
            // Arrange & Act & Assert
            expect(() => {
                new Equipo('EQ-001', 'VOL-001', 'TIPO_INVALIDO');
            }).toThrow('Tipo TIPO_INVALIDO no es válido');
        });

        test('Debería crear equipo con valores por defecto', () => {
            // Arrange & Act
            const equipo = new Equipo('EQ-001', 'VOL-001', 'VOLQUETE');

            // Assert
            expect(equipo.nivelCombustible).toBe(100);
            expect(equipo.horasOperacion).toBe(0);
            expect(equipo.estado).toBe('DISPONIBLE');
        });
    });

    // ===================================
    // 2. PRUEBAS DE CAMBIO DE ESTADO
    // ===================================

    describe('Cambio de Estado', () => {

        test('Debería cambiar de DISPONIBLE a OPERANDO', () => {
            // Arrange
            const equipo = new Equipo('EQ-001', 'VOL-001', 'VOLQUETE');

            // Act
            equipo.cambiarEstado('OPERANDO');

            // Assert
            expect(equipo.estado).toBe('OPERANDO');
        });

        test('Debería cambiar de OPERANDO a DISPONIBLE', () => {
            // Arrange
            const equipo = new Equipo('EQ-001', 'VOL-001', 'VOLQUETE');
            equipo.cambiarEstado('OPERANDO');

            // Act
            equipo.cambiarEstado('DISPONIBLE');

            // Assert
            expect(equipo.estado).toBe('DISPONIBLE');
        });

        test('NO debería permitir estado inválido', () => {
            // Arrange
            const equipo = new Equipo('EQ-001', 'VOL-001', 'VOLQUETE');

            // Act & Assert
            expect(() => {
                equipo.cambiarEstado('ESTADO_INVALIDO');
            }).toThrow('Estado ESTADO_INVALIDO no es válido');
        });

        test('NO debería permitir transición inválida (OPERANDO a INACTIVO)', () => {
            // Arrange
            const equipo = new Equipo('EQ-001', 'VOL-001', 'VOLQUETE');
            equipo.cambiarEstado('OPERANDO');

            // Act & Assert
            expect(() => {
                equipo.cambiarEstado('INACTIVO');
            }).toThrow('No se puede cambiar de OPERANDO a INACTIVO');
        });

        test('Debería permitir todas las transiciones desde DISPONIBLE', () => {
            // Test 1: DISPONIBLE -> OPERANDO
            const equipo1 = new Equipo('EQ-001', 'VOL-001', 'VOLQUETE');
            expect(() => equipo1.cambiarEstado('OPERANDO')).not.toThrow();

            // Test 2: DISPONIBLE -> MANTENIMIENTO
            const equipo2 = new Equipo('EQ-002', 'VOL-002', 'VOLQUETE');
            expect(() => equipo2.cambiarEstado('MANTENIMIENTO')).not.toThrow();

            // Test 3: DISPONIBLE -> INACTIVO
            const equipo3 = new Equipo('EQ-003', 'VOL-003', 'VOLQUETE');
            expect(() => equipo3.cambiarEstado('INACTIVO')).not.toThrow();
        });
    });

    // ===================================
    // 3. PRUEBAS DE COMBUSTIBLE
    // ===================================

    describe('Manejo de Combustible', () => {

        test('INVARIANTE: El nivel de combustible no puede ser negativo', () => {
            // Arrange
            const equipo = new Equipo('EQ-001', 'VOL-001', 'VOLQUETE');

            // Act & Assert
            expect(() => {
                equipo.nivelCombustible = -10;
            }).toThrow('El nivel de combustible no puede ser negativo');
        });

        test('Debería consumir combustible correctamente', () => {
            // Arrange
            const equipo = new Equipo('EQ-001', 'VOL-001', 'VOLQUETE', 100, 0);

            // Act
            equipo.consumirCombustible(30);

            // Assert
            expect(equipo.nivelCombustible).toBe(70);
        });

        test('NO debería permitir consumir cantidad negativa', () => {
            // Arrange
            const equipo = new Equipo('EQ-001', 'VOL-001', 'VOLQUETE', 100, 0);

            // Act & Assert
            expect(() => {
                equipo.consumirCombustible(-10);
            }).toThrow('La cantidad debe ser positiva');
        });

        test('NO debería permitir consumir más combustible del disponible', () => {
            // Arrange
            const equipo = new Equipo('EQ-001', 'VOL-001', 'VOLQUETE', 50, 0);

            // Act & Assert
            expect(() => {
                equipo.consumirCombustible(60);
            }).toThrow('Combustible insuficiente');
        });

        test('Debería permitir consumir exactamente todo el combustible', () => {
            // Arrange
            const equipo = new Equipo('EQ-001', 'VOL-001', 'VOLQUETE', 50, 0);

            // Act
            equipo.consumirCombustible(50);

            // Assert
            expect(equipo.nivelCombustible).toBe(0);
        });
    });

    // ===================================
    // 4. PRUEBAS DE HORAS DE OPERACIÓN
    // ===================================

    describe('Horas de Operación', () => {

        test('INVARIANTE: Las horas de operación no pueden ser negativas', () => {
            // Arrange
            const equipo = new Equipo('EQ-001', 'VOL-001', 'VOLQUETE');

            // Act & Assert
            expect(() => {
                equipo.horasOperacion = -10;
            }).toThrow('Las horas de operación no pueden ser negativas');
        });

        test('Debería sumar horas de operación correctamente', () => {
            // Arrange
            const equipo = new Equipo('EQ-001', 'VOL-001', 'VOLQUETE', 100, 0);

            // Act
            equipo.sumarHorasOperacion(5);
            equipo.sumarHorasOperacion(3);

            // Assert
            expect(equipo.horasOperacion).toBe(8);
        });

        test('NO debería permitir sumar horas negativas', () => {
            // Arrange
            const equipo = new Equipo('EQ-001', 'VOL-001', 'VOLQUETE', 100, 0);

            // Act & Assert
            expect(() => {
                equipo.sumarHorasOperacion(-5);
            }).toThrow('Las horas deben ser positivas');
        });
    });

    // ===================================
    // 5. PRUEBAS DE ALERTAS
    // ===================================

    describe('Sistema de Alertas', () => {

        test('Debería generar alerta por equipo INACTIVO', () => {
            // Arrange
            const equipo = new Equipo('EQ-001', 'VOL-001', 'VOLQUETE');
            equipo.cambiarEstado('INACTIVO');
            const alertas: string[] = [];

            // Act
            equipo.verificarAlertas((mensaje) => alertas.push(mensaje));

            // Assert
            expect(alertas.length).toBeGreaterThan(0);
            expect(alertas[0]).toContain('INACTIVO');
        });

        test('Debería generar alerta por bajo nivel de combustible', () => {
            // Arrange
            const equipo = new Equipo('EQ-001', 'VOL-001', 'VOLQUETE', 5, 0);
            const alertas: string[] = [];

            // Act
            equipo.verificarAlertas((mensaje) => alertas.push(mensaje), 10, 500);

            // Assert
            expect(alertas.some(a => a.includes('bajo nivel de combustible'))).toBe(true);
        });

        test('Debería generar alerta por exceso de horas de operación', () => {
            // Arrange
            const equipo = new Equipo('EQ-001', 'VOL-001', 'VOLQUETE', 100, 600);
            const alertas: string[] = [];

            // Act
            equipo.verificarAlertas((mensaje) => alertas.push(mensaje), 10, 500);

            // Assert
            expect(alertas.some(a => a.includes('mantenimiento preventivo'))).toBe(true);
        });

        test('Debería generar alerta por equipo en MANTENIMIENTO', () => {
            // Arrange
            const equipo = new Equipo('EQ-001', 'VOL-001', 'VOLQUETE');
            equipo.cambiarEstado('MANTENIMIENTO');
            const alertas: string[] = [];

            // Act
            equipo.verificarAlertas((mensaje) => alertas.push(mensaje));

            // Assert
            expect(alertas.some(a => a.includes('mantenimiento'))).toBe(true);
        });

        test('NO debería generar alertas si todo está bien', () => {
            // Arrange
            const equipo = new Equipo('EQ-001', 'VOL-001', 'VOLQUETE', 100, 50);
            const alertas: string[] = [];

            // Act
            equipo.verificarAlertas((mensaje) => alertas.push(mensaje), 10, 500);

            // Assert
            expect(alertas.length).toBe(0);
        });
    });

    // ===================================
    // 6. PRUEBAS DE COMPORTAMIENTOS
    // ===================================

    describe('Comportamientos del Dominio', () => {

        test('puedeOperar() debería retornar true solo si está DISPONIBLE', () => {
            // Arrange
            const equipo = new Equipo('EQ-001', 'VOL-001', 'VOLQUETE');

            // Assert - Estado DISPONIBLE
            expect(equipo.puedeOperar()).toBe(true);

            // Act - Cambiar a OPERANDO
            equipo.cambiarEstado('OPERANDO');

            // Assert - Estado OPERANDO
            expect(equipo.puedeOperar()).toBe(false);
        });

        test('reiniciar() debería restaurar valores iniciales', () => {
            // Arrange
            const equipo = new Equipo('EQ-001', 'VOL-001', 'VOLQUETE', 50, 200);
            equipo.cambiarEstado('MANTENIMIENTO');

            // Act
            equipo.reiniciar();

            // Assert
            expect(equipo.estado).toBe('DISPONIBLE');
            expect(equipo.nivelCombustible).toBe(100);
            expect(equipo.horasOperacion).toBe(0);
        });

        test('obtenerInfo() debería retornar todos los datos del equipo', () => {
            // Arrange
            const equipo = new Equipo('EQ-001', 'VOL-001', 'VOLQUETE', 75, 150);

            // Act
            const info = equipo.obtenerInfo();

            // Assert
            expect(info).toEqual({
                id: 'EQ-001',
                codigo: 'VOL-001',
                tipo: 'VOLQUETE',
                estado: 'DISPONIBLE',
                nivelCombustible: 75,
                horasOperacion: 150
            });
        });
    });

    // ===================================
    // 7. PRUEBAS DE HISTORIAL
    // ===================================

    describe('Historial de Cambios', () => {

        test('Debería registrar la creación en el historial', () => {
            // Arrange & Act
            const equipo = new Equipo('EQ-001', 'VOL-001', 'VOLQUETE', 100, 0);

            // Assert
            expect(equipo.historial.length).toBeGreaterThan(0);
            expect(equipo.historial[0].accion).toBe('crear');
        });

        test('Debería registrar cambios de estado en el historial', () => {
            // Arrange
            const equipo = new Equipo('EQ-001', 'VOL-001', 'VOLQUETE');
            const historialInicial = equipo.historial.length;

            // Act
            equipo.cambiarEstado('OPERANDO');

            // Assert
            expect(equipo.historial.length).toBeGreaterThan(historialInicial);
            const ultimoCambio = equipo.historial[equipo.historial.length - 1];
            expect(ultimoCambio.accion).toBe('cambiarEstado');
            expect(ultimoCambio.valor).toBe('OPERANDO');
        });

        test('Debería registrar múltiples acciones en orden', () => {
            // Arrange
            const equipo = new Equipo('EQ-001', 'VOL-001', 'VOLQUETE', 100, 0);

            // Act
            equipo.cambiarEstado('OPERANDO');
            equipo.sumarHorasOperacion(10);
            equipo.nivelCombustible = 80;

            // Assert
            expect(equipo.historial.length).toBeGreaterThanOrEqual(4); // crear + 3 acciones

            // Verificar que las acciones están en el historial
            const acciones = equipo.historial.map(h => h.accion);
            expect(acciones).toContain('cambiarEstado');
            expect(acciones).toContain('sumarHorasOperacion');
            expect(acciones).toContain('setNivelCombustible');
        });
    });

    // ===================================
    // 8. PRUEBAS DE TIPOS DE EQUIPOS
    // ===================================

    describe('Tipos de Equipos Válidos', () => {

        test('Debería crear VOLQUETE', () => {
            const equipo = new Equipo('EQ-001', 'VOL-001', 'VOLQUETE');
            expect(equipo.tipo).toBe('VOLQUETE');
        });

        test('Debería crear EXCAVADORA', () => {
            const equipo = new Equipo('EQ-002', 'EXC-001', 'EXCAVADORA');
            expect(equipo.tipo).toBe('EXCAVADORA');
        });

        test('Debería crear BULLDOZER', () => {
            const equipo = new Equipo('EQ-003', 'BUL-001', 'BULLDOZER');
            expect(equipo.tipo).toBe('BULLDOZER');
        });

        test('Debería crear GRUA', () => {
            const equipo = new Equipo('EQ-004', 'GRU-001', 'GRUA');
            expect(equipo.tipo).toBe('GRUA');
        });

        test('Debería crear PERFORADORA', () => {
            const equipo = new Equipo('EQ-005', 'PER-001', 'PERFORADORA');
            expect(equipo.tipo).toBe('PERFORADORA');
        });
    });
});
