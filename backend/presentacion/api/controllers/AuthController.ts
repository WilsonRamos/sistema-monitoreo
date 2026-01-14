import { Request, Response } from 'express';
import { Login } from '../../../aplicacion/casos-uso/auth/Login';
import { Register } from '../../../aplicacion/casos-uso/auth/Register';

/**
 * CONTROLLER: Autenticación
 *
 * Responsabilidad:
 * - Manejar peticiones HTTP relacionadas con autenticación
 * - Validar datos de entrada
 * - Invocar casos de uso
 * - Formatear respuestas HTTP
 */
export class AuthController {
    constructor(
        private loginUseCase: Login,
        private registerUseCase: Register
    ) {}

    /**
     * POST /api/auth/login
     *
     * Autentica un usuario y devuelve un token JWT
     */
    login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { username, password } = req.body;

            console.log(`🔐 Intento de login: ${username}`);

            const resultado = await this.loginUseCase.ejecutar({
                username,
                password
            });

            if (resultado.success) {
                res.status(200).json(resultado);
            } else {
                res.status(401).json(resultado);
            }
        } catch (error: any) {
            console.error('❌ Error en login controller:', error);

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    };

    /**
     * POST /api/auth/register
     *
     * Registra un nuevo usuario en el sistema
     */
    register = async (req: Request, res: Response): Promise<void> => {
        try {
            const { username, email, password, rol, minaId } = req.body;

            console.log(`📝 Intento de registro: ${username}`);

            const resultado = await this.registerUseCase.ejecutar({
                username,
                email,
                password,
                rol,
                minaId
            });

            if (resultado.success) {
                res.status(201).json(resultado);
            } else {
                res.status(400).json(resultado);
            }
        } catch (error: any) {
            console.error('❌ Error en register controller:', error);

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    };

    /**
     * GET /api/auth/me
     *
     * Obtiene información del usuario autenticado actual
     * Requiere autenticación (middleware)
     */
    me = async (req: Request, res: Response): Promise<void> => {
        try {
            // req.user fue adjuntado por el middleware de autenticación
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'No autenticado'
                });
                return;
            }

            res.status(200).json({
                success: true,
                usuario: req.user
            });
        } catch (error: any) {
            console.error('❌ Error en me controller:', error);

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    };

    /**
     * POST /api/auth/logout
     *
     * Cierra la sesión del usuario
     * (En JWT, esto es principalmente del lado del cliente)
     */
    logout = async (req: Request, res: Response): Promise<void> => {
        try {
            // En JWT, el logout es principalmente del lado del cliente
            // (eliminar token del localStorage)

            // Aquí podrías implementar blacklist si lo necesitas:
            // - Agregar token a Redis con TTL igual a su expiración
            // - El middleware verificaría la blacklist antes de aceptar tokens

            console.log(`👋 Logout: ${req.user?.username || 'Usuario desconocido'}`);

            res.status(200).json({
                success: true,
                message: 'Logout exitoso'
            });
        } catch (error: any) {
            console.error('❌ Error en logout controller:', error);

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    };
}
