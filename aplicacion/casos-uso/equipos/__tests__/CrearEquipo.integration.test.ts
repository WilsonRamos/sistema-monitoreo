

import { CrearEquipo } from '../CrearEquipo';
import { IEquipoRepositorio } from '../../../../Dominio/repositorios/IEquipoRepositorio';

describe('CrearEquipo - Pruebas de Integración con Mocks', () => {
    // ===================================
    // MOCKS Y SETUP
    // ===================================

    let mockRepository: jest.Mocked<IEquipoRepositorio>;
    let crearEquipoUseCase: CrearEquipo;

    beforeEach(() => {
        mockRepository = {
            crear: jest.fn(),
            obtenerTodos: jest.fn(),
            obtenerPorId: jest.fn(),
            actualizar: jest.fn(),
            eliminar: jest.fn(),
            buscarPorTipo: jest.fn(),
            buscarPorEstado: jest.fn(),
            existeConCodigo: jest.fn()
        };

        // Crear instancia del caso de uso con el mock
        crearEquipoUseCase = new CrearEquipo(mockRepository);
    });

    afterEach(() => {
        // Limpiar todos los mocks después de cada prueba
        jest.clearAllMocks();
    });

    // ===================================
    // 1. PRUEBAS DE CASO EXITOSO
    // ===================================

    describe('Caso exitoso', () => {

        test('Debería crear un equipo válido usando el repositorio', async () => {
            // Arrange
            const codigo = 'VOL-TEST-001';
            const tipo = 'VOLQUETE';
            const nivelCombustible = 100;
            const horasOperacion = 0;

            // Configurar el mock: simular que NO existe código duplicado
            mockRepository.existeConCodigo.mockResolvedValue(false);
            mockRepository.crear.mockResolvedValue(undefined);

            // Act
            const id = await crearEquipoUseCase.ejecutar(codigo, tipo, nivelCombustible, horasOperacion);

            // Assert
            // Verificar que retorna un ID
            expect(id).toBeDefined();
            expect(typeof id).toBe('string');

            // Verificar que se llamó a existeConCodigo con el código correcto
            expect(mockRepository.existeConCodigo).toHaveBeenCalledWith('VOL-TEST-001');
            expect(mockRepository.existeConCodigo).toHaveBeenCalledTimes(1);

            // Verificar que se llamó a crear con un equipo válido
            expect(mockRepository.crear).toHaveBeenCalledTimes(1);
            expect(mockRepository.crear).toHaveBeenCalledWith(
                expect.objectContaining({
                    codigo: 'VOL-TEST-001',
                    tipo: 'VOLQUETE',
                    nivelCombustible: 100,
                    horasOperacion: 0
                })
            );
        });

        test('Debería crear equipo con valores iniciales correctos', async () => {
            // Arrange
            const codigo = 'EXC-TEST-001';
            const tipo = 'EXCAVADORA';
            const nivelCombustible = 75;
            const horasOperacion = 50;

            mockRepository.existeConCodigo.mockResolvedValue(false);
            mockRepository.crear.mockResolvedValue(undefined);

            // Act
            await crearEquipoUseCase.ejecutar(codigo, tipo, nivelCombustible, horasOperacion);

            // Assert
            expect(mockRepository.crear).toHaveBeenCalledWith(
                expect.objectContaining({
                    codigo: 'EXC-TEST-001',
                    tipo: 'EXCAVADORA',
                    nivelCombustible: 75,
                    horasOperacion: 50
                })
            );
        });
    });

    // ===================================
    // 2. PRUEBAS DE VALIDACIONES
    // ===================================

    describe('Validaciones de negocio', () => {

        test('NO debería crear equipo con código duplicado', async () => {
            // Arrange
            const codigo = 'VOL-DUPLICADO';
            const tipo = 'VOLQUETE';

            // Configurar el mock: simular que YA existe el código
            mockRepository.existeConCodigo.mockResolvedValue(true);

            // Act & Assert
            await expect(
                crearEquipoUseCase.ejecutar(codigo, tipo, 100, 0)
            ).rejects.toThrow('Ya existe un equipo');

            // Verificar que NO se intentó crear
            expect(mockRepository.crear).not.toHaveBeenCalled();
        });

        test('NO debería crear equipo con código vacío', async () => {
            // Arrange
            const codigo = ''; // Código vacío - INVÁLIDO
            const tipo = 'VOLQUETE';

            mockRepository.existeConCodigo.mockResolvedValue(false);

            // Act & Assert
            await expect(
                crearEquipoUseCase.ejecutar(codigo, tipo, 100, 0)
            ).rejects.toThrow();

            // Verificar que NO se intentó crear
            expect(mockRepository.crear).not.toHaveBeenCalled();
        });

        test('NO debería crear equipo con tipo inválido', async () => {
            // Arrange
            const codigo = 'VOL-TIPO-INV';
            const tipo = 'TIPO_INEXISTENTE';

            mockRepository.existeConCodigo.mockResolvedValue(false);

            // Act & Assert
            await expect(
                crearEquipoUseCase.ejecutar(codigo, tipo, 100, 0)
            ).rejects.toThrow('no es válido');

            // Verificar que NO se intentó crear
            expect(mockRepository.crear).not.toHaveBeenCalled();
        });

        test('NO debería crear equipo con combustible negativo', async () => {
            // Arrange
            const codigo = 'VOL-COMB-NEG';
            const tipo = 'VOLQUETE';

            mockRepository.existeConCodigo.mockResolvedValue(false);

            // Act & Assert
            await expect(
                crearEquipoUseCase.ejecutar(codigo, tipo, -10, 0)
            ).rejects.toThrow('combustible no puede ser negativo');

            expect(mockRepository.crear).not.toHaveBeenCalled();
        });

        test('NO debería crear equipo con horas negativas', async () => {
            // Arrange
            const codigo = 'VOL-HORAS-NEG';
            const tipo = 'VOLQUETE';

            mockRepository.existeConCodigo.mockResolvedValue(false);

            // Act & Assert
            await expect(
                crearEquipoUseCase.ejecutar(codigo, tipo, 100, -5)
            ).rejects.toThrow('horas de operación no pueden ser negativas');

            expect(mockRepository.crear).not.toHaveBeenCalled();
        });
    });

    // ===================================
    // 3. PRUEBAS DE MANEJO DE ERRORES
    // ===================================

    describe('Manejo de errores del repositorio', () => {

        test('Debería propagar errores del repositorio al verificar existencia', async () => {
            // Arrange
            const codigo = 'VOL-ERR';
            const tipo = 'VOLQUETE';

            // Simular error en el repositorio
            mockRepository.existeConCodigo.mockRejectedValue(new Error('Error de base de datos'));

            // Act & Assert
            await expect(
                crearEquipoUseCase.ejecutar(codigo, tipo, 100, 0)
            ).rejects.toThrow('Error de base de datos');
        });

        test('Debería propagar errores del repositorio al crear', async () => {
            // Arrange
            const codigo = 'VOL-ERR-2';
            const tipo = 'VOLQUETE';

            mockRepository.existeConCodigo.mockResolvedValue(false);
            mockRepository.crear.mockRejectedValue(new Error('Error al guardar'));

            // Act & Assert
            await expect(
                crearEquipoUseCase.ejecutar(codigo, tipo, 100, 0)
            ).rejects.toThrow('Error al guardar');
        });
    });

    // ===================================
    // 4. PRUEBAS DE INTERACCIÓN (Behavior Verification)
    // ===================================

    describe('Verificación de comportamiento (interacciones)', () => {

        test('Debería verificar existencia ANTES de crear', async () => {
            // Arrange
            const codigo = 'VOL-ORDER';
            const tipo = 'VOLQUETE';

            const callOrder: string[] = [];

            mockRepository.existeConCodigo.mockImplementation(async () => {
                callOrder.push('existeConCodigo');
                return false;
            });

            mockRepository.crear.mockImplementation(async () => {
                callOrder.push('crear');
            });

            // Act
            await crearEquipoUseCase.ejecutar(codigo, tipo, 100, 0);

            // Assert
            expect(callOrder).toEqual(['existeConCodigo', 'crear']);
        });

        test('NO debería llamar a otros métodos del repositorio', async () => {
            // Arrange
            const codigo = 'VOL-ISOLATED';
            const tipo = 'VOLQUETE';

            mockRepository.existeConCodigo.mockResolvedValue(false);
            mockRepository.crear.mockResolvedValue(undefined);

            // Act
            await crearEquipoUseCase.ejecutar(codigo, tipo, 100, 0);

            // Assert
            expect(mockRepository.obtenerTodos).not.toHaveBeenCalled();
            expect(mockRepository.obtenerPorId).not.toHaveBeenCalled();
            expect(mockRepository.actualizar).not.toHaveBeenCalled();
            expect(mockRepository.eliminar).not.toHaveBeenCalled();
            expect(mockRepository.buscarPorTipo).not.toHaveBeenCalled();
            expect(mockRepository.buscarPorEstado).not.toHaveBeenCalled();
        });
    });

    // ===================================
    // 5. PRUEBAS PARAMÉTRICAS (Data-Driven Tests)
    // ===================================

    describe('Pruebas paramétricas con diferentes tipos de equipos', () => {

        test.each([
            ['VOLQUETE', 'VOL-001'],
            ['EXCAVADORA', 'EXC-001'],
            ['BULLDOZER', 'BUL-001'],
            ['GRUA', 'GRU-001'],
            ['PERFORADORA', 'PER-001']
        ])('Debería crear equipo de tipo %s', async (tipo, codigo) => {
            // Arrange
            mockRepository.existeConCodigo.mockResolvedValue(false);
            mockRepository.crear.mockResolvedValue(undefined);

            // Act
            await crearEquipoUseCase.ejecutar(codigo, tipo, 100, 0);

            // Assert
            expect(mockRepository.crear).toHaveBeenCalledWith(
                expect.objectContaining({
                    tipo: tipo
                })
            );
        });
    });

    // ==========================================
    // NUEVAS PRUEBAS: UUID v4 SECURITY FIX
    // ==========================================
    describe('Seguridad de IDs generados (UUID v4)', () => {
        it('debe generar IDs únicos en múltiples llamadas', async () => {
            // Arrange
            const ids = new Set<string>();
            const iteraciones = 100;

            // Act - Generar 100 IDs
            for (let i = 0; i < iteraciones; i++) {
                const codigo = `EQ-${i.toString().padStart(3, '0')}`;
                const id = await crearEquipoUseCase.ejecutar(codigo, 'VOLQUETE', 100, 0);
                ids.add(id);

                // Reset mock para siguiente iteración
                mockRepository.existeConCodigo.mockResolvedValue(false);
            }

            // Assert - No debe haber duplicados
            expect(ids.size).toBe(iteraciones);
        });

        it('debe generar IDs en formato UUID v4 válido', async () => {
            // Arrange
            // Regex para validar UUID v4 según RFC 4122
            const uuidV4Regex = /^equipo-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

            // Act
            const id = await crearEquipoUseCase.ejecutar('EQ-UUID-TEST', 'VOLQUETE', 100, 0);

            // Assert
            expect(id).toMatch(uuidV4Regex);
        });

        it('debe generar IDs no predecibles', async () => {
            // Arrange
            const ids: string[] = [];

            // Act - Generar 10 IDs consecutivos
            for (let i = 0; i < 10; i++) {
                const codigo = `EQ-PRED-${i.toString().padStart(3, '0')}`;
                const id = await crearEquipoUseCase.ejecutar(codigo, 'VOLQUETE', 100, 0);
                ids.push(id);
                mockRepository.existeConCodigo.mockResolvedValue(false);
            }

            // Assert - Los IDs no deben seguir un patrón incremental
            // Extraer la primera parte del UUID (después de "equipo-")
            const numericParts = ids.map(id => {
                const match = id.match(/equipo-([0-9a-f]+)-/);
                return match ? parseInt(match[1], 16) : 0;
            });

            // Verificar que no son secuenciales (diferencia no es constante)
            const diferencias: number[] = [];
            for (let i = 1; i < numericParts.length; i++) {
                diferencias.push(numericParts[i] - numericParts[i - 1]);
            }

            // Las diferencias deben variar (no ser todas iguales)
            const diferenciaUnica = new Set(diferencias).size;
            expect(diferenciaUnica).toBeGreaterThan(1);
        });

        it('debe generar IDs compatibles con estándar RFC 4122', async () => {
            // Act
            const id = await crearEquipoUseCase.ejecutar('EQ-RFC-TEST', 'VOLQUETE', 100, 0);

            // Assert
            const uuidPart = id.replace('equipo-', '');
            const parts = uuidPart.split('-');

            // RFC 4122 UUID v4 structure: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
            expect(parts).toHaveLength(5);
            expect(parts[0]).toHaveLength(8);  // time-low
            expect(parts[1]).toHaveLength(4);  // time-mid
            expect(parts[2]).toHaveLength(4);  // time-high-and-version
            expect(parts[3]).toHaveLength(4);  // clock-seq-and-reserved
            expect(parts[4]).toHaveLength(12); // node

            // Version 4 indicator (4xxx en la 3ra sección)
            expect(parts[2][0]).toBe('4');

            // Variant indicator (8, 9, a, o b en la 4ta sección)
            expect(['8', '9', 'a', 'b']).toContain(parts[3][0].toLowerCase());
        });

        it('debe funcionar correctamente con el flujo completo de creación', async () => {
            // Arrange
            const codigo = 'VOL-INTEGRATION-001';
            const tipo = 'VOLQUETE';

            // Act
            const id = await crearEquipoUseCase.ejecutar(codigo, tipo, 100, 0);

            // Assert
            expect(id).toBeDefined();
            expect(id).toContain('equipo-');
            expect(mockRepository.crear).toHaveBeenCalledWith(
                expect.objectContaining({
                    codigo,
                    tipo,
                })
            );
        });
    });
});
