// ===================================
// APP.TS - APLICACIÓN PRINCIPAL
// ===================================
// Concepto: Composition Root - Configuración de dependencias
// Buena Práctica: Separación de responsabilidades - NO HTML embebido

import express from 'express';
import path from 'path';

// Importar dependencias siguiendo Clean Architecture
import { MemoriaEquipoRepositorio } from './infraestructura/persistencia/repositorios/MemoriaEquipoRepositorio';
import { CrearEquipo } from './aplicacion/casos-uso/equipos/CrearEquipo';
import { ObtenerEquipos } from './aplicacion/casos-uso/equipos/ObtenerEquipos';
import { EquipoController } from './presentacion/api/controllers/EquipoController';
import { crearRutasEquipos } from './presentacion/api/routes/equipos.routes';

class SistemaMonitoreoApp {
    private app: express.Application;
    private equipoController!: EquipoController;

    constructor() {
        this.app = express();
        this.configurarMiddlewares();
        this.configurarDependencias();
        this.configurarRutas();
    }

    private configurarMiddlewares(): void {
        console.log('🔧 Configurando middlewares...');
        
        // Middleware para parsear JSON
        this.app.use(express.json());
        
        // Middleware para archivos estáticos
        // Concepto: Separation of Concerns - HTML separado del código
        this.app.use(express.static(path.join(__dirname, 'presentacion', 'web')));
        
        // Logs de requests (útil para debugging)
        this.app.use((req, res, next) => {
            const timestamp = new Date().toISOString();
            console.log(`${timestamp} - ${req.method} ${req.path}`);
            next();
        });
        
        console.log('✅ Middlewares configurados');
    }

    private configurarDependencias(): void {
        console.log('🔧 Configurando dependencias (Dependency Injection)...');
        
        // 1. INFRAESTRUCTURA - Repositorio concreto
        const equipoRepositorio = new MemoriaEquipoRepositorio();
        console.log('   📦 Repositorio en memoria creado');

        // 2. APLICACIÓN - Casos de uso (inyectamos repositorio)
        const crearEquipoUseCase = new CrearEquipo(equipoRepositorio);
        const obtenerEquiposUseCase = new ObtenerEquipos(equipoRepositorio);
        console.log('   📋 Casos de uso configurados');

        // 3. PRESENTACIÓN - Controller (inyectamos casos de uso)
        this.equipoController = new EquipoController(crearEquipoUseCase, obtenerEquiposUseCase);
        console.log('   📱 Controller configurado');
        
        console.log('✅ Todas las dependencias inyectadas correctamente');
    }

    private configurarRutas(): void {
        console.log('🛣️ Configurando rutas...');
        
        // Ruta para página de inicio
        // Concepto: El HTML está en archivo separado (buena práctica)
        this.app.get('/', (req, res) => {
            const htmlPath = path.join(__dirname, 'presentacion', 'web', 'index.html');
            res.sendFile(htmlPath);
        });

        // API REST para equipos
        // Concepto: Organización por bounded context
        this.app.use('/api/equipos', crearRutasEquipos(this.equipoController));

        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({ 
                status: 'OK', 
                message: 'Sistema de Monitoreo funcionando correctamente',
                timestamp: new Date().toISOString(),
                arquitectura: {
                    patron: 'Clean Architecture + DDD',
                    lenguaje: 'TypeScript',
                    framework: 'Express.js',
                    capas: ['Presentación', 'Aplicación', 'Dominio', 'Infraestructura']
                }
            });
        });

        // Ruta catch-all para manejo de errores 404
        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                message: `Ruta no encontrada: ${req.originalUrl}`,
                rutasDisponibles: [
                    'GET /',
                    'GET /api/equipos',
                    'POST /api/equipos',
                    'GET /health'
                ]
            });
        });
    
    }

    iniciar(puerto: number = 3000): void {
        this.app.listen(puerto, () => {
            console.log('\n🚀 Iniciando Servidor');
            
        });
    }
}

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Iniciar aplicación
const app = new SistemaMonitoreoApp();
app.iniciar(3000);

export default app;