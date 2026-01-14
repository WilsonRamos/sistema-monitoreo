/**
 * ==================================
 * ENTIDAD DE DOMINIO - VOLQUETE
 * ==================================
 * Especialización de Equipo
 */

import { Equipo } from './Equipo';

export class Volquete extends Equipo {
    private _capacidadCarga: number;
    private _cargaActual: number;

    constructor(id: string, codigo: string, capacidadCarga: number = 50) {
        super(id, codigo, 'VOLQUETE', 100, 0);
        this._capacidadCarga = capacidadCarga;
        this._cargaActual = 0;
    }

    get capacidadCarga(): number { return this._capacidadCarga; }
    get cargaActual(): number { return this._cargaActual; }

    /**
     * Cargar material en el volquete
     */
    cargar(cantidad: number): void {
        if (this.estado !== 'OPERANDO') {
            throw new Error('El volquete debe estar operando para cargar');
        }
        if (this._cargaActual + cantidad > this._capacidadCarga) {
            throw new Error('Excede la capacidad de carga');
        }
        this._cargaActual += cantidad;
        this.consumirCombustible(2);
    }

    /**
     * Descargar material del volquete
     */
    descargar(): void {
        if (this.estado !== 'OPERANDO') {
            throw new Error('El volquete debe estar operando para descargar');
        }
        this._cargaActual = 0;
        this.consumirCombustible(1);
    }

    /**
     * Transportar material
     */
    transportar(distancia: number): void {
        if (this.estado !== 'OPERANDO') {
            throw new Error('El volquete debe estar operando para transportar');
        }
        const consumo = distancia * 0.5; // 0.5 litros por km
        this.consumirCombustible(consumo);
        this.sumarHorasOperacion(distancia / 30); // 30 km/h promedio
    }
}
