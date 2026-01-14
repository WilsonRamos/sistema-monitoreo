import bcrypt from 'bcrypt';

/**
 * SERVICIO DE DOMINIO: PasswordServicio
 *
 * Encapsula la lógica de hashing y verificación de contraseñas.
 * Es un servicio de dominio porque:
 * - No pertenece naturalmente a una entidad específica
 * - Implementa lógica de negocio importante (seguridad)
 * - Es stateless (sin estado)
 */
export class PasswordServicio {
    private static readonly SALT_ROUNDS = 10;

    /**
     * Hashea una contraseña usando bcrypt
     *
     * @param password - Contraseña en texto plano
     * @returns Hash de la contraseña
     */
    static async hashear(password: string): Promise<string> {
        // Validar contraseña antes de hashear
        this.validarPassword(password);

        return await bcrypt.hash(password, this.SALT_ROUNDS);
    }

    /**
     * Compara una contraseña en texto plano con su hash
     *
     * @param password - Contraseña en texto plano
     * @param hash - Hash almacenado
     * @returns true si coinciden, false si no
     */
    static async comparar(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }

    /**
     * Valida que una contraseña cumpla los requisitos de seguridad
     *
     * Requisitos:
     * - Mínimo 8 caracteres
     * - Al menos una mayúscula
     * - Al menos una minúscula
     * - Al menos un número
     * - Al menos un carácter especial
     */
    static validarPassword(password: string): void {
        if (!password || password.trim() === '') {
            throw new Error('La contraseña no puede estar vacía');
        }

        if (password.length < 8) {
            throw new Error('La contraseña debe tener al menos 8 caracteres');
        }

        if (password.length > 128) {
            throw new Error('La contraseña no puede tener más de 128 caracteres');
        }

        // Al menos una mayúscula
        if (!/[A-Z]/.test(password)) {
            throw new Error('La contraseña debe contener al menos una letra mayúscula');
        }

        // Al menos una minúscula
        if (!/[a-z]/.test(password)) {
            throw new Error('La contraseña debe contener al menos una letra minúscula');
        }

        // Al menos un número
        if (!/[0-9]/.test(password)) {
            throw new Error('La contraseña debe contener al menos un número');
        }

        // Al menos un carácter especial
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            throw new Error('La contraseña debe contener al menos un carácter especial');
        }

        // No permitir espacios
        if (/\s/.test(password)) {
            throw new Error('La contraseña no puede contener espacios');
        }
    }

    /**
     * Genera una contraseña temporal segura
     *
     * @returns Contraseña temporal aleatoria
     */
    static generarPasswordTemporal(): string {
        const mayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const minusculas = 'abcdefghijklmnopqrstuvwxyz';
        const numeros = '0123456789';
        const especiales = '!@#$%^&*';

        let password = '';

        // Asegurar que tenga al menos uno de cada tipo
        password += mayusculas[Math.floor(Math.random() * mayusculas.length)];
        password += minusculas[Math.floor(Math.random() * minusculas.length)];
        password += numeros[Math.floor(Math.random() * numeros.length)];
        password += especiales[Math.floor(Math.random() * especiales.length)];

        // Completar hasta 12 caracteres
        const todos = mayusculas + minusculas + numeros + especiales;
        for (let i = 0; i < 8; i++) {
            password += todos[Math.floor(Math.random() * todos.length)];
        }

        // Mezclar caracteres
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }
}
