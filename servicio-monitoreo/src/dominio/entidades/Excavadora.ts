/**
 * ==================================
 * ENTIDAD DE DOMINIO - EXCAVADORA
 * ==================================
 * Especialización de Equipo
 */

import { Equipo } from './Equipo';

export class Excavadora extends Equipo {
    constructor(id: string, codigo: string) {
        super(id, codigo, 'EXCAVADORA', 100, 0);
    }

    /**
     * Método específico de excavadora
     */
    excavar(): void {
        if (this.estado !== 'OPERANDO') {
            throw new Error('La excavadora debe estar operando para excavar');
        }
        // Lógica específica de excavación
        this.consumirCombustible(5); // Consumo por excavación
        this.sumarHorasOperacion(0.5); // Media hora por excavación
    }
}
