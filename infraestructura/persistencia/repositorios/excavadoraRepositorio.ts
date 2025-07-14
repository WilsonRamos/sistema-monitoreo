import { PrismaClient } from '../generated/prisma';
import { IExcavadoraRepositorio } from '../../../Dominio/monitoreo/interfacesRepositorio/iExcavadoraRepositorio';
import { Excavadora } from '../../../Dominio/monitoreo/excavadora';
import { Operador } from '../../../Dominio/usuarios/modelo/operador';

const prisma = new PrismaClient();

/**
 * Repositorio concreto para gestionar operaciones CRUD sobre entidades Excavadora
 * utilizando Prisma como ORM y PostgreSQL como base de datos.
 */
export class ExcavadoraRepositorio implements IExcavadoraRepositorio {
    
    /**
     * Guarda una nueva instancia de Excavadora y su equipo asociado en la base de datos.
     * @param excavadora La excavadora a guardar.
     */
    async guardar(excavadora: Excavadora): Promise<void> {
        // Crear Equipo relacionado
        await prisma.equipo.create({
            data: {
                id: excavadora.id,
                codigo: excavadora.codigo,
                tipo: excavadora.tipo,
                estado: excavadora.estado,
                nivelCombustible: excavadora.nivelCombustible,
                horasOperacion: excavadora.horasOperacion,
                operador: {
                    connect: { id: excavadora.operadorAsignado.id }
                }
            }
        });

        // crear entidad Excavadora con relación 1:1 basada en el ID
        await prisma.excavadora.create({
            data: {
                id: excavadora.id,
                tipoExcavacion: excavadora.tipo
            }
        });
    }

    /**
     * busca una exavadora por su identificador único
     * @param id ID de la excavadora
     * @returns Instancia de Excavadora si existe, o null
     */
    async buscarPorId(id: string): Promise<Excavadora | null> {
        const excavadoraPrisma = await prisma.excavadora.findUnique({
            where: { id },
            include: {
                equipo: {
                    include: { operador: true }
                }
            }
        });

        if (!excavadoraPrisma) return null;

        const operador = new Operador(
            excavadoraPrisma.equipo.operador.id,
            excavadoraPrisma.equipo.operador.nombre,
            excavadoraPrisma.equipo.operador.apellido,
            excavadoraPrisma.equipo.operador.licencia,
            null as any
        );

        return new Excavadora(
            excavadoraPrisma.equipo.id,
            excavadoraPrisma.equipo.codigo,
            excavadoraPrisma.equipo.tipo,
            excavadoraPrisma.equipo.nivelCombustible,
            excavadoraPrisma.equipo.horasOperacion,
            operador,
            excavadoraPrisma.tipoExcavacion
        );
    }

    /**
     * Lista todas las excavadoras almacenadas en la base de datos
     * @returns Array de Excavadoras
     */
    async listar(): Promise<Excavadora[]> {
        const excavadoras = await prisma.excavadora.findMany({
            include: {
                equipo: {
                    include: { operador: true }
                }
            }
        });

        return excavadoras.map(e => {
            const operador = new Operador(
                e.equipo.operador.id,
                e.equipo.operador.nombre,
                e.equipo.operador.apellido,
                e.equipo.operador.licencia,
                null as any
            );

            return new Excavadora(
                e.equipo.id,
                e.equipo.codigo,
                e.equipo.tipo,
                e.equipo.nivelCombustible,
                e.equipo.horasOperacion,
                operador,
                e.tipoExcavacion
            );
        });
    }

    /**
     * Actualiza la información de una excavadora existente
     * @param excavadora Excavadora con los datos actualizados
     */
    async actualizar(excavadora: Excavadora): Promise<void> {
        await prisma.excavadora.update({
            where: { id: excavadora.id },
            data: {
                tipoExcavacion: excavadora.tipo,
                equipo: {
                    update: {
                        codigo: excavadora.codigo,
                        tipo: excavadora.tipo,
                        estado: excavadora.estado,
                        nivelCombustible: excavadora.nivelCombustible,
                        horasOperacion: excavadora.horasOperacion,
                        operador: {
                            connect: { id: excavadora.operadorAsignado.id }
                        }
                    }
                }
            }
        });
    }

    /**
     * Elimina una excavadora por su ID (esto elimina también el equipo relacionado si tienes `onDelete: Cascade`)
     * @param id ID de la excavadora a eliminar
     */
    async eliminar(id: string): Promise<void> {
        await prisma.excavadora.delete({
            where: { id }
        });
    }
}
