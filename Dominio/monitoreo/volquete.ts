import { Equipo } from './Equipo';
import { Operador } from '../usuarios/modelo/operador';

/**
 * representa un Volquete, que es un tipo de Equipo especializado en transportar carga
 */
export class Volquete extends Equipo {
    private _capacidadCarga: number;
    private _cargaActual: number;

    constructor(
        id: string,
        codigo: string,
        tipo: string,
        nivelCombustible: number,
        horasOperacion: number,
        operadorAsignado: Operador,
        capacidadCarga: number,
        cargaActual: number = 0
    ) {
        super(id, codigo, tipo, nivelCombustible, horasOperacion, operadorAsignado);
        this._capacidadCarga = capacidadCarga;
        this._cargaActual = cargaActual;
    }

    /**
     * carga una cantidad al volquete, si hay capacidad disponible
     * @param cantidad cantidad a cargar
     */
    public cargar(cantidad: number): void {
        if (this._cargaActual + cantidad <= this._capacidadCarga) {
            this._cargaActual += cantidad;
        } else {
            throw new Error('Supera la capacidad máxima de carga');
        }
    }

    /**
     * descarga completamente el volquete
     */
    public descargar(): void {
        this._cargaActual = 0;
    }
}
