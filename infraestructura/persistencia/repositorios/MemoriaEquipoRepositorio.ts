
import { IEquipoRepositorio } from '../../../Dominio/repositorios/IEquipoRepositorio';
import { Equipo } from '../../../Dominio/monitoreo/Equipo';

/**
 * Implementación COMPLETA en memoria del repositorio de equipos
 * 
 * IMPORTANTE: Esta clase debe implementar TODOS los métodos de IEquipoRepositorio
 * 
 * Métodos implementados:
 * ✅ crear()
 * ✅ obtenerTodos() 
 * ✅ obtenerPorId()
 * ✅ actualizar()
 * ✅ eliminar()
 * ✅ buscarPorTipo()      ← Estaba faltando
 * ✅ buscarPorEstado()    ← Estaba faltando  
 * ✅ existeConCodigo()    ← Estaba faltando
 */
export class MemoriaEquipoRepositorio implements IEquipoRepositorio {
    
    // Simulamos una "base de datos" en memoria
    private equipos: Equipo[] = [];
    
    constructor() {
        console.log('📦 MemoriaEquipoRepositorio: Repositorio en memoria inicializado');
        this.inicializarDatosDePrueba();
    }

    // ===================================
    // OPERACIONES CRUD BÁSICAS
    // ===================================

    async crear(equipo: Equipo): Promise<void> {
        try {
            // Validar que no exista duplicado
            const existeCodigo = await this.existeConCodigo(equipo.codigo);
            if (existeCodigo) {
                throw new Error(`Ya existe un equipo con el código: ${equipo.codigo}`);
            }

            // Agregar a la "base de datos" en memoria
            this.equipos.push(equipo);
            
            console.log(`✅ Equipo creado: ${equipo.codigo} (${equipo.tipo})`);
        } catch (error) {
            console.error(`❌ Error creando equipo: ${error}`);
            throw error;
        }
    }

    async obtenerTodos(): Promise<Equipo[]> {
        try {
            // Retornar una copia para evitar modificaciones externas
            const copia = [...this.equipos];
            console.log(`📋 Obtenidos ${copia.length} equipos del repositorio`);
            return copia;
        } catch (error) {
            console.error(`❌ Error obteniendo equipos: ${error}`);
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
            console.error(`❌ Error buscando equipo por ID: ${error}`);
            throw new Error('Error al buscar equipo por ID');
        }
    }

    async actualizar(equipo: Equipo): Promise<void> {
        try {
            const index = this.equipos.findIndex(e => e.id === equipo.id);
            
            if (index === -1) {
                throw new Error(`No se encontró equipo con ID: ${equipo.id}`);
            }

            // Reemplazar el equipo en la posición encontrada
            this.equipos[index] = equipo;
            
            console.log(`✅ Equipo actualizado: ${equipo.codigo}`);
        } catch (error) {
            console.error(`❌ Error actualizando equipo: ${error}`);
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
            
            // Eliminar del array
            this.equipos.splice(index, 1);
            
            console.log(`🗑️ Equipo eliminado: ${equipoEliminado.codigo}`);
        } catch (error) {
            console.error(`❌ Error eliminando equipo: ${error}`);
            throw error;
        }
    }

    // ===================================
    // OPERACIONES ESPECÍFICAS DEL DOMINIO
    // ===================================
    // ESTOS MÉTODOS ESTABAN FALTANDO - AHORA IMPLEMENTADOS

    async buscarPorTipo(tipo: string): Promise<Equipo[]> {
        try {
            console.log(`🔍 Buscando equipos por tipo: ${tipo}`);
            
            const equiposFiltrados = this.equipos.filter(e => e.tipo === tipo);
            
            console.log(`📊 Encontrados ${equiposFiltrados.length} equipos de tipo: ${tipo}`);
            
            // Retornar copia para evitar modificaciones externas
            return [...equiposFiltrados];
        } catch (error) {
            console.error(`❌ Error buscando equipos por tipo: ${error}`);
            throw new Error('Error al buscar equipos por tipo');
        }
    }

    async buscarPorEstado(estado: string): Promise<Equipo[]> {
        try {
            console.log(`🔍 Buscando equipos por estado: ${estado}`);
            
            const equiposFiltrados = this.equipos.filter(e => e.estado === estado);
            
            console.log(`📊 Encontrados ${equiposFiltrados.length} equipos en estado: ${estado}`);
            
            // Retornar copia para evitar modificaciones externas
            return [...equiposFiltrados];
        } catch (error) {
            console.error(`❌ Error buscando equipos por estado: ${error}`);
            throw new Error('Error al buscar equipos por estado');
        }
    }

    async existeConCodigo(codigo: string): Promise<boolean> {
        try {
            const existe = this.equipos.some(e => e.codigo === codigo);
            
            console.log(`🔍 ¿Existe código ${codigo}?: ${existe ? 'Sí' : 'No'}`);
            
            return existe;
        } catch (error) {
            console.error(`❌ Error verificando existencia de código: ${error}`);
            throw new Error('Error al verificar existencia de código');
        }
    }

    // ===================================
    // MÉTODOS AUXILIARES
    // ===================================

    /**
     * Inicializar algunos datos de prueba
     * Concepto: Seed data para desarrollo
     */
    private inicializarDatosDePrueba(): void {
        // Solo agregar datos si el repositorio está vacío
        if (this.equipos.length === 0) {
            try {
                console.log('🌱 Inicializando datos de prueba...');
                
                const equipoPrueba1 = new Equipo('demo-001', 'VOL-DEMO', 'VOLQUETE');
                const equipoPrueba2 = new Equipo('demo-002', 'EXC-DEMO', 'EXCAVADORA');
                
                this.equipos.push(equipoPrueba1);
                this.equipos.push(equipoPrueba2);
                
                console.log('✅ Datos de prueba inicializados: 2 equipos demo');
                console.log(`   - ${equipoPrueba1.codigo} (${equipoPrueba1.tipo})`);
                console.log(`   - ${equipoPrueba2.codigo} (${equipoPrueba2.tipo})`);
                
            } catch (error) {
                console.error('❌ Error inicializando datos de prueba:', error);
            }
        }
    }

    /**
     * Obtener estadísticas del repositorio
     * Útil para debugging y monitoreo
     */
    obtenerEstadisticas(): any {
        const tipoCount: { [key: string]: number } = {};
        const estadoCount: { [key: string]: number } = {};

        this.equipos.forEach(equipo => {
            tipoCount[equipo.tipo] = (tipoCount[equipo.tipo] || 0) + 1;
            estadoCount[equipo.estado] = (estadoCount[equipo.estado] || 0) + 1;
        });

        return {
            totalEquipos: this.equipos.length,
            porTipo: tipoCount,
            porEstado: estadoCount,
            equipos: this.equipos.map(e => ({
                id: e.id,
                codigo: e.codigo,
                tipo: e.tipo,
                estado: e.estado
            }))
        };
    }

    /**
     * Limpiar todos los equipos (útil para testing)
     */
    async limpiar(): Promise<void> {
        this.equipos = [];
        console.log('🧹 Repositorio limpiado - Todos los equipos eliminados');
    }
}
