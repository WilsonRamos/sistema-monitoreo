import { IEquipoRepositorio } from '../../../Dominio/repositorios/IEquipoRepositorio';
import { Equipo } from '../../../Dominio/monitoreo/Equipo';
import { ValidadorTiposYEstados } from '../../../Dominio/monitoreo/constantes/TiposYEstados';

/**
 * Caso de Uso: Crear Nuevo Equipo
 * 
 * Responsabilidades:
 * 1. Coordinar la creación de un equipo
 * 2. Validar datos de entrada (nivel aplicación)
 * 3. Delegar validaciones de negocio al dominio
 * 4. Orchestrar la persistencia
 * 
 * Conceptos aplicados:
 * - Use Case Pattern
 * - Dependency Injection
 * - Separation of Concerns
 * - Command Pattern (implícito)
 */
export class CrearEquipo {
    
    constructor(
        private readonly equipoRepositorio: IEquipoRepositorio
    ) {
        console.log('📋 CrearEquipo: Caso de uso inicializado');
    }

    /**
     * Ejecutar el caso de uso de crear equipo
     * 
     * @param codigo - Código único del equipo
     * @param tipo - Tipo de equipo (VOLQUETE, EXCAVADORA, etc.)
     * @param nivelCombustible - Nivel inicial de combustible
     * @param horasOperacion - Horas iniciales de operación
     * @returns ID del equipo creado
     */
    async ejecutar(
        codigo: string,
        tipo: string,
        nivelCombustible: number,
        horasOperacion: number
    ): Promise<string> {
        try {
            console.log(`📝 Iniciando creación de equipo: ${codigo} (${tipo})`);
            
            // 1. Validaciones a nivel de aplicación
            this.validarDatosDeEntrada(codigo, tipo);

            //validar nuevs parametros
            if (nivelCombustible < 0) throw new Error('El nivel de combustible no puede ser negativo');
            if (horasOperacion < 0) throw new Error('Las horas de operación no pueden ser negativas');
            
            // 2. Verificar reglas de negocio específicas
            await this.verificarReglasDeNegocio(codigo);
            
            // 3. Generar ID único para el equipo
            const id = this.generarIdUnico();
            
            // 4. Crear entidad de dominio
            // Concepto: La entidad valida las reglas de negocio en su constructor
            const equipo = new Equipo(id, codigo, tipo, nivelCombustible, horasOperacion);
            
            // 5. Persistir usando el repositorio
            // Concepto: Dependency Injection - usamos la interface, no la implementación
            await this.equipoRepositorio.crear(equipo);
            
            console.log(`✅ Equipo creado exitosamente: ${codigo} con ID: ${id}`);
            
            // 6. Retornar el ID del equipo creado
            return id;
            
        } catch (error: any) {
            console.error(`❌ Error en caso de uso CrearEquipo: ${error.message}`);
            
            // Re-lanzar el error con contexto adicional
            throw new Error(`Error al crear equipo: ${error.message}`);
        }
    }

    // ===================================
    // MÉTODOS PRIVADOS (LÓGICA INTERNA)
    // ===================================

    /**
     * Validar datos de entrada a nivel de aplicación
     * Concepto: Input Validation - Validaciones básicas antes de llegar al dominio
     */
    private validarDatosDeEntrada(codigo: string, tipo: string): void {
        // Validaciones básicas de formato
        if (!codigo || typeof codigo !== 'string') {
            throw new Error('El código del equipo es obligatorio y debe ser texto');
        }

        if (!tipo || typeof tipo !== 'string') {
            throw new Error('El tipo del equipo es obligatorio y debe ser texto');
        }

        // Validación de formato de código
        if (codigo.trim().length === 0) {
            throw new Error('El código no puede estar vacío');
        }

        // Validación de longitud
        if (codigo.length > 20) {
            throw new Error('El código no puede tener más de 20 caracteres');
        }

        // Validación de tipo de equipo usando validador centralizado (OCP)
        ValidadorTiposYEstados.validarTipoOError(tipo);

        console.log(`✅ Validaciones de entrada pasadas para: ${codigo}`);
    }

    /**
     * Verificar reglas de negocio específicas
     * Concepto: Business Rules Validation usando servicios de dominio
     */
    private async verificarReglasDeNegocio(codigo: string): Promise<void> {
        // Regla: No pueden existir equipos con códigos duplicados
        const existeCodigo = await this.equipoRepositorio.existeConCodigo(codigo);
        
        if (existeCodigo) {
            throw new Error(`Ya existe un equipo registrado con el código: ${codigo}`);
        }

        // Aquí se podrían agregar más reglas de negocio:
        // - Verificar límites de equipos por tipo
        // - Validar códigos según estándares de la empresa
        // - Verificar permisos del usuario, etc.

        console.log(`✅ Reglas de negocio verificadas para: ${codigo}`);
    }

    /**
     * Generar ID único para el equipo
     * Concepto: ID Generation Strategy
     * 
     * Nota: En un sistema real, esto podría ser:
     * - UUID con crypto.randomUUID()
     * - ID generado por base de datos
     * - ID basado en timestamp + random
     */
    private generarIdUnico(): string {
        // Estrategia simple: timestamp + random
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        const id = `equipo-${timestamp}-${random}`;
        
        console.log(`🆔 ID generado: ${id}`);
        return id;
    }
}