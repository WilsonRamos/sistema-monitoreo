/**
 * ==================================
 * CONTROLLER - KPIS
 * ==================================
 * Maneja las peticiones HTTP relacionadas con KPIs de operaciones
 */

import { Request, Response } from 'express';
import { ObtenerKPIsOperaciones } from '../../aplicacion/casos-uso/ObtenerKPIsOperaciones';
import { IOperacionRepositorio } from '../../dominio/repositorios/IOperacionRepositorio';

export class KPIsController {
    private obtenerKPIsOperaciones: ObtenerKPIsOperaciones;

    constructor(operacionRepositorio: IOperacionRepositorio) {
        this.obtenerKPIsOperaciones = new ObtenerKPIsOperaciones(operacionRepositorio);
    }

    /**
     * GET /api/kpis
     * Obtener KPIs de operaciones
     */
    async obtenerKPIs(req: Request, res: Response): Promise<void> {
        try {
            const resultado = await this.obtenerKPIsOperaciones.ejecutar();

            if (resultado.success) {
                res.status(200).json({
                    success: true,
                    data: resultado.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: resultado.error
                });
            }
        } catch (error: any) {
            console.error('❌ Error en KPIsController.obtenerKPIs:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}
