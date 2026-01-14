/**
 * IniciarOperacion - Caso de Uso (Application Layer)
 *
 * CONCEPTO: Use Case Pattern
 * ===========================
 * Un Caso de Uso representa una operación de negocio específica.
 * Orquesta la lógica de aplicación sin contener lógica de dominio.
 *
 * RESPONSABILIDADES:
 * 1. Validar datos de entrada (capa de aplicación)
 * 2. Orquestar llamadas al dominio
 * 3. Coordinar con repositorios
 * 4. Manejar transacciones (si aplica)
 *
 * DIFERENCIA CON ENTIDAD:
 * - Entidad (Operacion): Lógica de negocio (finalizar, asignarEquipo)
 * - Use Case: Coordinación de servicios (crear operación en BD)
 */

import { randomUUID } from 'crypto';
import { IOperacionRepositorio } from '../../Dominio/operaciones/interfacesRepositorio/IOperacionRepositorio';
import { Operacion } from '../../Dominio/operaciones/modelo/Operacion';

export class IniciarOperacion {
    /**
     * CONCEPTO: Dependency Injection (Constructor Injection)
     * =======================================================
     * Recibimos dependencias por constructor en lugar de crearlas internamente.
     *
     * VENTAJAS:
     * - Testeable: podemos inyectar mocks en tests
     * - Flexible: podemos cambiar implementación sin modificar código
     * - Explícito: las dependencias están claras en la firma
     *
     * SOLID: Dependency Inversion Principle (DIP)
     * - Dependemos de la INTERFAZ IOperacionRepositorio (abstracción)
     * - NO dependemos de MemoriaOperacionRepositorio (implementación concreta)
     */
    constructor(
        private readonly operacionRepositorio: IOperacionRepositorio
    ) {
        console.log('📋 IniciarOperacion: Caso de uso inicializado');
    }

    /**
     * CONCEPTO: Command Method
     * =========================
     * Método que ejecuta una acción (comando) y retorna resultado mínimo.
     *
     * En este caso retorna el ID de la operación creada,
     * para que el controller pueda responder al cliente.
     *
     * @param tipo - Tipo de operación (CARGUE, TRANSPORTE, DESCARGA)
     * @param supervisorId - ID del supervisor responsable
     * @param frenteId - ID del frente de trabajo
     * @returns Promise<string> - ID de la operación creada
     * @throws Error si la validación falla o el repositorio falla
     */
    async ejecutar(
        tipo: string,
        supervisorId: string,
        frenteId: string
    ): Promise<string> {
        try {
            console.log(`📝 Iniciando operación: ${tipo} en frente ${frenteId}`);

            /**
             * CONCEPTO: Fail Fast (Guard Clauses)
             * ====================================
             * Validamos PRIMERO antes de ejecutar lógica costosa.
             * Si falla, lanzamos error inmediatamente.
             */
            this.validarDatosDeEntrada(tipo, supervisorId, frenteId);

            /**
             * CONCEPTO: UUID v4 (Universally Unique Identifier)
             * ==================================================
             * Generamos IDs únicos usando crypto.randomUUID() (seguro).
             * NO usamos Math.random() (inseguro, predecible).
             *
             * FORMATO: operacion-{uuid}
             * Ejemplo: operacion-550e8400-e29b-41d4-a716-446655440000
             */
            const id = this.generarIdUnico();

            /**
             * CONCEPTO: Factory Pattern (implícito)
             * ======================================
             * El constructor de Operacion actúa como factory.
             * Valida invariantes y retorna instancia válida.
             */
            const operacion = new Operacion(id, tipo, supervisorId, frenteId);

            /**
             * CONCEPTO: Repository Pattern
             * =============================
             * Delegamos la persistencia al repositorio.
             * El Use Case NO sabe si es BD, archivo, memoria, etc.
             */
            await this.operacionRepositorio.crear(operacion);

            console.log(`✅ Operación creada exitosamente: ${id}`);
            return id;

        } catch (error: any) {
            /**
             * CONCEPTO: Error Wrapping
             * ========================
             * Capturamos errores y los re-lanzamos con contexto adicional.
             * Esto facilita debugging sin exponer detalles internos.
             */
            console.error(`❌ Error en caso de uso IniciarOperacion: ${error.message}`);
            throw new Error(`Error al iniciar operación: ${error.message}`);
        }
    }

    /**
     * CONCEPTO: Input Validation
     * ===========================
     * Validación a nivel de aplicación (formato, presencia).
     * La validación de negocio (ej: "tipo válido") la hace la entidad.
     *
     * DIFERENCIA:
     * - Aplicación: campos requeridos, formato correcto
     * - Dominio: reglas de negocio, invariantes
     */
    private validarDatosDeEntrada(
        tipo: string,
        supervisorId: string,
        frenteId: string
    ): void {
        if (!tipo || tipo.trim().length === 0) {
            throw new Error('El tipo de operación es obligatorio');
        }

        if (!supervisorId || supervisorId.trim().length === 0) {
            throw new Error('El supervisor es obligatorio');
        }

        if (!frenteId || frenteId.trim().length === 0) {
            throw new Error('El frente de trabajo es obligatorio');
        }
    }

    /**
     * CONCEPTO: ID Generation Strategy
     * =================================
     * Usamos UUID v4 generado por crypto.randomUUID().
     *
     * VENTAJAS:
     * - Seguro (criptográficamente aleatorio)
     * - Único globalmente (probabilidad de colisión ~0)
     * - No requiere servidor central
     * - Funciona offline
     *
     * FORMATO:
     * operacion-{uuid} para identificar fácilmente el tipo de entidad.
     */
    private generarIdUnico(): string {
        const id = `operacion-${randomUUID()}`;
        console.log(`🆔 ID generado (UUID v4): ${id}`);
        return id;
    }
}

/**
 * CONCEPTOS APLICADOS EN ESTE USE CASE:
 * =======================================
 *
 * PATTERNS:
 * 1. ✅ Use Case Pattern (Application Service)
 * 2. ✅ Dependency Injection
 * 3. ✅ Repository Pattern
 * 4. ✅ Command Method
 * 5. ✅ Guard Clauses (Fail Fast)
 * 6. ✅ Error Wrapping
 *
 * SOLID:
 * 7. ✅ SRP - Una responsabilidad: iniciar operación
 * 8. ✅ DIP - Depende de IOperacionRepositorio (abstracción)
 * 9. ✅ OCP - Abierto a extensión (podemos inyectar diferentes repos)
 *
 * SECURITY:
 * 10. ✅ crypto.randomUUID() en lugar de Math.random()
 * 11. ✅ Input validation
 * 12. ✅ Error wrapping (no exponer detalles internos)
 *
 * CLEAN ARCHITECTURE:
 * 13. ✅ Capa de Aplicación (orquesta, no contiene lógica de negocio)
 * 14. ✅ Usa entidades del Dominio
 * 15. ✅ Usa interfaces del Dominio
 * 16. ✅ NO conoce detalles de Infraestructura
 */
