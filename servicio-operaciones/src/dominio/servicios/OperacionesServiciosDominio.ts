/**
 * ==================================
 * SERVICIO DE DOMINIO - OPERACIONES
 * ==================================
 * Lógica de dominio que no pertenece a una entidad específica
 */

import { Operacion } from '../entidades/Operacion';
import { IOperacionRepositorio } from '../repositorios/IOperacionRepositorio';

export class OperacionesServiciosDominio {
    constructor(private operacionRepositorio: IOperacionRepositorio) {}

    /**
     * Calcular productividad: Total de operaciones completadas
     */
    async calcularProductividad(): Promise<number> {
        const operaciones = await this.operacionRepositorio.obtenerTodas();
        return operaciones.filter(op => !op.estaActiva()).length;
    }

    /**
     * Calcular tiempo de ciclo promedio en minutos
     */
    async calcularTiempoCicloPromedio(): Promise<number> {
        const operaciones = await this.operacionRepositorio.obtenerTodas();
        const operacionesFinalizadas = operaciones.filter(op => !op.estaActiva());

        if (operacionesFinalizadas.length === 0) return 0;

        const totalMinutos = operacionesFinalizadas.reduce(
            (total, op) => total + op.calcularDuracionMinutos(),
            0
        );

        return Math.floor(totalMinutos / operacionesFinalizadas.length);
    }

    /**
     * Obtener operaciones por estado (activas o finalizadas)
     */
    async obtenerOperacionesPorEstado(activas: boolean): Promise<Operacion[]> {
        const operaciones = await this.operacionRepositorio.obtenerTodas();
        return operaciones.filter(op => op.estaActiva() === activas);
    }

    /**
     * Calcular total de equipos asignados en operaciones activas
     */
    async calcularEquiposEnOperacion(): Promise<number> {
        const operacionesActivas = await this.operacionRepositorio.obtenerActivas();
        return operacionesActivas.reduce(
            (total, op) => total + op.cantidadEquiposAsignados(),
            0
        );
    }

    /**
     * Obtener operaciones por tipo
     */
    async obtenerOperacionesPorTipo(tipo: string): Promise<Operacion[]> {
        const operaciones = await this.operacionRepositorio.obtenerTodas();
        return operaciones.filter(op => op.tipo === tipo);
    }

    /**
     * Calcular duración total de operaciones finalizadas en minutos
     */
    async calcularDuracionTotalOperaciones(): Promise<number> {
        const operaciones = await this.operacionRepositorio.obtenerTodas();
        const operacionesFinalizadas = operaciones.filter(op => !op.estaActiva());

        return operacionesFinalizadas.reduce(
            (total, op) => total + op.calcularDuracionMinutos(),
            0
        );
    }

    /**
     * Obtener tasa de operaciones completadas (%)
     */
    async calcularTasaCompletitud(): Promise<number> {
        const operaciones = await this.operacionRepositorio.obtenerTodas();
        if (operaciones.length === 0) return 0;

        const completadas = operaciones.filter(op => !op.estaActiva()).length;
        return Math.floor((completadas / operaciones.length) * 100);
    }
}
