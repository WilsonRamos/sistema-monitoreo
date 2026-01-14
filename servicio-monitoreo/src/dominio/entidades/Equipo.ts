/**
 * ==================================
 * ENTIDAD DE DOMINIO - EQUIPO
 * ==================================
 * Microservicio: Monitoreo
 * Bounded Context: Gestión de Equipos Mineros
 *
 * Esta entidad encapsula toda la lógica de negocio relacionada con equipos mineros.
 * Implementa patrones DDD: Aggregate Root, Encapsulación, Invariantes de Dominio
 */

export class Equipo {
    private readonly _id: string;
    private readonly _codigo: string;
    private readonly _tipo: string;
    private _estado: string;
    private _nivelCombustible: number;
    private _horasOperacion: number;
    private readonly _fechaCreacion: Date;
    private _fechaActualizacion: Date;
    private readonly _historial: { accion: string, valor?: any, fecha: Date }[] = [];

    constructor(
        id: string,
        codigo: string,
        tipo: string,
        nivelCombustible: number = 100,
        horasOperacion: number = 0
    ) {
        this.validarDatos(codigo, tipo);

        this._id = id;
        this._codigo = codigo;
        this._tipo = tipo;
        this._estado = 'DISPONIBLE';
        this._nivelCombustible = nivelCombustible;
        this._horasOperacion = horasOperacion;
        this._fechaCreacion = new Date();
        this._fechaActualizacion = new Date();
        this.registrarHistorial('crear', { nivelCombustible, horasOperacion });
    }

    // ===================================
    // GETTERS (Read-only properties)
    // ===================================

    get id(): string { return this._id; }
    get codigo(): string { return this._codigo; }
    get tipo(): string { return this._tipo; }
    get estado(): string { return this._estado; }
    get nivelCombustible(): number { return this._nivelCombustible; }
    get horasOperacion(): number { return this._horasOperacion; }
    get fechaCreacion(): Date { return this._fechaCreacion; }
    get fechaActualizacion(): Date { return this._fechaActualizacion; }
    get historial(): { accion: string, valor?: any, fecha: Date }[] { return [...this._historial]; }

    // ===================================
    // COMPORTAMIENTOS DE DOMINIO
    // ===================================

    /**
     * Cambiar el estado del equipo
     * Implementa máquina de estados (State Machine)
     */
    cambiarEstado(nuevoEstado: string): void {
        const estadosValidos = ['DISPONIBLE', 'OPERANDO', 'MANTENIMIENTO', 'INACTIVO'];

        if (!estadosValidos.includes(nuevoEstado)) {
            throw new Error(`Estado ${nuevoEstado} no es válido. Estados válidos: ${estadosValidos.join(', ')}`);
        }

        if (!this.puedeTransicionarA(nuevoEstado)) {
            throw new Error(`No se puede cambiar de ${this._estado} a ${nuevoEstado}`);
        }

        this._estado = nuevoEstado;
        this._fechaActualizacion = new Date();
        this.registrarHistorial('cambiarEstado', nuevoEstado);
    }

    /**
     * Consumir combustible del equipo
     */
    consumirCombustible(cantidad: number): void {
        if (cantidad < 0) {
            throw new Error('La cantidad debe ser positiva');
        }
        if (this._nivelCombustible - cantidad < 0) {
            throw new Error('Combustible insuficiente');
        }
        this._nivelCombustible -= cantidad;
        this._fechaActualizacion = new Date();
        this.registrarHistorial('consumirCombustible', cantidad);
    }

    /**
     * Sumar horas de operación
     */
    sumarHorasOperacion(horas: number): void {
        if (horas < 0) {
            throw new Error('Las horas deben ser positivas');
        }
        this._horasOperacion += horas;
        this._fechaActualizacion = new Date();
        this.registrarHistorial('sumarHorasOperacion', horas);
    }

    /**
     * Verificar si el equipo puede operar
     */
    puedeOperar(): boolean {
        return this._estado === 'DISPONIBLE';
    }

    /**
     * Reiniciar el equipo a estado inicial
     */
    reiniciar(): void {
        this._estado = 'DISPONIBLE';
        this._nivelCombustible = 100;
        this._horasOperacion = 0;
        this._fechaActualizacion = new Date();
        this.registrarHistorial('reiniciar');
    }

    /**
     * Verificar alertas del equipo
     */
    verificarAlertas(
        onAlerta: (mensaje: string) => void,
        umbralCombustible: number = 10,
        umbralHoras: number = 500
    ): void {
        if (this._estado === 'INACTIVO') {
            onAlerta(`ALERTA: El equipo ${this._codigo} está INACTIVO.`);
            this.registrarHistorial('alerta', 'INACTIVO');
        }
        if (this._nivelCombustible < umbralCombustible) {
            onAlerta(`ALERTA: El equipo ${this._codigo} tiene bajo nivel de combustible.`);
            this.registrarHistorial('alerta', 'Combustible bajo');
        }
        if (this._horasOperacion > umbralHoras) {
            onAlerta(`ALERTA: El equipo ${this._codigo} requiere mantenimiento preventivo.`);
            this.registrarHistorial('alerta', 'Mantenimiento preventivo');
        }
        if (this._estado === 'MANTENIMIENTO') {
            onAlerta(`ALERTA: El equipo ${this._codigo} está en mantenimiento.`);
            this.registrarHistorial('alerta', 'MANTENIMIENTO');
        }
    }

    /**
     * Obtener información completa del equipo (DTO)
     */
    obtenerInfo(): any {
        return {
            id: this._id,
            codigo: this._codigo,
            tipo: this._tipo,
            estado: this._estado,
            nivelCombustible: this._nivelCombustible,
            horasOperacion: this._horasOperacion,
            fechaCreacion: this._fechaCreacion,
            fechaActualizacion: this._fechaActualizacion
        };
    }

    // ===================================
    // MÉTODOS PRIVADOS (Business Rules)
    // ===================================

    private validarDatos(codigo: string, tipo: string): void {
        if (!codigo || codigo.trim().length === 0) {
            throw new Error('El código del equipo es obligatorio');
        }
        if (codigo.length < 3) {
            throw new Error('El código debe tener al menos 3 caracteres');
        }

        const tiposValidos = ['VOLQUETE', 'EXCAVADORA', 'BULLDOZER', 'GRUA', 'PERFORADORA'];
        if (!tiposValidos.includes(tipo)) {
            throw new Error(`Tipo ${tipo} no es válido. Tipos válidos: ${tiposValidos.join(', ')}`);
        }
    }

    private puedeTransicionarA(nuevoEstado: string): boolean {
        const transicionesPermitidas: { [key: string]: string[] } = {
            'DISPONIBLE': ['OPERANDO', 'MANTENIMIENTO', 'INACTIVO'],
            'OPERANDO': ['DISPONIBLE', 'MANTENIMIENTO'],
            'MANTENIMIENTO': ['DISPONIBLE', 'INACTIVO'],
            'INACTIVO': ['DISPONIBLE', 'MANTENIMIENTO']
        };

        const estadosPermitidos = transicionesPermitidas[this._estado] || [];
        return estadosPermitidos.includes(nuevoEstado);
    }

    private registrarHistorial(accion: string, valor?: any): void {
        this._historial.push({ accion, valor, fecha: new Date() });
    }
}
