import { Excavadora } from '../excavadora'

export interface IExcavadoraRepositorio {
  guardar(excavadora: Excavadora): Promise<void>;
  buscarPorId(id: string): Promise<Excavadora | null>;
  listar(): Promise<Excavadora[]>;
  actualizar(excavadora: Excavadora): Promise<void>;
  eliminar(id: string): Promise<void>;
}