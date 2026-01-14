/**
 * ==================================
 * CASO DE USO - ACTUALIZAR ESTADO EQUIPO
 * ==================================
 * Cambiar el estado operacional de un equipo
 */

import { IEquipoRepositorio } from '../../dominio/repositorios/IEquipoRepositorio';

export interface ActualizarEstadoEquipoDTO {
    equipoId: string;
    nuevoEstado: string;
}

export class ActualizarEstadoEquipo {
    constructor(private equipoRepositorio: IEquipoRepositorio) {}

    async ejecutar(dto: ActualizarEstadoEquipoDTO): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            // Validar DTO
            this.validarDTO(dto);

            // Obtener equipo
            const equipo = await this.equipoRepositorio.obtenerPorId(dto.equipoId);
            if (!equipo) {
                return {
                    success: false,
                    error: `No se encontró equipo con ID: ${dto.equipoId}`
                };
            }

            // Cambiar estado (la entidad valida la transición)
            equipo.cambiarEstado(dto.nuevoEstado);

            // Persistir cambios
            await this.equipoRepositorio.actualizar(equipo);

            return {
                success: true,
                data: equipo.obtenerInfo()
            };
        } catch (error: any) {
            console.error('❌ Error en ActualizarEstadoEquipo:', error);
            return {
                success: false,
                error: error.message || 'Error desconocido al actualizar estado'
            };
        }
    }

    private validarDTO(dto: ActualizarEstadoEquipoDTO): void {
        if (!dto.equipoId || dto.equipoId.trim() === '') {
            throw new Error('El ID del equipo es obligatorio');
        }
        if (!dto.nuevoEstado || dto.nuevoEstado.trim() === '') {
            throw new Error('El nuevo estado es obligatorio');
        }
    }
}
