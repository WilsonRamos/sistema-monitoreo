/**
 * ==================================
 * PRUEBAS UNITARIAS - INICIAR OPERACION USE CASE
 * ==================================
 * Tests para el caso de uso IniciarOperacion (Application Layer)
 * Cobertura: Validaciones de DTO, lógica de negocio, integración con repositorio
 */

import { IniciarOperacion, IniciarOperacionDTO } from '../IniciarOperacion';
import { IOperacionRepositorio } from '../../../dominio/repositorios/IOperacionRepositorio';
import { Operacion } from '../../../dominio/entidades/Operacion';

// Mock del repositorio
class MockOperacionRepositorio implements IOperacionRepositorio {
    private operaciones: Map<string, Operacion> = new Map();

    async crear(operacion: Operacion): Promise<void> {
        this.operaciones.set(operacion.id, operacion);
    }

    async obtenerPorId(id: string): Promise<Operacion | null> {
        return this.operaciones.get(id) || null;
    }

    async obtenerTodas(): Promise<Operacion[]> {
        return Array.from(this.operaciones.values());
    }

    async obtenerActivas(): Promise<Operacion[]> {
        return Array.from(this.operaciones.values()).filter(op => op.estaActiva());
    }

    async obtenerPorSupervisor(supervisorId: string): Promise<Operacion[]> {
        return Array.from(this.operaciones.values()).filter(op => op.supervisorId === supervisorId);
    }

    async obtenerPorFrente(frenteId: string): Promise<Operacion[]> {
        return Array.from(this.operaciones.values()).filter(op => op.frenteId === frenteId);
    }

    async actualizar(operacion: Operacion): Promise<void> {
        this.operaciones.set(operacion.id, operacion);
    }

    async eliminar(id: string): Promise<void> {
        this.operaciones.delete(id);
    }

    reset(): void {
        this.operaciones.clear();
    }
}

