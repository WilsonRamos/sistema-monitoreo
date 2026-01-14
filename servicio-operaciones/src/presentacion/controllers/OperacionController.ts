/**
 * ==================================
 * CONTROLLER - OPERACIONES
 * ==================================
 * Maneja las peticiones HTTP relacionadas con operaciones
 */

import { Request, Response } from 'express';
import { IniciarOperacion } from '../../aplicacion/casos-uso/IniciarOperacion';
import { FinalizarOperacion } from '../../aplicacion/casos-uso/FinalizarOperacion';
import { AsignarEquipoAOperacion } from '../../aplicacion/casos-uso/AsignarEquipoAOperacion';
import { ObtenerOperaciones } from '../../aplicacion/casos-uso/ObtenerOperaciones';
import { IOperacionRepositorio } from '../../dominio/repositorios/IOperacionRepositorio';

export class OperacionController {
    private iniciarOperacion: IniciarOperacion;
    private finalizarOperacion: FinalizarOperacion;
    private asignarEquipoAOperacion: AsignarEquipoAOperacion;
    private obtenerOperaciones: ObtenerOperaciones;

    constructor(operacionRepositorio: IOperacionRepositorio) {
        this.iniciarOperacion = new IniciarOperacion(operacionRepositorio);
        this.finalizarOperacion = new FinalizarOperacion(operacionRepositorio);
        this.asignarEquipoAOperacion = new AsignarEquipoAOperacion(operacionRepositorio);
        this.obtenerOperaciones = new ObtenerOperaciones(operacionRepositorio);
    }

    /**
     * POST /api/operaciones
     * Iniciar una operación nueva
     */
    async crear(req: Request, res: Response): Promise<void> {
        try {
            const { tipo, supervisorId, frenteId, equiposAsignados } = req.body;

            const resultado = await this.iniciarOperacion.ejecutar({
                tipo,
                supervisorId,
                frenteId,
                equiposAsignados
            });

            if (resultado.success) {
                res.status(201).json({
                    success: true,
                    message: 'Operación iniciada exitosamente',
                    data: resultado.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: resultado.error
                });
            }
        } catch (error: any) {
            console.error('❌ Error en OperacionController.crear:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * GET /api/operaciones
     * Obtener listado de operaciones con filtros opcionales
     * Query params: supervisorId, frenteId, activas
     */
    async listar(req: Request, res: Response): Promise<void> {
        try {
            const { supervisorId, frenteId, activas } = req.query;

            const resultado = await this.obtenerOperaciones.ejecutar({
                supervisorId: supervisorId as string,
                frenteId: frenteId as string,
                activas: activas === 'true' ? true : activas === 'false' ? false : undefined
            });

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
            console.error('❌ Error en OperacionController.listar:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * PUT /api/operaciones/:id/finalizar
     * Finalizar una operación
     */
    async finalizar(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const resultado = await this.finalizarOperacion.ejecutar({
                operacionId: id
            });

            if (resultado.success) {
                res.status(200).json({
                    success: true,
                    message: 'Operación finalizada exitosamente',
                    data: resultado.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: resultado.error
                });
            }
        } catch (error: any) {
            console.error('❌ Error en OperacionController.finalizar:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * POST /api/operaciones/:id/equipos
     * Asignar un equipo a una operación
     */
    async asignarEquipo(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { equipoId } = req.body;

            const resultado = await this.asignarEquipoAOperacion.ejecutar({
                operacionId: id,
                equipoId
            });

            if (resultado.success) {
                res.status(200).json({
                    success: true,
                    message: 'Equipo asignado exitosamente',
                    data: resultado.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: resultado.error
                });
            }
        } catch (error: any) {
            console.error('❌ Error en OperacionController.asignarEquipo:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}
