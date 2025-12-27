/**
 * Servicio de Dominio - Operaciones Mineras
 *
 * Responsabilidades:
 * - Gestionar operaciones de cargue
 * - Completar ciclos de transporte
 * - Calcular KPIs de operaciones
 *
 * Patrón: Interface Segregation Principle (ISP)
 * Este contrato define solo operaciones relacionadas con ciclos operativos
 */
export interface IOperacionesServicio {
    /**
     * Iniciar una operación de cargue
     * @param equipoId ID del equipo que realizará el cargue
     * @param cantidadCargue Cantidad de material a cargar (en toneladas)
     * @returns ID de la operación creada
     */
    iniciarOperacionCargue(equipoId: string, cantidadCargue: number): Promise<string>;

    /**
     * Completar un ciclo de transporte
     * @param operacionId ID de la operación en curso
     * @param destino Destino final del material transportado
     */
    completarCicloTransporte(operacionId: string, destino: string): Promise<void>;

    /**
     * Calcular KPIs de una operación
     * @param operacionId ID de la operación
     * @returns Objeto con métricas calculadas
     */
    calcularKPIs(operacionId: string): Promise<{
        tiempoTotal: number;
        eficiencia: number;
        cantidadTransportada: number;
    }>;
}