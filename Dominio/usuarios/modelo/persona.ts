export class Persona {
    protected readonly _id: string;
    protected readonly _nombre: string;
    protected readonly _apellido: string;
    
    constructor(
        id: string,
        nombre: string, 
        apellido: string
    ) {
        this._id = id;
        this._nombre = nombre;
        this._apellido = apellido;
    }

    get id(): string {
        return this._id;
    }

    get nombre(): string {
        return this._nombre;
    }
    
    get apellido() : string {
        return this._apellido;
    }

}