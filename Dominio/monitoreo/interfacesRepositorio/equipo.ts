// Dominio/monitoreo/interfacesRepositorio/equipo.ts
// OPCIÓN 2: Si debe ser una INTERFACE

/**
 * Interface para definir la estructura de un Equipo
 */
export interface IEquipo {
    id: string;
    codigo: string;
    tipo: string;
    estado: string;
    nivelCombustible: number;
    horasOperacion: number;
}

/**
 * Interface para datos de creación de equipo
 */
export interface CrearEquipoData {
    codigo: string;
    tipo: string;
    nivelCombustible?: number;
    horasOperacion?: number;
}

/**
 * Interface para filtros de consulta
 */
export interface FiltrosEquipo {
    tipo?: string;
    estado?: string;
}