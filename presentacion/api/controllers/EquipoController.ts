
import { Request, Response } from 'express';
import { CrearEquipo } from '../../../aplicacion/casos-uso/equipos/CrearEquipo';
import { ObtenerEquipos } from '../../../aplicacion/casos-uso/equipos/ObtenerEquipos';

/**
 * Controller REST para gestión de equipos
 * 
 * Responsabilidades:
 * 1. Manejar requests y responses HTTP
 * 2. Validar datos de entrada a nivel HTTP
 * 3. Coordinar casos de uso
 * 4. Formatear respuestas consistentes
 * 5. Manejar errores HTTP
 * 
 * Conceptos aplicados:
 * - MVC Pattern (Controller)
 * - REST API design
 * - Dependency Injection
 * - Error Handling
 * - Response formatting
 */
export class EquipoController {
    
    constructor(
        private readonly crearEquipoUseCase: CrearEquipo,
        private readonly obtenerEquiposUseCase: ObtenerEquipos
    ) {
        console.log('🎮 EquipoController: Controller inicializado con casos de uso');
    }

    // ===================================
    // ENDPOINTS REST
    // ===================================

    /**
     * POST /api/equipos
     * Crear un nuevo equipo
     */
    async crear(req: Request, res: Response): Promise<void> {
        try {
            console.log('📝 POST /api/equipos - Crear equipo:', req.body);
            
            // 1. Extraer datos del request body
            const { codigo, tipo } = req.body;
            
            // 2. Validaciones básicas HTTP
            const erroresValidacion = this.validarDatosCreacion(codigo, tipo);
            if (erroresValidacion.length > 0) {
                res.status(400).json(this.crearRespuestaError(
                    'Datos de entrada inválidos',
                    erroresValidacion
                ));
                return;
            }

            // 3. Ejecutar caso de uso
            const equipoId = await this.crearEquipoUseCase.ejecutar(codigo, tipo);

            // 4. Respuesta exitosa
            res.status(201).json(this.crearRespuestaExitosa(
                'Equipo creado exitosamente',
                {
                    id: equipoId,
                    codigo: codigo,
                    tipo: tipo,
                    estado: 'DISPONIBLE' // Estado inicial por defecto
                }
            ));

        } catch (error: any) {
            console.error('❌ Error en POST /api/equipos:', error.message);
            this.manejarError(res, error);
        }
    }

    /**
     * GET /api/equipos
     * Obtener lista de equipos (con filtros opcionales)
     */
    async obtenerTodos(req: Request, res: Response): Promise<void> {
        try {
            console.log('📋 GET /api/equipos - Obtener equipos');
            console.log('Query params:', req.query);
            
            // 1. Extraer parámetros de query (filtros opcionales)
            const { tipo, estado } = req.query;

            let equipos;

            // 2. Aplicar filtros según parámetros
            if (tipo && typeof tipo === 'string') {
                console.log(`🔍 Filtro por tipo: ${tipo}`);
                equipos = await this.obtenerEquiposUseCase.ejecutarPorTipo(tipo);
            } else if (estado && typeof estado === 'string') {
                console.log(`🔍 Filtro por estado: ${estado}`);
                equipos = await this.obtenerEquiposUseCase.ejecutarPorEstado(estado);
            } else {
                console.log('📋 Sin filtros - Obtener todos');
                equipos = await this.obtenerEquiposUseCase.ejecutar();
            }

            // 3. Respuesta exitosa
            res.status(200).json(this.crearRespuestaExitosa(
                'Equipos obtenidos exitosamente',
                equipos,
                {
                    total: equipos.length,
                    filtros: { tipo, estado }
                }
            ));

        } catch (error: any) {
            console.error('❌ Error en GET /api/equipos:', error.message);
            this.manejarError(res, error);
        }
    }

