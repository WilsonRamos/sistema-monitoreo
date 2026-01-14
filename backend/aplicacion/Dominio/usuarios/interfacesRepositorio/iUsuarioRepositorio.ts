import { Usuario } from '../modelo/usuario';

/**
 * INTERFAZ: Repositorio de Usuarios
 *
 * Define el contrato para persistir y recuperar usuarios.
 * Siguiendo DDD, la interfaz está en el dominio
 * pero la implementación está en infraestructura.
 *
 * Esto permite:
 * - Inversión de dependencias (SOLID)
 * - Independencia de la tecnología de persistencia
 * - Facilita testing con mocks
 */
export interface IUsuarioRepositorio {
    /**
     * Guarda un nuevo usuario
     */
    guardar(usuario: Usuario): Promise<void>;

    /**
     * Busca un usuario por su ID
     */
    buscarPorId(id: string): Promise<Usuario | null>;

    /**
     * Busca un usuario por su username
     */
    buscarPorUsername(username: string): Promise<Usuario | null>;

    /**
     * Busca un usuario por su email
     */
    buscarPorEmail(email: string): Promise<Usuario | null>;

    /**
     * Obtiene todos los usuarios
     */
    obtenerTodos(): Promise<Usuario[]>;

    /**
     * Actualiza un usuario existente
     */
    actualizar(usuario: Usuario): Promise<void>;

    /**
     * Elimina un usuario
     */
    eliminar(id: string): Promise<void>;

    /**
     * Verifica si existe un username
     */
    existeUsername(username: string): Promise<boolean>;

    /**
     * Verifica si existe un email
     */
    existeEmail(email: string): Promise<boolean>;
}
