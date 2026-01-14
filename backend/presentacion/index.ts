
import express from 'express';
import { MemoriaEquipoRepositorio } from '../aplicacion/infraestructura/persistencia/repositorios/MemoriaEquipoRepositorio';
import { MemoriaOperacionRepositorio } from '../aplicacion/infraestructura/persistencia/repositorios/MemoriaOperacionRepositorio';
import { MemoriaUsuarioRepositorio } from '../aplicacion/infraestructura/persistencia/repositorios/MemoriaUsuarioRepositorio';
import { CrearEquipo } from '../aplicacion/casos-uso/equipos/CrearEquipo';
import { ObtenerEquipos } from '../aplicacion/casos-uso/equipos/ObtenerEquipos';
import { IniciarOperacion } from '../aplicacion/casos-uso/operaciones/IniciarOperacion';
import { Login } from '../aplicacion/casos-uso/auth/Login';
import { Register } from '../aplicacion/casos-uso/auth/Register';
import { EquipoController } from './api/controllers/EquipoController';
import { OperacionesController } from './api/controllers/OperacionesController';
import { AuthController } from './api/controllers/AuthController';
import { AuthMiddleware } from './api/middleware/authMiddleware';
import { crearRutasEquipos } from './api/routes/equipos.routes';
import { crearRutasOperaciones } from './api/routes/operaciones.routes';
import { crearRutasAuth } from './api/routes/auth.routes';

class SistemaMonitoreoApp {
    private app: express.Application;

    constructor() {
        this.app = express();
        this.configurarMiddlewares();
        this.configurarDependencias();
        this.configurarRutas();
    }

    private configurarMiddlewares(): void {
        // Middleware CORS - Permite peticiones desde el frontend microservice
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*'); // En producción, especificar dominio exacto
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

            // Manejar preflight requests
            if (req.method === 'OPTIONS') {
                res.sendStatus(200);
            } else {
                next();
            }
        });

        // Middleware para parsear JSON
        this.app.use(express.json());

        // Logs básicos
        this.app.use((req, res, next) => {
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] ${req.method} ${req.path}`);
            next();
        });
    }

    private configurarDependencias(): void {
        // ═══════════════════════════════════════════════════════
        // 1. CONFIGURACIÓN JWT
        // ═══════════════════════════════════════════════════════
        const JWT_SECRET = process.env.JWT_SECRET || 'desarrollo_jwt_secret_cambiar_en_produccion';
        const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

        if (!process.env.JWT_SECRET) {
            console.warn('⚠️  ADVERTENCIA: Usando JWT_SECRET por defecto. Configure JWT_SECRET en .env');
        }

        // ═══════════════════════════════════════════════════════
        // 2. CREAR REPOSITORIOS (Infraestructura)
        // ═══════════════════════════════════════════════════════
        const equipoRepositorio = new MemoriaEquipoRepositorio();
        const operacionRepositorio = new MemoriaOperacionRepositorio();
        const usuarioRepositorio = new MemoriaUsuarioRepositorio();

        // ═══════════════════════════════════════════════════════
        // 3. CREAR CASOS DE USO (Aplicación)
        // ═══════════════════════════════════════════════════════
        // Equipos
        const crearEquipoUseCase = new CrearEquipo(equipoRepositorio);
        const obtenerEquiposUseCase = new ObtenerEquipos(equipoRepositorio);

        // Operaciones
        const iniciarOperacionUseCase = new IniciarOperacion(operacionRepositorio);

        // Autenticación
        const loginUseCase = new Login(usuarioRepositorio, JWT_SECRET, JWT_EXPIRES_IN);
        const registerUseCase = new Register(usuarioRepositorio);

        // ═══════════════════════════════════════════════════════
        // 4. CREAR MIDDLEWARE
        // ═══════════════════════════════════════════════════════
        this.authMiddleware = new AuthMiddleware(JWT_SECRET);

        // ═══════════════════════════════════════════════════════
        // 5. CREAR CONTROLLERS (Presentación)
        // ═══════════════════════════════════════════════════════
        const equipoController = new EquipoController(crearEquipoUseCase, obtenerEquiposUseCase);
        const operacionesController = new OperacionesController(iniciarOperacionUseCase);
        const authController = new AuthController(loginUseCase, registerUseCase);

        // ═══════════════════════════════════════════════════════
        // 6. GUARDAR CONTROLLERS PARA USAR EN RUTAS
        // ═══════════════════════════════════════════════════════
        this.equipoController = equipoController;
        this.operacionesController = operacionesController;
        this.authController = authController;
    }

    private equipoController!: EquipoController;
    private operacionesController!: OperacionesController;
    private authController!: AuthController;
    private authMiddleware!: AuthMiddleware;

    private configurarRutas(): void {
        // ═══════════════════════════════════════════════════════
        // RUTA RAÍZ - INFORMACIÓN DEL API
        // ═══════════════════════════════════════════════════════
        this.app.get('/', (req, res) => {
            res.json({
                success: true,
                service: 'Backend API - Sistema de Monitoreo Minero',
                version: '1.0.0',
                endpoints: {
                    auth: '/api/auth',
                    equipos: '/api/equipos',
                    operaciones: '/api/operaciones',
                    health: '/health'
                }
            });
        });

        // ═══════════════════════════════════════════════════════
        // RUTAS PÚBLICAS (Sin autenticación)
        // ═══════════════════════════════════════════════════════

        // Autenticación (login, register)
        this.app.use('/api/auth', crearRutasAuth(this.authController, this.authMiddleware));

        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                success: true,
                service: 'Backend Microservice',
                status: 'OK',
                message: 'Sistema de Monitoreo funcionando correctamente',
                timestamp: new Date().toISOString()
            });
        });

        // ═══════════════════════════════════════════════════════
        // RUTAS PROTEGIDAS (Requieren autenticación)
        // ═══════════════════════════════════════════════════════

        // Equipos - Protegido con JWT
        this.app.use(
            '/api/equipos',
            this.authMiddleware.requireAuth,
            crearRutasEquipos(this.equipoController)
        );

        // Operaciones - Protegido con JWT
        this.app.use(
            '/api/operaciones',
            this.authMiddleware.requireAuth,
            crearRutasOperaciones(this.operacionesController)
        );
    }

    iniciar(puerto: number = 4000): void {
        this.app.listen(puerto, () => {
            console.log('\n🔧 ==========================================');
            console.log('   BACKEND MICROSERVICE INICIADO');
            console.log('🔧 ==========================================');
            console.log(`🌐 API Base: http://localhost:${puerto}`);
            console.log(`🔗 API Equipos: http://localhost:${puerto}/api/equipos`);
            console.log(`🔗 API Operaciones: http://localhost:${puerto}/api/operaciones`);
            console.log(`💚 Health Check: http://localhost:${puerto}/health`);
            console.log(`✅ CORS habilitado para comunicación con Frontend`);
            console.log('==========================================\n');
        });
    }

    getApp(): express.Application {
        return this.app;
    }
}

// Exportar clase para uso externo
export { SistemaMonitoreoApp };

// Solo iniciar si este archivo es ejecutado directamente
if (require.main === module) {
    const app = new SistemaMonitoreoApp();
    app.iniciar(4000);
}