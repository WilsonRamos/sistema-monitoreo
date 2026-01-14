/**
 * ==================================
 * ROUTES - OPERACIONES
 * ==================================
 * Define las rutas REST para operaciones
 */

import { Router } from 'express';
import { OperacionController } from '../controllers/OperacionController';
import { IOperacionRepositorio } from '../../dominio/repositorios/IOperacionRepositorio';

export function crearOperacionesRoutes(operacionRepositorio: IOperacionRepositorio): Router {
    const router = Router();
    const controller = new OperacionController(operacionRepositorio);

    // POST /api/operaciones - Iniciar operación
    router.post('/', (req, res) => controller.crear(req, res));

    // GET /api/operaciones - Listar operaciones (con filtros opcionales)
    router.get('/', (req, res) => controller.listar(req, res));

    // PUT /api/operaciones/:id/finalizar - Finalizar operación
    router.put('/:id/finalizar', (req, res) => controller.finalizar(req, res));

    // POST /api/operaciones/:id/equipos - Asignar equipo a operación
    router.post('/:id/equipos', (req, res) => controller.asignarEquipo(req, res));

    return router;
}
