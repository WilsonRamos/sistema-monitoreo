/**
 * ==================================
 * ENTIDAD DE DOMINIO - OPERACION
 * ==================================
 * Microservicio: Operaciones
 * Bounded Context: Gestión de Operaciones Mineras
 *
 * Esta entidad encapsula toda la lógica de negocio relacionada con operaciones mineras.
 * Implementa patrones DDD: Aggregate Root, Encapsulación, Invariantes de Dominio
 */

export class Operacion {
    private readonly _id: string;
    private readonly _tipo: string;
    private readonly _fechaInicio: Date;
    private _fechaFin: Date | null;
    private readonly _supervisorId: string;
    private readonly _frenteId: string;
    private _equiposAsignados: string[];
    private readonly _fechaCreacion: Date;
    private _fechaActualizacion: Date;
    private readonly _historial: { accion: string, valor?: any, fecha: Date }[] = [];

    constructor(
        id: string,
        tipo: string,
        supervisorId: string,
        frenteId: string,
        fechaInicio: Date = new Date(),
        equiposAsignados: string[] = []
    ) {
        this.validarDatos(tipo, supervisorId, frenteId);

        this._id = id;
        this._tipo = tipo;
        this._fechaInicio = fechaInicio;
        this._fechaFin = null;
        this._supervisorId = supervisorId;
        this._frenteId = frenteId;
        this._equiposAsignados = [...equiposAsignados];
        this._fechaCreacion = new Date();
        this._fechaActualizacion = new Date();
        this.registrarHistorial('crear', { tipo, supervisorId, frenteId });
    }

    // ===================================
    // GETTERS (Read-only properties)
    // ===================================

    get id(): string { return this._id; }
    get tipo(): string { return this._tipo; }
    get fechaInicio(): Date { return this._fechaInicio; }
    get fechaFin(): Date | null { return this._fechaFin; }
    get supervisorId(): string { return this._supervisorId; }
    get frenteId(): string { return this._frenteId; }
    get equiposAsignados(): string[] { return [...this._equiposAsignados]; }
    get fechaCreacion(): Date { return this._fechaCreacion; }
    get fechaActualizacion(): Date { return this._fechaActualizacion; }
    get historial(): { accion: string, valor?: any, fecha: Date }[] { return [...this._historial]; }

    // ===================================
    // COMPORTAMIENTOS DE DOMINIO
    // ===================================

    /**
     * Asignar un equipo a la operación
     */
    asignarEquipo(equipoId: string): void {
        if (!equipoId || equipoId.trim().length === 0) {
            throw new Error('El ID del equipo es obligatorio');
        }

        if (this._equiposAsignados.includes(equipoId)) {
            throw new Error(`El equipo ${equipoId} ya está asignado a esta operación`);
        }

        if (!this.estaActiva()) {
            throw new Error('No se pueden asignar equipos a una operación finalizada');
        }

        this._equiposAsignados.push(equipoId);
        this._fechaActualizacion = new Date();
        this.registrarHistorial('asignarEquipo', equipoId);
    }

    /**
     * Remover un equipo de la operación
     */
    removerEquipo(equipoId: string): void {
        const index = this._equiposAsignados.indexOf(equipoId);

        if (index === -1) {
            throw new Error(`El equipo ${equipoId} no está asignado a esta operación`);
        }

        if (!this.estaActiva()) {
            throw new Error('No se pueden remover equipos de una operación finalizada');
        }

        this._equiposAsignados.splice(index, 1);
        this._fechaActualizacion = new Date();
        this.registrarHistorial('removerEquipo', equipoId);
    }

    /**
     * Finalizar la operación
     */
    finalizar(): void {
        if (!this.estaActiva()) {
            throw new Error('La operación ya está finalizada');
        }

        this._fechaFin = new Date();
        this._fechaActualizacion = new Date();
        this.registrarHistorial('finalizar', this._fechaFin);
    }

    /**
     * Calcular la duración de la operación en minutos
     */
    calcularDuracionMinutos(): number {
        const fechaFin = this._fechaFin || new Date();
        const duracionMs = fechaFin.getTime() - this._fechaInicio.getTime();
        return Math.floor(duracionMs / 60000); // Convertir de ms a minutos
    }

    /**
     * Verificar si la operación está activa
     */
    estaActiva(): boolean {
        return this._fechaFin === null;
    }

    /**
     * Obtener la cantidad de equipos asignados
     */
    cantidadEquiposAsignados(): number {
        return this._equiposAsignados.length;
    }

    /**
     * Verificar si un equipo está asignado a la operación
     */
    tieneEquipoAsignado(equipoId: string): boolean {
        return this._equiposAsignados.includes(equipoId);
    }

    /**
     * Obtener información completa de la operación (DTO)
     */
    obtenerInfo(): any {
        return {
            id: this._id,
            tipo: this._tipo,
            fechaInicio: this._fechaInicio,
            fechaFin: this._fechaFin,
            supervisorId: this._supervisorId,
            frenteId: this._frenteId,
            equiposAsignados: [...this._equiposAsignados],
            cantidadEquipos: this._equiposAsignados.length,
            duracionMinutos: this.calcularDuracionMinutos(),
            estaActiva: this.estaActiva(),
            fechaCreacion: this._fechaCreacion,
            fechaActualizacion: this._fechaActualizacion
        };
    }

    // ===================================
    // MÉTODOS PRIVADOS (Business Rules)
    // ===================================

    private validarDatos(tipo: string, supervisorId: string, frenteId: string): void {
        const tiposValidos = ['CARGUE', 'TRANSPORTE', 'DESCARGA'];
        if (!tiposValidos.includes(tipo)) {
            throw new Error(`Tipo ${tipo} no es válido. Tipos válidos: ${tiposValidos.join(', ')}`);
        }

        if (!supervisorId || supervisorId.trim().length === 0) {
            throw new Error('El ID del supervisor es obligatorio');
        }

        if (!frenteId || frenteId.trim().length === 0) {
            throw new Error('El ID del frente es obligatorio');
        }
    }

    private registrarHistorial(accion: string, valor?: any): void {
        this._historial.push({ accion, valor, fecha: new Date() });
    }
}
