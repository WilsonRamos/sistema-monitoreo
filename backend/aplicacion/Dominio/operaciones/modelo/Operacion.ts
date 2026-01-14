import { TipoOperacion, validarTipoOperacion } from './TipoOperacion';

export class Operacion {
    private _id: string;
    private _tipo: TipoOperacion;
    private _fechaInicio: Date;
    private _fechaFin?: Date;
    private _supervisorId: string;
    private _frenteId: string;
    private _equiposAsignados: string[];

    constructor(
        id: string,
        tipo: string,
        supervisorId: string,
        frenteId: string
    ) {
        this.validarId(id);
        validarTipoOperacion(tipo);
        this.validarSupervisor(supervisorId);
        this.validarFrente(frenteId);

        this._id = id;
        this._tipo = tipo as TipoOperacion;
        this._supervisorId = supervisorId;
        this._frenteId = frenteId;
        this._fechaInicio = new Date();
        this._equiposAsignados = [];

        console.log(`📋 Operación ${tipo} creada: ${id} en frente ${frenteId}`);
    }

    get id(): string {
        return this._id;
    }

    get tipo(): TipoOperacion {
        return this._tipo;
    }

    get fechaInicio(): Date {
        return this._fechaInicio;
    }

    get fechaFin(): Date | undefined {
        return this._fechaFin;
    }

    get supervisorId(): string {
        return this._supervisorId;
    }

    get frenteId(): string {
        return this._frenteId;
    }

    get equiposAsignados(): string[] {
        return [...this._equiposAsignados];
    }

    asignarEquipo(equipoId: string): void {
        if (!equipoId || equipoId.trim().length === 0) {
            throw new Error('El ID del equipo es obligatorio');
        }

        if (!this._equiposAsignados.includes(equipoId)) {
            this._equiposAsignados.push(equipoId);
            console.log(`➕ Equipo ${equipoId} asignado a operación ${this._id}`);
        }
    }

    removerEquipo(equipoId: string): void {
        const index = this._equiposAsignados.indexOf(equipoId);
        if (index > -1) {
            this._equiposAsignados.splice(index, 1);
            console.log(`➖ Equipo ${equipoId} removido de operación ${this._id}`);
        }
    }

    finalizar(): void {
        if (this._fechaFin) {
            return;
        }
        this._fechaFin = new Date();
        console.log(`✅ Operación ${this._id} finalizada`);
    }

    calcularDuracionMinutos(): number {
        if (!this._fechaFin) {
            return 0;
        }
        const diffMs = this._fechaFin.getTime() - this._fechaInicio.getTime();
        return Math.floor(diffMs / (1000 * 60));
    }

    estaActiva(): boolean {
        return this._fechaFin === undefined;
    }

    obtenerCantidadEquipos(): number {
        return this._equiposAsignados.length;
    }

    obtenerInfo(): any {
        return {
            id: this._id,
            tipo: this._tipo,
            supervisorId: this._supervisorId,
            frenteId: this._frenteId,
            fechaInicio: this._fechaInicio.toISOString(),
            fechaFin: this._fechaFin?.toISOString(),
            equiposAsignados: this.equiposAsignados,
            duracionMinutos: this.calcularDuracionMinutos(),
            estaActiva: this.estaActiva(),
        };
    }

    private validarId(id: string): void {
        if (!id || id.trim().length === 0) {
            throw new Error('El ID de la operación es obligatorio');
        }
    }

    private validarSupervisor(supervisorId: string): void {
        if (!supervisorId || supervisorId.trim().length === 0) {
            throw new Error('El supervisor es obligatorio');
        }
    }

    private validarFrente(frenteId: string): void {
        if (!frenteId || frenteId.trim().length === 0) {
            throw new Error('El frente de trabajo es obligatorio');
        }
    }
}
