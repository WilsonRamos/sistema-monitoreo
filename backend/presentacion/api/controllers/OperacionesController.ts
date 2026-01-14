/**
 * OperacionesController - Controlador REST API
 *
 * CONCEPTO: Controller Pattern (MVC)
 * ===================================
 * El Controller es la capa de presentación en arquitectura MVC.
 * Se encarga de:
 * 1. Recibir peticiones HTTP
 * 2. Validar formato de entrada (JSON, headers, etc.)
 * 3. Delegar lógica al Use Case
 * 4. Transformar respuesta a formato HTTP (status codes, JSON)
 *
 * DIFERENCIA CON USE CASE:
 * - Controller: Maneja HTTP (request/response, status codes)
 * - Use Case: Lógica de aplicación (independiente del protocolo)
 *
 * VENTAJA:
 * El mismo Use Case podría usarse desde:
 * - REST API (este controller)
 * - GraphQL
 * - CLI
 * - Worker/Queue
 */

import { Request, Response } from 'express';
import { IniciarOperacion } from '../../../aplicacion/casos-uso/operaciones/IniciarOperacion';

export class OperacionesController {
    /**
     * CONCEPTO: Dependency Injection
     * ===============================
     * Inyectamos el Use Case por constructor.
     *
     * VENTAJAS:
     * - Testeable (podemos inyectar mock del use case)
     * - Flexible (podemos cambiar implementación)
     * - Explícito (dependencias claras)
     */
    constructor(
        private readonly iniciarOperacionUseCase: IniciarOperacion
    ) {
        console.log('🎮 OperacionesController inicializado');
    }

    /**
     * CONCEPTO: HTTP POST Handler
     * ============================
     * Endpoint: POST /api/operaciones
     * Body: { tipo, supervisorId, frenteId }
     *
     * RESPONSABILIDADES:
     * 1. Extraer datos del body
     * 2. Validar formato (no lógica de negocio)
     * 3. Llamar al Use Case
     * 4. Retornar respuesta HTTP apropiada
     *
     * CÓDIGOS HTTP:
     * - 201 Created: Operación creada exitosamente
     * - 400 Bad Request: Errores de validación
     * - 500 Internal Server Error: Error inesperado
     */
    async crear(req: Request, res: Response): Promise<void> {
        try {
            /**
             * CONCEPTO: Destructuring
             * =======================
             * Extraemos propiedades del body usando destructuring.
             * Es equivalente a:
             * const tipo = req.body.tipo;
             * const supervisorId = req.body.supervisorId;
             */
            const { tipo, supervisorId, frenteId } = req.body;

            /**
             * CONCEPTO: Input Validation (Controller Level)
             * ==============================================
             * Validamos formato y tipo de datos.
             * NO validamos reglas de negocio (eso es del dominio).
             *
             * DIFERENCIA:
             * - Controller: "¿es un string?" "¿está presente?"
             * - Dominio: "¿es un tipo válido?" "¿está activo?"
             */
            const errores = this.validarDatosCreacion(tipo, supervisorId, frenteId);
            if (errores.length > 0) {
                res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    timestamp: new Date().toISOString(),
                    errors: errores,
                });
                return;
            }

            /**
             * CONCEPTO: Use Case Invocation
             * ==============================
             * Delegamos la lógica al Use Case.
             * El controller NO sabe cómo se crea una operación,
             * solo sabe que debe llamar al use case.
             */
            const operacionId = await this.iniciarOperacionUseCase.ejecutar(
                tipo,
                supervisorId,
                frenteId
            );

