/**
 * ==================================
 * SERVIDOR PRINCIPAL
 * ==================================
 * Microservicio de Operaciones Mineras
 * Puerto: 6000
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { crearOperacionesRoutes } from './presentacion/routes/operaciones.routes';
import { crearKPIsRoutes } from './presentacion/routes/kpis.routes';
import { MemoriaOperacionRepositorio } from './infraestructura/persistencia/MemoriaOperacionRepositorio';

// Cargar variables de entorno
dotenv.config();

class ServicioOperaciones {
    private app: Application;
    private puerto: number;
    private operacionRepositorio: MemoriaOperacionRepositorio;

    constructor() {
        this.app = express();
        this.puerto = parseInt(process.env.PORT || '6000');
        this.operacionRepositorio = new MemoriaOperacionRepositorio();

        this.configurarMiddlewares();
        this.configurarRutas();
    }

    private configurarMiddlewares(): void {
        // CORS - Permitir peticiones cross-origin
        this.app.use(cors({
            origin: process.env.CORS_ORIGIN || '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));

        // Body parser
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        // Logger simple
        this.app.use((req, res, next) => {
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
            next();
        });
    }

    private configurarRutas(): void {
        // Ruta raíz - Información del servicio
        this.app.get('/', (req: Request, res: Response) => {
            res.json({
                service: 'Servicio de Operaciones Mineras',
                version: '1.0.0',
                status: 'running',
                endpoints: {
                    health: '/health',
                    operaciones: '/api/operaciones',
                    kpis: '/api/kpis'
                },
                documentation: '/api/docs'
            });
        });

        // Health check
        this.app.get('/health', (req: Request, res: Response) => {
            res.status(200).json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                service: 'servicio-operaciones'
            });
        });

        // Rutas de la API
        this.app.use('/api/operaciones', crearOperacionesRoutes(this.operacionRepositorio));
        this.app.use('/api/kpis', crearKPIsRoutes(this.operacionRepositorio));

        // Ruta 404 - Not Found
        this.app.use((req: Request, res: Response) => {
            res.status(404).json({
                success: false,
                message: `Ruta ${req.method} ${req.path} no encontrada`
            });
        });

        // Manejador de errores global
        this.app.use((err: Error, req: Request, res: Response, next: any) => {
            console.error('❌ Error no manejado:', err);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        });
    }

    public iniciar(): void {
        this.app.listen(this.puerto, () => {
            console.log('\n╔═══════════════════════════════════════════════════════════════╗');
            console.log('║                                                               ║');
            console.log('║          ⚙️  SERVICIO DE OPERACIONES MINERAS  ⚙️              ║');
            console.log('║                                                               ║');
            console.log('╚═══════════════════════════════════════════════════════════════╝\n');
            console.log(`✅ Servidor iniciado en puerto: ${this.puerto}`);
            console.log(`🌐 URL: http://localhost:${this.puerto}`);
            console.log(`📊 Health Check: http://localhost:${this.puerto}/health`);
            console.log(`📦 Repositorio: En memoria (${this.operacionRepositorio.constructor.name})`);
            console.log(`⚙️  Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log('\n📚 Endpoints disponibles:');
            console.log(`   POST   /api/operaciones - Iniciar operación`);
            console.log(`   GET    /api/operaciones - Listar operaciones`);
            console.log(`   PUT    /api/operaciones/:id/finalizar - Finalizar operación`);
            console.log(`   POST   /api/operaciones/:id/equipos - Asignar equipo`);
            console.log(`   GET    /api/kpis - Obtener KPIs\n`);
        });
    }
}

// Iniciar servidor
const servicio = new ServicioOperaciones();
servicio.iniciar();

// Manejo de señales de terminación
process.on('SIGTERM', () => {
    console.log('\n⚠️  Señal SIGTERM recibida. Cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n⚠️  Señal SIGINT recibida. Cerrando servidor...');
    process.exit(0);
});
