/**
 * ==================================
 * PRUEBAS UNITARIAS - CREAR EQUIPO USE CASE
 * ==================================
 * Tests para el caso de uso CrearEquipo (Application Layer)
 * Cobertura: Validaciones de DTO, lógica de negocio, integración con repositorio
 */

import { CrearEquipo, CrearEquipoDTO } from '../CrearEquipo';
import { IEquipoRepositorio } from '../../../dominio/repositorios/IEquipoRepositorio';
import { Equipo } from '../../../dominio/entidades/Equipo';

// Mock del repositorio
class MockEquipoRepositorio implements IEquipoRepositorio {
    private equipos: Map<string, Equipo> = new Map();
    private codigosExistentes: Set<string> = new Set();

    async crear(equipo: Equipo): Promise<void> {
        this.equipos.set(equipo.id, equipo);
        this.codigosExistentes.add(equipo.codigo);
    }

    async obtenerPorId(id: string): Promise<Equipo | null> {
        return this.equipos.get(id) || null;
    }

    async obtenerPorCodigo(codigo: string): Promise<Equipo | null> {
        for (const equipo of this.equipos.values()) {
            if (equipo.codigo === codigo) {
                return equipo;
            }
        }
        return null;
    }

    async obtenerTodos(): Promise<Equipo[]> {
        return Array.from(this.equipos.values());
    }

    async buscarPorTipo(tipo: string): Promise<Equipo[]> {
        return Array.from(this.equipos.values()).filter(e => e.tipo === tipo);
    }

    async buscarPorEstado(estado: string): Promise<Equipo[]> {
        return Array.from(this.equipos.values()).filter(e => e.estado === estado);
    }

    async existeConCodigo(codigo: string): Promise<boolean> {
        return this.codigosExistentes.has(codigo);
    }

    async actualizar(equipo: Equipo): Promise<void> {
        this.equipos.set(equipo.id, equipo);
    }

    async eliminar(id: string): Promise<void> {
        const equipo = this.equipos.get(id);
        if (equipo) {
            this.codigosExistentes.delete(equipo.codigo);
            this.equipos.delete(id);
        }
    }

    // Helper para tests
    simularCodigoExistente(codigo: string): void {
        this.codigosExistentes.add(codigo);
    }

    reset(): void {
        this.equipos.clear();
        this.codigosExistentes.clear();
    }
}

