import { Supervisor } from '../modelo/supervisor';

export interface IOSupervisorRepositorio {
    crear(operador: Supervisor): Promise<void>;
    
    eliminar(operador: Supervisor): Promise<void>;
    
    actualizar(operador: Supervisor): Promise<void>;
    
    obtenerPorId(id: string): Promise<Supervisor | null>;

    obtenerTodos(): Promise<Supervisor[]>;
    
    buscarPorNombre(nombre: string): Promise<Supervisor[]>;
    
    buscarPorApellido(apellido: string): Promise<Supervisor[]>;
}