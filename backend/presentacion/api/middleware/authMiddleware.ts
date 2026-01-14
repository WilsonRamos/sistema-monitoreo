import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RolUsuario } from '../../../aplicacion/Dominio/usuarios/modelo/usuario';

/**
 * MIDDLEWARE: Autenticación JWT
 *
 * Responsabilidad:
 * - Extraer y verificar el token JWT de las peticiones
 * - Adjuntar datos del usuario a req.user
 * - Rechazar peticiones sin token o token inválido
 */

// Extender Request de Express para incluir user
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                username: string;
                email: string;
                rol: RolUsuario;
                minaId?: string;
            };
        }
    }
}

export class AuthMiddleware {
    constructor(private jwtSecret: string) {}

    /**
     * Middleware que requiere autenticación
     */
    requireAuth = (req: Request, res: Response, next: NextFunction): void => {
        try {
            // ═══════════════════════════════════════
            // 1. EXTRAER TOKEN DEL HEADER
            // ═══════════════════════════════════════
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                res.status(401).json({
                    success: false,
                    message: 'No se proporcionó token de autenticación'
                });
                return;
            }

            // Formato esperado: "Bearer <token>"
            const parts = authHeader.split(' ');

            if (parts.length !== 2 || parts[0] !== 'Bearer') {
                res.status(401).json({
                    success: false,
                    message: 'Formato de token inválido. Use: Bearer <token>'
                });
                return;
            }

            const token = parts[1];

            // ═══════════════════════════════════════
            // 2. VERIFICAR Y DECODIFICAR TOKEN
            // ═══════════════════════════════════════
            const decoded = jwt.verify(token, this.jwtSecret) as any;

            // ═══════════════════════════════════════
            // 3. ADJUNTAR USUARIO A REQUEST
            // ═══════════════════════════════════════
            req.user = {
                userId: decoded.userId,
                username: decoded.username,
                email: decoded.email,
                rol: decoded.rol,
                minaId: decoded.minaId
            };

            console.log(`✅ Usuario autenticado: ${req.user.username} (${req.user.rol})`);

            next();
        } catch (error: any) {
            console.error('❌ Error en autenticación:', error.message);

            if (error.name === 'TokenExpiredError') {
                res.status(401).json({
                    success: false,
                    message: 'Token expirado. Por favor, inicie sesión nuevamente'
                });
                return;
            }

            if (error.name === 'JsonWebTokenError') {
                res.status(401).json({
                    success: false,
                    message: 'Token inválido'
                });
                return;
            }

            res.status(401).json({
                success: false,
                message: 'Error de autenticación'
            });
        }
    };

    /**
     * Middleware que requiere un rol específico
     */
    requireRole = (...rolesPermitidos: RolUsuario[]) => {
        return (req: Request, res: Response, next: NextFunction): void => {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }

            if (!rolesPermitidos.includes(req.user.rol)) {
                console.log(`❌ Acceso denegado: ${req.user.username} (${req.user.rol}) intentó acceder a ruta que requiere: ${rolesPermitidos.join(', ')}`);

                res.status(403).json({
                    success: false,
                    message: 'No tiene permisos para realizar esta acción',
                    requiredRoles: rolesPermitidos,
                    userRole: req.user.rol
                });
                return;
            }

            console.log(`✅ Autorización exitosa: ${req.user.username} tiene rol ${req.user.rol}`);

            next();
        };
    };

    /**
     * Middleware opcional de autenticación
     * Si hay token, lo valida. Si no hay, continúa sin req.user
     */
    optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                next();
                return;
            }

            const parts = authHeader.split(' ');

            if (parts.length !== 2 || parts[0] !== 'Bearer') {
                next();
                return;
            }

            const token = parts[1];
            const decoded = jwt.verify(token, this.jwtSecret) as any;

            req.user = {
                userId: decoded.userId,
                username: decoded.username,
                email: decoded.email,
                rol: decoded.rol,
                minaId: decoded.minaId
            };

            next();
        } catch (error) {
            // Si hay error, simplemente continuar sin usuario
            next();
        }
    };
}
