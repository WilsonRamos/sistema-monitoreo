import { Supervisor } from '../modelo/supervisor';

export interface ISupervisorRepositorio {
    crear(supervisor: Supervisor): Promise<void>;
    
    eliminar(id: string): Promise<void>;
    
    actualizar(supervisor: Supervisor): Promise<void>;
    
    obtenerPorId(id: string): Promise<Supervisor | null>;

    obtenerTodos(): Promise<Supervisor[]>;
    
    buscarPorNombre(nombre: string): Promise<Supervisor[]>;
    
    buscarPorApellido(apellido: string): Promise<Supervisor[]>;

    listar(): Promise<Supervisor[]>;
}