describe('CrearEquipo - Use Case Tests', () => {

    let crearEquipo: CrearEquipo;
    let mockRepositorio: MockEquipoRepositorio;

    beforeEach(() => {
        mockRepositorio = new MockEquipoRepositorio();
        crearEquipo = new CrearEquipo(mockRepositorio);
    });

    afterEach(() => {
        mockRepositorio.reset();
    });

    describe('Creación Exitosa', () => {

        it('debe crear equipo correctamente con datos válidos', async () => {
            const dto: CrearEquipoDTO = {
                codigo: 'VOL-001',
                tipo: 'VOLQUETE'
            };

            const resultado = await crearEquipo.ejecutar(dto);

            expect(resultado.success).toBe(true);
            expect(resultado.data).toBeDefined();
            expect(resultado.data.codigo).toBe('VOL-001');
            expect(resultado.data.tipo).toBe('VOLQUETE');
            expect(resultado.data.estado).toBe('DISPONIBLE');
            expect(resultado.data.nivelCombustible).toBe(100);
            expect(resultado.data.horasOperacion).toBe(0);
        });

        it('debe crear equipo con valores personalizados', async () => {
            const dto: CrearEquipoDTO = {
                codigo: 'EXC-002',
                tipo: 'EXCAVADORA',
                nivelCombustible: 75,
                horasOperacion: 150
            };

            const resultado = await crearEquipo.ejecutar(dto);

            expect(resultado.success).toBe(true);
            expect(resultado.data.nivelCombustible).toBe(75);
            expect(resultado.data.horasOperacion).toBe(150);
        });

        it('debe generar ID único usando crypto.randomUUID', async () => {
            const dto: CrearEquipoDTO = {
                codigo: 'BULL-003',
                tipo: 'BULLDOZER'
            };

            const resultado = await crearEquipo.ejecutar(dto);

            expect(resultado.success).toBe(true);
            expect(resultado.data.id).toBeDefined();
            expect(typeof resultado.data.id).toBe('string');
            // UUID v4 format check
            expect(resultado.data.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        });

        it('debe persistir equipo en el repositorio', async () => {
            const dto: CrearEquipoDTO = {
                codigo: 'GRUA-004',
                tipo: 'GRUA'
            };

            const resultado = await crearEquipo.ejecutar(dto);
            const equipoGuardado = await mockRepositorio.obtenerPorCodigo('GRUA-004');

            expect(resultado.success).toBe(true);
            expect(equipoGuardado).not.toBeNull();
            expect(equipoGuardado?.codigo).toBe('GRUA-004');
        });
    });

    describe('Validaciones de DTO', () => {

        it('debe rechazar código vacío', async () => {
            const dto: CrearEquipoDTO = {
                codigo: '',
                tipo: 'VOLQUETE'
            };

            const resultado = await crearEquipo.ejecutar(dto);

            expect(resultado.success).toBe(false);
            expect(resultado.error).toContain('código es obligatorio');
        });

        it('debe rechazar código con solo espacios', async () => {
            const dto: CrearEquipoDTO = {
                codigo: '   ',
                tipo: 'EXCAVADORA'
            };

            const resultado = await crearEquipo.ejecutar(dto);

            expect(resultado.success).toBe(false);
            expect(resultado.error).toBeDefined();
        });

        it('debe rechazar tipo vacío', async () => {
            const dto: CrearEquipoDTO = {
                codigo: 'EQ-001',
                tipo: ''
            };

            const resultado = await crearEquipo.ejecutar(dto);

            expect(resultado.success).toBe(false);
            expect(resultado.error).toContain('tipo es obligatorio');
        });

        it('debe rechazar tipo con solo espacios', async () => {
            const dto: CrearEquipoDTO = {
                codigo: 'EQ-001',
                tipo: '   '
            };

            const resultado = await crearEquipo.ejecutar(dto);

            expect(resultado.success).toBe(false);
            expect(resultado.error).toBeDefined();
        });
    });

    describe('Validaciones de Negocio', () => {

        it('debe rechazar código duplicado', async () => {
            mockRepositorio.simularCodigoExistente('VOL-001');

            const dto: CrearEquipoDTO = {
                codigo: 'VOL-001',
                tipo: 'VOLQUETE'
            };

            const resultado = await crearEquipo.ejecutar(dto);

            expect(resultado.success).toBe(false);
            expect(resultado.error).toContain('Ya existe un equipo con el código');
            expect(resultado.error).toContain('VOL-001');
        });

        it('debe rechazar código menor a 3 caracteres (validación de dominio)', async () => {
            const dto: CrearEquipoDTO = {
                codigo: 'AB',
                tipo: 'VOLQUETE'
            };

            const resultado = await crearEquipo.ejecutar(dto);

            expect(resultado.success).toBe(false);
            expect(resultado.error).toContain('3 caracteres');
        });

        it('debe rechazar tipo inválido (validación de dominio)', async () => {
            const dto: CrearEquipoDTO = {
                codigo: 'EQ-001',
                tipo: 'TIPO_INVALIDO'
            };

            const resultado = await crearEquipo.ejecutar(dto);

            expect(resultado.success).toBe(false);
            expect(resultado.error).toContain('no es válido');
        });
    });

    describe('Manejo de Errores', () => {

        it('debe capturar errores de validación del dominio', async () => {
            const dto: CrearEquipoDTO = {
                codigo: '',
                tipo: 'VOLQUETE'
            };

            const resultado = await crearEquipo.ejecutar(dto);

            expect(resultado.success).toBe(false);
            expect(resultado.error).toBeDefined();
            expect(typeof resultado.error).toBe('string');
        });
    });

    describe('Tipos Válidos', () => {

        it('debe crear equipos de todos los tipos válidos', async () => {
            const tiposValidos = ['VOLQUETE', 'EXCAVADORA', 'BULLDOZER', 'GRUA', 'PERFORADORA'];

            for (const tipo of tiposValidos) {
                const dto: CrearEquipoDTO = {
                    codigo: `${tipo}-001`,
                    tipo
                };

                const resultado = await crearEquipo.ejecutar(dto);

                expect(resultado.success).toBe(true);
                expect(resultado.data.tipo).toBe(tipo);
            }
        });
    });

    describe('Integración con Dominio', () => {

        it('debe crear entidad de dominio con todas las propiedades inicializadas', async () => {
            const dto: CrearEquipoDTO = {
                codigo: 'PERF-001',
                tipo: 'PERFORADORA'
            };

            const resultado = await crearEquipo.ejecutar(dto);

            expect(resultado.success).toBe(true);
            expect(resultado.data.fechaCreacion).toBeDefined();
            expect(resultado.data.fechaActualizacion).toBeDefined();
        });

        it('debe crear equipo con historial inicializado', async () => {
            const dto: CrearEquipoDTO = {
                codigo: 'VOL-002',
                tipo: 'VOLQUETE'
            };

            const resultado = await crearEquipo.ejecutar(dto);
            const equipoGuardado = await mockRepositorio.obtenerPorCodigo('VOL-002');

            expect(resultado.success).toBe(true);
            expect(equipoGuardado).not.toBeNull();
            expect(equipoGuardado?.historial.length).toBeGreaterThan(0);
        });
    });
});
