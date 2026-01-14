/**
 * ==================================
 * CASO DE USO - OBTENER OPERACIONES
 * ==================================
 * Orquesta la consulta de operaciones con filtros opcionales
 * Patrón: Use Case (Clean Architecture)
 */

import { IOperacionRepositorio } from '../../dominio/repositorios/IOperacionRepositorio';

export interface ObtenerOperacionesDTO {
    supervisorId?: string;
    frenteId?: string;
    activas?: boolean;
}

export class ObtenerOperaciones {
    constructor(private operacionRepositorio: IOperacionRepositorio) {}

    async ejecutar(dto: ObtenerOperacionesDTO): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            let operaciones;

            // Aplicar filtros
            if (dto.supervisorId) {
                operaciones = await this.operacionRepositorio.obtenerPorSupervisor(dto.supervisorId);
            } else if (dto.frenteId) {
                operaciones = await this.operacionRepositorio.obtenerPorFrente(dto.frenteId);
            } else if (dto.activas !== undefined) {
                if (dto.activas) {
                    operaciones = await this.operacionRepositorio.obtenerActivas();
                } else {
                    const todas = await this.operacionRepositorio.obtenerTodas();
                    operaciones = todas.filter(op => !op.estaActiva());
                }
            } else {
                operaciones = await this.operacionRepositorio.obtenerTodas();
            }

            // Convertir a DTOs
            const data = operaciones.map(op => op.obtenerInfo());

            return {
                success: true,
                data
            };
        } catch (error: any) {
            console.error('❌ Error en ObtenerOperaciones:', error);
            return {
                success: false,
                error: error.message || 'Error desconocido al obtener operaciones'
            };
        }
    }
}
