/**
 * ==================================
 * CASO DE USO - OBTENER ALERTAS DE EQUIPOS
 * ==================================
 * Obtener alertas de equipos que requieren atención
 */

import { IEquipoRepositorio } from '../../dominio/repositorios/IEquipoRepositorio';

export interface AlertaEquipo {
    equipoId: string;
    codigo: string;
    tipo: string;
    alertas: string[];
}

export class ObtenerAlertasEquipos {
    constructor(private equipoRepositorio: IEquipoRepositorio) {}

    async ejecutar(): Promise<{ success: boolean; data?: AlertaEquipo[]; error?: string }> {
        try {
            const equipos = await this.equipoRepositorio.obtenerTodos();
            const alertas: AlertaEquipo[] = [];

            for (const equipo of equipos) {
                const alertasEquipo: string[] = [];

                // Verificar alertas usando el método de dominio
                equipo.verificarAlertas((mensaje) => {
                    alertasEquipo.push(mensaje);
                });

                if (alertasEquipo.length > 0) {
                    alertas.push({
                        equipoId: equipo.id,
                        codigo: equipo.codigo,
                        tipo: equipo.tipo,
                        alertas: alertasEquipo
                    });
                }
            }

            return {
                success: true,
                data: alertas
            };
        } catch (error: any) {
            console.error('❌ Error en ObtenerAlertasEquipos:', error);
            return {
                success: false,
                error: error.message || 'Error desconocido al obtener alertas'
            };
        }
    }
}
