/**
 * MemoriaOperacionRepositorio - Implementación en Memoria
 *
 * CONCEPTO: In-Memory Repository
 * ===============================
 * Almacena datos en memoria RAM (Map/Array) en lugar de BD.
 *
 * VENTAJAS:
 * - Ultra rápido (no hay I/O)
 * - Ideal para testing
 * - No requiere configuración de BD
 * - Facilita desarrollo inicial
 *
 * DESVENTAJAS:
 * - Datos se pierden al reiniciar servidor
 * - No escala (limitado por RAM)
 * - No persistente
 *
 * USO:
 * - Desarrollo y testing
 * - Demos y prototipos
 * - Luego se reemplaza por PrismaOperacionRepositorio (BD real)
 */

import { IOperacionRepositorio } from '../../../Dominio/operaciones/interfacesRepositorio/IOperacionRepositorio';
import { Operacion } from '../../../Dominio/operaciones/modelo/Operacion';

export class MemoriaOperacionRepositorio implements IOperacionRepositorio {
    /**
     * CONCEPTO: Map vs Array
     * ======================
     * Usamos Map<string, Operacion> en lugar de Array<Operacion> porque:
     *
     * VENTAJAS DE MAP:
     * - Búsqueda por ID es O(1) (instantánea)
     * - Array sería O(n) (recorrer todos)
     * - Evita duplicados automáticamente (key única)
     * - API más clara: get(), set(), has(), delete()
     *
     * VENTAJAS DE ARRAY:
     * - Orden de inserción garantizado
     * - Métodos como filter(), map() más conocidos
     *
     * Elegimos Map porque las búsquedas por ID son críticas.
     */
    private operaciones: Map<string, Operacion> = new Map();

    async crear(operacion: Operacion): Promise<void> {
        /**
         * CONCEPTO: Guard Clause (Cláusula de Guarda)
         * ============================================
         * Validamos PRIMERO condiciones de error.
         * Si falla, lanzamos error inmediatamente (Fail Fast).
         *
         * VENTAJA: Reduce anidamiento if-else.
         */
        if (this.operaciones.has(operacion.id)) {
            throw new Error(`Ya existe una operación con ID: ${operacion.id}`);
        }

        this.operaciones.set(operacion.id, operacion);
        console.log(`💾 Operación guardada en memoria: ${operacion.id}`);
    }

    async obtenerPorId(id: string): Promise<Operacion | null> {
        /**
         * CONCEPTO: Null Object Pattern
         * ==============================
         * Retornamos null si no existe, en lugar de lanzar error.
         *
         * VENTAJA: El código cliente decide qué hacer:
         * ```ts
         * const op = await repo.obtenerPorId('id');
         * if (!op) {
         *   // manejar caso "no encontrado"
         * }
         * ```
         */
        return this.operaciones.get(id) || null;
    }

    async obtenerTodas(): Promise<Operacion[]> {
        /**
         * CONCEPTO: Defensive Copying
         * ============================
         * Retornamos un NUEVO array, no la referencia interna.
         *
         * Array.from(map.values()) convierte los valores del Map a Array.
         */
        return Array.from(this.operaciones.values());
    }

    async obtenerPorSupervisor(supervisorId: string): Promise<Operacion[]> {
        /**
         * CONCEPTO: Array.filter()
         * ========================
         * Filtramos operaciones que cumplan condición.
         *
         * NOTA: En BD real, esto sería un WHERE en SQL.
         */
        return Array.from(this.operaciones.values())
            .filter(op => op.supervisorId === supervisorId);
    }

    async obtenerPorFrente(frenteId: string): Promise<Operacion[]> {
        return Array.from(this.operaciones.values())
            .filter(op => op.frenteId === frenteId);
    }

    async obtenerActivas(): Promise<Operacion[]> {
        /**
         * Filtramos operaciones donde estaActiva() === true.
         * Delegamos la lógica a la entidad (Single Source of Truth).
         */
        return Array.from(this.operaciones.values())
            .filter(op => op.estaActiva());
    }

    async obtenerPorTipo(tipo: string): Promise<Operacion[]> {
        return Array.from(this.operaciones.values())
            .filter(op => op.tipo === tipo);
    }

    async actualizar(operacion: Operacion): Promise<void> {
        if (!this.operaciones.has(operacion.id)) {
            throw new Error(`Operación con ID ${operacion.id} no encontrada`);
        }

        /**
         * CONCEPTO: Update by Replacement
         * ================================
         * Reemplazamos completamente la operación.
         * No hacemos merge parcial de propiedades.
         */
        this.operaciones.set(operacion.id, operacion);
        console.log(`💾 Operación actualizada: ${operacion.id}`);
    }

    async eliminar(id: string): Promise<void> {
        if (!this.operaciones.has(id)) {
            throw new Error(`Operación con ID ${id} no encontrada`);
        }

        this.operaciones.delete(id);
        console.log(`🗑️ Operación eliminada: ${id}`);
    }

    async existe(id: string): Promise<boolean> {
        return this.operaciones.has(id);
    }

    /**
     * CONCEPTO: Testing Helper Methods
     * =================================
     * Métodos adicionales SOLO para facilitar testing.
     * NO forman parte de la interfaz IOperacionRepositorio.
     */

    /**
     * Limpiar todos los datos (útil en beforeEach de tests)
     */
    async limpiar(): Promise<void> {
        this.operaciones.clear();
        console.log('🧹 Repositorio limpiado');
    }

    /**
     * Obtener estadísticas del repositorio
     */
    obtenerEstadisticas(): any {
        return {
            total: this.operaciones.size,
            activas: Array.from(this.operaciones.values()).filter(op => op.estaActiva()).length,
            finalizadas: Array.from(this.operaciones.values()).filter(op => !op.estaActiva()).length,
        };
    }
}

/**
 * CONCEPTOS APLICADOS EN ESTA CLASE:
 * ===================================
 *
 * PATTERNS:
 * 1. ✅ Repository Pattern (implementación)
 * 2. ✅ In-Memory Storage
 * 3. ✅ Null Object Pattern
 * 4. ✅ Guard Clauses
 * 5. ✅ Defensive Copying
 *
 * DATA STRUCTURES:
 * 6. ✅ Map para búsquedas O(1)
 * 7. ✅ Array.from() para conversión
 * 8. ✅ filter() para queries
 *
 * SOLID:
 * 9. ✅ SRP - Solo persistencia de Operacion
 * 10. ✅ DIP - Implementa interfaz del Dominio
 * 11. ✅ LSP - Sustituible por otras implementaciones
 *
 * TESTING:
 * 12. ✅ Helper methods (limpiar, obtenerEstadisticas)
 * 13. ✅ Fácil de testear (sin I/O)
 */
