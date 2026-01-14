/**
 * ==================================
 * SERVICIO DE DOMINIO - MONITOREO
 * ==================================
 * Lógica de dominio que no pertenece a una entidad específica
 */

import { Equipo } from '../entidades/Equipo';
import { IEquipoRepositorio } from '../repositorios/IEquipoRepositorio';

export class MonitoreoServiciosDominio {
    constructor(private equipoRepositorio: IEquipoRepositorio) {}

    /**
     * Calcular tiempo de operación total de una flota
     */
    async calcularTiempoOperacionFlota(tipo?: string): Promise<number> {
        let equipos: Equipo[];

        if (tipo) {
            equipos = await this.equipoRepositorio.buscarPorTipo(tipo);
        } else {
            equipos = await this.equipoRepositorio.obtenerTodos();
        }

        return equipos.reduce((total, equipo) => total + equipo.horasOperacion, 0);
    }

    /**
     * Calcular combustible total consumido
     */
    async calcularCombustibleTotalDisponible(tipo?: string): Promise<number> {
        let equipos: Equipo[];

        if (tipo) {
            equipos = await this.equipoRepositorio.buscarPorTipo(tipo);
        } else {
            equipos = await this.equipoRepositorio.obtenerTodos();
        }

        return equipos.reduce((total, equipo) => total + equipo.nivelCombustible, 0);
    }

    /**
     * Obtener equipos que requieren mantenimiento
     */
    async obtenerEquiposParaMantenimiento(umbralHoras: number = 500): Promise<Equipo[]> {
        const equipos = await this.equipoRepositorio.obtenerTodos();
        return equipos.filter(equipo => equipo.horasOperacion > umbralHoras);
    }

    /**
     * Obtener equipos con bajo combustible
     */
    async obtenerEquiposBajoCombustible(umbral: number = 10): Promise<Equipo[]> {
        const equipos = await this.equipoRepositorio.obtenerTodos();
        return equipos.filter(equipo => equipo.nivelCombustible < umbral);
    }

    /**
     * Calcular tasa de disponibilidad de la flota
     */
    async calcularTasaDisponibilidad(): Promise<number> {
        const equipos = await this.equipoRepositorio.obtenerTodos();
        if (equipos.length === 0) return 0;

        const disponibles = equipos.filter(e => e.puedeOperar()).length;
        return (disponibles / equipos.length) * 100;
    }
}
