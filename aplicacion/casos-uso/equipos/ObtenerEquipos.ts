
import { IEquipoRepositorio } from '../../../Dominio/repositorios/IEquipoRepositorio';
import { Equipo } from '../../../Dominio/monitoreo/Equipo';

/**
 * Caso de Uso: Obtener Lista de Equipos
 * 
 * Responsabilidades:
 * 1. Consultar equipos del repositorio
 * 2. Transformar entidades de dominio a DTOs
 * 3. Aplicar filtros si es necesario
 * 4. Manejar errores de consulta
 * 
 * Conceptos aplicados:
 * - Query Pattern
 * - DTO (Data Transfer Object)
 * - Dependency Injection
 * - Error Handling
 */
export class ObtenerEquipos {
    
    constructor(
        private readonly equipoRepositorio: IEquipoRepositorio
    ) {
        console.log('📋 ObtenerEquipos: Caso de uso inicializado');
    }

    /**
     * Ejecutar consulta de todos los equipos
     * 
     * @returns Lista de equipos en formato DTO
     */
    async ejecutar(): Promise<EquipoDto[]> {
        try {
            console.log('📋 Iniciando consulta de equipos...');
            
            // 1. Obtener equipos del repositorio
            const equipos = await this.equipoRepositorio.obtenerTodos();
            
            console.log(`📊 Obtenidos ${equipos.length} equipos del repositorio`);
            
            // 2. Convertir entidades de dominio a DTOs
            // Concepto: DTO Mapping - Transformar datos para la presentación
            const equiposDto = this.mapearADto(equipos);
            
            console.log(`✅ Equipos convertidos a DTO exitosamente`);
            
            return equiposDto;
            
        } catch (error: any) {
            console.error(`❌ Error en caso de uso ObtenerEquipos: ${error.message}`);
            throw new Error(`Error al obtener equipos: ${error.message}`);
        }
    }

    /**
     * Ejecutar consulta filtrada por tipo de equipo
     * 
     * @param tipo - Tipo de equipo a filtrar
     * @returns Lista de equipos filtrados
     */
    async ejecutarPorTipo(tipo: string): Promise<EquipoDto[]> {
        try {
            console.log(`📋 Iniciando consulta de equipos por tipo: ${tipo}`);
            
            // Validar entrada
            this.validarTipo(tipo);
            
            // Obtener equipos filtrados
            const equipos = await this.equipoRepositorio.buscarPorTipo(tipo);
            
            console.log(`📊 Obtenidos ${equipos.length} equipos de tipo: ${tipo}`);
            
            // Convertir a DTOs
            const equiposDto = this.mapearADto(equipos);
            
            return equiposDto;
            
        } catch (error: any) {
            console.error(`❌ Error consultando equipos por tipo: ${error.message}`);
            throw new Error(`Error al obtener equipos por tipo: ${error.message}`);
        }
    }

    /**
     * Ejecutar consulta filtrada por estado
     * 
     * @param estado - Estado de equipos a filtrar
     * @returns Lista de equipos en el estado especificado
     */
    async ejecutarPorEstado(estado: string): Promise<EquipoDto[]> {
        try {
            console.log(`📋 Iniciando consulta de equipos por estado: ${estado}`);
            
            // Validar entrada
            this.validarEstado(estado);
            
            // Obtener equipos filtrados
            const equipos = await this.equipoRepositorio.buscarPorEstado(estado);
            
            console.log(`📊 Obtenidos ${equipos.length} equipos en estado: ${estado}`);
            
            // Convertir a DTOs
            const equiposDto = this.mapearADto(equipos);
            
            return equiposDto;
            
        } catch (error: any) {
            console.error(`❌ Error consultando equipos por estado: ${error.message}`);
            throw new Error(`Error al obtener equipos por estado: ${error.message}`);
        }
    }

    // ===================================
    // MÉTODOS PRIVADOS (LÓGICA INTERNA)
    // ===================================

    /**
     * Mapear entidades de dominio a DTOs
     * Concepto: DTO Mapping - Separar modelo de dominio del modelo de presentación
     */
    private mapearADto(equipos: Equipo[]): EquipoDto[] {
        return equipos.map(equipo => ({
            id: equipo.id,
            codigo: equipo.codigo,
            tipo: equipo.tipo,
            estado: equipo.estado,
            // Agregar campos calculados o formateados si es necesario
            fechaConsulta: new Date().toISOString()
        }));
    }

    /**
     * Validar tipo de equipo
     */
    private validarTipo(tipo: string): void {
        if (!tipo || typeof tipo !== 'string') {
            throw new Error('El tipo de equipo es obligatorio');
        }

        const tiposValidos = ['VOLQUETE', 'EXCAVADORA', 'BULLDOZER', 'GRUA', 'PERFORADORA'];
        if (!tiposValidos.includes(tipo.toUpperCase())) {
            throw new Error(`Tipo de equipo inválido: ${tipo}. Tipos válidos: ${tiposValidos.join(', ')}`);
        }
    }

    /**
     * Validar estado de equipo
     */
    private validarEstado(estado: string): void {
        if (!estado || typeof estado !== 'string') {
            throw new Error('El estado de equipo es obligatorio');
        }

        const estadosValidos = ['DISPONIBLE', 'OPERANDO', 'MANTENIMIENTO', 'INACTIVO'];
        if (!estadosValidos.includes(estado.toUpperCase())) {
            throw new Error(`Estado de equipo inválido: ${estado}. Estados válidos: ${estadosValidos.join(', ')}`);
        }
    }
}

// ===================================
// DTO (DATA TRANSFER OBJECT)
// ===================================
// Concepto: Objeto simple para transferir datos entre capas

/**
 * DTO para transferir datos de equipos a la capa de presentación
 * 
 * Características:
 * - Solo propiedades (sin comportamiento)
 * - Estructura optimizada para la presentación
 * - Independiente del modelo de dominio
 */
export interface EquipoDto {
    id: string;
    codigo: string;
    tipo: string;
    estado: string;
    fechaConsulta: string; // Campo adicional para la presentación
}