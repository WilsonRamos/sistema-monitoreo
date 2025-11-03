/**
 * ========================================================
 * TUTORIAL: MOCKS BÁSICOS CON JEST - PASO A PASO
 * ========================================================
 *
 * Este archivo te enseña desde cero cómo funcionan los mocks
 * con ejemplos simples y progresivos.
 */

// ========================================================
// EJEMPLO 1: ¿QUÉ ES UN MOCK? - Analogía del Mundo Real
// ========================================================

describe('1. CONCEPTO: ¿Qué es un Mock?', () => {

    test('Analogía: Mock vs Real', () => {
        /**
         * MUNDO REAL:
         * - Un auto REAL: tiene motor, consume gasolina, se mueve de verdad
         * - Un auto de JUGUETE (mock): simula ser un auto, pero NO tiene motor real
         *
         * PROGRAMACIÓN:
         * - Una función REAL: ejecuta código, hace cálculos, accede a BD
         * - Una función MOCK: simula ser la función, pero NO ejecuta código real
         */

        // Función REAL
        function sumarReal(a: number, b: number): number {
            console.log('Ejecutando código real...');
            return a + b; // Ejecuta la lógica real
        }

        // Función MOCK (simulada con Jest)
        const sumarMock = jest.fn(); // NO ejecuta código real
        sumarMock.mockReturnValue(10); // Le decimos qué retornar

        // Uso:
        const resultadoReal = sumarReal(2, 3); // Ejecuta la suma real = 5
        const resultadoMock = sumarMock(2, 3); // NO suma, solo retorna 10

        expect(resultadoReal).toBe(5);  // Resultado real de 2 + 3
        expect(resultadoMock).toBe(10); // Resultado que nosotros configuramos
    });
});

// ========================================================
// EJEMPLO 2: CREAR UN MOCK SIMPLE
// ========================================================

describe('2. CREAR UN MOCK SIMPLE', () => {

    test('Paso 1: Crear un mock vacío', () => {
        // jest.fn() crea una función mock
        const miFuncionMock = jest.fn();

        // Llamar al mock
        miFuncionMock();

        // Verificar que se llamó
        expect(miFuncionMock).toHaveBeenCalled();
    });

    test('Paso 2: Mock que retorna un valor', () => {
        // Crear mock que retorna un valor específico
        const obtenerNombreMock = jest.fn();
        obtenerNombreMock.mockReturnValue('Wilson');

        // Llamar al mock
        const nombre = obtenerNombreMock();

        // Verificar
        expect(nombre).toBe('Wilson');
        expect(obtenerNombreMock).toHaveBeenCalled();
    });

    test('Paso 3: Mock que retorna una promesa', () => {
        // Crear mock asíncrono
        const obtenerDatosMock = jest.fn();
        obtenerDatosMock.mockResolvedValue({ id: 1, nombre: 'Test' });

        // Llamar al mock (es asíncrono)
        return obtenerDatosMock().then(datos => {
            expect(datos).toEqual({ id: 1, nombre: 'Test' });
        });
    });
});

// ========================================================
// EJEMPLO 3: MOCK DE UN OBJETO COMPLETO
// ========================================================

describe('3. MOCK DE UN OBJETO (Como tu repositorio)', () => {

    // Imaginemos una calculadora simple
    interface Calculadora {
        sumar(a: number, b: number): number;
        restar(a: number, b: number): number;
        multiplicar(a: number, b: number): number;
    }

    test('Mock de un objeto con múltiples métodos', () => {
        // Crear mock de toda la calculadora
        const calculadoraMock: jest.Mocked<Calculadora> = {
            sumar: jest.fn(),
            restar: jest.fn(),
            multiplicar: jest.fn()
        };

        // Configurar comportamientos
        calculadoraMock.sumar.mockReturnValue(10);
        calculadoraMock.restar.mockReturnValue(5);
        calculadoraMock.multiplicar.mockReturnValue(20);

        // Usar los mocks
        const suma = calculadoraMock.sumar(2, 3);        // No suma realmente, retorna 10
        const resta = calculadoraMock.restar(8, 3);      // No resta realmente, retorna 5
        const mult = calculadoraMock.multiplicar(4, 5);  // No multiplica, retorna 20

        // Verificar
        expect(suma).toBe(10);
        expect(resta).toBe(5);
        expect(mult).toBe(20);

        // Verificar que se llamaron
        expect(calculadoraMock.sumar).toHaveBeenCalled();
        expect(calculadoraMock.restar).toHaveBeenCalled();
        expect(calculadoraMock.multiplicar).toHaveBeenCalled();
    });
});

