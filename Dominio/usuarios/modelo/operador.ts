import { Persona } from './persona';
import { Equipo } from '../../monitoreo/Equipo';

export class Operador extends Persona {
    private _licencia: string;
    private _equipoAsignado: Equipo;
    
    constructor(
        id: string,
        nombre: string,
        apellido: string,
        licencia: string,
        equipoAsignado: Equipo
    ) {
        super(id, nombre, apellido);
        this._licencia = licencia;
        this._equipoAsignado = equipoAsignado;
    }
    
    get licencia(): string {
        return this._licencia;
    }
    
    get equipoAsignado(): Equipo {
        return this._equipoAsignado;
    }

    set licencia(valor: string) {
        this._licencia = valor;
    }

    set equipoAsignado(equipo: Equipo) {
        this._equipoAsignado = equipo;
    }

    public operar(): void {
        // TODO: Implement method
    }

    public reportarIncidencia(): void {
        // TODO: Implement method
    }
}