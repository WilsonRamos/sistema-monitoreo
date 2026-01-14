import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthMiddleware } from '../middleware/authMiddleware';

/**
 * Crear y configurar rutas de autenticación
 *
 * @param authController - Controller de autenticación
 * @param authMiddleware - Middleware de autenticación
 * @returns Router configurado
 */
export function crearRutasAuth(
    authController: AuthController,
    authMiddleware: AuthMiddleware
): Router {
    console.log('🛣️ Configurando rutas de autenticación...');

    const router = Router();

    // ═══════════════════════════════════════════════════════
    // RUTAS PÚBLICAS (Sin autenticación)
    // ═══════════════════════════════════════════════════════

    /**
     * POST /api/auth/login
     * Login de usuario
     */
    router.post('/login', (req, res) => authController.login(req, res));

    /**
     * POST /api/auth/register
     * Registro de nuevo usuario
     */
    router.post('/register', (req, res) => authController.register(req, res));

    // ═══════════════════════════════════════════════════════
    // RUTAS PROTEGIDAS (Requieren autenticación)
    // ═══════════════════════════════════════════════════════

    /**
     * GET /api/auth/me
     * Obtener información del usuario actual
     */
    router.get('/me', authMiddleware.requireAuth, (req, res) =>
        authController.me(req, res)
    );

    /**
     * POST /api/auth/logout
     * Cerrar sesión
     */
    router.post('/logout', authMiddleware.requireAuth, (req, res) =>
        authController.logout(req, res)
    );

    // Logging de rutas configuradas
    console.log('✅ Rutas de autenticación configuradas:');
    console.log('   🔓 POST   /api/auth/login      - Login');
    console.log('   🔓 POST   /api/auth/register   - Registro');
    console.log('   🔒 GET    /api/auth/me         - Usuario actual');
    console.log('   🔒 POST   /api/auth/logout     - Logout');

    return router;
}
