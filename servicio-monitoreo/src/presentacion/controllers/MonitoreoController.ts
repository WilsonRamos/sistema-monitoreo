/**
 * ==================================
 * CONTROLLER - MONITOREO
 * ==================================
 * Maneja las peticiones HTTP relacionadas con monitoreo y alertas
 */

import { Request, Response } from 'express';
import { ObtenerAlertasEquipos } from '../../aplicacion/casos-uso/ObtenerAlertasEquipos';
import { MonitoreoServiciosDominio } from '../../dominio/servicios/MonitoreoServiciosDominio';
import { IEquipoRepositorio } from '../../dominio/repositorios/IEquipoRepositorio';

export class MonitoreoController {
    private obtenerAlertasEquipos: ObtenerAlertasEquipos;
    private monitoreoServicio: MonitoreoServiciosDominio;

    constructor(equipoRepositorio: IEquipoRepositorio) {
        this.obtenerAlertasEquipos = new ObtenerAlertasEquipos(equipoRepositorio);
        this.monitoreoServicio = new MonitoreoServiciosDominio(equipoRepositorio);
    }

    /**
     * GET /api/monitoreo/alertas
     * Obtener alertas de todos los equipos
     */
    async obtenerAlertas(req: Request, res: Response): Promise<void> {
        try {
            const resultado = await this.obtenerAlertasEquipos.ejecutar();

            if (resultado.success) {
                res.status(200).json({
                    success: true,
                    data: resultado.data,
                    count: resultado.data?.length || 0
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: resultado.error
                });
            }
        } catch (error: any) {
            console.error('❌ Error en MonitoreoController.obtenerAlertas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * GET /api/monitoreo/kpis
     * Obtener KPIs de la flota
     */
    async obtenerKPIs(req: Request, res: Response): Promise<void> {
        try {
            const { tipo } = req.query;

            const tiempoTotal = await this.monitoreoServicio.calcularTiempoOperacionFlota(tipo as string);
            const combustibleTotal = await this.monitoreoServicio.calcularCombustibleTotalDisponible(tipo as string);
            const tasaDisponibilidad = await this.monitoreoServicio.calcularTasaDisponibilidad();
            const equiposMantenimiento = await this.monitoreoServicio.obtenerEquiposParaMantenimiento();
            const equiposBajoCombustible = await this.monitoreoServicio.obtenerEquiposBajoCombustible();

            res.status(200).json({
                success: true,
                data: {
                    tiempoOperacionTotal: tiempoTotal,
                    combustibleTotalDisponible: combustibleTotal,
                    tasaDisponibilidad: tasaDisponibilidad.toFixed(2) + '%',
                    equiposRequierenMantenimiento: equiposMantenimiento.length,
                    equiposBajoCombustible: equiposBajoCombustible.length
                }
            });
        } catch (error: any) {
            console.error('❌ Error en MonitoreoController.obtenerKPIs:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}
