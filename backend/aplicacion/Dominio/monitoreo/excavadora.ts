import { Equipo } from './Equipo';

export class Excavadora extends Equipo {
    // ❌ INCORRECTO: Redefinir como propiedad
    // public horasOperacion: any = null;
    
    // ✅ CORRECTO: No redefinir, usar el del padre
    constructor(id: string, codigo: string) {
        // Llamar al constructor padre con TODOS los parámetros
        super(id, codigo, 'EXCAVADORA', 100, 0);
    }
    
    // Métodos específicos de excavadora
    public excavar(): void {
        if (this.estado !== 'OPERANDO') {
            throw new Error('La excavadora debe estar operando para excavar');
        }
        // Lógica específica de excavación
    }
}

// Dominio/monitoreo/volquete.ts  
export class Volquete extends Equipo {
    constructor(id: string, codigo: string) {
        // Llamar al constructor padre con TODOS los parámetros
        super(id, codigo, 'VOLQUETE', 100, 0);
    }
    
    public transportar(): void {
        if (this.estado !== 'OPERANDO') {
            throw new Error('El volquete debe estar operando para transportar');
        }
        // Lógica específica de transporte
    }
}
