/**
 * ==================================
 * ROUTES - KPIS
 * ==================================
 * Define las rutas REST para KPIs de operaciones
 */

import { Router } from 'express';
import { KPIsController } from '../controllers/KPIsController';
import { IOperacionRepositorio } from '../../dominio/repositorios/IOperacionRepositorio';

export function crearKPIsRoutes(operacionRepositorio: IOperacionRepositorio): Router {
    const router = Router();
    const controller = new KPIsController(operacionRepositorio);

    // GET /api/kpis - Obtener KPIs de operaciones
    router.get('/', (req, res) => controller.obtenerKPIs(req, res));

    return router;
}
