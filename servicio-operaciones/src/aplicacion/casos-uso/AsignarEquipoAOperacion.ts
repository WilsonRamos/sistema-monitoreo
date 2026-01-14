/**
 * ==================================
 * CASO DE USO - ASIGNAR EQUIPO A OPERACION
 * ==================================
 * Orquesta la asignación de un equipo a una operación
 * Patrón: Use Case (Clean Architecture)
 */

import { IOperacionRepositorio } from '../../dominio/repositorios/IOperacionRepositorio';

export interface AsignarEquipoDTO {
    operacionId: string;
    equipoId: string;
}

export class AsignarEquipoAOperacion {
    constructor(private operacionRepositorio: IOperacionRepositorio) {}

    async ejecutar(dto: AsignarEquipoDTO): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            // Validar DTO
            this.validarDTO(dto);

            // Buscar operación
            const operacion = await this.operacionRepositorio.obtenerPorId(dto.operacionId);

            if (!operacion) {
                return {
                    success: false,
                    error: `No se encontró operación con ID: ${dto.operacionId}`
                };
            }

            // Asignar equipo (lógica de dominio)
            operacion.asignarEquipo(dto.equipoId);

            // Persistir cambios
            await this.operacionRepositorio.actualizar(operacion);

            return {
                success: true,
                data: operacion.obtenerInfo()
            };
        } catch (error: any) {
            console.error('❌ Error en AsignarEquipoAOperacion:', error);
            return {
                success: false,
                error: error.message || 'Error desconocido al asignar equipo'
            };
        }
    }

    private validarDTO(dto: AsignarEquipoDTO): void {
        if (!dto.operacionId || dto.operacionId.trim() === '') {
            throw new Error('El ID de la operación es obligatorio');
        }
        if (!dto.equipoId || dto.equipoId.trim() === '') {
            throw new Error('El ID del equipo es obligatorio');
        }
    }
}
