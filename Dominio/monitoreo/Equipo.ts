// ===================================
// ENTIDAD DE DOMINIO - EQUIPO
// ===================================
// Archivo: Dominio/monitoreo/Equipo.ts
// Concepto: Entidad = Objeto con identidad + comportamiento + reglas de negocio
// Buena Práctica: La entidad encapsula las reglas del negocio

export class Equipo {
    // Propiedades privadas (encapsulación)
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
        nivelCombustible: number,
        horasOperacion: number
    ) {
        // Validación de reglas de negocio en el constructor
        this.validarDatos(codigo, tipo);
        
        this._id = id;
        this._codigo = codigo;
        this._tipo = tipo;
        this._estado = 'DISPONIBLE'; // Estado inicial por defecto
        this._nivelCombustible = nivelCombustible;
        this._horasOperacion = horasOperacion;
        this._fechaCreacion = new Date();
        this._fechaActualizacion = new Date();
        this.registrarHistorial('crear', { nivelCombustible, horasOperacion });
    }

    // Getters (propiedades de solo lectura desde el exterior)
    get id(): string { 
        return this._id; 
    }
    
    get codigo(): string { 
        return this._codigo; 
    }
    
    get tipo(): string { 
        return this._tipo; 
    }
    
    get estado(): string { 
        return this._estado; 
    }
    get fechaCreacion(): Date {
        return this._fechaCreacion;
    }
    get fechaActualizacion(): Date {
        return this._fechaActualizacion;
    }
    // Nivel de combustible
    get nivelCombustible(): number {
        return this._nivelCombustible;
    }

    set nivelCombustible(valor: number) {
        if (valor < 0) {
            throw new Error('El nivel de combustible no puede ser negativo');
        }
        this._nivelCombustible = valor;
        this._fechaActualizacion = new Date();
        this.registrarHistorial('setNivelCombustible', valor);
    }

    // Horas de operación
    get horasOperacion(): number {
        return this._horasOperacion;
    }

    set horasOperacion(valor: number) {
        if (valor < 0) {
            throw new Error('Las horas de operación no pueden ser negativas');
        }
        this._horasOperacion = valor;
        this._fechaActualizacion = new Date();
        this.registrarHistorial('setHorasOperacion', valor);
    }
    get historial(): { 
        accion: string, valor?: any, fecha: Date }[] { return this._historial; 
    }
    
    consumirCombustible(cantidad: number): void {
        if (cantidad < 0) {
            throw new Error('La cantidad debe ser positiva')
        }
        if (this._nivelCombustible - cantidad < 0) {
            throw new Error('Combustible insuficiente')
        }
        this._nivelCombustible -= cantidad;
    }

    sumarHorasOperacion(horas: number): void {
    if (horas < 0){ 
        throw new Error('Las horas deben ser positivas')
    }
    this._horasOperacion += horas;
    this._fechaActualizacion = new Date();
    this.registrarHistorial('sumarHorasOperacion', horas);
    }


    // ===================================
    // COMPORTAMIENTOS DE DOMINIO
    // ===================================
    // Concepto: La lógica de negocio va en la entidad

    /**
     * Cambiar el estado del equipo
     * Regla de negocio: Solo ciertos estados son válidos
     */
    cambiarEstado(nuevoEstado: string): void {
        const estadosValidos = ['DISPONIBLE', 'OPERANDO', 'MANTENIMIENTO', 'INACTIVO'];
        
        if (!estadosValidos.includes(nuevoEstado)) {
            throw new Error(`Estado ${nuevoEstado} no es válido. Estados válidos: ${estadosValidos.join(', ')}`);
        }
        
        // Regla adicional: validar transiciones de estado
        if (!this.puedeTransicionarA(nuevoEstado)) {
            throw new Error(`No se puede cambiar de ${this._estado} a ${nuevoEstado}`);
        }
        
        this._estado = nuevoEstado;
        this._fechaActualizacion = new Date();
        this.registrarHistorial('cambiarEstado', nuevoEstado);
    }

    /**
     * Verificar si el equipo puede operar
     * Regla de negocio: Solo equipos disponibles pueden operar
     */
    puedeOperar(): boolean {
        return this._estado === 'DISPONIBLE';
    }

    /**
     * Reinicia el equipo a estado inicial.
     */
    reiniciar(): void {
        this._estado = 'DISPONIBLE';
        this._nivelCombustible = 100;
        this._horasOperacion = 0;
        this._fechaActualizacion = new Date();
        this.registrarHistorial('reiniciar');
    }

    /**
     * Obtener información completa del equipo
     * Útil para transferir datos a otras capas
     */
    obtenerInfo(): any {
        return {
            id: this._id,
            codigo: this._codigo,
            tipo: this._tipo,
            estado: this._estado,
            nivelCombustible: this._nivelCombustible,
            horasOperacion: this._horasOperacion
        };
    }

    // ===================================
    // MÉTODOS PRIVADOS (REGLAS DE NEGOCIO)
    // ===================================

    /**
     * Validar datos básicos del equipo
     * Concepto: Business Rules Validation
     */
    private validarDatos(codigo: string, tipo: string): void {
        // Regla: El código es obligatorio y debe tener formato específico
        if (!codigo || codigo.trim().length === 0) {
            throw new Error('El código del equipo es obligatorio');
        }
        if (codigo.length < 3) {
            throw new Error('El código debe tener al menos 3 caracteres');
        }

        // Regla: Solo ciertos tipos de equipos son válidos
        const tiposValidos = ['VOLQUETE', 'EXCAVADORA', 'BULLDOZER', 'GRUA', 'PERFORADORA'];
        if (!tiposValidos.includes(tipo)) {
            throw new Error(`Tipo ${tipo} no es válido. Tipos válidos: ${tiposValidos.join(', ')}`);
        }
    }

    /**
     * Validar transiciones de estado permitidas
     * Concepto: State Machine - Máquina de estados
     */
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
    private registrarHistorial(accion: string, valor?: any) {
        this._historial.push({ accion, valor, fecha: new Date() });
    }
}