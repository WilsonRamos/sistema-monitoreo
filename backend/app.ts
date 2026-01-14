/**
 * app.ts - Backend Microservice Entry Point
 *
 * Sistema de Monitoreo Minero
 * Clean Architecture + DDD + Autenticación JWT
 */

import { SistemaMonitoreoApp } from './presentacion/index';
import dotenv from 'dotenv';

// ═══════════════════════════════════════
// CARGAR VARIABLES DE ENTORNO
// ═══════════════════════════════════════
dotenv.config();

// ═══════════════════════════════════════
// INICIALIZAR APLICACIÓN
// ═══════════════════════════════════════
const PORT = parseInt(process.env.PORT || '4000', 10);

const app = new SistemaMonitoreoApp();

// ═══════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// ═══════════════════════════════════════
// INICIAR SERVIDOR
// ═══════════════════════════════════════
app.iniciar(PORT);