    /**
     * GET /api/equipos/:id
     * Obtener un equipo específico por ID
     */
    async obtenerPorId(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            console.log(`🔍 GET /api/equipos/${id} - Obtener equipo específico`);
            
            // Validar ID
            if (!id || id.trim().length === 0) {
                res.status(400).json(this.crearRespuestaError(
                    'ID de equipo es obligatorio'
                ));
                return;
            }

            // Obtener todos los equipos y filtrar por ID
            // Nota: En un sistema real, tendríamos un caso de uso específico
            const todosLosEquipos = await this.obtenerEquiposUseCase.ejecutar();
            const equipo = todosLosEquipos.find(e => e.id === id);

            if (!equipo) {
                res.status(404).json(this.crearRespuestaError(
                    `Equipo no encontrado con ID: ${id}`
                ));
                return;
            }

            // Respuesta exitosa
            res.status(200).json(this.crearRespuestaExitosa(
                'Equipo encontrado exitosamente',
                equipo
            ));

        } catch (error: any) {
            console.error(`❌ Error en GET /api/equipos/:id:`, error.message);
            this.manejarError(res, error);
        }
    }

    // ===================================
    // MÉTODOS AUXILIARES
    // ===================================

    /**
     * Validar datos para creación de equipo
     * Concepto: Input Validation a nivel HTTP
     */
    private validarDatosCreacion(codigo: any, tipo: any): string[] {
        const errores: string[] = [];

        // Validar código
        if (!codigo) {
            errores.push('El código del equipo es obligatorio');
        } else if (typeof codigo !== 'string') {
            errores.push('El código debe ser texto');
        } else if (codigo.trim().length === 0) {
            errores.push('El código no puede estar vacío');
        } else if (codigo.length > 20) {
            errores.push('El código no puede tener más de 20 caracteres');
        }

        // Validar tipo
        if (!tipo) {
            errores.push('El tipo de equipo es obligatorio');
        } else if (typeof tipo !== 'string') {
            errores.push('El tipo debe ser texto');
        } else {
            const tiposValidos = ['VOLQUETE', 'EXCAVADORA', 'BULLDOZER', 'GRUA', 'PERFORADORA'];
            if (!tiposValidos.includes(tipo.toUpperCase())) {
                errores.push(`Tipo inválido. Tipos válidos: ${tiposValidos.join(', ')}`);
            }
        }

        return errores;
    }

    /**
     * Crear respuesta exitosa estandarizada
     * Concepto: Consistent API Response Format
     */
    private crearRespuestaExitosa(mensaje: string, data?: any, metadata?: any): any {
        const respuesta: any = {
            success: true,
            message: mensaje,
            timestamp: new Date().toISOString()
        };

        if (data !== undefined) {
            respuesta.data = data;
        }

        if (metadata) {
            respuesta.metadata = metadata;
        }

        return respuesta;
    }

    /**
     * Crear respuesta de error estandarizada
     * Concepto: Consistent Error Response Format
     */
    private crearRespuestaError(mensaje: string, errores?: string[]): any {
        const respuesta: any = {
            success: false,
            message: mensaje,
            timestamp: new Date().toISOString()
        };

        if (errores && errores.length > 0) {
            respuesta.errors = errores;
        }

        return respuesta;
    }

    /**
     * Manejar errores de manera centralizada
     * Concepto: Centralized Error Handling
     */
    private manejarError(res: Response, error: any): void {
        // Determinar código de estado según tipo de error
        let statusCode = 500;
        let mensaje = 'Error interno del servidor';

        if (error.message.includes('Ya existe')) {
            statusCode = 409; // Conflict
            mensaje = error.message;
        } else if (error.message.includes('obligatorio') || 
                   error.message.includes('inválido') ||
                   error.message.includes('no válido')) {
            statusCode = 400; // Bad Request
            mensaje = error.message;
        } else if (error.message.includes('no encontrado')) {
            statusCode = 404; // Not Found
            mensaje = error.message;
        }

        res.status(statusCode).json(this.crearRespuestaError(mensaje));
    }
}