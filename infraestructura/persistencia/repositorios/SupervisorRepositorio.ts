import { PrismaClient } from '../generated/prisma';
import { Equipo } from '../../../Dominio/monitoreo/Equipo';
import { EstadoEquipo as EstadoEquipoDominio } from '../../../Dominio/monitoreo/EstadoEquipo';
import { Supervisor } from '../../../Dominio/usuarios/modelo/supervisor';
import { Operador } from '../../../Dominio/usuarios/modelo/operador';
import { ISupervisorRepositorio } from '../../../Dominio/usuarios/InteracesRepositorio/iSupervisorRepositorio';

const prisma = new PrismaClient();

export class SupervisorRepositorio implements ISupervisorRepositorio {
  async crear(supervisor: Supervisor): Promise<void> {
    await prisma.persona.create({
      data: {
        id: supervisor.id,
        nombre: supervisor.nombre,
        apellido: supervisor.apellido  
      }
    })
    await prisma.supervisor.create({
      data: {
        id: supervisor.id,
        equipos: {
          // Asociacion de los equipos ya existentes al supervisor utilizando la relación many-to-many.
          // uso de `connect` para vincular los objetos `Equipo` que ya existen en la base de datos
          connect: supervisor.equipoAsignados.map(equipo => ({ id: equipo.id }))
        }
      }
    })
  }
  
  async eliminar(id: string): Promise<void> {
    await prisma.supervisor.delete({
      where: { id }
    })
  }
  
  async actualizar(supervisor: Supervisor): Promise<void> {
    await prisma.supervisor.update({
      where: { id: supervisor.id },
      data: {
        persona: {
          update: {
            nombre: supervisor.nombre,
            apellido: supervisor.apellido,
          }
        }
      }
    });
  }
    
  async obtenerPorId(id: string): Promise<Supervisor | null> {
    const supervisorPrisma = await prisma.supervisor.findUnique({
      where: { id },
      include: {
        persona: true,
        equipos: {
          include: {
            operador: {
              include: {
                persona: true
              }
            }
          }
        }
      }
    });

    if (!supervisorPrisma) return null;

    const equipos: Equipo[] = [];

    for (const equipoPrisma of supervisorPrisma.equipos) {
      const operadorPrisma = equipoPrisma.operador;
      // problematica circular
      // Crea un Equipo sin operador primero
      const equipo = new Equipo(
        equipoPrisma.id,
        equipoPrisma.codigo,
        equipoPrisma.tipo,
        equipoPrisma.nivelCombustible,
        equipoPrisma.horasOperacion
      );

      // Crea al operador con equipo asignado
      const operador = new Operador(
        operadorPrisma.id,
        operadorPrisma.persona.nombre,
        operadorPrisma.persona.apellido,
        operadorPrisma.licencia,
        equipo
      );

      // Asigna el operador al equipo
      equipo.operadorAsignado = operador;

      equipos.push(equipo);
    }

    const supervisor = new Supervisor(
      supervisorPrisma.id,
      supervisorPrisma.persona.nombre,
      supervisorPrisma.persona.apellido,
      equipos
    );

    return supervisor;
  }


  async obtenerTodos(): Promise<Supervisor[]> {
    const rows = await prisma.supervisor.findMany({
      include: {
        persona: true,
        equipos: {
          include: {
            operador: {
              include: { persona: true }
            }
          }
        }
      }
    });

    const supervisores = rows.map(row => {
      const equipos: Equipo[] = row.equipos.map(eq => {
        let operador: Operador | undefined;

        if (eq.operador) {
          operador = new Operador(
            eq.operador.id,
            eq.operador.persona.nombre,
            eq.operador.persona.apellido,
            eq.operador.licencia,
            undefined as any // Puedes pasar supervisor si lo necesitas
          );
        }

        const equipo = new Equipo(
          eq.id,
          eq.codigo,
          eq.tipo,
          eq.nivelCombustible,
          eq.horasOperacion,
          operador
        );

        if (operador) {
          equipo.operadorAsignado = operador;
        }

        equipo.estado = EstadoEquipoDominio[eq.estado as keyof typeof EstadoEquipoDominio];
        return equipo;
      });

      return new Supervisor(
        row.id,
        row.persona.nombre,
        row.persona.apellido,
        equipos
      );
    });

    return supervisores;
  }
    
