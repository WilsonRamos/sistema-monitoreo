import { Equipo } from './equipo';

export class Excavadora extends Equipo {
    public tipoExcavacion: any = null;
    public horasOperacion: any = null;

    constructor() {
        super(); // constructor
    }

    public extraer(): void {
        // TODO: Implement method
    }

    public cargarVolquete(): void {
        // TODO: Implement method
    }
}