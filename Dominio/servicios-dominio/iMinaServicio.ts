/**
 * Servicio de Dominio - Gestión de Minas
 *
 * Responsabilidades:
 * - Gestionar información de minas
 * - Administrar frentes de trabajo
 * - Coordinar zonas de operación
 *
 * Patrón: Interface Segregation Principle (ISP)
 * Este contrato define solo operaciones relacionadas con la estructura física de la mina
 */
export interface IMinaServicio {
    /**
     * Obtener información completa de una mina
     * @param minaId ID de la mina
     * @returns Información detallada de la mina
     */
    obtenerInformacionMina(minaId: string): Promise<any>;

    /**
     * Listar frentes de trabajo activos de una mina
     * @param minaId ID de la mina
     * @returns Lista de frentes activos
     */
    listarFrentesActivos(minaId: string): Promise<any[]>;

    /**
     * Asignar equipo a un frente de trabajo
     * @param frenteId ID del frente
     * @param equipoId ID del equipo a asignar
     */
    asignarEquipoAFrente(frenteId: string, equipoId: string): Promise<void>;
}