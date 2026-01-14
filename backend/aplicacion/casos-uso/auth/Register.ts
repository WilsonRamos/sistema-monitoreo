import { Usuario, RolUsuario } from '../../Dominio/usuarios/modelo/usuario';
import { IUsuarioRepositorio } from '../../Dominio/usuarios/interfacesRepositorio/iUsuarioRepositorio';
import { PasswordServicio } from '../../Dominio/usuarios/servicios/passwordServicio';
import crypto from 'crypto';

/**
 * CASO DE USO: Registrar Usuario
 *
 * Responsabilidad:
 * - Validar que el username y email sean únicos
 * - Hashear la contraseña
 * - Crear el usuario en el sistema
 *
 * Aplicando Clean Architecture:
 * - Capa de Aplicación (orquestación)
 * - Depende de abstracciones del Dominio
 * - No depende de detalles de infraestructura
 */

export interface RegisterDTO {
    username: string;
    email: string;
    password: string;
    rol?: RolUsuario;
    minaId?: string;
}

export interface RegisterResultado {
    success: boolean;
    message: string;
    usuario?: {
        id: string;
        username: string;
        email: string;
        rol: RolUsuario;
    };
}

export class Register {
    constructor(private usuarioRepositorio: IUsuarioRepositorio) {}

    async ejecutar(dto: RegisterDTO): Promise<RegisterResultado> {
        try {
            // ═══════════════════════════════════════
            // 1. VALIDAR DATOS DE ENTRADA
            // ═══════════════════════════════════════
            if (!dto.username || !dto.email || !dto.password) {
                return {
                    success: false,
                    message: 'Username, email y contraseña son requeridos'
                };
            }

            // ═══════════════════════════════════════
            // 2. VERIFICAR QUE USERNAME SEA ÚNICO
            // ═══════════════════════════════════════
            const usernameExiste = await this.usuarioRepositorio.existeUsername(dto.username);
            if (usernameExiste) {
                return {
                    success: false,
                    message: 'El username ya está en uso'
                };
            }

            // ═══════════════════════════════════════
            // 3. VERIFICAR QUE EMAIL SEA ÚNICO
            // ═══════════════════════════════════════
            const emailExiste = await this.usuarioRepositorio.existeEmail(dto.email);
            if (emailExiste) {
                return {
                    success: false,
                    message: 'El email ya está registrado'
                };
            }

            // ═══════════════════════════════════════
            // 4. VALIDAR Y HASHEAR CONTRASEÑA
            // ═══════════════════════════════════════
            PasswordServicio.validarPassword(dto.password);
            const passwordHash = await PasswordServicio.hashear(dto.password);

            // ═══════════════════════════════════════
            // 5. CREAR USUARIO
            // ═══════════════════════════════════════
            const id = crypto.randomUUID();
            const rol = dto.rol || 'OPERADOR'; // Por defecto OPERADOR

            const usuario = new Usuario(
                id,
                dto.username,
                dto.email,
                passwordHash,
                rol,
                true,
                dto.minaId
            );

            // ═══════════════════════════════════════
            // 6. PERSISTIR USUARIO
            // ═══════════════════════════════════════
            await this.usuarioRepositorio.guardar(usuario);

            console.log(`✅ Usuario registrado: ${usuario.username} (${usuario.rol})`);

            return {
                success: true,
                message: 'Usuario registrado exitosamente',
                usuario: {
                    id: usuario.id,
                    username: usuario.username,
                    email: usuario.email,
                    rol: usuario.rol
                }
            };
        } catch (error: any) {
            console.error('❌ Error al registrar usuario:', error);

            return {
                success: false,
                message: error.message || 'Error al registrar usuario'
            };
        }
    }
}
