import { IUsuarioRepositorio } from '../../Dominio/usuarios/interfacesRepositorio/iUsuarioRepositorio';
import { PasswordServicio } from '../../Dominio/usuarios/servicios/passwordServicio';
import jwt, { SignOptions } from 'jsonwebtoken';

/**
 * CASO DE USO: Login
 *
 * Responsabilidad:
 * - Validar credenciales del usuario
 * - Generar token JWT
 * - Registrar último acceso
 *
 * Aplicando Clean Architecture:
 * - Capa de Aplicación (orquestación)
 * - Depende de abstracciones del Dominio
 */

export interface LoginDTO {
    username: string;
    password: string;
}

export interface LoginResultado {
    success: boolean;
    message: string;
    token?: string;
    usuario?: {
        id: string;
        username: string;
        email: string;
        rol: string;
        minaId?: string;
    };
}

export class Login {
    constructor(
        private usuarioRepositorio: IUsuarioRepositorio,
        private jwtSecret: string,
        private jwtExpiresIn: string | number = '24h'
    ) {}

    async ejecutar(dto: LoginDTO): Promise<LoginResultado> {
        try {
            // ═══════════════════════════════════════
            // 1. VALIDAR DATOS DE ENTRADA
            // ═══════════════════════════════════════
            if (!dto.username || !dto.password) {
                return {
                    success: false,
                    message: 'Username y contraseña son requeridos'
                };
            }

            // ═══════════════════════════════════════
            // 2. BUSCAR USUARIO POR USERNAME
            // ═══════════════════════════════════════
            const usuario = await this.usuarioRepositorio.buscarPorUsername(dto.username);

            if (!usuario) {
                return {
                    success: false,
                    message: 'Credenciales inválidas'
                };
            }

            // ═══════════════════════════════════════
            // 3. VERIFICAR SI USUARIO ESTÁ ACTIVO
            // ═══════════════════════════════════════
            if (!usuario.activo) {
                return {
                    success: false,
                    message: 'Usuario desactivado. Contacte al administrador'
                };
            }

            // ═══════════════════════════════════════
            // 4. VERIFICAR CONTRASEÑA
            // ═══════════════════════════════════════
            const passwordValida = await PasswordServicio.comparar(
                dto.password,
                usuario.passwordHash
            );

            if (!passwordValida) {
                console.log(`❌ Intento de login fallido para: ${dto.username}`);
                return {
                    success: false,
                    message: 'Credenciales inválidas'
                };
            }

            // ═══════════════════════════════════════
            // 5. REGISTRAR ÚLTIMO ACCESO
            // ═══════════════════════════════════════
            usuario.registrarAcceso();
            await this.usuarioRepositorio.actualizar(usuario);

            // ═══════════════════════════════════════
            // 6. GENERAR JWT
            // ═══════════════════════════════════════
            const payload = usuario.toJWTPayload();

            const signOptions: SignOptions = {
                expiresIn: this.jwtExpiresIn as any,
                issuer: 'sistema-monitoreo-api',
                audience: 'sistema-monitoreo-frontend'
            };

            const token = jwt.sign(payload, this.jwtSecret, signOptions);

            console.log(`✅ Login exitoso: ${usuario.username} (${usuario.rol})`);

            // ═══════════════════════════════════════
            // 7. RETORNAR RESULTADO
            // ═══════════════════════════════════════
            return {
                success: true,
                message: 'Login exitoso',
                token,
                usuario: {
                    id: usuario.id,
                    username: usuario.username,
                    email: usuario.email,
                    rol: usuario.rol,
                    minaId: usuario.minaId
                }
            };
        } catch (error: any) {
            console.error('❌ Error en login:', error);

            return {
                success: false,
                message: 'Error al procesar login'
            };
        }
    }
}
