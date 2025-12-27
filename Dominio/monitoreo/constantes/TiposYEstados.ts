/**
 * Constantes Centralizadas - Tipos y Estados
 *
 * Responsabilidades:
 * - Definir tipos de equipos permitidos
 * - Definir estados válidos del equipo
 * - Proveer validadores centralizados
 *
 * Principios SOLID aplicados:
 * - SRP: Solo define constantes y validaciones
 * - OCP: Abierto a extensión (agregar nuevos tipos), cerrado a modificación
 * - DIP: Otros módulos dependen de estas abstracciones
 *
 * Beneficios:
 * - Un solo lugar para agregar/modificar tipos de equipos
 * - Validación consistente en toda la aplicación
 * - Eliminación de duplicación de código
 */

/**
 * Enum de Tipos de Equipos permitidos en el sistema
 *
 * Para agregar un nuevo tipo de equipo:
 * 1. Agregar el valor al enum
 * 2. No se requieren cambios en otros archivos
 */
export enum TipoEquipo {
    VOLQUETE = 'VOLQUETE',
    EXCAVADORA = 'EXCAVADORA',
    BULLDOZER = 'BULLDOZER',
    GRUA = 'GRUA',
    PERFORADORA = 'PERFORADORA'
}

/**
 * Enum de Estados válidos para los equipos
 *
 * Estados del ciclo de vida del equipo:
 * - DISPONIBLE: Equipo listo para asignación
 * - OPERANDO: Equipo en operación activa
 * - MANTENIMIENTO: Equipo en mantenimiento preventivo/correctivo
 * - INACTIVO: Equipo temporalmente fuera de servicio
 * - FUERA_DE_SERVICIO: Equipo dado de baja o inutilizable
 */
export enum EstadoEquipo {
    DISPONIBLE = 'DISPONIBLE',
    OPERANDO = 'OPERANDO',
    MANTENIMIENTO = 'MANTENIMIENTO',
    INACTIVO = 'INACTIVO',
    FUERA_DE_SERVICIO = 'FUERA_DE_SERVICIO'
}

/**
 * Clase de Validación Centralizada
 *
 * Concepto: Single Source of Truth
 * Todas las validaciones de tipos y estados pasan por aquí
 */
export class ValidadorTiposYEstados {

    /**
     * Obtener todos los tipos de equipos válidos
     * @returns Array de tipos válidos
     */
    static obtenerTiposValidos(): string[] {
        return Object.values(TipoEquipo);
    }

    /**
     * Obtener todos los estados válidos
     * @returns Array de estados válidos
     */
    static obtenerEstadosValidos(): string[] {
        return Object.values(EstadoEquipo);
    }

    /**
     * Validar si un tipo de equipo es válido
     *
     * @param tipo - Tipo de equipo a validar
     * @returns true si es válido, false si no
     */
    static esTipoValido(tipo: string): boolean {
        return Object.values(TipoEquipo).includes(tipo as TipoEquipo);
    }

    /**
     * Validar si un estado es válido
     *
     * @param estado - Estado a validar
     * @returns true si es válido, false si no
     */
    static esEstadoValido(estado: string): boolean {
        return Object.values(EstadoEquipo).includes(estado as EstadoEquipo);
    }

    /**
     * Validar tipo de equipo y lanzar error si no es válido
     *
     * @param tipo - Tipo de equipo a validar
     * @throws Error si el tipo no es válido
     */
    static validarTipoOError(tipo: string): void {
        if (!this.esTipoValido(tipo)) {
            const tiposValidos = this.obtenerTiposValidos().join(', ');
            throw new Error(
                `Tipo ${tipo} no es válido. Tipos válidos: ${tiposValidos}`
            );
        }
    }

    /**
     * Validar estado y lanzar error si no es válido
     *
     * @param estado - Estado a validar
     * @throws Error si el estado no es válido
     */
    static validarEstadoOError(estado: string): void {
        if (!this.esEstadoValido(estado)) {
            const estadosValidos = this.obtenerEstadosValidos().join(', ');
            throw new Error(
                `Estado ${estado} no es válido. Estados válidos: ${estadosValidos}`
            );
        }
    }

    /**
     * Obtener mensaje descriptivo del tipo de equipo
     *
     * @param tipo - Tipo de equipo
     * @returns Descripción del tipo
     */
    static obtenerDescripcionTipo(tipo: TipoEquipo): string {
        const descripciones: Record<TipoEquipo, string> = {
            [TipoEquipo.VOLQUETE]: 'Vehículo de transporte de material',
            [TipoEquipo.EXCAVADORA]: 'Equipo de excavación y cargue',
            [TipoEquipo.BULLDOZER]: 'Equipo de nivelación y empuje',
            [TipoEquipo.GRUA]: 'Equipo de izaje y manipulación',
            [TipoEquipo.PERFORADORA]: 'Equipo de perforación y voladura'
        };
        return descripciones[tipo];
    }

    /**
     * Obtener mensaje descriptivo del estado
     *
     * @param estado - Estado del equipo
     * @returns Descripción del estado
     */
    static obtenerDescripcionEstado(estado: EstadoEquipo): string {
        const descripciones: Record<EstadoEquipo, string> = {
            [EstadoEquipo.DISPONIBLE]: 'Equipo listo para asignación',
            [EstadoEquipo.OPERANDO]: 'Equipo en operación activa',
            [EstadoEquipo.MANTENIMIENTO]: 'Equipo en mantenimiento',
            [EstadoEquipo.INACTIVO]: 'Equipo temporalmente fuera de servicio',
            [EstadoEquipo.FUERA_DE_SERVICIO]: 'Equipo dado de baja'
        };
        return descripciones[estado];
    }
}
