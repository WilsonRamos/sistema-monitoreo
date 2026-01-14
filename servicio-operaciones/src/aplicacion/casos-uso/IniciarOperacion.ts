/**
 * ==================================
 * CASO DE USO - INICIAR OPERACION
 * ==================================
 * Orquesta el inicio de una operación minera
 * Patrón: Use Case (Clean Architecture)
 */

import { Operacion } from '../../dominio/entidades/Operacion';
import { IOperacionRepositorio } from '../../dominio/repositorios/IOperacionRepositorio';
import * as crypto from 'crypto';

export interface IniciarOperacionDTO {
    tipo: string;
    supervisorId: string;
    frenteId: string;
    equiposAsignados?: string[];
}

export class IniciarOperacion {
    constructor(private operacionRepositorio: IOperacionRepositorio) {}

    async ejecutar(dto: IniciarOperacionDTO): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            // Validar DTO
            this.validarDTO(dto);

            // Generar ID seguro con crypto (no Math.random)
            const id = crypto.randomUUID();

            // Crear entidad de dominio
            const operacion = new Operacion(
                id,
                dto.tipo,
                dto.supervisorId,
                dto.frenteId,
                new Date(),
                dto.equiposAsignados || []
            );

            // Persistir
            await this.operacionRepositorio.crear(operacion);

            return {
                success: true,
                data: operacion.obtenerInfo()
            };
        } catch (error: any) {
            console.error('❌ Error en IniciarOperacion:', error);
            return {
                success: false,
                error: error.message || 'Error desconocido al iniciar operación'
            };
        }
    }

    private validarDTO(dto: IniciarOperacionDTO): void {
        if (!dto.tipo || dto.tipo.trim() === '') {
            throw new Error('El tipo de operación es obligatorio');
        }
        if (!dto.supervisorId || dto.supervisorId.trim() === '') {
            throw new Error('El ID del supervisor es obligatorio');
        }
        if (!dto.frenteId || dto.frenteId.trim() === '') {
            throw new Error('El ID del frente es obligatorio');
        }
    }
}
