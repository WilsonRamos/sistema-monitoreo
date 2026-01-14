/**
 * ==================================
 * PRUEBAS UNITARIAS - EQUIPO
 * ==================================
 * Tests para la entidad Equipo (Aggregate Root)
 * Cobertura: Validaciones, cambios de estado, reglas de negocio
 */

import { Equipo } from '../Equipo';

describe('Equipo - Domain Entity Tests', () => {

    describe('Constructor y Validaciones', () => {

        it('debe crear un equipo válido con valores por defecto', () => {
            const equipo = new Equipo('id-123', 'EQ-001', 'VOLQUETE');

            expect(equipo.id).toBe('id-123');
            expect(equipo.codigo).toBe('EQ-001');
            expect(equipo.tipo).toBe('VOLQUETE');
            expect(equipo.estado).toBe('DISPONIBLE');
            expect(equipo.nivelCombustible).toBe(100);
            expect(equipo.horasOperacion).toBe(0);
            expect(equipo.fechaCreacion).toBeInstanceOf(Date);
            expect(equipo.historial).toHaveLength(1);
        });

        it('debe crear equipo con valores personalizados', () => {
            const equipo = new Equipo('id-456', 'EX-002', 'EXCAVADORA', 80, 150);

            expect(equipo.nivelCombustible).toBe(80);
            expect(equipo.horasOperacion).toBe(150);
        });

        it('debe rechazar código vacío', () => {
            expect(() => {
                new Equipo('id-123', '', 'VOLQUETE');
            }).toThrow('El código del equipo es obligatorio');
        });

        it('debe rechazar código menor a 3 caracteres', () => {
            expect(() => {
                new Equipo('id-123', 'AB', 'VOLQUETE');
            }).toThrow('El código debe tener al menos 3 caracteres');
        });

        it('debe rechazar tipo inválido', () => {
            expect(() => {
                new Equipo('id-123', 'EQ-001', 'TIPO_INVALIDO');
            }).toThrow('Tipo TIPO_INVALIDO no es válido');
        });

        it('debe aceptar todos los tipos válidos', () => {
            const tiposValidos = ['VOLQUETE', 'EXCAVADORA', 'BULLDOZER', 'GRUA', 'PERFORADORA'];

            tiposValidos.forEach(tipo => {
                const equipo = new Equipo('id-123', 'EQ-001', tipo);
                expect(equipo.tipo).toBe(tipo);
            });
        });
    });

    describe('Cambios de Estado', () => {

        let equipo: Equipo;

        beforeEach(() => {
            equipo = new Equipo('id-123', 'EQ-001', 'VOLQUETE');
        });

        it('debe cambiar de DISPONIBLE a OPERANDO', () => {
            equipo.cambiarEstado('OPERANDO');
            expect(equipo.estado).toBe('OPERANDO');
        });

        it('debe cambiar de DISPONIBLE a MANTENIMIENTO', () => {
            equipo.cambiarEstado('MANTENIMIENTO');
            expect(equipo.estado).toBe('MANTENIMIENTO');
        });

        it('debe cambiar de OPERANDO a DISPONIBLE', () => {
            equipo.cambiarEstado('OPERANDO');
            equipo.cambiarEstado('DISPONIBLE');
            expect(equipo.estado).toBe('DISPONIBLE');
        });

        it('debe rechazar estado inválido', () => {
            expect(() => {
                equipo.cambiarEstado('ESTADO_INVALIDO');
            }).toThrow('Estado ESTADO_INVALIDO no es válido');
        });

        it('debe rechazar transición no permitida (OPERANDO a INACTIVO)', () => {
            equipo.cambiarEstado('OPERANDO');

            expect(() => {
                equipo.cambiarEstado('INACTIVO');
            }).toThrow('No se puede cambiar de OPERANDO a INACTIVO');
        });

        it('debe permitir transición MANTENIMIENTO a DISPONIBLE', () => {
            equipo.cambiarEstado('MANTENIMIENTO');
            equipo.cambiarEstado('DISPONIBLE');
            expect(equipo.estado).toBe('DISPONIBLE');
        });

        it('debe registrar cambio de estado en historial', () => {
            equipo.cambiarEstado('OPERANDO');
            const historial = equipo.historial;

            expect(historial.length).toBeGreaterThan(1);
            expect(historial[historial.length - 1].accion).toBe('cambiarEstado');
            expect(historial[historial.length - 1].valor).toBe('OPERANDO');
        });
    });

    describe('Gestión de Combustible', () => {

        let equipo: Equipo;

        beforeEach(() => {
            equipo = new Equipo('id-123', 'EQ-001', 'VOLQUETE', 100);
        });

        it('debe consumir combustible correctamente', () => {
            equipo.consumirCombustible(30);
            expect(equipo.nivelCombustible).toBe(70);
        });

        it('debe rechazar cantidad negativa', () => {
            expect(() => {
                equipo.consumirCombustible(-10);
            }).toThrow('La cantidad debe ser positiva');
        });

        it('debe rechazar consumo que deje combustible negativo', () => {
            expect(() => {
                equipo.consumirCombustible(150);
            }).toThrow('Combustible insuficiente');
        });

        it('debe permitir consumir todo el combustible', () => {
            equipo.consumirCombustible(100);
            expect(equipo.nivelCombustible).toBe(0);
        });

        it('debe registrar consumo en historial', () => {
            equipo.consumirCombustible(25);
            const historial = equipo.historial;

            const registro = historial.find(h => h.accion === 'consumirCombustible');
            expect(registro).toBeDefined();
            expect(registro?.valor).toBe(25);
        });
    });

    describe('Gestión de Horas de Operación', () => {

        let equipo: Equipo;

        beforeEach(() => {
            equipo = new Equipo('id-123', 'EQ-001', 'EXCAVADORA', 100, 0);
        });

        it('debe sumar horas de operación correctamente', () => {
            equipo.sumarHorasOperacion(50);
            expect(equipo.horasOperacion).toBe(50);
        });

        it('debe acumular horas correctamente', () => {
            equipo.sumarHorasOperacion(50);
            equipo.sumarHorasOperacion(30);
            expect(equipo.horasOperacion).toBe(80);
        });

        it('debe rechazar horas negativas', () => {
            expect(() => {
                equipo.sumarHorasOperacion(-10);
            }).toThrow('Las horas deben ser positivas');
        });

        it('debe registrar horas en historial', () => {
            equipo.sumarHorasOperacion(100);
            const historial = equipo.historial;

            const registro = historial.find(h => h.accion === 'sumarHorasOperacion');
            expect(registro).toBeDefined();
            expect(registro?.valor).toBe(100);
        });
    });

    describe('Reglas de Negocio', () => {

        let equipo: Equipo;

        beforeEach(() => {
            equipo = new Equipo('id-123', 'EQ-001', 'VOLQUETE');
        });

        it('puedeOperar debe retornar true si estado es DISPONIBLE', () => {
            expect(equipo.puedeOperar()).toBe(true);
        });

        it('puedeOperar debe retornar false si estado es OPERANDO', () => {
            equipo.cambiarEstado('OPERANDO');
            expect(equipo.puedeOperar()).toBe(false);
        });

        it('puedeOperar debe retornar false si estado es MANTENIMIENTO', () => {
            equipo.cambiarEstado('MANTENIMIENTO');
            expect(equipo.puedeOperar()).toBe(false);
        });

        it('reiniciar debe resetear el equipo a valores iniciales', () => {
            equipo.cambiarEstado('MANTENIMIENTO');
            equipo.consumirCombustible(50);
            equipo.sumarHorasOperacion(200);

            equipo.reiniciar();

            expect(equipo.estado).toBe('DISPONIBLE');
            expect(equipo.nivelCombustible).toBe(100);
            expect(equipo.horasOperacion).toBe(0);
        });
    });

    describe('Verificación de Alertas', () => {

        it('debe generar alerta por combustible bajo', () => {
            const equipo = new Equipo('id-123', 'EQ-001', 'VOLQUETE', 5);
            const alertas: string[] = [];

            equipo.verificarAlertas((mensaje) => alertas.push(mensaje));

            expect(alertas.some(a => a.includes('bajo nivel de combustible'))).toBe(true);
        });

        it('debe generar alerta por horas de operación altas', () => {
            const equipo = new Equipo('id-123', 'EQ-001', 'EXCAVADORA', 100, 600);
            const alertas: string[] = [];

            equipo.verificarAlertas((mensaje) => alertas.push(mensaje));

            expect(alertas.some(a => a.includes('mantenimiento preventivo'))).toBe(true);
        });

        it('debe generar alerta si equipo está INACTIVO', () => {
            const equipo = new Equipo('id-123', 'EQ-001', 'VOLQUETE');
            equipo.cambiarEstado('INACTIVO');
            const alertas: string[] = [];

            equipo.verificarAlertas((mensaje) => alertas.push(mensaje));

            expect(alertas.some(a => a.includes('INACTIVO'))).toBe(true);
        });

        it('debe generar alerta si equipo está en MANTENIMIENTO', () => {
            const equipo = new Equipo('id-123', 'EQ-001', 'VOLQUETE');
            equipo.cambiarEstado('MANTENIMIENTO');
            const alertas: string[] = [];

            equipo.verificarAlertas((mensaje) => alertas.push(mensaje));

            expect(alertas.some(a => a.includes('mantenimiento'))).toBe(true);
        });

        it('no debe generar alertas si todo está bien', () => {
            const equipo = new Equipo('id-123', 'EQ-001', 'VOLQUETE', 50, 100);
            const alertas: string[] = [];

            equipo.verificarAlertas((mensaje) => alertas.push(mensaje));

            expect(alertas).toHaveLength(0);
        });
    });

    describe('DTO y Serialización', () => {

        it('obtenerInfo debe retornar todos los campos correctamente', () => {
            const equipo = new Equipo('id-123', 'EQ-001', 'BULLDOZER', 80, 250);
            const info = equipo.obtenerInfo();

            expect(info.id).toBe('id-123');
            expect(info.codigo).toBe('EQ-001');
            expect(info.tipo).toBe('BULLDOZER');
            expect(info.estado).toBe('DISPONIBLE');
            expect(info.nivelCombustible).toBe(80);
            expect(info.horasOperacion).toBe(250);
            expect(info.fechaCreacion).toBeInstanceOf(Date);
            expect(info.fechaActualizacion).toBeInstanceOf(Date);
        });

        it('historial debe ser inmutable (copia defensiva)', () => {
            const equipo = new Equipo('id-123', 'EQ-001', 'VOLQUETE');
            const historial = equipo.historial;

            historial.push({ accion: 'fake', fecha: new Date() });

            expect(equipo.historial.length).not.toBe(historial.length);
        });
    });
});
