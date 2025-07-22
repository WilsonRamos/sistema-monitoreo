import { PrismaClient } from '../generated/prisma';
import { IOperadorRepositorio } from '../../../Dominio/usuarios/InteracesRepositorio/iOperadorRepositorio';
import { Operador } from '../../../Dominio/usuarios/modelo/operador';
import { Equipo } from '../../../Dominio/monitoreo/Equipo';

// Interfaz para definir la estructura de datos para crear un Operador
interface OperadorCreateInput {
  id: string;
  nombre: string;
  apellido: string;
  licencia: string;
  equipoAsignado: Equipo;
}

// Clase de error personalizada para excepciones del repositorio de Operador
class OperadorRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OperadorRepositoryError';
  }
}

/**
 * Clase repositorio para gestionar entidades Operador en la base de datos.
 * Encapsula operaciones de base de datos y mapea modelos Prisma a modelos de dominio.
 */
export class OperadorRepositorio {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient = new PrismaClient()) {
    this.prisma = prisma;
  }

  /**
   * Crea un nuevo Operador en la base de datos.
   * @param input Datos necesarios para crear un Operador
   * @returns Objeto Operador del dominio creado
   * @throws OperadorRepositoryError si la creación falla
   */
  async create(input: OperadorCreateInput): Promise<Operador> {
    try {
      const { id, nombre, apellido, licencia, equipoAsignado } = input;
      const prismaOperador = await this.prisma.operador.create({
        data: {
          id,
          nombre,
          apellido,
          licencia,
          equipoId: equipoAsignado.id,
        },
      });
      return this.toDomainModel(prismaOperador, equipoAsignado);
    } catch (error) {
      throw new OperadorRepositoryError(`No se pudo crear el Operador: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Busca un Operador por su ID.
   * @param id El ID del Operador a buscar
   * @returns Objeto Operador del dominio o null si no se encuentra
   * @throws OperadorRepositoryError si la operación falla
   */
  async findById(id: string): Promise<Operador | null> {
    try {
      const prismaOperador = await this.prisma.operador.findUnique({
        where: { id },
        include: { equipoAsignado: true },
      });
      if (!prismaOperador || !prismaOperador.equipoAsignado) {
        return null;
      }
      return this.toDomainModel(prismaOperador, this.mapToEquipo(prismaOperador.equipoAsignado));
    } catch (error) {
      throw new OperadorRepositoryError(`No se pudo encontrar el Operador con ID ${id}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Actualiza un Operador existente.
   * @param id El ID del Operador a actualizar
   * @param input Datos actualizados para el Operador
   * @returns Objeto Operador del dominio actualizado
   * @throws OperadorRepositoryError si no se encuentra el Operador o la actualización falla
   */
  async update(id: string, input: Partial<OperadorCreateInput>): Promise<Operador> {
    try {
      const existingOperador = await this.prisma.operador.findUnique({
        where: { id },
        include: { equipoAsignado: true },
      });
      if (!existingOperador || !existingOperador.equipoAsignado) {
        throw new OperadorRepositoryError(`Operador con ID ${id} no encontrado o sin equipo asignado`);
      }
      const prismaOperador = await this.prisma.operador.update({
        where: { id },
        data: {
          nombre: input.nombre ?? existingOperador.nombre,
          apellido: input.apellido ?? existingOperador.apellido,
          licencia: input.licencia ?? existingOperador.licencia,
          equipoId: input.equipoAsignado?.id ?? existingOperador.equipoId,
        },
      });
      const equipo = input.equipoAsignado ?? this.mapToEquipo(existingOperador.equipoAsignado);
      return this.toDomainModel(prismaOperador, equipo);
    } catch (error) {
      throw new OperadorRepositoryError(`No se pudo actualizar el Operador con ID ${id}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Elimina un Operador por su ID.
   * @param id El ID del Operador a eliminar
   * @throws OperadorRepositoryError si no se encuentra el Operador o la eliminación falla
   */
  async delete(id: string): Promise<void> {
    try {
      const existingOperador = await this.prisma.operador.findUnique({
        where: { id },
      });
      if (!existingOperador) {
        throw new OperadorRepositoryError(`Operador con ID ${id} no encontrado`);
      }
      await this.prisma.operador.delete({
        where: { id },
      });
    } catch (error) {
      throw new OperadorRepositoryError(`No se pudo eliminar el Operador con ID ${id}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Mapea un modelo Prisma Operador a un modelo de dominio Operador.
   * @param prismaOperador El modelo Operador de Prisma
   * @param equipo El objeto Equipo del dominio
   * @returns Objeto Operador del dominio
   */
  private toDomainModel(prismaOperador: PrismaOperador, equipo: Equipo): Operador {
    return new Operador(
      prismaOperador.id,
      prismaOperador.nombre,
      prismaOperador.apellido,
      prismaOperador.licencia,
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