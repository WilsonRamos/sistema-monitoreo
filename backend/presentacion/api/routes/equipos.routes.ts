import { Router } from 'express';
import { EquipoController } from '../controllers/EquipoController';

/**
 * Crear y configurar rutas para equipos
 * 
 * Conceptos aplicados:
 * - Express Router
 * - REST API endpoints
 * - Route organization
 * - Method binding
 * 
 * @param equipoController - Controller inyectado con casos de uso
 * @returns Router configurado con todas las rutas de equipos
 */
export function crearRutasEquipos(equipoController: EquipoController): Router {
    console.log('🛣️ Configurando rutas de equipos...');
    
    const router = Router();

    // ===================================
    // CONFIGURACIÓN DE RUTAS REST
    // ===================================

    // POST /api/equipos - Crear nuevo equipo
    router.post('/', 
        (req, res) => equipoController.crear(req, res)
    );

    // GET /api/equipos - Obtener todos los equipos (con filtros opcionales)
    router.get('/', 
        (req, res) => equipoController.obtenerTodos(req, res)
    );

    // GET /api/equipos/:id - Obtener equipo específico por ID
    router.get('/:id', 
        (req, res) => equipoController.obtenerPorId(req, res)
    );

    // Logging de rutas configuradas
    console.log('✅ Rutas de equipos configuradas:');
    console.log('   📝 POST   /api/equipos     - Crear equipo');
    console.log('   📋 GET    /api/equipos     - Listar equipos');
    console.log('   🔍 GET    /api/equipos/:id - Obtener equipo por ID');
    console.log('   💡 Query params soportados: ?tipo=VOLQUETE&estado=DISPONIBLE');

    return router;
}