            /**
             * CONCEPTO: HTTP 201 Created
             * ===========================
             * 201 indica que un recurso fue creado.
             * Incluimos el ID del recurso en la respuesta.
             *
             * FORMATO DE RESPUESTA:
             * {
             *   success: boolean,
             *   message: string,
             *   timestamp: ISO 8601 date,
             *   data: { id, tipo, supervisorId, frenteId }
             * }
             */
            res.status(201).json({
                success: true,
                message: 'Operación iniciada exitosamente',
                timestamp: new Date().toISOString(),
                data: {
                    id: operacionId,
                    tipo,
                    supervisorId,
                    frenteId,
                },
            });

        } catch (error: any) {
            /**
             * CONCEPTO: Centralized Error Handling
             * =====================================
             * Delegamos manejo de errores a método privado.
             * Esto evita duplicación de código.
             */
            this.manejarError(res, error);
        }
    }

    /**
     * CONCEPTO: Validation Logic
     * ===========================
     * Validaciones a nivel de presentación:
     * - Tipo de dato correcto
     * - Campo presente y no vacío
     *
     * NO validamos:
     * - Si el tipo es CARGUE/TRANSPORTE/DESCARGA (lo hace el dominio)
     * - Si el supervisor existe (lo haría el use case en versión completa)
     */
    private validarDatosCreacion(
        tipo: any,
        supervisorId: any,
        frenteId: any
    ): string[] {
        const errores: string[] = [];

        /**
         * CONCEPTO: Type Checking
         * =======================
         * TypeScript no valida en runtime, así que chequeamos tipos.
         * 'any' nos permite recibir cualquier cosa del JSON.
         */
        if (!tipo || typeof tipo !== 'string') {
            errores.push('El tipo de operación es obligatorio y debe ser texto');
        }

        if (!supervisorId || typeof supervisorId !== 'string') {
            errores.push('El ID del supervisor es obligatorio');
        }

        if (!frenteId || typeof frenteId !== 'string') {
            errores.push('El ID del frente es obligatorio');
        }

        return errores;
    }

    /**
     * CONCEPTO: Error Handler
     * ========================
     * Centraliza manejo de errores y mapeo a HTTP status codes.
     *
     * ESTRATEGIA:
     * - 400 Bad Request: Errores de validación
     * - 500 Internal Server Error: Otros errores
     *
     * NOTA: En producción deberíamos:
     * - Loggear stack trace completo
     * - NO exponer detalles internos al cliente
     * - Usar un servicio de monitoreo (Sentry, etc.)
     */
    private manejarError(res: Response, error: any): void {
        console.error('❌ Error en OperacionesController:', error.message);

        /**
         * CONCEPTO: Error Type Detection
         * ===============================
         * Detectamos tipo de error por el mensaje.
         * En versión más avanzada, usaríamos clases de error custom.
         */
        let statusCode = 500;
        let mensaje = 'Error interno del servidor';

        if (error.message.includes('inválido') || error.message.includes('obligatorio')) {
            statusCode = 400;
            mensaje = error.message;
        }

        /**
         * CONCEPTO: Consistent Error Response
         * ====================================
         * Todas las respuestas de error tienen el mismo formato:
         * {
         *   success: false,
         *   message: string,
         *   timestamp: ISO 8601
         * }
         */
        res.status(statusCode).json({
            success: false,
            message: mensaje,
            timestamp: new Date().toISOString(),
        });
    }
}

/**
 * CONCEPTOS APLICADOS EN ESTE CONTROLLER:
 * =========================================
 *
 * PATTERNS:
 * 1. ✅ Controller Pattern (MVC)
 * 2. ✅ Dependency Injection
 * 3. ✅ Centralized Error Handling
 * 4. ✅ Input Validation (Presentation Layer)
 *
 * HTTP CONCEPTS:
 * 5. ✅ RESTful API (POST para crear)
 * 6. ✅ HTTP Status Codes (201, 400, 500)
 * 7. ✅ JSON Response Format
 * 8. ✅ Timestamps en ISO 8601
 *
 * SOLID:
 * 9. ✅ SRP - Solo maneja HTTP para operaciones
 * 10. ✅ DIP - Depende de abstracción (Use Case)
 * 11. ✅ OCP - Abierto a extensión (se pueden agregar endpoints)
 *
 * CLEAN ARCHITECTURE:
 * 12. ✅ Capa de Presentación (maneja HTTP)
 * 13. ✅ Delega a Aplicación (Use Case)
 * 14. ✅ NO conoce detalles de Dominio
 * 15. ✅ NO conoce detalles de Infraestructura
 *
 * SECURITY:
 * 16. ✅ Input validation
 * 17. ✅ Type checking
 * 18. ✅ Error wrapping (no exponer stack traces)
 */