describe('IniciarOperacion - Use Case Tests', () => {

    let iniciarOperacion: IniciarOperacion;
    let mockRepositorio: MockOperacionRepositorio;

    beforeEach(() => {
        mockRepositorio = new MockOperacionRepositorio();
        iniciarOperacion = new IniciarOperacion(mockRepositorio);
    });

    afterEach(() => {
        mockRepositorio.reset();
    });

    describe('Creación Exitosa', () => {

        it('debe iniciar operación correctamente con datos mínimos', async () => {
            const dto: IniciarOperacionDTO = {
                tipo: 'CARGUE',
                supervisorId: 'SUP-001',
                frenteId: 'FRENTE-A'
            };

            const resultado = await iniciarOperacion.ejecutar(dto);

            expect(resultado.success).toBe(true);
            expect(resultado.data).toBeDefined();
            expect(resultado.data.tipo).toBe('CARGUE');
            expect(resultado.data.supervisorId).toBe('SUP-001');
            expect(resultado.data.frenteId).toBe('FRENTE-A');
            expect(resultado.data.estaActiva).toBe(true);
            expect(resultado.data.fechaFin).toBeNull();
            expect(resultado.data.equiposAsignados).toEqual([]);
        });

        it('debe iniciar operación con equipos asignados', async () => {
            const dto: IniciarOperacionDTO = {
                tipo: 'TRANSPORTE',
                supervisorId: 'SUP-002',
                frenteId: 'FRENTE-B',
                equiposAsignados: ['EQ-001', 'EQ-002', 'EQ-003']
            };

            const resultado = await iniciarOperacion.ejecutar(dto);

            expect(resultado.success).toBe(true);
            expect(resultado.data.equiposAsignados).toEqual(['EQ-001', 'EQ-002', 'EQ-003']);
            expect(resultado.data.cantidadEquipos).toBe(3);
        });

        it('debe generar ID único usando crypto.randomUUID', async () => {
            const dto: IniciarOperacionDTO = {
                tipo: 'DESCARGA',
                supervisorId: 'SUP-003',
                frenteId: 'FRENTE-C'
            };

            const resultado = await iniciarOperacion.ejecutar(dto);

            expect(resultado.success).toBe(true);
            expect(resultado.data.id).toBeDefined();
            expect(typeof resultado.data.id).toBe('string');
            // UUID v4 format check
            expect(resultado.data.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        });

        it('debe persistir operación en el repositorio', async () => {
            const dto: IniciarOperacionDTO = {
                tipo: 'CARGUE',
                supervisorId: 'SUP-004',
                frenteId: 'FRENTE-D'
            };

            const resultado = await iniciarOperacion.ejecutar(dto);
            const operaciones = await mockRepositorio.obtenerTodas();

            expect(resultado.success).toBe(true);
            expect(operaciones.length).toBe(1);
            expect(operaciones[0].supervisorId).toBe('SUP-004');
        });

        it('debe establecer fechaInicio automáticamente', async () => {
            const dto: IniciarOperacionDTO = {
                tipo: 'CARGUE',
                supervisorId: 'SUP-001',
                frenteId: 'FRENTE-A'
            };

            const antes = new Date();
            const resultado = await iniciarOperacion.ejecutar(dto);
            const despues = new Date();

            expect(resultado.success).toBe(true);
            const fechaInicio = new Date(resultado.data.fechaInicio);
            expect(fechaInicio.getTime()).toBeGreaterThanOrEqual(antes.getTime());
            expect(fechaInicio.getTime()).toBeLessThanOrEqual(despues.getTime());
        });
    });

    describe('Validaciones de DTO', () => {

        it('debe rechazar tipo vacío', async () => {
            const dto: IniciarOperacionDTO = {
                tipo: '',
                supervisorId: 'SUP-001',
                frenteId: 'FRENTE-A'
            };

            const resultado = await iniciarOperacion.ejecutar(dto);

            expect(resultado.success).toBe(false);
            expect(resultado.error).toContain('tipo de operación es obligatorio');
        });

        it('debe rechazar tipo con solo espacios', async () => {
            const dto: IniciarOperacionDTO = {
                tipo: '   ',
                supervisorId: 'SUP-001',
                frenteId: 'FRENTE-A'
            };

            const resultado = await iniciarOperacion.ejecutar(dto);

            expect(resultado.success).toBe(false);
            expect(resultado.error).toBeDefined();
        });

        it('debe rechazar supervisorId vacío', async () => {
            const dto: IniciarOperacionDTO = {
                tipo: 'CARGUE',
                supervisorId: '',
                frenteId: 'FRENTE-A'
            };

            const resultado = await iniciarOperacion.ejecutar(dto);

            expect(resultado.success).toBe(false);
            expect(resultado.error).toContain('supervisor es obligatorio');
        });

        it('debe rechazar supervisorId con solo espacios', async () => {
            const dto: IniciarOperacionDTO = {
                tipo: 'CARGUE',
                supervisorId: '   ',
                frenteId: 'FRENTE-A'
            };

            const resultado = await iniciarOperacion.ejecutar(dto);

            expect(resultado.success).toBe(false);
            expect(resultado.error).toBeDefined();
        });

        it('debe rechazar frenteId vacío', async () => {
            const dto: IniciarOperacionDTO = {
                tipo: 'TRANSPORTE',
                supervisorId: 'SUP-001',
                frenteId: ''
            };

            const resultado = await iniciarOperacion.ejecutar(dto);

            expect(resultado.success).toBe(false);
            expect(resultado.error).toContain('frente es obligatorio');
        });

        it('debe rechazar frenteId con solo espacios', async () => {
            const dto: IniciarOperacionDTO = {
                tipo: 'DESCARGA',
                supervisorId: 'SUP-001',
                frenteId: '   '
            };

            const resultado = await iniciarOperacion.ejecutar(dto);

            expect(resultado.success).toBe(false);
            expect(resultado.error).toBeDefined();
        });
    });

    describe('Validaciones de Negocio', () => {

        it('debe rechazar tipo inválido (validación de dominio)', async () => {
            const dto: IniciarOperacionDTO = {
                tipo: 'TIPO_INVALIDO',
                supervisorId: 'SUP-001',
                frenteId: 'FRENTE-A'
            };

            const resultado = await iniciarOperacion.ejecutar(dto);

            expect(resultado.success).toBe(false);
            expect(resultado.error).toContain('no es válido');
        });

        it('debe aceptar todos los tipos válidos', async () => {
            const tiposValidos = ['CARGUE', 'TRANSPORTE', 'DESCARGA'];

            for (const tipo of tiposValidos) {
                mockRepositorio.reset();
                const dto: IniciarOperacionDTO = {
                    tipo,
                    supervisorId: 'SUP-001',
                    frenteId: 'FRENTE-A'
                };

                const resultado = await iniciarOperacion.ejecutar(dto);

                expect(resultado.success).toBe(true);
                expect(resultado.data.tipo).toBe(tipo);
            }
        });
    });

    describe('Manejo de Errores', () => {

        it('debe retornar error si el repositorio falla', async () => {
            const repositorioConError = new MockOperacionRepositorio();
            repositorioConError.crear = async () => {
                throw new Error('Error de base de datos');
            };

            const useCaseConError = new IniciarOperacion(repositorioConError);

            const dto: IniciarOperacionDTO = {
                tipo: 'CARGUE',
                supervisorId: 'SUP-001',
                frenteId: 'FRENTE-A'
            };

            const resultado = await useCaseConError.ejecutar(dto);

            expect(resultado.success).toBe(false);
            expect(resultado.error).toBeDefined();
        });

        it('debe capturar errores de validación del dominio', async () => {
            const dto: IniciarOperacionDTO = {
                tipo: '',
                supervisorId: 'SUP-001',
                frenteId: 'FRENTE-A'
            };

            const resultado = await iniciarOperacion.ejecutar(dto);

            expect(resultado.success).toBe(false);
            expect(resultado.error).toBeDefined();
            expect(typeof resultado.error).toBe('string');
        });
    });

    describe('Integración con Dominio', () => {

        it('debe crear entidad de dominio con todas las propiedades inicializadas', async () => {
            const dto: IniciarOperacionDTO = {
                tipo: 'CARGUE',
                supervisorId: 'SUP-005',
                frenteId: 'FRENTE-E'
            };

            const resultado = await iniciarOperacion.ejecutar(dto);

            expect(resultado.success).toBe(true);
            expect(resultado.data.fechaInicio).toBeDefined();
            expect(resultado.data.fechaCreacion).toBeDefined();
            expect(resultado.data.fechaActualizacion).toBeDefined();
            expect(resultado.data.duracionMinutos).toBeDefined();
        });

        it('debe crear operación con historial inicializado', async () => {
            const dto: IniciarOperacionDTO = {
                tipo: 'TRANSPORTE',
                supervisorId: 'SUP-006',
                frenteId: 'FRENTE-F'
            };

            const resultado = await iniciarOperacion.ejecutar(dto);
            const operacionGuardada = await mockRepositorio.obtenerPorId(resultado.data.id);

            expect(resultado.success).toBe(true);
            expect(operacionGuardada).not.toBeNull();
            expect(operacionGuardada?.historial.length).toBeGreaterThan(0);
        });

        it('debe iniciar operación como activa', async () => {
            const dto: IniciarOperacionDTO = {
                tipo: 'DESCARGA',
                supervisorId: 'SUP-007',
                frenteId: 'FRENTE-G'
            };

            const resultado = await iniciarOperacion.ejecutar(dto);
            const operacionesActivas = await mockRepositorio.obtenerActivas();

            expect(resultado.success).toBe(true);
            expect(operacionesActivas.length).toBe(1);
            expect(operacionesActivas[0].id).toBe(resultado.data.id);
        });
    });

    describe('Equipos Asignados', () => {

        it('debe iniciar con array vacío si no se especifican equipos', async () => {
            const dto: IniciarOperacionDTO = {
                tipo: 'CARGUE',
                supervisorId: 'SUP-001',
                frenteId: 'FRENTE-A'
            };

            const resultado = await iniciarOperacion.ejecutar(dto);

            expect(resultado.success).toBe(true);
            expect(Array.isArray(resultado.data.equiposAsignados)).toBe(true);
            expect(resultado.data.equiposAsignados.length).toBe(0);
        });

        it('debe preservar orden de equipos asignados', async () => {
            const dto: IniciarOperacionDTO = {
                tipo: 'TRANSPORTE',
                supervisorId: 'SUP-002',
                frenteId: 'FRENTE-B',
                equiposAsignados: ['EQ-003', 'EQ-001', 'EQ-002']
            };

            const resultado = await iniciarOperacion.ejecutar(dto);

            expect(resultado.success).toBe(true);
            expect(resultado.data.equiposAsignados).toEqual(['EQ-003', 'EQ-001', 'EQ-002']);
        });
    });
});
