/**
 * IOperacionRepositorio - Interfaz del Repositorio
 *
 * CONCEPTO: Repository Pattern
 * =============================
 * El patrón Repository abstrae la lógica de acceso a datos.
 * Actúa como una "colección en memoria" de objetos de dominio.
 *
 * VENTAJAS:
 * 1. Desacopla dominio de infraestructura
 * 2. Facilita testing (se puede mockear)
 * 3. Permite cambiar BD sin afectar dominio
 * 4. Centraliza queries complejos
 *
 * CONCEPTO: Dependency Inversion Principle (DIP)
 * ===============================================
 * Esta interfaz se define en la capa de DOMINIO (no en Infraestructura).
 *
 * REGLA DE DEPENDENCIAS:
 * - Dominio NO depende de nada (centro de la arquitectura)
 * - Aplicación depende de Dominio
 * - Infraestructura IMPLEMENTA interfaces del Dominio
 *
 * Flujo:
 * ```
 * Aplicación  →  IOperacionRepositorio (INTERFAZ en Dominio)
 *                        ↑
 *                        | implementa
 *                        |
 * Infraestructura  →  MemoriaOperacionRepositorio (IMPLEMENTACIÓN)
 * ```
 */

import { Operacion } from '../modelo/Operacion';

export interface IOperacionRepositorio {
    /**
     * Crear nueva operación
     *
     * CONCEPTO: Command Method
     * ========================
     * Modifica estado (persiste datos). Retorna void o Promise<void>.
     *
     * @param operacion - Instancia de Operacion a persistir
     * @throws Error si ya existe una operación con el mismo ID
     */
    crear(operacion: Operacion): Promise<void>;

    /**
     * Obtener operación por ID
     *
     * CONCEPTO: Query Method
     * ======================
     * Solo lectura, no modifica estado.
     * Retorna null si no existe (Null Object Pattern).
     *
     * @param id - ID de la operación
     * @returns Operacion si existe, null si no
     */
    obtenerPorId(id: string): Promise<Operacion | null>;

    /**
     * Obtener todas las operaciones
     *
     * CONCEPTO: Collection-like Interface
     * ====================================
     * El repositorio se comporta como una colección.
     *
     * @returns Array de todas las operaciones
     */
    obtenerTodas(): Promise<Operacion[]>;

    /**
     * Obtener operaciones por supervisor
     *
     * CONCEPTO: Domain-Specific Query
     * ================================
     * Query específica del dominio minero.
     * Un supervisor puede tener varias operaciones asignadas.
     *
     * @param supervisorId - ID del supervisor
     * @returns Array de operaciones del supervisor
     */
    obtenerPorSupervisor(supervisorId: string): Promise<Operacion[]>;

    /**
     * Obtener operaciones por frente de trabajo
     *
     * @param frenteId - ID del frente
     * @returns Array de operaciones en ese frente
     */
    obtenerPorFrente(frenteId: string): Promise<Operacion[]>;

    /**
     * Obtener operaciones activas (no finalizadas)
     *
     * CONCEPTO: Business Logic in Repository
     * =======================================
     * Este filtro tiene lógica de negocio ("activa" = sin fechaFin).
     * Podríamos hacerlo en el Use Case, pero es más eficiente
     * filtrarlo en la query (especialmente con BD real).
     *
     * @returns Array de operaciones activas
     */
    obtenerActivas(): Promise<Operacion[]>;

    /**
     * Obtener operaciones por tipo
     *
     * @param tipo - Tipo de operación (CARGUE, TRANSPORTE, DESCARGA)
     * @returns Array de operaciones de ese tipo
     */
    obtenerPorTipo(tipo: string): Promise<Operacion[]>;

    /**
     * Actualizar operación existente
     *
     * CONCEPTO: Update by Replacement
     * ================================
     * Reemplaza completamente la operación con el mismo ID.
     * No hace merge parcial.
     *
     * @param operacion - Operacion con datos actualizados
     * @throws Error si la operación no existe
     */
    actualizar(operacion: Operacion): Promise<void>;

    /**
     * Eliminar operación por ID
     *
     * @param id - ID de la operación a eliminar
     * @throws Error si la operación no existe
     */
    eliminar(id: string): Promise<void>;

    /**
     * Verificar si existe una operación con cierto ID
     *
     * CONCEPTO: Existence Check
     * =========================
     * Más eficiente que obtenerPorId() cuando solo necesitas saber si existe.
     * En BD real, podría ser un COUNT(*) en lugar de SELECT *.
     *
     * @param id - ID a verificar
     * @returns true si existe, false si no
     */
    existe(id: string): Promise<boolean>;
}

/**
 * CONCEPTOS APLICADOS EN ESTA INTERFAZ:
 * ======================================
 *
 * SOLID:
 * 1. ✅ SRP - Una responsabilidad: persistencia de Operacion
 * 2. ✅ OCP - Abierta a extensión (se pueden agregar más métodos)
 * 3. ✅ LSP - N/A (es interfaz)
 * 4. ✅ ISP - Interface segregada (solo métodos de Operacion)
 * 5. ✅ DIP - Inversión de dependencias (interfaz en Dominio)
 *
 * PATTERNS:
 * 6. ✅ Repository Pattern
 * 7. ✅ Collection-like Interface
 * 8. ✅ Null Object Pattern (retornar null en lugar de throw)
 * 9. ✅ Command-Query Separation (CQS)
 *
 * DOMAIN-DRIVEN DESIGN:
 * 10. ✅ Ubiquitous Language (usar términos del dominio)
 * 11. ✅ Domain-Specific Queries (obtenerPorFrente, obtenerActivas)
 * 12. ✅ Repository for Aggregate Root only
 *
 * CLEAN ARCHITECTURE:
 * 13. ✅ Interfaz en capa de Dominio
 * 14. ✅ Implementación en capa de Infraestructura
 * 15. ✅ Dependency Rule respetada
 */
