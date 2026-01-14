/**
 * operaciones.routes.ts - Rutas Express para Operaciones
 *
 * CONCEPTO: Router Pattern (Express)
 * ===================================
 * Express Router permite modularizar rutas.
 * En lugar de registrar todas las rutas en app.ts,
 * creamos routers específicos por módulo.
 *
 * VENTAJAS:
 * - Organización: Rutas agrupadas por contexto
 * - Testeable: Podemos testear el router aisladamente
 * - Escalable: Fácil agregar nuevas rutas
 * - Mantenible: Cambios en un contexto no afectan otros
 *
 * ESTRUCTURA:
 * /api/operaciones       → este router
 * /api/equipos          → otro router
 * /api/supervisores     → otro router
 */

import { Router } from 'express';
import { OperacionesController } from '../controllers/OperacionesController';

/**
 * CONCEPTO: Factory Function
 * ===========================
 * Esta función crea y configura el router.
 * Recibe el controller por parámetro (Dependency Injection).
 *
 * VENTAJAS:
 * - No crea dependencias internamente (testeable)
 * - Configuración centralizada
 * - Reutilizable
 */
export function crearRutasOperaciones(controller: OperacionesController): Router {
    const router = Router();

    /**
     * CONCEPTO: RESTful Routes
     * ========================
     * Seguimos convenciones REST:
     *
     * POST   /api/operaciones          → Crear nueva operación
     * GET    /api/operaciones          → Listar todas (futuro)
     * GET    /api/operaciones/:id      → Obtener una (futuro)
     * PUT    /api/operaciones/:id      → Actualizar (futuro)
     * DELETE /api/operaciones/:id      → Eliminar (futuro)
     *
     * Por ahora solo implementamos POST (crear).
     */

    /**
     * POST /api/operaciones
     *
     * CONCEPTO: Route Handler Binding
     * ================================
     * Usamos arrow function para preservar 'this' del controller.
     *
     * INCORRECTO: router.post('/', controller.crear)
     * (pierde contexto de 'this')
     *
     * CORRECTO: router.post('/', (req, res) => controller.crear(req, res))
     * (preserva 'this')
     */
    router.post('/', (req, res) => controller.crear(req, res));

    console.log('🛣️ Rutas de operaciones configuradas');
    return router;
}

/**
 * CONCEPTOS APLICADOS EN ESTE ARCHIVO:
 * ======================================
 *
 * EXPRESS PATTERNS:
 * 1. ✅ Router Pattern (modularización)
 * 2. ✅ Factory Function (crear router)
 * 3. ✅ Route Handler (vincular controller)
 *
 * REST API:
 * 4. ✅ RESTful conventions (POST para crear)
 * 5. ✅ Resource-based URLs (/api/operaciones)
 *
 * DEPENDENCY INJECTION:
 * 6. ✅ Controller inyectado (no creado internamente)
 *
 * JAVASCRIPT CONCEPTS:
 * 7. ✅ Arrow functions (preservar contexto)
 * 8. ✅ Function scope (router como closure)
 *
 * NEXT STEPS:
 * ===========
 * Para completar las rutas REST, agregar:
 * - GET    /api/operaciones          → obtenerTodas()
 * - GET    /api/operaciones/activas  → obtenerActivas()
 * - GET    /api/operaciones/:id      → obtenerPorId()
 * - PUT    /api/operaciones/:id/finalizar → finalizar()
 * - DELETE /api/operaciones/:id      → eliminar()
 */
