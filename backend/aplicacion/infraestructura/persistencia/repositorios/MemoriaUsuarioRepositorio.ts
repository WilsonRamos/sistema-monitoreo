import { Usuario } from '../../../Dominio/usuarios/modelo/usuario';
import { IUsuarioRepositorio } from '../../../Dominio/usuarios/interfacesRepositorio/iUsuarioRepositorio';

/**
 * IMPLEMENTACIÓN: Repositorio de Usuarios en Memoria
 *
 * Implementa IUsuarioRepositorio usando un Map en memoria.
 * En producción, esto sería reemplazado por una implementación
 * con base de datos real (Prisma, TypeORM, etc.)
 *
 * Ventajas de esta implementación:
 * - No requiere base de datos para desarrollo
 * - Rápida para prototipos
 * - Fácil de entender
 *
 * Desventajas:
 * - Los datos se pierden al reiniciar
 * - No funciona en múltiples instancias
 */
export class MemoriaUsuarioRepositorio implements IUsuarioRepositorio {
    private usuarios: Map<string, Usuario> = new Map();
    private usernameIndex: Map<string, string> = new Map(); // username -> id
    private emailIndex: Map<string, string> = new Map(); // email -> id

    constructor() {
        console.log('📦 MemoriaUsuarioRepositorio inicializado');
        this.inicializarUsuariosPorDefecto();
    }

    /**
     * Crea usuarios por defecto para pruebas
     */
    private inicializarUsuariosPorDefecto(): void {
        // Nota: En producción, los usuarios se crearían a través del registro
        // Estos son solo para facilitar las pruebas iniciales

        // Password hasheado de "Admin123!" (bcrypt, 10 rounds)
        const adminPasswordHash = '$2b$10$ETAs8jKbvUCr6RZc0ChIz.Z4K64qv0irHKdfz4vQvY7fpTUaT8uKm';

        // Password hasheado de "Super123!" (bcrypt, 10 rounds)
        const supervisorPasswordHash = '$2b$10$uOeKXcBTigFhR1B/KBCCXOcVlqNbeh78rKROWNVXi1qrBdZGjcnqC';

        // Password hasheado de "Opera123!" (bcrypt, 10 rounds)
        const operadorPasswordHash = '$2b$10$0cGHZ1ts0/.EOc8qF9IT8uiCGO1b7R2Vlo../cvuPX77V4odvVn8.';

        const usuariosPorDefecto = [
            new Usuario(
                '1',
                'admin',
                'admin@minera.com',
                adminPasswordHash,
                'ADMIN',
                true
            ),
            new Usuario(
                '2',
                'supervisor1',
                'supervisor@minera.com',
                supervisorPasswordHash,
                'SUPERVISOR',
                true,
                'mina-1'
            ),
            new Usuario(
                '3',
                'operador1',
                'operador@minera.com',
                operadorPasswordHash,
                'OPERADOR',
                true,
                'mina-1'
            )
        ];

        usuariosPorDefecto.forEach(usuario => {
            this.usuarios.set(usuario.id, usuario);
            this.usernameIndex.set(usuario.username, usuario.id);
            this.emailIndex.set(usuario.email, usuario.id);
        });

        console.log(`✅ ${usuariosPorDefecto.length} usuarios por defecto creados`);
        console.log(`   - admin / Admin123! (ADMIN)`);
        console.log(`   - supervisor1 / Super123! (SUPERVISOR)`);
        console.log(`   - operador1 / Opera123! (OPERADOR)`);
    }

    async guardar(usuario: Usuario): Promise<void> {
        this.usuarios.set(usuario.id, usuario);
        this.usernameIndex.set(usuario.username, usuario.id);
        this.emailIndex.set(usuario.email, usuario.id);

        console.log(`💾 Usuario guardado: ${usuario.username} (ID: ${usuario.id})`);
    }

    async buscarPorId(id: string): Promise<Usuario | null> {
        return this.usuarios.get(id) || null;
    }

    async buscarPorUsername(username: string): Promise<Usuario | null> {
        const id = this.usernameIndex.get(username);
        if (!id) return null;

        return this.usuarios.get(id) || null;
    }

    async buscarPorEmail(email: string): Promise<Usuario | null> {
        const id = this.emailIndex.get(email);
        if (!id) return null;

        return this.usuarios.get(id) || null;
    }

    async obtenerTodos(): Promise<Usuario[]> {
        return Array.from(this.usuarios.values());
    }

    async actualizar(usuario: Usuario): Promise<void> {
        const usuarioExistente = this.usuarios.get(usuario.id);

        if (!usuarioExistente) {
            throw new Error(`Usuario con ID ${usuario.id} no encontrado`);
        }

        // Actualizar índices si cambió el username o email
        if (usuarioExistente.username !== usuario.username) {
            this.usernameIndex.delete(usuarioExistente.username);
            this.usernameIndex.set(usuario.username, usuario.id);
        }

        if (usuarioExistente.email !== usuario.email) {
            this.emailIndex.delete(usuarioExistente.email);
            this.emailIndex.set(usuario.email, usuario.id);
        }

        this.usuarios.set(usuario.id, usuario);

        console.log(`🔄 Usuario actualizado: ${usuario.username}`);
    }

    async eliminar(id: string): Promise<void> {
        const usuario = this.usuarios.get(id);

        if (!usuario) {
            throw new Error(`Usuario con ID ${id} no encontrado`);
        }

        this.usuarios.delete(id);
        this.usernameIndex.delete(usuario.username);
        this.emailIndex.delete(usuario.email);

        console.log(`🗑️ Usuario eliminado: ${usuario.username}`);
    }

    async existeUsername(username: string): Promise<boolean> {
        return this.usernameIndex.has(username);
    }

    async existeEmail(email: string): Promise<boolean> {
        return this.emailIndex.has(email);
    }

    /**
     * Método de utilidad para desarrollo: Listar todos los usuarios
     */
    listarUsuarios(): void {
        console.log('\n📋 Usuarios en el sistema:');
        this.usuarios.forEach((usuario, id) => {
            console.log(`   - ${usuario.username} (${usuario.rol}) - ${usuario.email}`);
        });
        console.log(`   Total: ${this.usuarios.size} usuarios\n`);
    }
}
