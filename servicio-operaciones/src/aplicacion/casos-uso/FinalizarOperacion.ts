/**
 * ==================================
 * CASO DE USO - FINALIZAR OPERACION
 * ==================================
 * Orquesta la finalización de una operación minera
 * Patrón: Use Case (Clean Architecture)
 */

import { IOperacionRepositorio } from '../../dominio/repositorios/IOperacionRepositorio';

export interface FinalizarOperacionDTO {
    operacionId: string;
}

export class FinalizarOperacion {
    constructor(private operacionRepositorio: IOperacionRepositorio) {}

    async ejecutar(dto: FinalizarOperacionDTO): Promise<{ success: boolean; data?: any; error?: string }> {
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

            // Finalizar operación (lógica de dominio)
            operacion.finalizar();

            // Persistir cambios
            await this.operacionRepositorio.actualizar(operacion);

            return {
                success: true,
                data: operacion.obtenerInfo()
            };
        } catch (error: any) {
            console.error('❌ Error en FinalizarOperacion:', error);
            return {
                success: false,
                error: error.message || 'Error desconocido al finalizar operación'
            };
        }
    }

    private validarDTO(dto: FinalizarOperacionDTO): void {
        if (!dto.operacionId || dto.operacionId.trim() === '') {
            throw new Error('El ID de la operación es obligatorio');
        }
    }
}
