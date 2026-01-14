
import { Equipo } from '../monitoreo/Equipo';

/**
 * Interface del Repositorio de Equipos
 * 
 * Concepto: Repository Pattern
 * - El DOMINIO define QUÉ operaciones necesita
 * - La INFRAESTRUCTURA define CÓMO se implementan
 * 
 * Buena Práctica: Operaciones CRUD + operaciones específicas del dominio
 */
export interface IEquipoRepositorio {
    
    // ===================================
    // OPERACIONES CRUD BÁSICAS
    // ===================================
    // Concepto: Estas son las operaciones estándar que exige el laboratorio
    
    /**
     * Crear un nuevo equipo
     * @param equipo - Entidad de dominio a persistir
     */
    crear(equipo: Equipo): Promise<void>;

    /**
     * Obtener todos los equipos
     * @returns Lista de equipos del dominio
     */
    obtenerTodos(): Promise<Equipo[]>;

    /**
     * Buscar equipo por ID único
     * @param id - Identificador único del equipo
     * @returns Equipo encontrado o null si no existe
     */
    obtenerPorId(id: string): Promise<Equipo | null>;

    /**
     * Actualizar un equipo existente
     * @param equipo - Entidad de dominio con los cambios
     */
    actualizar(equipo: Equipo): Promise<void>;

    /**
     * Eliminar un equipo
     * @param id - Identificador único del equipo a eliminar
     */
    eliminar(id: string): Promise<void>;

    // ===================================
    // OPERACIONES ESPECÍFICAS DEL DOMINIO
    // ===================================
    // Concepto: Más allá del CRUD básico, operaciones que el negocio necesita
    
    /**
     * Buscar equipos por tipo
     * @param tipo - Tipo de equipo (VOLQUETE, EXCAVADORA, etc.)
     */
    buscarPorTipo(tipo: string): Promise<Equipo[]>;

    /**
     * Buscar equipos por estado
     * @param estado - Estado del equipo (DISPONIBLE, OPERANDO, etc.)
     */
    buscarPorEstado(estado: string): Promise<Equipo[]>;

    /**
     * Verificar si existe un equipo con el código específico
     * @param codigo - Código único del equipo
     * @returns true si existe, false si no
     */
    existeConCodigo(codigo: string): Promise<boolean>;
}