  async buscarPorNombre(nombre: string): Promise<Supervisor[]> {
    const rows = await prisma.supervisor.findMany({
      where: {
        persona: {
          nombre: {
            contains: nombre,
            mode: 'insensitive', // búsqueda sin distinguir mayúsculas/minúsculas
          },
        },
      },
      include: {
        persona: true,
        equipos: {
          include: {
            operador: {
              include: { persona: true }
            }
          }
        }
      }
    });

    return rows.map(row => {
      const equipos: Equipo[] = row.equipos.map(eq => {
        let operador: Operador | undefined;

        if (eq.operador) {
          operador = new Operador(
            eq.operador.id,
            eq.operador.persona.nombre,
            eq.operador.persona.apellido,
            eq.operador.licencia,
            undefined as any
          );
        }

        const equipo = new Equipo(
          eq.id,
          eq.codigo,
          eq.tipo,
          eq.nivelCombustible,
          eq.horasOperacion,
          operador
        );

        if (operador) {
          equipo.operadorAsignado = operador;
        }

        // Conversión segura del enum
        equipo.estado = EstadoEquipoDominio[eq.estado as keyof typeof EstadoEquipoDominio];

        return equipo;
      });

      return new Supervisor(
        row.id,
        row.persona.nombre,
        row.persona.apellido,
        equipos
      );
    });
  }

  
  async buscarPorApellido(apellido: string): Promise<Supervisor[]> {
    const rows = await prisma.supervisor.findMany({
      where: {
        persona: {
          nombre: {
            contains: apellido,
            mode: 'insensitive', // búsqueda sin distinguir mayúsculas/minúsculas
          },
        },
      },
      include: {
        persona: true,
        equipos: {
          include: {
            operador: {
              include: { persona: true }
            }
          }
        }
      }
    });

    return rows.map(row => {
      const equipos: Equipo[] = row.equipos.map(eq => {
        let operador: Operador | undefined;

        if (eq.operador) {
          operador = new Operador(
            eq.operador.id,
            eq.operador.persona.nombre,
            eq.operador.persona.apellido,
            eq.operador.licencia,
            undefined as any
          );
        }

        const equipo = new Equipo(
          eq.id,
          eq.codigo,
          eq.tipo,
          eq.nivelCombustible,
          eq.horasOperacion,
          operador
        );

        if (operador) {
          equipo.operadorAsignado = operador;
        }

        // Conversión segura del enum
        equipo.estado = EstadoEquipoDominio[eq.estado as keyof typeof EstadoEquipoDominio];

        return equipo;
      });

      return new Supervisor(
        row.id,
        row.persona.nombre,
        row.persona.apellido,
        equipos
      );
    });
  }

  async listar(): Promise<Supervisor[]> {
    const rows = await prisma.supervisor.findMany({
      include: {
        persona: true,
        equipos: {
          include: {
            operador: {
              include: {
                persona: true
              }
            }
          }
        }
      }
    });

    return rows.map(row => {
      const equipos: Equipo[] = row.equipos.map(eq => {
        let operador: Operador | undefined;

        if (eq.operador) {
          operador = new Operador(
            eq.operador.id,
            eq.operador.persona.nombre,
            eq.operador.persona.apellido,
            eq.operador.licencia,
            undefined as any // Aquí puedes inyectar un repositorio si es necesario
          );
        }

        const equipo = new Equipo(
          eq.id,
          eq.codigo,
          eq.tipo,
          eq.nivelCombustible,
          eq.horasOperacion,
          operador
        );

        equipo.estado = EstadoEquipoDominio[eq.estado as keyof typeof EstadoEquipoDominio];

        return equipo;
      });

      return new Supervisor(
        row.id,
        row.persona.nombre,
        row.persona.apellido,
        equipos
      );
    });
  }
}