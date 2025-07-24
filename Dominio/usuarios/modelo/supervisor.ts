import { Persona } from './persona';
import { Equipo } from '../../monitoreo/Equipo';

export class Supervisor extends Persona {
    private readonly _equipoAsignados: Equipo[];
    
    constructor(
        id: string,
        nombre: string,
        apellido: string,
        equipoAsignados: Equipo[]

    ) {
        super(id, nombre, apellido);
        this._equipoAsignados = equipoAsignados;
    }

    get equipoAsignados(): Equipo[] {
        return this._equipoAsignados;
    }

    public asignarOperacion(): void {
        // TODO: Implement method
    }

    public monitorearEquipos(): void {
        // TODO: Implement method
    }
}