/**
 * ===============================================
 * PRUEBAS UNITARIAS - VOLQUETE (ESPECIALIZACIÓN)
 * ===============================================
 *
 * Objetivo:
 * - Probar comportamientos específicos de Volquete
 * - Verificar herencia correcta desde Equipo
 */

import { Volquete } from '../volquete';

describe('Volquete - Pruebas Unitarias de Dominio', () => {

    describe('Constructor y Herencia', () => {

        test('Debería crear un volquete con tipo correcto', () => {
            // Arrange & Act
            const volquete = new Volquete('VOL-001', 'VOL-DEMO-001');

            // Assert
            expect(volquete.tipo).toBe('VOLQUETE');
        });

        test('Debería heredar propiedades de Equipo', () => {
            // Arrange & Act
            const volquete = new Volquete('VOL-001', 'VOL-DEMO-001');

            // Assert
            expect(volquete.id).toBe('VOL-001');
            expect(volquete.codigo).toBe('VOL-DEMO-001');
            expect(volquete.estado).toBe('DISPONIBLE');
            expect(volquete.nivelCombustible).toBe(100);
            expect(volquete.horasOperacion).toBe(0);
        });

        test('Debería heredar comportamientos de Equipo', () => {
            // Arrange
            const volquete = new Volquete('VOL-001', 'VOL-DEMO-001');

            // Act
            volquete.cambiarEstado('OPERANDO');

            // Assert
            expect(volquete.estado).toBe('OPERANDO');
        });
    });

    describe('Comportamiento específico: transportar()', () => {

        test('Debería poder transportar cuando está OPERANDO', () => {
            // Arrange
            const volquete = new Volquete('VOL-001', 'VOL-DEMO-001');
            volquete.cambiarEstado('OPERANDO');

            // Act & Assert
            expect(() => volquete.transportar()).not.toThrow();
        });

        test('NO debería poder transportar cuando NO está OPERANDO', () => {
            // Arrange
            const volquete = new Volquete('VOL-001', 'VOL-DEMO-001');
            // Estado inicial es DISPONIBLE

            // Act & Assert
            expect(() => volquete.transportar()).toThrow('El volquete debe estar operando para transportar');
        });

        test('NO debería poder transportar en MANTENIMIENTO', () => {
            // Arrange
            const volquete = new Volquete('VOL-001', 'VOL-DEMO-001');
            volquete.cambiarEstado('MANTENIMIENTO');

            // Act & Assert
            expect(() => volquete.transportar()).toThrow('El volquete debe estar operando para transportar');
        });
    });

    describe('Integración con funcionalidades heredadas', () => {

        test('Debería consumir combustible al transportar (simulado)', () => {
            // Arrange
            const volquete = new Volquete('VOL-001', 'VOL-DEMO-001');
            volquete.cambiarEstado('OPERANDO');
            const combustibleInicial = volquete.nivelCombustible;

            // Act
            volquete.transportar();
            // En una implementación real, transportar() consumiría combustible
            // Para este test, lo simulamos manualmente
            volquete.consumirCombustible(10);

            // Assert
            expect(volquete.nivelCombustible).toBe(combustibleInicial - 10);
        });

        test('Debería sumar horas al transportar (simulado)', () => {
            // Arrange
            const volquete = new Volquete('VOL-001', 'VOL-DEMO-001');
            volquete.cambiarEstado('OPERANDO');

            // Act
            volquete.transportar();
            volquete.sumarHorasOperacion(2);

            // Assert
            expect(volquete.horasOperacion).toBe(2);
        });
    });
});
