import crypto from 'crypto';

/**
 * Roles disponibles en el sistema
 */
export type RolUsuario = 'ADMIN' | 'SUPERVISOR' | 'OPERADOR';

/**
 * ENTIDAD: Usuario
 *
 * Representa un usuario del sistema de monitoreo minero.
 * Aplicando Domain-Driven Design (DDD):
 * - Aggregate Root del bounded context de Usuarios
 * - Encapsula reglas de negocio de autenticación
 * - Valida invariantes del dominio
 */
export class Usuario {
    private _id: string;
    private _username: string;
    private _email: string;
    private _passwordHash: string;
    private _rol: RolUsuario;
    private _activo: boolean;
    private _minaId?: string;
    private _creadoEn: Date;
    private _ultimoAcceso?: Date;

    constructor(
        id: string,
        username: string,
        email: string,
        passwordHash: string,
        rol: RolUsuario,
        activo: boolean = true,
        minaId?: string
    ) {
        // Validaciones de negocio
        this.validarUsername(username);
        this.validarEmail(email);
        this.validarRol(rol);

        this._id = id;
        this._username = username;
        this._email = email;
        this._passwordHash = passwordHash;
        this._rol = rol;
        this._activo = activo;
        this._minaId = minaId;
        this._creadoEn = new Date();
    }

    // ═══════════════════════════════════════════════════════
    // GETTERS
    // ═══════════════════════════════════════════════════════

    get id(): string {
        return this._id;
    }

    get username(): string {
        return this._username;
    }

    get email(): string {
        return this._email;
    }

    get passwordHash(): string {
        return this._passwordHash;
    }

    get rol(): RolUsuario {
        return this._rol;
    }

    get activo(): boolean {
        return this._activo;
    }

    get minaId(): string | undefined {
        return this._minaId;
    }

    get creadoEn(): Date {
        return this._creadoEn;
    }

    get ultimoAcceso(): Date | undefined {
        return this._ultimoAcceso;
    }

    // ═══════════════════════════════════════════════════════
    // MÉTODOS DE NEGOCIO
    // ═══════════════════════════════════════════════════════

    /**
     * Registra el último acceso del usuario
     */
    registrarAcceso(): void {
        this._ultimoAcceso = new Date();
    }

    /**
     * Activa el usuario
     */
    activar(): void {
        this._activo = true;
    }

    /**
     * Desactiva el usuario
     */
    desactivar(): void {
        this._activo = false;
    }

    /**
     * Cambia el rol del usuario
     */
    cambiarRol(nuevoRol: RolUsuario): void {
        this.validarRol(nuevoRol);
        this._rol = nuevoRol;
    }

    /**
     * Asigna una mina al usuario
     */
    asignarMina(minaId: string): void {
        if (!minaId || minaId.trim() === '') {
            throw new Error('ID de mina inválido');
        }
        this._minaId = minaId;
    }

    /**
     * Cambia la contraseña del usuario
     */
    cambiarPassword(nuevoPasswordHash: string): void {
        if (!nuevoPasswordHash || nuevoPasswordHash.trim() === '') {
            throw new Error('Hash de contraseña inválido');
        }
        this._passwordHash = nuevoPasswordHash;
    }

    /**
     * Genera un token de sesión temporal
     * (NO es el JWT, es para casos especiales)
     */
    generarTokenSesion(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Verifica si el usuario tiene un rol específico
     */
    tieneRol(rol: RolUsuario): boolean {
        return this._rol === rol;
    }

    /**
     * Verifica si el usuario puede acceder a una mina específica
     */
    puedeAccederMina(minaId: string): boolean {
        // Admin puede acceder a todas las minas
        if (this._rol === 'ADMIN') {
            return true;
        }

        // Otros roles solo pueden acceder a su mina asignada
        return this._minaId === minaId;
    }

    /**
     * Serializa el usuario para JWT (sin datos sensibles)
     */
    toJWTPayload(): {
        userId: string;
        username: string;
        email: string;
        rol: RolUsuario;
        minaId?: string;
    } {
        return {
            userId: this._id,
            username: this._username,
            email: this._email,
            rol: this._rol,
            minaId: this._minaId
        };
    }

    /**
     * Serializa el usuario para respuestas API (sin password)
     */
    toJSON(): {
        id: string;
        username: string;
        email: string;
        rol: RolUsuario;
        activo: boolean;
        minaId?: string;
        creadoEn: string;
        ultimoAcceso?: string;
    } {
        return {
            id: this._id,
            username: this._username,
            email: this._email,
            rol: this._rol,
            activo: this._activo,
            minaId: this._minaId,
            creadoEn: this._creadoEn.toISOString(),
            ultimoAcceso: this._ultimoAcceso?.toISOString()
        };
    }

    // ═══════════════════════════════════════════════════════
    // VALIDACIONES PRIVADAS
    // ═══════════════════════════════════════════════════════

    private validarUsername(username: string): void {
        if (!username || username.trim() === '') {
            throw new Error('Username no puede estar vacío');
        }

        if (username.length < 3) {
            throw new Error('Username debe tener al menos 3 caracteres');
        }

        if (username.length > 50) {
            throw new Error('Username no puede tener más de 50 caracteres');
        }

        // Solo alfanuméricos, guiones y puntos
        const usernameRegex = /^[a-zA-Z0-9._-]+$/;
        if (!usernameRegex.test(username)) {
            throw new Error('Username solo puede contener letras, números, puntos, guiones y guiones bajos');
        }
    }

    private validarEmail(email: string): void {
        if (!email || email.trim() === '') {
            throw new Error('Email no puede estar vacío');
        }

        // Validación simple de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Email inválido');
        }
    }

    private validarRol(rol: RolUsuario): void {
        const rolesValidos: RolUsuario[] = ['ADMIN', 'SUPERVISOR', 'OPERADOR'];
        if (!rolesValidos.includes(rol)) {
            throw new Error(`Rol inválido. Debe ser uno de: ${rolesValidos.join(', ')}`);
        }
    }
}
