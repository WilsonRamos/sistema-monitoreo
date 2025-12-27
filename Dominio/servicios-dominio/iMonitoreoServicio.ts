/**
 * Servicio de Dominio - Monitoreo de Equipos
 *
 * Responsabilidades:
 * - Actualizar estado de equipos
 * - Obtener ubicación en tiempo real
 * - Gestionar alertas de equipos
 *
 * Patrón: Interface Segregation Principle (ISP)
 * Este contrato define solo operaciones relacionadas con monitoreo
 */
export interface IMonitoreoServicio {
    /**
     * Actualizar estado de un equipo
     * @param equipoId ID del equipo
     * @param nuevoEstado Nuevo estado del equipo
     */
    actualizarEstadoEquipo(equipoId: string, nuevoEstado: string): Promise<void>;

    /**
     * Obtener ubicación GPS de un equipo en tiempo real
     * @param equipoId ID del equipo
     * @returns Coordenadas GPS actuales
     */
    obtenerUbicacionTiempoReal(equipoId: string): Promise<{ latitud: number; longitud: number }>;

    /**
     * Verificar alertas para un equipo específico
     * @param equipoId ID del equipo
     * @returns Lista de alertas activas
     */
    verificarAlertasEquipo(equipoId: string): Promise<string[]>;
}