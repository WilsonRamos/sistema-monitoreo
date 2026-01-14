/**
 * ==================================
 * SERVIDOR PRINCIPAL
 * ==================================
 * Microservicio de Monitoreo de Equipos Mineros
 * Puerto: 5000
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { crearEquiposRoutes } from './presentacion/routes/equipos.routes';
import { crearMonitoreoRoutes } from './presentacion/routes/monitoreo.routes';
import { MemoriaEquipoRepositorio } from './infraestructura/persistencia/MemoriaEquipoRepositorio';

// Cargar variables de entorno
dotenv.config();

class ServicioMonitoreo {
    private app: Application;
    private puerto: number;
    private equipoRepositorio: MemoriaEquipoRepositorio;

    constructor() {
        this.app = express();
        this.puerto = parseInt(process.env.PORT || '5000');
        this.equipoRepositorio = new MemoriaEquipoRepositorio();

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
        this.app.use((req, _res, next) => {
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
            next();
        });
    }

    private configurarRutas(): void {
        // Ruta raíz - Información del servicio
        this.app.get('/', (_req: Request, res: Response) => {
            res.json({
                service: 'Servicio de Monitoreo de Equipos Mineros',
                version: '1.0.0',
                status: 'running',
                endpoints: {
                    health: '/health',
                    equipos: '/api/equipos',
                    monitoreo: '/api/monitoreo'
                },
                documentation: '/api/docs'
            });
        });

        // Health check
        this.app.get('/health', (_req: Request, res: Response) => {
            res.status(200).json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                service: 'servicio-monitoreo'
            });
        });

        // Rutas de la API
        this.app.use('/api/equipos', crearEquiposRoutes(this.equipoRepositorio));
        this.app.use('/api/monitoreo', crearMonitoreoRoutes(this.equipoRepositorio));

        // Ruta 404 - Not Found
        this.app.use((req: Request, res: Response) => {
            res.status(404).json({
                success: false,
                message: `Ruta ${req.method} ${req.path} no encontrada`
            });
        });

        // Manejador de errores global
        this.app.use((err: Error, _req: Request, res: Response, _next: any) => {
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
            console.log('║       🏔️  SERVICIO DE MONITOREO DE EQUIPOS MINEROS  🏔️       ║');
            console.log('║                                                               ║');
            console.log('╚═══════════════════════════════════════════════════════════════╝\n');
            console.log(`✅ Servidor iniciado en puerto: ${this.puerto}`);
            console.log(`🌐 URL: http://localhost:${this.puerto}`);
            console.log(`📊 Health Check: http://localhost:${this.puerto}/health`);
            console.log(`📦 Repositorio: En memoria (${this.equipoRepositorio.constructor.name})`);
            console.log(`⚙️  Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log('\n📚 Endpoints disponibles:');
            console.log(`   POST   /api/equipos - Crear equipo`);
            console.log(`   GET    /api/equipos - Listar equipos`);
            console.log(`   PUT    /api/equipos/:id/estado - Actualizar estado`);
            console.log(`   GET    /api/monitoreo/alertas - Obtener alertas`);
            console.log(`   GET    /api/monitoreo/kpis - Obtener KPIs\n`);
        });
    }
}

// Iniciar servidor
const servicio = new ServicioMonitoreo();
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
