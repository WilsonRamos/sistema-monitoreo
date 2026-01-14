/**
 * ==================================
 * PRUEBAS UNITARIAS - OPERACION
 * ==================================
 * Tests para la entidad Operacion (Aggregate Root)
 * Cobertura: Validaciones, asignación de equipos, finalización, reglas de negocio
 */

import { Operacion } from '../Operacion';

describe('Operacion - Domain Entity Tests', () => {

    describe('Constructor y Validaciones', () => {

        it('debe crear una operación válida con valores por defecto', () => {
            const operacion = new Operacion(
                'op-123',
                'CARGUE',
                'sup-001',
                'frente-A'
            );

            expect(operacion.id).toBe('op-123');
            expect(operacion.tipo).toBe('CARGUE');
            expect(operacion.supervisorId).toBe('sup-001');
            expect(operacion.frenteId).toBe('frente-A');
            expect(operacion.fechaInicio).toBeInstanceOf(Date);
            expect(operacion.fechaFin).toBeNull();
            expect(operacion.equiposAsignados).toEqual([]);
            expect(operacion.estaActiva()).toBe(true);
            expect(operacion.historial).toHaveLength(1);
        });

        it('debe crear operación con equipos asignados inicialmente', () => {
            const operacion = new Operacion(
                'op-123',
                'TRANSPORTE',
                'sup-002',
                'frente-B',
                new Date(),
                ['eq-001', 'eq-002']
            );

            expect(operacion.equiposAsignados).toEqual(['eq-001', 'eq-002']);
            expect(operacion.cantidadEquiposAsignados()).toBe(2);
        });

        it('debe rechazar tipo inválido', () => {
            expect(() => {
                new Operacion('op-123', 'TIPO_INVALIDO', 'sup-001', 'frente-A');
            }).toThrow('Tipo TIPO_INVALIDO no es válido');
        });

        it('debe rechazar supervisor vacío', () => {
            expect(() => {
                new Operacion('op-123', 'CARGUE', '', 'frente-A');
            }).toThrow('El ID del supervisor es obligatorio');
        });

        it('debe rechazar frente vacío', () => {
            expect(() => {
                new Operacion('op-123', 'CARGUE', 'sup-001', '');
            }).toThrow('El ID del frente es obligatorio');
        });

        it('debe aceptar todos los tipos válidos', () => {
            const tiposValidos = ['CARGUE', 'TRANSPORTE', 'DESCARGA'];

            tiposValidos.forEach(tipo => {
                const operacion = new Operacion('op-123', tipo, 'sup-001', 'frente-A');
                expect(operacion.tipo).toBe(tipo);
            });
        });
    });

    describe('Asignación de Equipos', () => {

        let operacion: Operacion;

        beforeEach(() => {
            operacion = new Operacion('op-123', 'CARGUE', 'sup-001', 'frente-A');
        });

        it('debe asignar equipo correctamente', () => {
            operacion.asignarEquipo('eq-001');

            expect(operacion.equiposAsignados).toContain('eq-001');
            expect(operacion.cantidadEquiposAsignados()).toBe(1);
        });

        it('debe asignar múltiples equipos', () => {
            operacion.asignarEquipo('eq-001');
            operacion.asignarEquipo('eq-002');
            operacion.asignarEquipo('eq-003');

            expect(operacion.cantidadEquiposAsignados()).toBe(3);
            expect(operacion.tieneEquipoAsignado('eq-002')).toBe(true);
        });

        it('debe rechazar equipo con ID vacío', () => {
            expect(() => {
                operacion.asignarEquipo('');
            }).toThrow('El ID del equipo es obligatorio');
        });

        it('debe rechazar equipo duplicado', () => {
            operacion.asignarEquipo('eq-001');

            expect(() => {
                operacion.asignarEquipo('eq-001');
            }).toThrow('ya está asignado a esta operación');
        });

        it('debe rechazar asignación si operación está finalizada', () => {
            operacion.finalizar();

            expect(() => {
                operacion.asignarEquipo('eq-001');
            }).toThrow('No se pueden asignar equipos a una operación finalizada');
        });

        it('debe registrar asignación en historial', () => {
            operacion.asignarEquipo('eq-001');
            const historial = operacion.historial;

            const registro = historial.find(h => h.accion === 'asignarEquipo');
            expect(registro).toBeDefined();
            expect(registro?.valor).toBe('eq-001');
        });
    });

    describe('Remoción de Equipos', () => {

        let operacion: Operacion;

        beforeEach(() => {
            operacion = new Operacion('op-123', 'TRANSPORTE', 'sup-001', 'frente-A');
            operacion.asignarEquipo('eq-001');
            operacion.asignarEquipo('eq-002');
            operacion.asignarEquipo('eq-003');
        });

        it('debe remover equipo correctamente', () => {
            operacion.removerEquipo('eq-002');

            expect(operacion.cantidadEquiposAsignados()).toBe(2);
            expect(operacion.tieneEquipoAsignado('eq-002')).toBe(false);
            expect(operacion.tieneEquipoAsignado('eq-001')).toBe(true);
            expect(operacion.tieneEquipoAsignado('eq-003')).toBe(true);
        });

        it('debe rechazar remoción de equipo no asignado', () => {
            expect(() => {
                operacion.removerEquipo('eq-999');
            }).toThrow('no está asignado a esta operación');
        });

        it('debe rechazar remoción si operación está finalizada', () => {
            operacion.finalizar();

            expect(() => {
                operacion.removerEquipo('eq-001');
            }).toThrow('No se pueden remover equipos de una operación finalizada');
        });

        it('debe registrar remoción en historial', () => {
            operacion.removerEquipo('eq-001');
            const historial = operacion.historial;

            const registro = historial.find(h => h.accion === 'removerEquipo');
            expect(registro).toBeDefined();
            expect(registro?.valor).toBe('eq-001');
        });
    });

    describe('Finalización de Operaciones', () => {

        let operacion: Operacion;

        beforeEach(() => {
            operacion = new Operacion('op-123', 'DESCARGA', 'sup-001', 'frente-A');
        });

        it('debe finalizar operación correctamente', () => {
            operacion.finalizar();

            expect(operacion.estaActiva()).toBe(false);
            expect(operacion.fechaFin).not.toBeNull();
            expect(operacion.fechaFin).toBeInstanceOf(Date);
        });

        it('debe rechazar finalización de operación ya finalizada', () => {
            operacion.finalizar();

            expect(() => {
                operacion.finalizar();
            }).toThrow('La operación ya está finalizada');
        });

        it('debe registrar finalización en historial', () => {
            operacion.finalizar();
            const historial = operacion.historial;

            const registro = historial.find(h => h.accion === 'finalizar');
            expect(registro).toBeDefined();
            expect(registro?.valor).toBeInstanceOf(Date);
        });

        it('fechaFin debe ser posterior a fechaInicio', () => {
            operacion.finalizar();

            expect(operacion.fechaFin!.getTime()).toBeGreaterThanOrEqual(operacion.fechaInicio.getTime());
        });
    });

    describe('Cálculo de Duración', () => {

        it('debe calcular duración para operación activa', () => {
            const operacion = new Operacion('op-123', 'CARGUE', 'sup-001', 'frente-A');

            // La duración debe ser muy pequeña (segundos)
            const duracion = operacion.calcularDuracionMinutos();
            expect(duracion).toBeGreaterThanOrEqual(0);
        });

        it('debe calcular duración para operación finalizada', (done) => {
            const operacion = new Operacion('op-123', 'CARGUE', 'sup-001', 'frente-A');

            // Esperar 100ms antes de finalizar
            setTimeout(() => {
                operacion.finalizar();
                const duracion = operacion.calcularDuracionMinutos();

                expect(duracion).toBeGreaterThanOrEqual(0);
                done();
            }, 100);
        });

        it('debe retornar duración en minutos (entero)', () => {
            const operacion = new Operacion('op-123', 'TRANSPORTE', 'sup-001', 'frente-A');
            const duracion = operacion.calcularDuracionMinutos();

            expect(Number.isInteger(duracion)).toBe(true);
        });
    });

    describe('Reglas de Negocio', () => {

        it('estaActiva debe retornar true si no ha sido finalizada', () => {
            const operacion = new Operacion('op-123', 'CARGUE', 'sup-001', 'frente-A');
            expect(operacion.estaActiva()).toBe(true);
        });

        it('estaActiva debe retornar false si ha sido finalizada', () => {
            const operacion = new Operacion('op-123', 'CARGUE', 'sup-001', 'frente-A');
            operacion.finalizar();
            expect(operacion.estaActiva()).toBe(false);
        });

        it('tieneEquipoAsignado debe retornar true si equipo está asignado', () => {
            const operacion = new Operacion('op-123', 'TRANSPORTE', 'sup-001', 'frente-A');
            operacion.asignarEquipo('eq-001');

            expect(operacion.tieneEquipoAsignado('eq-001')).toBe(true);
        });

        it('tieneEquipoAsignado debe retornar false si equipo no está asignado', () => {
            const operacion = new Operacion('op-123', 'TRANSPORTE', 'sup-001', 'frente-A');

            expect(operacion.tieneEquipoAsignado('eq-999')).toBe(false);
        });

        it('cantidadEquiposAsignados debe retornar cantidad correcta', () => {
            const operacion = new Operacion('op-123', 'DESCARGA', 'sup-001', 'frente-A');
            operacion.asignarEquipo('eq-001');
            operacion.asignarEquipo('eq-002');

            expect(operacion.cantidadEquiposAsignados()).toBe(2);
        });
    });

    describe('DTO y Serialización', () => {

        it('obtenerInfo debe retornar todos los campos correctamente', () => {
            const operacion = new Operacion(
                'op-123',
                'CARGUE',
                'sup-001',
                'frente-A',
                new Date(),
                ['eq-001', 'eq-002']
            );

            const info = operacion.obtenerInfo();

            expect(info.id).toBe('op-123');
            expect(info.tipo).toBe('CARGUE');
            expect(info.supervisorId).toBe('sup-001');
            expect(info.frenteId).toBe('frente-A');
            expect(info.fechaInicio).toBeInstanceOf(Date);
            expect(info.fechaFin).toBeNull();
            expect(info.equiposAsignados).toEqual(['eq-001', 'eq-002']);
            expect(info.cantidadEquipos).toBe(2);
            expect(info.duracionMinutos).toBeGreaterThanOrEqual(0);
            expect(info.estaActiva).toBe(true);
            expect(info.fechaCreacion).toBeInstanceOf(Date);
            expect(info.fechaActualizacion).toBeInstanceOf(Date);
        });

        it('equiposAsignados debe ser inmutable (copia defensiva)', () => {
            const operacion = new Operacion('op-123', 'CARGUE', 'sup-001', 'frente-A');
            operacion.asignarEquipo('eq-001');

            const equipos = operacion.equiposAsignados;
            equipos.push('eq-fake');

            expect(operacion.equiposAsignados.length).not.toBe(equipos.length);
        });

        it('historial debe ser inmutable (copia defensiva)', () => {
            const operacion = new Operacion('op-123', 'TRANSPORTE', 'sup-001', 'frente-A');
            const historial = operacion.historial;

            historial.push({ accion: 'fake', fecha: new Date() });

            expect(operacion.historial.length).not.toBe(historial.length);
        });
    });
});
