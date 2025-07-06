import { Enum } from 'enum';

export class EstadoEquipo(Enum) {
    OPERATIVO = 1
    EN_MANTENIMIENTO = 2
    CARGANDO = 3
    DESCARGANDO = 4
    TRANSPORTANDO = 5