// ========================================================
// EJEMPLO 4: VERIFICAR CÓMO SE LLAMÓ EL MOCK
// ========================================================

describe('4. VERIFICAR CÓMO SE LLAMÓ EL MOCK', () => {

    test('Verificar con qué parámetros se llamó', () => {
        const enviarEmailMock = jest.fn();

        // Llamar con parámetros específicos
        enviarEmailMock('wilson@email.com', 'Hola');

        // Verificar que se llamó con esos parámetros exactos
        expect(enviarEmailMock).toHaveBeenCalledWith('wilson@email.com', 'Hola');
    });

    test('Verificar cuántas veces se llamó', () => {
        const guardarMock = jest.fn();

        // Llamar 3 veces
        guardarMock('dato1');
        guardarMock('dato2');
        guardarMock('dato3');

        // Verificar que se llamó exactamente 3 veces
        expect(guardarMock).toHaveBeenCalledTimes(3);
    });

    test('Verificar que NO se llamó', () => {
        const eliminarMock = jest.fn();

        // NO llamamos la función

        // Verificar que NO se llamó
        expect(eliminarMock).not.toHaveBeenCalled();
    });
});

// ========================================================
// EJEMPLO 5: MOCK QUE SIMULA ERRORES
// ========================================================

describe('5. MOCK QUE SIMULA ERRORES', () => {

    test('Mock que lanza un error', async () => {
        const conectarBaseDatosMock = jest.fn();

        // Configurar para que lance un error
        conectarBaseDatosMock.mockRejectedValue(new Error('No hay conexión'));

        // Verificar que lanza el error
        await expect(conectarBaseDatosMock()).rejects.toThrow('No hay conexión');
    });
});

// ========================================================
// EJEMPLO 6: CASO PRÁCTICO - Sistema de Usuarios
// ========================================================

// Interfaz de repositorio de usuarios
interface IUsuarioRepositorio {
    guardar(nombre: string): Promise<void>;
    obtenerPorId(id: string): Promise<{ id: string; nombre: string } | null>;
    eliminar(id: string): Promise<void>;
}

// Caso de uso que DEPENDE del repositorio
class CrearUsuario {
    constructor(private repositorio: IUsuarioRepositorio) {}

    async ejecutar(nombre: string): Promise<string> {
        // Validar
        if (!nombre || nombre.trim() === '') {
            throw new Error('El nombre es obligatorio');
        }

        // Guardar en el repositorio
        const id = 'USR-' + Date.now();
        await this.repositorio.guardar(nombre);

        return id;
    }
}

describe('6. CASO PRÁCTICO: Probar CrearUsuario con Mocks', () => {

    let mockRepositorio: jest.Mocked<IUsuarioRepositorio>;
    let crearUsuarioUseCase: CrearUsuario;

    beforeEach(() => {
        // 1. CREAR EL MOCK DEL REPOSITORIO
        mockRepositorio = {
            guardar: jest.fn(),
            obtenerPorId: jest.fn(),
            eliminar: jest.fn()
        };

        // 2. INYECTAR EL MOCK AL CASO DE USO
        crearUsuarioUseCase = new CrearUsuario(mockRepositorio);
    });

    test('Caso exitoso: Crear un usuario válido', async () => {
        // 3. CONFIGURAR EL MOCK: Simular que guardar tiene éxito
        mockRepositorio.guardar.mockResolvedValue(undefined);

        // 4. EJECUTAR EL CASO DE USO
        const id = await crearUsuarioUseCase.ejecutar('Wilson');

        // 5. VERIFICAR RESULTADOS
        expect(id).toBeDefined();
        expect(id).toContain('USR-');

        // 6. VERIFICAR QUE SE LLAMÓ AL MOCK CORRECTAMENTE
        expect(mockRepositorio.guardar).toHaveBeenCalledTimes(1);
        expect(mockRepositorio.guardar).toHaveBeenCalledWith('Wilson');
    });

    test('Caso de error: NO debería guardar si el nombre está vacío', async () => {
        // 3. CONFIGURAR EL MOCK
        mockRepositorio.guardar.mockResolvedValue(undefined);

        // 4. EJECUTAR Y VERIFICAR QUE LANZA ERROR
        await expect(
            crearUsuarioUseCase.ejecutar('')
        ).rejects.toThrow('El nombre es obligatorio');

        // 5. VERIFICAR QUE NO SE INTENTÓ GUARDAR
        expect(mockRepositorio.guardar).not.toHaveBeenCalled();
    });

    test('Caso de error: Propagar error del repositorio', async () => {
        // 3. CONFIGURAR EL MOCK PARA QUE FALLE
        mockRepositorio.guardar.mockRejectedValue(new Error('Error de conexión'));

        // 4. EJECUTAR Y VERIFICAR QUE PROPAGA EL ERROR
        await expect(
            crearUsuarioUseCase.ejecutar('Wilson')
        ).rejects.toThrow('Error de conexión');

        // 5. VERIFICAR QUE SÍ SE INTENTÓ GUARDAR
        expect(mockRepositorio.guardar).toHaveBeenCalledTimes(1);
    });
});

