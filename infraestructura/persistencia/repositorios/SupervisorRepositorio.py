import { PrismaClient, Supervisor as PrismaSupervisor } from '@prisma/client';
import { Supervisor } from '../modelo/Supervisor';
import { Equipo } from '../../monitoreo/Equipo';
import { ISupervisorRepositorio } from './ISupervisorRepositorio';

// Clase de error personalizada para excepciones del repositorio de Supervisor
class SupervisorRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupervisorRepositoryError';
  }
}

/**
 * Implementación del repositorio para gestionar entidades Supervisor en la base de datos.
 * Cumple con la interfaz ISupervisorRepositorio y usa Prisma para operaciones de persistencia.
 */
export class SupervisorRepositorio implements ISupervisorRepositorio {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient = new PrismaClient()) {
    this.prisma = prisma;
  }

  /**
   * Agrega un nuevo Supervisor a la base de datos.
   * @param supervisor Objeto Supervisor a persistir
   * @throws SupervisorRepositoryError si la creación falla
   */
  async adicionar(supervisor: Supervisor): Promise<void> {
    try {
      await this.prisma.supervisor.create({
        data: {
          id: supervisor.id,
          nombre: supervisor.nombre,
          apellido: supervisor.apellido,
          equipoId: supervisor.equipoAsignado.id,
        },
      });
    } catch (error) {
      throw new SupervisorRepositoryError(`No se pudo adicionar el Supervisor: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Elimina un Supervisor de la base de datos.
   * @param supervisor Objeto Supervisor a eliminar
   * @throws SupervisorRepositoryError si no se encuentra el Supervisor o la eliminación falla
   */
  async eliminar(supervisor: Supervisor): Promise<void> {
    try {
      const existingSupervisor = await this.prisma.supervisor.findUnique({
        where: { id: supervisor.id },
      });
      if (!existingSupervisor) {
        throw new SupervisorRepositoryError(`Supervisor con ID ${supervisor.id} no encontrado`);
      }
      await this.prisma.supervisor.delete({
        where: { id: supervisor.id },
      });
    } catch (error) {
      throw new SupervisorRepositoryError(`No se pudo eliminar el Supervisor con ID ${supervisor.id}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Modifica un Supervisor existente en la base de datos.
   * @param supervisor Objeto Supervisor con los datos actualizados
   * @throws SupervisorRepositoryError si no se encuentra el Supervisor o la actualización falla
   */
  async modificar(supervisor: Supervisor): Promise<void> {
    try {
      const existingSupervisor = await this.prisma.supervisor.findUnique({
        where: { id: supervisor.id },
      });
      if (!existingSupervisor) {
        throw new SupervisorRepositoryError(`Supervisor con ID ${supervisor.id} no encontrado`);
      }
      await this.prisma.supervisor.update({
        where: { id: supervisor.id },
        data: {
          nombre: supervisor.nombre,
          apellido: supervisor.apellido,
          equipoId: supervisor.equipoAsignado.id,
        },
      });
    } catch (error) {
      throw new SupervisorRepositoryError(`No se pudo modificar el Supervisor con ID ${supervisor.id}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Busca un Supervisor por su ID.
   * @param idSupervisor El ID del Supervisor a buscar
   * @returns Objeto Supervisor del dominio o null si no se encuentra
   * @throws SupervisorRepositoryError si la operación falla
   */
  async buscar(idSupervisor: string): Promise<Supervisor | null> {
    try {
      const prismaSupervisor = await this.prisma.supervisor.findUnique({
        where: { id: idSupervisor },
        include: { equipoAsignado: true },
      });
      if (!prismaSupervisor || !prismaSupervisor.equipoAsignado) {
        return null;
      }
      return this.toDomainModel(prismaSupervisor, this.mapToEquipo(prismaSupervisor.equipoAsignado));
    } catch (error) {
      throw new SupervisorRepositoryError(`No se pudo buscar el Supervisor con ID ${idSupervisor}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Mapea un modelo Prisma Supervisor a un modelo de dominio Supervisor.
   * @param prismaSupervisor El modelo Supervisor de Prisma
   * @param equipo El objeto Equipo del dominio
   * @returns Objeto Supervisor del dominio
   */
  private toDomainModel(prismaSupervisor: PrismaSupervisor, equipo: Equipo): Supervisor {
    return new Supervisor(
      prismaSupervisor.id,
      prismaSupervisor.nombre,
      prismaSupervisor.apellido,
      equipo
    );
  }

  /**
   * Mapea un modelo Prisma Equipo a un modelo de dominio Equipo.
   * @param prismaEquipo El modelo Equipo de Prisma
   * @returns Objeto Equipo del dominio
   */
  private mapToEquipo(prismaEquipo: any): Equipo {
    // Asumiendo que Equipo tiene un constructor con id y nombre
    return new Equipo(prismaEquipo.id, prismaEquipo.nombre);
  }

  /**
   * Cierra la conexión del cliente Prisma.
   * Debe llamarse cuando el repositorio ya no sea necesario.
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}