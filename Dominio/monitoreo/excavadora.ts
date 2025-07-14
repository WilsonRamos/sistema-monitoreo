import { Equipo } from './Equipo';
import { Operador } from '../usuarios/modelo/operador';

/**
 * Representa una Excavadora, equipo utilizado para realizar excavaciones.
 */
export class Excavadora extends Equipo {
    private readonly tipoExcavacion: string;

    constructor(
        id: string,
        codigo: string,
        tipo: string,
        nivelCombustible: number,
        horasOperacion: number,
        operadorAsignado: Operador,
        tipoExcavacion: string
    ) {
        super(id, codigo, tipo, nivelCombustible, horasOperacion, operadorAsignado);
        this.tipoExcavacion = tipoExcavacion;
    }

    /**
     * Realiza una operación de excavación.
     */
    public extraer(): void {
        this.horasOperacion += 1;
        console.log(`${this.codigo} realizó una excavación de tipo ${this.tipoExcavacion}.`);
    }

    /**
     * Simula la carga de material a un volquete.
     */
    public cargarVolquete(): void {
        console.log(`${this.codigo} está cargando material en un volquete.`);
    }
}
