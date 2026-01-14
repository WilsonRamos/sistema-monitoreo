/**
 * ==================================
 * ROUTES - MONITOREO
 * ==================================
 * Define las rutas REST para monitoreo y alertas
 */

import { Router } from 'express';
import { MonitoreoController } from '../controllers/MonitoreoController';
import { IEquipoRepositorio } from '../../dominio/repositorios/IEquipoRepositorio';

export function crearMonitoreoRoutes(equipoRepositorio: IEquipoRepositorio): Router {
    const router = Router();
    const controller = new MonitoreoController(equipoRepositorio);

    // GET /api/monitoreo/alertas - Obtener alertas
    router.get('/alertas', (req, res) => controller.obtenerAlertas(req, res));

    // GET /api/monitoreo/kpis - Obtener KPIs de la flota
    router.get('/kpis', (req, res) => controller.obtenerKPIs(req, res));

    return router;
}
