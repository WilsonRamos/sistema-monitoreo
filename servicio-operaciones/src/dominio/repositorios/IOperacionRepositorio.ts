/**
 * ==================================
 * INTERFACE - REPOSITORIO DE OPERACIONES
 * ==================================
 * Define el contrato para persistencia de operaciones
 * Patrón Repository (DDD)
 */

import { Operacion } from '../entidades/Operacion';

export interface IOperacionRepositorio {
    crear(operacion: Operacion): Promise<void>;
    obtenerTodas(): Promise<Operacion[]>;
    obtenerPorId(id: string): Promise<Operacion | null>;
    obtenerActivas(): Promise<Operacion[]>;
    obtenerPorSupervisor(supervisorId: string): Promise<Operacion[]>;
    obtenerPorFrente(frenteId: string): Promise<Operacion[]>;
    actualizar(operacion: Operacion): Promise<void>;
    eliminar(id: string): Promise<void>;
}
