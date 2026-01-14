/**
 * ==================================
 * CASO DE USO - OBTENER EQUIPOS
 * ==================================
 * Obtener listado de equipos con filtros opcionales
 */

import { Equipo } from '../../dominio/entidades/Equipo';
import { IEquipoRepositorio } from '../../dominio/repositorios/IEquipoRepositorio';

export interface ObtenerEquiposDTO {
    tipo?: string;
    estado?: string;
}

export class ObtenerEquipos {
    constructor(private equipoRepositorio: IEquipoRepositorio) {}

    async ejecutar(dto?: ObtenerEquiposDTO): Promise<{ success: boolean; data?: any[]; error?: string }> {
        try {
            let equipos: Equipo[];

            // Aplicar filtros
            if (dto?.tipo && dto?.estado) {
                // Filtrar por tipo y estado
                const equiposPorTipo = await this.equipoRepositorio.buscarPorTipo(dto.tipo);
                equipos = equiposPorTipo.filter(e => e.estado === dto.estado);
            } else if (dto?.tipo) {
                // Solo filtrar por tipo
                equipos = await this.equipoRepositorio.buscarPorTipo(dto.tipo);
            } else if (dto?.estado) {
                // Solo filtrar por estado
                equipos = await this.equipoRepositorio.buscarPorEstado(dto.estado);
            } else {
                // Sin filtros, obtener todos
                equipos = await this.equipoRepositorio.obtenerTodos();
            }

            // Convertir a DTOs
            const data = equipos.map(e => e.obtenerInfo());

            return {
                success: true,
                data
            };
        } catch (error: any) {
            console.error('❌ Error en ObtenerEquipos:', error);
            return {
                success: false,
                error: error.message || 'Error desconocido al obtener equipos'
            };
        }
    }
}
