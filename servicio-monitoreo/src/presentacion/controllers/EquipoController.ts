/**
 * ==================================
 * CONTROLLER - EQUIPOS
 * ==================================
 * Maneja las peticiones HTTP relacionadas con equipos
 */

import { Request, Response } from 'express';
import { CrearEquipo } from '../../aplicacion/casos-uso/CrearEquipo';
import { ObtenerEquipos } from '../../aplicacion/casos-uso/ObtenerEquipos';
import { ActualizarEstadoEquipo } from '../../aplicacion/casos-uso/ActualizarEstadoEquipo';
import { IEquipoRepositorio } from '../../dominio/repositorios/IEquipoRepositorio';

export class EquipoController {
    private crearEquipo: CrearEquipo;
    private obtenerEquipos: ObtenerEquipos;
    private actualizarEstadoEquipo: ActualizarEstadoEquipo;

    constructor(equipoRepositorio: IEquipoRepositorio) {
        this.crearEquipo = new CrearEquipo(equipoRepositorio);
        this.obtenerEquipos = new ObtenerEquipos(equipoRepositorio);
        this.actualizarEstadoEquipo = new ActualizarEstadoEquipo(equipoRepositorio);
    }

    /**
     * POST /api/equipos
     * Crear un equipo nuevo
     */
    async crear(req: Request, res: Response): Promise<void> {
        try {
            const { codigo, tipo, nivelCombustible, horasOperacion } = req.body;

            const resultado = await this.crearEquipo.ejecutar({
                codigo,
                tipo,
                nivelCombustible,
                horasOperacion
            });

            if (resultado.success) {
                res.status(201).json({
                    success: true,
                    message: 'Equipo creado exitosamente',
                    data: resultado.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: resultado.error
                });
            }
        } catch (error: any) {
            console.error('❌ Error en EquipoController.crear:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * GET /api/equipos
     * Obtener listado de equipos con filtros opcionales
     * Query params: tipo, estado
     */
    async listar(req: Request, res: Response): Promise<void> {
        try {
            const { tipo, estado } = req.query;

            const resultado = await this.obtenerEquipos.ejecutar({
                tipo: tipo as string,
                estado: estado as string
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
            console.error('❌ Error en EquipoController.listar:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * PUT /api/equipos/:id/estado
     * Actualizar estado de un equipo
     */
    async actualizarEstado(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { estado } = req.body;

            const resultado = await this.actualizarEstadoEquipo.ejecutar({
                equipoId: id,
                nuevoEstado: estado
            });

            if (resultado.success) {
                res.status(200).json({
                    success: true,
                    message: 'Estado actualizado exitosamente',
                    data: resultado.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: resultado.error
                });
            }
        } catch (error: any) {
            console.error('❌ Error en EquipoController.actualizarEstado:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}
