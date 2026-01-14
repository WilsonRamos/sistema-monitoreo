/**
 * ==================================
 * INTERFACE - REPOSITORIO DE EQUIPOS
 * ==================================
 * Define el contrato para persistencia de equipos
 * Patrón Repository (DDD)
 */

import { Equipo } from '../entidades/Equipo';

export interface IEquipoRepositorio {
    crear(equipo: Equipo): Promise<void>;
    obtenerTodos(): Promise<Equipo[]>;
    obtenerPorId(id: string): Promise<Equipo | null>;
    actualizar(equipo: Equipo): Promise<void>;
    eliminar(id: string): Promise<void>;
    buscarPorTipo(tipo: string): Promise<Equipo[]>;
    buscarPorEstado(estado: string): Promise<Equipo[]>;
    existeConCodigo(codigo: string): Promise<boolean>;
}
