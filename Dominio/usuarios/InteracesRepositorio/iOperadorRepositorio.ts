import { Operador } from '../modelo/operador';

export interface IOperadorRepositorio {
    crear(operador: Operador): Promise<void>;
    
    eliminar(id: string): Promise<void>;
    
    actualizar(operador: Operador): Promise<void>;
    
    obtenerPorId(id: string): Promise<Operador | null>;

    obtenerTodos(): Promise<Operador[]>;
    
    buscarPorNombre(nombre: string): Promise<Operador[]>;
    
    buscarPorApellido(apellido: string): Promise<Operador[]>;

    listar(): Promise<Operador[]>;
}