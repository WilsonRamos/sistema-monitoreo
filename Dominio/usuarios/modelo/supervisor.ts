import { Persona } from './persona';
import { Equipo } from '../../monitoreo/Equipo';

export class Supervisor extends Persona {
    private _equipoAsignado: Equipo;
    
    constructor(
        id: string,
        nombre: string,
        apellido: string,
        equipoAsignado: Equipo

    ) {
        super(id, nombre, apellido);
        this._equipoAsignado = equipoAsignado;
    }

    get equipoAsignado(): Equipo {
        return this._equipoAsignado;
    }

    public asignarOperacion(): void {
        // TODO: Implement method
    }

    public monitorearEquipos(): void {
        // TODO: Implement method
    }
}