// ========================================================
// EJEMPLO 7: COMPARACIÓN LADO A LADO
// ========================================================

describe('7. COMPARACIÓN: Con Mock vs Sin Mock', () => {

    // Repositorio REAL (implementación simple en memoria)
    class UsuarioRepositorioReal implements IUsuarioRepositorio {
        private usuarios = new Map<string, string>();

        async guardar(nombre: string): Promise<void> {
            const id = 'USR-' + Date.now();
            this.usuarios.set(id, nombre);
            console.log('Guardando en memoria real...');
            // Simular operación costosa
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        async obtenerPorId(id: string): Promise<{ id: string; nombre: string } | null> {
            const nombre = this.usuarios.get(id);
            if (nombre) {
                return { id, nombre };
            }
            return null;
        }

        async eliminar(id: string): Promise<void> {
            this.usuarios.delete(id);
        }
    }

    test('SIN MOCK: Usando repositorio real (más lento)', async () => {
        // Usar implementación REAL
        const repositorioReal = new UsuarioRepositorioReal();
        const crearUsuario = new CrearUsuario(repositorioReal);

        const inicio = Date.now();
        await crearUsuario.ejecutar('Wilson');
        const duracion = Date.now() - inicio;

        // Esta prueba tarda ~100ms porque usa el repositorio real
        expect(duracion).toBeGreaterThan(90);
    });

    test('CON MOCK: Usando mock (instantáneo)', async () => {
        // Usar MOCK
        const mockRepositorio: jest.Mocked<IUsuarioRepositorio> = {
            guardar: jest.fn().mockResolvedValue(undefined),
            obtenerPorId: jest.fn(),
            eliminar: jest.fn()
        };

        const crearUsuario = new CrearUsuario(mockRepositorio);

        const inicio = Date.now();
        await crearUsuario.ejecutar('Wilson');
        const duracion = Date.now() - inicio;

        // Esta prueba es instantánea porque usa un mock
        expect(duracion).toBeLessThan(10);
    });
});

// ========================================================
// RESUMEN Y CHEATSHEET
// ========================================================

describe('8. CHEATSHEET: Comandos más usados', () => {

    test('Resumen de comandos de mocks', () => {
        const mock = jest.fn();

        // 1. CREAR MOCK
        // jest.fn() - crea función mock

        // 2. CONFIGURAR RETORNO
        mock.mockReturnValue('valor');              // Retorna valor síncrono
        mock.mockResolvedValue('valor');            // Retorna promesa exitosa
        mock.mockRejectedValue(new Error('error')); // Retorna promesa con error

        // 3. VERIFICAR LLAMADAS
        expect(mock).toHaveBeenCalled();            // Se llamó al menos 1 vez
        expect(mock).toHaveBeenCalledTimes(3);      // Se llamó exactamente 3 veces
        expect(mock).toHaveBeenCalledWith('arg');   // Se llamó con este argumento
        expect(mock).not.toHaveBeenCalled();        // NO se llamó

        // 4. LIMPIAR MOCKS
        mock.mockClear();      // Limpia historial de llamadas
        jest.clearAllMocks();  // Limpia todos los mocks
    });
});

/**
 * ========================================================
 * CONCLUSIÓN
 * ========================================================
 *
 * ¿CUÁNDO USAR MOCKS?
 * ✅ Para probar lógica de negocio aislada
 * ✅ Para simular dependencias costosas (BD, APIs, archivos)
 * ✅ Para simular errores sin romper nada
 * ✅ Para hacer pruebas más rápidas
 *
 * ¿CUÁNDO NO USAR MOCKS?
 * ❌ Cuando quieres probar que TODO funciona junto (prueba de integración)
 * ❌ Cuando el código es tan simple que no vale la pena
 *
 * REGLA DE ORO:
 * - Pruebas UNITARIAS → USA MOCKS
 * - Pruebas de INTEGRACIÓN → USA IMPLEMENTACIONES REALES
 */
