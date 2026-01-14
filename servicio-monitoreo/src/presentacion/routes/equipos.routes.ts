/**
 * ==================================
 * ROUTES - EQUIPOS
 * ==================================
 * Define las rutas REST para equipos
 */

import { Router } from 'express';
import { EquipoController } from '../controllers/EquipoController';
import { IEquipoRepositorio } from '../../dominio/repositorios/IEquipoRepositorio';

export function crearEquiposRoutes(equipoRepositorio: IEquipoRepositorio): Router {
    const router = Router();
    const controller = new EquipoController(equipoRepositorio);

    // POST /api/equipos - Crear equipo
    router.post('/', (req, res) => controller.crear(req, res));

    // GET /api/equipos - Listar equipos (con filtros opcionales)
    router.get('/', (req, res) => controller.listar(req, res));

    // PUT /api/equipos/:id/estado - Actualizar estado de equipo
    router.put('/:id/estado', (req, res) => controller.actualizarEstado(req, res));

    return router;
}
