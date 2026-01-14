/**
 * ==================================
 * REPOSITORIO EN MEMORIA - OPERACIONES
 * ==================================
 * Implementación del repositorio usando almacenamiento en memoria
 * En producción, esto se reemplazaría por una base de datos real (PostgreSQL, MongoDB, etc.)
 */

import { Operacion } from '../../dominio/entidades/Operacion';
import { IOperacionRepositorio } from '../../dominio/repositorios/IOperacionRepositorio';

export class MemoriaOperacionRepositorio implements IOperacionRepositorio {
    private operaciones: Operacion[] = [];

    constructor() {
        console.log('📦 MemoriaOperacionRepositorio: Repositorio en memoria inicializado');
        this.inicializarDatosDePrueba();
    }

    async crear(operacion: Operacion): Promise<void> {
        try {
            this.operaciones.push(operacion);
            console.log(`✅ Operación creada: ${operacion.id} (${operacion.tipo})`);
        } catch (error) {
            console.error(`❌ Error creando operación:`, error);
            throw error;
        }
    }

    async obtenerTodas(): Promise<Operacion[]> {
        try {
            const copia = [...this.operaciones];
            console.log(`📋 Obtenidas ${copia.length} operaciones del repositorio`);
            return copia;
        } catch (error) {
            console.error(`❌ Error obteniendo operaciones:`, error);
            throw new Error('Error al obtener operaciones del repositorio');
        }
    }

    async obtenerPorId(id: string): Promise<Operacion | null> {
        try {
            const operacion = this.operaciones.find(op => op.id === id);

            if (operacion) {
                console.log(`🔍 Operación encontrada: ${operacion.id}`);
            } else {
                console.log(`❌ No se encontró operación con ID: ${id}`);
            }

            return operacion || null;
        } catch (error) {
            console.error(`❌ Error buscando operación por ID:`, error);
            throw new Error('Error al buscar operación por ID');
        }
    }

    async obtenerActivas(): Promise<Operacion[]> {
        try {
            const activas = this.operaciones.filter(op => op.estaActiva());
            console.log(`🔍 Encontradas ${activas.length} operaciones activas`);
            return activas;
        } catch (error) {
            console.error(`❌ Error obteniendo operaciones activas:`, error);
            throw new Error('Error al obtener operaciones activas');
        }
    }

    async obtenerPorSupervisor(supervisorId: string): Promise<Operacion[]> {
        try {
            const operaciones = this.operaciones.filter(op => op.supervisorId === supervisorId);
            console.log(`🔍 Encontradas ${operaciones.length} operaciones para supervisor: ${supervisorId}`);
            return operaciones;
        } catch (error) {
            console.error(`❌ Error buscando por supervisor:`, error);
            throw new Error('Error al buscar operaciones por supervisor');
        }
    }

    async obtenerPorFrente(frenteId: string): Promise<Operacion[]> {
        try {
            const operaciones = this.operaciones.filter(op => op.frenteId === frenteId);
            console.log(`🔍 Encontradas ${operaciones.length} operaciones para frente: ${frenteId}`);
            return operaciones;
        } catch (error) {
            console.error(`❌ Error buscando por frente:`, error);
            throw new Error('Error al buscar operaciones por frente');
        }
    }

    async actualizar(operacion: Operacion): Promise<void> {
        try {
            const index = this.operaciones.findIndex(op => op.id === operacion.id);

            if (index === -1) {
                throw new Error(`No se encontró operación con ID: ${operacion.id}`);
            }

            this.operaciones[index] = operacion;
            console.log(`✅ Operación actualizada: ${operacion.id}`);
        } catch (error) {
            console.error(`❌ Error actualizando operación:`, error);
            throw error;
        }
    }

    async eliminar(id: string): Promise<void> {
        try {
            const index = this.operaciones.findIndex(op => op.id === id);

            if (index === -1) {
                throw new Error(`No se encontró operación con ID: ${id}`);
            }

            const operacionEliminada = this.operaciones[index];
            this.operaciones.splice(index, 1);
            console.log(`✅ Operación eliminada: ${operacionEliminada.id}`);
        } catch (error) {
            console.error(`❌ Error eliminando operación:`, error);
            throw error;
        }
    }

    /**
     * Inicializar datos de prueba
     * SOLO para desarrollo y testing
     */
    private inicializarDatosDePrueba(): void {
        console.log('🔧 Inicializando datos de prueba...');

        // Importar crypto para generar IDs seguros
        const crypto = require('crypto');

        // IDs de prueba para supervisores y frentes
        const supervisor1 = crypto.randomUUID();
        const supervisor2 = crypto.randomUUID();
        const frente1 = crypto.randomUUID();
        const frente2 = crypto.randomUUID();

        // IDs de equipos de prueba (simulando equipos del servicio de monitoreo)
        const equipo1 = crypto.randomUUID();
        const equipo2 = crypto.randomUUID();
        const equipo3 = crypto.randomUUID();

        // Crear operaciones de prueba
        const operacionesPrueba = [
            // Operación 1: Cargue activo
            new Operacion(
                crypto.randomUUID(),
                'CARGUE',
                supervisor1,
                frente1,
                new Date(Date.now() - 3600000), // Hace 1 hora
                [equipo1, equipo2]
            ),
            // Operación 2: Transporte finalizado
            new Operacion(
                crypto.randomUUID(),
                'TRANSPORTE',
                supervisor2,
                frente1,
                new Date(Date.now() - 7200000), // Hace 2 horas
                [equipo3]
            ),
            // Operación 3: Descarga activa
            new Operacion(
                crypto.randomUUID(),
                'DESCARGA',
                supervisor1,
                frente2,
                new Date(Date.now() - 1800000), // Hace 30 minutos
                [equipo2]
            )
        ];

        // Finalizar la operación 2 (transporte)
        operacionesPrueba[1].finalizar();

        this.operaciones = operacionesPrueba;

        console.log(`✅ ${this.operaciones.length} operaciones de prueba inicializadas`);
        console.log(`   - ${this.obtenerActivas().length} operaciones activas`);
        console.log(`   - ${this.operaciones.length - this.obtenerActivas().length} operaciones finalizadas`);
    }
}
