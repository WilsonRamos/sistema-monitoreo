import { randomUUID } from 'crypto';
import { IEquipoRepositorio } from '../../Dominio/repositorios/IEquipoRepositorio';
import { Equipo } from '../../Dominio/monitoreo/Equipo';

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
     *
     * Concepto: ID Generation Strategy - UUID v4 (RFC 4122)
     *
     * ¿Por qué UUID v4?
     * - Criptográficamente seguro (usa crypto.randomUUID())
     * - 122 bits de entropía (vs 10 bits de Math.random()*1000)
     * - Prácticamente imposible de colisionar (2^-61 probabilidad por billion de IDs)
     * - Estándar internacional (RFC 4122)
     * - No predecible (a diferencia de timestamp + Math.random)
     *
     * Formato UUID v4:
     * xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
     * Ejemplo: f47ac10b-58cc-4372-a567-0e02b2c3d479
     *
     * Ventajas sobre timestamp + Math.random():
     * - Seguridad: No se puede predecir el próximo ID
     * - Unicidad: Globalmente único sin coordinación central
     * - Compatibilidad: Ampliamente soportado en APIs, BDs, sistemas
     *
     * @returns ID en formato "equipo-[UUID-v4]"
     */
    private generarIdUnico(): string {
        // UUID v4 - Cryptographically secure random ID
        const uuid = randomUUID();
        const id = `equipo-${uuid}`;

        console.log(`🆔 ID generado (UUID v4): ${id}`);
        return id;
    }
}