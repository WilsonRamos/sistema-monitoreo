
import express from 'express';
import path from 'path';
import { MemoriaEquipoRepositorio } from '../infraestructura/persistencia/repositorios/MemoriaEquipoRepositorio';
import { CrearEquipo } from '../aplicacion/casos-uso/equipos/CrearEquipo';
import { ObtenerEquipos } from '../aplicacion/casos-uso/equipos/ObtenerEquipos';
import { EquipoController } from './api/controllers/EquipoController';
import { crearRutasEquipos } from './api/routes/equipos.routes';

class SistemaMonitoreoApp {
    private app: express.Application;

    constructor() {
        this.app = express();
        this.configurarMiddlewares();
        this.configurarDependencias();
        this.configurarRutas();
    }

    private configurarMiddlewares(): void {
        // Middleware para parsear JSON
        this.app.use(express.json());
        
        // Middleware para archivos estáticos (CSS, JS, imágenes)
        this.app.use(express.static(path.join(__dirname, 'web/public')));
        
        // Logs básicos
        this.app.use((req, res, next) => {
            console.log(`${req.method} ${req.path}`);
            next();
        });
    }

    private configurarDependencias(): void {
        // 1. Crear repositorio (Infraestructura)
        const equipoRepositorio = new MemoriaEquipoRepositorio();

        // 2. Crear casos de uso (Aplicación) - Inyectamos repositorio
        const crearEquipoUseCase = new CrearEquipo(equipoRepositorio);
        const obtenerEquiposUseCase = new ObtenerEquipos(equipoRepositorio);

        // 3. Crear controller (Presentación) - Inyectamos casos de uso
        const equipoController = new EquipoController(crearEquipoUseCase, obtenerEquiposUseCase);

        // 4. Guardar controller para usar en rutas
        this.equipoController = equipoController;
    }

    private equipoController!: EquipoController;

    private configurarRutas(): void {
        // Página de inicio (como pide el laboratorio)
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'web/index.html'));
        });

        // API REST para equipos
        this.app.use('/api/equipos', crearRutasEquipos(this.equipoController));

        // Ruta de salud del sistema
        this.app.get('/health', (req, res) => {
            res.json({ 
                status: 'OK', 
                message: 'Sistema de Monitoreo funcionando correctamente',
                timestamp: new Date().toISOString()
            });
        });
    }

    iniciar(puerto: number = 3000): void {
        this.app.listen(puerto, () => {
            console.log('\n🚀 =======================================');
            console.log('   SISTEMA DE MONITOREO MINERO INICIADO');
            console.log('🚀 =======================================');
            console.log(`📱 Página de inicio: http://localhost:${puerto}`);
            console.log(`🔗 API Equipos: http://localhost:${puerto}/api/equipos`);
            console.log(`💚 Health Check: http://localhost:${puerto}/health`);
            console.log('=======================================\n');
        });
    }
}

// Iniciar aplicación
const app = new SistemaMonitoreoApp();
app.iniciar(3000);

export default app;