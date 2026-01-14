/**
 * ==================================
 * CASO DE USO - CREAR EQUIPO
 * ==================================
 * Orquesta la creación de un equipo nuevo
 * Patrón: Use Case (Clean Architecture)
 */

import { Equipo } from '../../dominio/entidades/Equipo';
import { IEquipoRepositorio } from '../../dominio/repositorios/IEquipoRepositorio';
import * as crypto from 'crypto';

export interface CrearEquipoDTO {
    codigo: string;
    tipo: string;
    nivelCombustible?: number;
    horasOperacion?: number;
}

export class CrearEquipo {
    constructor(private equipoRepositorio: IEquipoRepositorio) {}

    async ejecutar(dto: CrearEquipoDTO): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            // Validar DTO
            this.validarDTO(dto);

            // Verificar que no exista código duplicado
            const existeCodigo = await this.equipoRepositorio.existeConCodigo(dto.codigo);
            if (existeCodigo) {
                return {
                    success: false,
                    error: `Ya existe un equipo con el código: ${dto.codigo}`
                };
            }

            // Generar ID seguro con crypto (no Math.random)
            const id = crypto.randomUUID();

            // Crear entidad de dominio
            const equipo = new Equipo(
                id,
                dto.codigo,
                dto.tipo,
                dto.nivelCombustible || 100,
                dto.horasOperacion || 0
            );

            // Persistir
            await this.equipoRepositorio.crear(equipo);

            return {
                success: true,
                data: equipo.obtenerInfo()
            };
        } catch (error: any) {
            console.error('❌ Error en CrearEquipo:', error);
            return {
                success: false,
                error: error.message || 'Error desconocido al crear equipo'
            };
        }
    }

    private validarDTO(dto: CrearEquipoDTO): void {
        if (!dto.codigo || dto.codigo.trim() === '') {
            throw new Error('El código es obligatorio');
        }
        if (!dto.tipo || dto.tipo.trim() === '') {
            throw new Error('El tipo es obligatorio');
        }
    }
}
