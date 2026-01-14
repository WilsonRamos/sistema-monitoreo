/**
 * Servidor del Microservicio Frontend
 *
 * Este servidor sirve los archivos estáticos del frontend
 * y actúa como proxy para redirigir las peticiones al backend.
 *
 * Decisiones de Arquitectura:
 * 1. Servidor Express simple y liviano
 * 2. Proxy transparente hacia el backend API
 * 3. CORS configurado para permitir comunicación entre servicios
 * 4. Logging de peticiones para debugging
 *
 * Patrón aplicado: Backend for Frontend (BFF) simplificado
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';

class FrontendMicroservice {
    private app: express.Application;
    private readonly PUERTO_FRONTEND = 3000;
    private readonly PUERTO_BACKEND = 4000;
    private readonly URL_BACKEND = `http://localhost:${this.PUERTO_BACKEND}`;

    constructor() {
        this.app = express();
        this.configurarMiddlewares();
        this.configurarProxy();
        this.configurarRutasEstaticas();
    }

    /**
     * Configuración de middlewares básicos
     */
    private configurarMiddlewares(): void {
        // Middleware para parsear JSON
        this.app.use(express.json());

        // Middleware de logging
        this.app.use((req: Request, _res: Response, next: NextFunction) => {
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] ${req.method} ${req.path}`);
            next();
        });

        // Middleware de CORS - Permite que el frontend acceda al backend
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

            // Manejar preflight requests
            if (req.method === 'OPTIONS') {
                res.sendStatus(200);
            } else {
                next();
            }
        });

        console.log('✅ Middlewares configurados');
    }

    /**
     * Configuración del Proxy hacia el Backend
     *
     * El proxy redirige todas las peticiones /api/* hacia el backend,
     * permitiendo que el frontend y backend se ejecuten en puertos diferentes
     * de manera transparente.
     */
    private configurarProxy(): void {
        const proxyOptions: Options = {
            target: this.URL_BACKEND,
            changeOrigin: true,
            pathRewrite: {
                // No necesitamos reescribir la ruta, ya que el backend también usa /api
            },
            onProxyReq: (_proxyReq, req) => {
                console.log(`🔄 Proxy: ${req.method} ${req.path} -> ${this.URL_BACKEND}${req.path}`);
            },
            onProxyRes: (proxyRes, req) => {
                console.log(`✅ Proxy Response: ${req.path} - Status: ${proxyRes.statusCode}`);
            },
            onError: (err, _req, res) => {
                console.error('❌ Error en Proxy:', err.message);
                const response = res as Response;
                response.status(502).json({
                    success: false,
                    message: 'Error de comunicación con el backend',
                    error: err.message
                });
            }
        };

        // Configurar proxy para todas las rutas /api/*
        this.app.use('/api', createProxyMiddleware(proxyOptions));

        console.log(`✅ Proxy configurado: /api/* -> ${this.URL_BACKEND}/api/*`);
    }

    /**
     * Configuración de rutas para servir archivos estáticos
     */
    private configurarRutasEstaticas(): void {
        // Servir archivos estáticos desde /public
        const publicPath = path.join(__dirname, '..', 'public');
        this.app.use(express.static(publicPath));

        console.log(`✅ Archivos estáticos servidos desde: ${publicPath}`);

        // Ruta principal - Servir index.html
        this.app.get('/', (_req: Request, res: Response) => {
            res.sendFile(path.join(publicPath, 'index.html'));
        });

        // Health check del frontend
        this.app.get('/health', (_req: Request, res: Response) => {
            res.json({
                success: true,
                service: 'Frontend Microservice',
                status: 'OK',
                timestamp: new Date().toISOString(),
                backend: this.URL_BACKEND
            });
        });

        // Ruta para cualquier path no encontrado (SPA fallback)
        this.app.get('*', (req: Request, res: Response) => {
            // Si la ruta no existe, servir index.html (útil para SPAs)
            if (!req.path.startsWith('/api')) {
                res.sendFile(path.join(publicPath, 'index.html'));
            }
        });
    }

    /**
     * Iniciar el servidor del microservicio frontend
     */
    public iniciar(): void {
        this.app.listen(this.PUERTO_FRONTEND, () => {
            console.log('\n🎨 ==========================================');
            console.log('   FRONTEND MICROSERVICE INICIADO');
            console.log('🎨 ==========================================');
            console.log(`📱 Aplicación Web: http://localhost:${this.PUERTO_FRONTEND}`);
            console.log(`💚 Health Check: http://localhost:${this.PUERTO_FRONTEND}/health`);
            console.log(`🔗 Proxy hacia Backend: ${this.URL_BACKEND}`);
            console.log('==========================================\n');
            console.log('⚠️  IMPORTANTE: Asegúrate de que el backend esté ejecutándose en el puerto', this.PUERTO_BACKEND);
        });
    }

    /**
     * Obtener la instancia de Express (útil para testing)
     */
    public getApp(): express.Application {
        return this.app;
    }
}

// Iniciar el microservicio frontend
const frontendService = new FrontendMicroservice();
frontendService.iniciar();

export default frontendService;
