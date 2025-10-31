import { Equipo } from './Equipo';

export class Volquete extends Equipo {
    public capacidadCarga: number;
    public cargaActual: number;
    
    constructor(id: string, codigo: string, capacidadCarga: number = 50) {
        super(id, codigo, 'VOLQUETE', 100, 0); // constructor padre con todos los parámetros
        this.capacidadCarga = capacidadCarga;
        this.cargaActual = 0;
    }

    public cargar(): void {
        // TODO: Implement method
    }

    public descargar(): void {
        // TODO: Implement method
    }

    public transportar(): void {
        if (this.estado !== 'OPERANDO') {
            throw new Error('El volquete debe estar operando para transportar');
        }
        // Lógica específica de transporte
    }
}