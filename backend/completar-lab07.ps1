# Script PowerShell para completar Laboratorio 07
# Contexto de OPERACIONES completo

Write-Host "🚀 Iniciando completación del Laboratorio 07..." -ForegroundColor Green
Write-Host ""

# ===================================================================
# PASO 1: Crear Caso de Uso - IniciarOperacion.ts
# ===================================================================
Write-Host "📝 Creando IniciarOperacion.ts..." -ForegroundColor Cyan

$iniciarOperacionContent = @'
import { randomUUID } from 'crypto';
import { IOperacionRepositorio } from '../../../Dominio/operaciones/interfacesRepositorio/IOperacionRepositorio';
import { Operacion } from '../../../Dominio/operaciones/modelo/Operacion';

export class IniciarOperacion {
    constructor(
        private readonly operacionRepositorio: IOperacionRepositorio
    ) {
        console.log('📋 IniciarOperacion: Caso de uso inicializado');
    }

    async ejecutar(
        tipo: string,
        supervisorId: string,
        frenteId: string
    ): Promise<string> {
        try {
            console.log(`📝 Iniciando operación: ${tipo} en frente ${frenteId}`);

            this.validarDatosDeEntrada(tipo, supervisorId, frenteId);

            const id = this.generarIdUnico();

            const operacion = new Operacion(id, tipo, supervisorId, frenteId);

            await this.operacionRepositorio.crear(operacion);

            console.log(`✅ Operación creada exitosamente: ${id}`);
            return id;

        } catch (error: any) {
            console.error(`❌ Error en caso de uso IniciarOperacion: ${error.message}`);
            throw new Error(`Error al iniciar operación: ${error.message}`);
        }
    }

    private validarDatosDeEntrada(
        tipo: string,
        supervisorId: string,
        frenteId: string
    ): void {
        if (!tipo || tipo.trim().length === 0) {
            throw new Error('El tipo de operación es obligatorio');
        }

        if (!supervisorId || supervisorId.trim().length === 0) {
            throw new Error('El supervisor es obligatorio');
        }

        if (!frenteId || frenteId.trim().length === 0) {
            throw new Error('El frente de trabajo es obligatorio');
        }
    }

    private generarIdUnico(): string {
        const id = `operacion-${randomUUID()}`;
        console.log(`🆔 ID generado (UUID v4): ${id}`);
        return id;
    }
}
'@

$iniciarOperacionContent | Out-File -FilePath "aplicacion\casos-uso\operaciones\IniciarOperacion.ts" -Encoding UTF8
Write-Host "✅ IniciarOperacion.ts creado" -ForegroundColor Green

# ===================================================================
# PASO 2: Crear Controller - OperacionesController.ts
# ===================================================================
Write-Host "📝 Creando OperacionesController.ts..." -ForegroundColor Cyan

$controllerContent = @'
import { Request, Response } from 'express';
import { IniciarOperacion } from '../../../aplicacion/casos-uso/operaciones/IniciarOperacion';

export class OperacionesController {
    constructor(
        private readonly iniciarOperacionUseCase: IniciarOperacion
    ) {
        console.log('🎮 OperacionesController inicializado');
    }

    async crear(req: Request, res: Response): Promise<void> {
        try {
            const { tipo, supervisorId, frenteId } = req.body;

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

            const operacionId = await this.iniciarOperacionUseCase.ejecutar(
                tipo,
                supervisorId,
                frenteId
            );

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
            this.manejarError(res, error);
        }
    }

    private validarDatosCreacion(
        tipo: any,
        supervisorId: any,
        frenteId: any
    ): string[] {
        const errores: string[] = [];

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

    private manejarError(res: Response, error: any): void {
        console.error('❌ Error en OperacionesController:', error.message);

        let statusCode = 500;
        let mensaje = 'Error interno del servidor';

        if (error.message.includes('inválido') || error.message.includes('obligatorio')) {
            statusCode = 400;
            mensaje = error.message;
        }

        res.status(statusCode).json({
            success: false,
            message: mensaje,
            timestamp: new Date().toISOString(),
        });
    }
}
'@

New-Item -Path "presentacion\api\controllers" -ItemType Directory -Force | Out-Null
$controllerContent | Out-File -FilePath "presentacion\api\controllers\OperacionesController.ts" -Encoding UTF8
Write-Host "✅ OperacionesController.ts creado" -ForegroundColor Green

# ===================================================================
# PASO 3: Crear Rutas - operaciones.routes.ts
# ===================================================================
Write-Host "📝 Creando operaciones.routes.ts..." -ForegroundColor Cyan

$routesContent = @'
import { Router } from 'express';
import { OperacionesController } from '../controllers/OperacionesController';

export function crearRutasOperaciones(controller: OperacionesController): Router {
    const router = Router();

    router.post('/', (req, res) => controller.crear(req, res));

    console.log('🛣️ Rutas de operaciones configuradas');
    return router;
}
'@

New-Item -Path "presentacion\api\routes" -ItemType Directory -Force | Out-Null
$routesContent | Out-File -FilePath "presentacion\api\routes\operaciones.routes.ts" -Encoding UTF8
Write-Host "✅ operaciones.routes.ts creado" -ForegroundColor Green

Write-Host ""
Write-Host "✅ LABORATORIO 07 COMPLETADO" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Archivos creados:" -ForegroundColor Yellow
Write-Host "  1. IniciarOperacion.ts (Caso de Uso)"
Write-Host "  2. OperacionesController.ts (Controller REST)"
Write-Host "  3. operaciones.routes.ts (Rutas Express)"
Write-Host ""
Write-Host "🔧 Próximos pasos:" -ForegroundColor Cyan
Write-Host "  1. Integrar rutas en aplicacion/server.ts"
Write-Host "  2. Ejecutar: npm test"
Write-Host "  3. Ejecutar: npm run test:coverage"
Write-Host "  4. Verificar cobertura >= 80%"
Write-Host ""
