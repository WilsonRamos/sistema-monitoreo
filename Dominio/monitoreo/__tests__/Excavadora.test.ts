/**
 * ===============================================
 * PRUEBAS UNITARIAS - EXCAVADORA (ESPECIALIZACIÓN)
 * ===============================================
 *
 * Objetivo:
 * - Probar comportamientos específicos de Excavadora
 * - Verificar herencia correcta desde Equipo
 */

import { Excavadora } from '../excavadora';

describe('Excavadora - Pruebas Unitarias de Dominio', () => {

    describe('Constructor y Herencia', () => {

        test('Debería crear una excavadora con tipo correcto', () => {
            // Arrange & Act
            const excavadora = new Excavadora('EXC-001', 'EXC-DEMO-001');

            // Assert
            expect(excavadora.tipo).toBe('EXCAVADORA');
        });

        test('Debería heredar propiedades de Equipo', () => {
            // Arrange & Act
            const excavadora = new Excavadora('EXC-001', 'EXC-DEMO-001');

            // Assert
            expect(excavadora.id).toBe('EXC-001');
            expect(excavadora.codigo).toBe('EXC-DEMO-001');
            expect(excavadora.estado).toBe('DISPONIBLE');
            expect(excavadora.nivelCombustible).toBe(100);
            expect(excavadora.horasOperacion).toBe(0);
        });

        test('Debería heredar comportamientos de Equipo', () => {
            // Arrange
            const excavadora = new Excavadora('EXC-001', 'EXC-DEMO-001');

            // Act
            excavadora.cambiarEstado('OPERANDO');

            // Assert
            expect(excavadora.estado).toBe('OPERANDO');
        });
    });

    describe('Comportamiento específico: excavar()', () => {

        test('Debería poder excavar cuando está OPERANDO', () => {
            // Arrange
            const excavadora = new Excavadora('EXC-001', 'EXC-DEMO-001');
            excavadora.cambiarEstado('OPERANDO');

            // Act & Assert
            expect(() => excavadora.excavar()).not.toThrow();
        });

        test('NO debería poder excavar cuando NO está OPERANDO', () => {
            // Arrange
            const excavadora = new Excavadora('EXC-001', 'EXC-DEMO-001');
            // Estado inicial es DISPONIBLE

            // Act & Assert
            expect(() => excavadora.excavar()).toThrow('La excavadora debe estar operando para excavar');
        });

        test('NO debería poder excavar en MANTENIMIENTO', () => {
            // Arrange
            const excavadora = new Excavadora('EXC-001', 'EXC-DEMO-001');
            excavadora.cambiarEstado('MANTENIMIENTO');

            // Act & Assert
            expect(() => excavadora.excavar()).toThrow('La excavadora debe estar operando para excavar');
        });
    });

    describe('Integración con funcionalidades heredadas', () => {

        test('Debería consumir combustible al excavar (simulado)', () => {
            // Arrange
            const excavadora = new Excavadora('EXC-001', 'EXC-DEMO-001');
            excavadora.cambiarEstado('OPERANDO');
            const combustibleInicial = excavadora.nivelCombustible;

            // Act
            excavadora.excavar();
            // En una implementación real, excavar() consumiría combustible
            // Para este test, lo simulamos manualmente
            excavadora.consumirCombustible(5);

            // Assert
            expect(excavadora.nivelCombustible).toBe(combustibleInicial - 5);
        });

        test('Debería sumar horas al excavar (simulado)', () => {
            // Arrange
            const excavadora = new Excavadora('EXC-001', 'EXC-DEMO-001');
            excavadora.cambiarEstado('OPERANDO');

            // Act
            excavadora.excavar();
            excavadora.sumarHorasOperacion(1);

            // Assert
            expect(excavadora.horasOperacion).toBe(1);
        });
    });
});
