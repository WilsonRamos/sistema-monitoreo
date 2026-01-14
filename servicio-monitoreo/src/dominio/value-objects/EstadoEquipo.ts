/**
 * ==================================
 * VALUE OBJECT - ESTADO EQUIPO
 * ==================================
 * Enum de estados posibles para un equipo
 */

export enum EstadoEquipo {
    OPERATIVO = "Operativo",
    EN_MANTENIMIENTO = "En mantenimiento",
    CARGANDO = "Cargando",
    DESCARGANDO = "Descargando",
    TRANSPORTANDO = "Transportando",
    DISPONIBLE = "Disponible",
    INACTIVO = "Inactivo"
}
