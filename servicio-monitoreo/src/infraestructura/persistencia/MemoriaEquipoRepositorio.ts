/**
 * ==================================
 * REPOSITORIO EN MEMORIA - EQUIPOS
 * ==================================
 * Implementación del repositorio usando almacenamiento en memoria
 * En producción, esto se reemplazaría por una base de datos real (PostgreSQL, MongoDB, etc.)
 */

import { Equipo } from '../../dominio/entidades/Equipo';
import { IEquipoRepositorio } from '../../dominio/repositorios/IEquipoRepositorio';

export class MemoriaEquipoRepositorio implements IEquipoRepositorio {
    private equipos: Equipo[] = [];

    constructor() {
        console.log('📦 MemoriaEquipoRepositorio: Repositorio en memoria inicializado');
        this.inicializarDatosDePrueba();
    }

    async crear(equipo: Equipo): Promise<void> {
        try {
            const existeCodigo = await this.existeConCodigo(equipo.codigo);
            if (existeCodigo) {
                throw new Error(`Ya existe un equipo con el código: ${equipo.codigo}`);
            }

            this.equipos.push(equipo);
            console.log(`✅ Equipo creado: ${equipo.codigo} (${equipo.tipo})`);
        } catch (error) {
            console.error(`❌ Error creando equipo:`, error);
            throw error;
        }
    }

    async obtenerTodos(): Promise<Equipo[]> {
        try {
            const copia = [...this.equipos];
            console.log(`📋 Obtenidos ${copia.length} equipos del repositorio`);
            return copia;
        } catch (error) {
            console.error(`❌ Error obteniendo equipos:`, error);
            throw new Error('Error al obtener equipos del repositorio');
        }
    }

    async obtenerPorId(id: string): Promise<Equipo | null> {
        try {
            const equipo = this.equipos.find(e => e.id === id);

            if (equipo) {
                console.log(`🔍 Equipo encontrado: ${equipo.codigo}`);
            } else {
                console.log(`❌ No se encontró equipo con ID: ${id}`);
            }

            return equipo || null;
        } catch (error) {
            console.error(`❌ Error buscando equipo por ID:`, error);
            throw new Error('Error al buscar equipo por ID');
        }
    }

    async actualizar(equipo: Equipo): Promise<void> {
        try {
            const index = this.equipos.findIndex(e => e.id === equipo.id);

            if (index === -1) {
                throw new Error(`No se encontró equipo con ID: ${equipo.id}`);
            }

            this.equipos[index] = equipo;
            console.log(`✅ Equipo actualizado: ${equipo.codigo}`);
        } catch (error) {
            console.error(`❌ Error actualizando equipo:`, error);
            throw error;
        }
    }

    async eliminar(id: string): Promise<void> {
        try {
            const index = this.equipos.findIndex(e => e.id === id);

            if (index === -1) {
                throw new Error(`No se encontró equipo con ID: ${id}`);
            }

            const equipoEliminado = this.equipos[index];
            this.equipos.splice(index, 1);
            console.log(`✅ Equipo eliminado: ${equipoEliminado.codigo}`);
        } catch (error) {
            console.error(`❌ Error eliminando equipo:`, error);
            throw error;
        }
    }

    async buscarPorTipo(tipo: string): Promise<Equipo[]> {
        try {
            const equiposFiltrados = this.equipos.filter(e => e.tipo === tipo);
            console.log(`🔍 Encontrados ${equiposFiltrados.length} equipos del tipo: ${tipo}`);
            return equiposFiltrados;
        } catch (error) {
            console.error(`❌ Error buscando por tipo:`, error);
            throw new Error('Error al buscar equipos por tipo');
        }
    }

    async buscarPorEstado(estado: string): Promise<Equipo[]> {
        try {
            const equiposFiltrados = this.equipos.filter(e => e.estado === estado);
            console.log(`🔍 Encontrados ${equiposFiltrados.length} equipos en estado: ${estado}`);
            return equiposFiltrados;
        } catch (error) {
            console.error(`❌ Error buscando por estado:`, error);
            throw new Error('Error al buscar equipos por estado');
        }
    }

    async existeConCodigo(codigo: string): Promise<boolean> {
        try {
            const existe = this.equipos.some(e => e.codigo === codigo);
            return existe;
        } catch (error) {
            console.error(`❌ Error verificando código:`, error);
            throw new Error('Error al verificar código');
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

        // Crear equipos de prueba
        const equiposPrueba = [
            new Equipo(crypto.randomUUID(), 'VOL-001', 'VOLQUETE', 85, 120),
            new Equipo(crypto.randomUUID(), 'EXC-001', 'EXCAVADORA', 90, 200),
            new Equipo(crypto.randomUUID(), 'VOL-002', 'VOLQUETE', 70, 350)
        ];

        // Cambiar estados de algunos equipos
        equiposPrueba[1].cambiarEstado('OPERANDO');
        equiposPrueba[2].cambiarEstado('MANTENIMIENTO');

        this.equipos = equiposPrueba;

        console.log(`✅ ${this.equipos.length} equipos de prueba inicializados`);
    }
}
