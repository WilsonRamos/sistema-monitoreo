import { IMonitoreoServicio } from './iMonitoreoServicio';
import { IEquipoRepositorio } from '../repositorios/IEquipoRepositorio';

/**
 * Implementación del servicio de monitoreo
 *
 * Patrón: Dependency Inversion Principle (DIP)
 * Depende de la interfaz IEquipoRepositorio, no de implementación concreta
 */
export class MonitoreoServicio implements IMonitoreoServicio {

    constructor(
        private readonly equipoRepositorio: IEquipoRepositorio
    ) {
        console.log('🔧 MonitoreoServicio inicializado');
    }

    /**
     * Actualizar estado de un equipo
     */
    async actualizarEstadoEquipo(equipoId: string, nuevoEstado: string): Promise<void> {
        const equipo = await this.equipoRepositorio.obtenerPorId(equipoId);

        if (!equipo) {
            throw new Error(`Equipo con ID ${equipoId} no encontrado`);
        }

        equipo.cambiarEstado(nuevoEstado);
        await this.equipoRepositorio.actualizar(equipo);

        console.log(`✅ Estado actualizado: ${equipoId} → ${nuevoEstado}`);
    }

    /**
     * Obtener ubicación GPS en tiempo real
     *
     * Nota: En producción, esto consultaría un servicio GPS real
     * o un sistema de telemetría de equipos
     */
    async obtenerUbicacionTiempoReal(equipoId: string): Promise<{ latitud: number; longitud: number }> {
        const equipo = await this.equipoRepositorio.obtenerPorId(equipoId);

        if (!equipo) {
            throw new Error(`Equipo con ID ${equipoId} no encontrado`);
        }

        // Simulación: En producción, consultaría GPS del equipo
        // Coordenadas de ejemplo: Arequipa, Perú
        return {
            latitud: -16.4090,
            longitud: -71.5375
        };
    }

    /**
     * Verificar alertas activas para un equipo
     */
    async verificarAlertasEquipo(equipoId: string): Promise<string[]> {
        const equipo = await this.equipoRepositorio.obtenerPorId(equipoId);

        if (!equipo) {
            return [];
        }

        const alertas: string[] = [];

        // Usar el método de dominio para verificar alertas
        equipo.verificarAlertas((mensaje) => {
            alertas.push(mensaje);
        });

        return alertas;
    }
}