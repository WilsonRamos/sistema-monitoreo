// server.ts
import express from 'express';
import path from 'path';
import { EquipoController } from '../presentacion/api/controllers/EquipoController';
import { crearRutasEquipos } from '../presentacion/api/routes/equipos.routes';

export class Server {
    private readonly app = express();

    constructor(private equipoController: EquipoController) {
        this.configurarMiddlewares();
        this.configurarRutas();
    }

    private configurarMiddlewares(): void {
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, 'presentacion', 'web')));

        this.app.use((req, _res, next) => {
            const timestamp = new Date().toISOString();
            console.log(`${timestamp} - ${req.method} ${req.path}`);
            next();
        });
    }

    private configurarRutas(): void {
        this.app.get('/', (_req, res) => {
            const htmlPath = path.join(__dirname, '../presentacion', 'web', 'index.html');
            res.sendFile(htmlPath);
        });

        this.app.use('/api/equipos', crearRutasEquipos(this.equipoController));

        this.app.get('/health', (_req, res) => {
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

    public iniciar(puerto: number): void {
        this.app.listen(puerto, () => {
            console.log('\n🚀 Sistema de Monitoreo Minero iniciado en puerto', puerto);
            console.log(`📱 Página web: http://localhost:${puerto}`);
            console.log(`🔗 API REST: http://localhost:${puerto}/api/equipos`);
            console.log(`💚 Health: http://localhost:${puerto}/health`);
        });
    }
}
