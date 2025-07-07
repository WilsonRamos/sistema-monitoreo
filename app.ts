// app.ts
import { MemoriaEquipoRepositorio } from './infraestructura/persistencia/repositorios/MemoriaEquipoRepositorio';
import { CrearEquipo } from './aplicacion/casos-uso/equipos/CrearEquipo';
import { ObtenerEquipos } from './aplicacion/casos-uso/equipos/ObtenerEquipos';
import { EquipoController } from './presentacion/api/controllers/EquipoController';
import { Server } from './aplicacion/server';

function main() {
    // Composición de dependencias
    const equipoRepositorio = new MemoriaEquipoRepositorio();
    const crearEquipoUseCase = new CrearEquipo(equipoRepositorio);
    const obtenerEquiposUseCase = new ObtenerEquipos(equipoRepositorio);
    const equipoController = new EquipoController(crearEquipoUseCase, obtenerEquiposUseCase);

    // Crear servidor
    const server = new Server(equipoController);
    server.iniciar(3000);
}

// Manejo de errores globales
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

main();
