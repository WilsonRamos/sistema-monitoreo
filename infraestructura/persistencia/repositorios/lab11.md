# Laboratorio 11: Clean Code


## Objetivo

Demostrar la identificación y corrección de bugs, *code smells* y vulnerabilidades en el proyecto final del curso, aplicando prácticas de codificación legible en las siguientes categorías:

- Nombres
- Funciones
- Comentarios
- Estructura de Código Fuente
- Objetos/Estructuras de Datos
- Tratamiento de Errores
- Clases

---

## Descripción
Este laboratorio presenta la implementación de `SupervisorRepositorio.ts`, una clase que implementa la interfaz `ISupervisorRepositorio` para gestionar entidades `Supervisor` en la base de datos utilizando Prisma. Se han seguido las prácticas de **Clean Code**, garantizando un código:

- Legible
- Mantenible
- Libre de problemas "Blocker" o "Critical" según SonarLint

También se mencionan brevemente las implementaciones relacionadas: `PersonaRepositorio.ts` y `OperadorRepositorio.ts`.

---

## Prácticas de Clean Code Aplicadas

### 1. Nombres

**Práctica:** Usar nombres descriptivos que revelen la intención.  
**Ejemplo:**

```ts
async adicionar(supervisor: Supervisor): Promise<void> {
  // ...
}
```

---

### 2. 🔧 Funciones

**Práctica:** Diseñar funciones pequeñas con una sola responsabilidad.  
**Ejemplo:**

```ts
private toDomainModel(prismaSupervisor: PrismaSupervisor, equipo: Equipo): Supervisor {
  return new Supervisor(
    prismaSupervisor.id,
    prismaSupervisor.nombre,
    prismaSupervisor.apellido,
    equipo
  );
}
```

---

### 3. Comentarios

**Práctica:** Usar comentarios que expliquen la intención sin redundancia.  
**Ejemplo:**

```ts
/**
 * Agrega un nuevo Supervisor a la base de datos.
 * @param supervisor Objeto Supervisor a persistir
 * @throws SupervisorRepositoryError si la creación falla
 */
async adicionar(supervisor: Supervisor): Promise<void> {
  // ...
}
```

---

### 4. Estructura de Código Fuente

**Práctica:** Organizar el código de forma lógica y consistente.  
**Ejemplo:**

```ts
// Clase de error
class SupervisorRepositoryError extends Error { ... }

// Clase principal
export class SupervisorRepositorio implements ISupervisorRepositorio {
  // Constructor y métodos
}
```

---

### 5. Objetos / Estructuras de Datos

**Práctica:** Usar clases para definir contratos claros de datos.  
**Ejemplo:**

```ts
await this.prisma.supervisor.create({
  data: {
    id: supervisor.id,
    nombre: supervisor.nombre,
    apellido: supervisor.apellido,
    equipoId: supervisor.equipoAsignado.id,
  },
});
```

---

### 6.  Tratamiento de Errores

**Práctica:** Implementar manejo robusto de errores con mensajes específicos.  
**Ejemplo:**

```ts
try {
  const existingSupervisor = await this.prisma.supervisor.findUnique({
    where: { id: supervisor.id },
  });
  if (!existingSupervisor) {
    throw new SupervisorRepositoryError(`Supervisor con ID ${supervisor.id} no encontrado`);
  }
} catch (error) {
  throw new SupervisorRepositoryError(`No se pudo modificar el Supervisor con ID ${supervisor.id}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
}
```

---

### 7.  Clases

**Práctica:** Diseñar clases cohesivas con una única responsabilidad.  
**Ejemplo:**

```ts
export class SupervisorRepositorio implements ISupervisorRepositorio {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient = new PrismaClient()) {
    this.prisma = prisma;
  }

  private mapToEquipo(prismaEquipo: any): Equipo {
    return new Equipo(prismaEquipo.id, prismaEquipo.nombre);
  }
}
```

---

##  Identificación y Corrección

###  Bugs Corregidos

- **Problema:** Posibles referencias nulas a `supervisor.id` o `supervisor.equipoAsignado`.
- **Corrección:** Verificación previa usando `findUnique`.

```ts
if (!prismaSupervisor || !prismaSupervisor.equipoAsignado) {
  return null;
}
```

---

###  Code Smells Corregidos

- **Problema:** Método `buscar` retornaba `void`.
- **Corrección:** Retorna `Promise<Supervisor | null>`.

```ts
async buscar(idSupervisor: string): Promise<Supervisor | null> {
  // ...
}
```

---

###  Vulnerabilidades Corregidas

- **Problema:** Promesas no manejadas correctamente.
- **Corrección:** Uso de `try-catch` en todas las operaciones asíncronas.

```ts
try {
  await this.prisma.supervisor.create({ ... });
} catch (error) {
  throw new SupervisorRepositoryError(...);
}
```

---

##  Reporte SonarLint
-  **Sin problemas "Blocker" o "Critical"**
-  Nombres claros, funciones pequeñas
-  Operaciones asíncronas bien gestionadas
- Interfaz bien implementada

---

##  Contexto del Proyecto

- **`PersonaRepositorio.ts`:** CRUD para `Persona`, usa `PersonaCreateInput`.
- **`OperadorRepositorio.ts`:** CRUD para `Operador`, incluye campo `licencia`.

Ambos repositorios siguen prácticas similares y también están limpios según SonarLint.

---

##  Trello

| Tarea | Estado | Detalles |
|-------|--------|----------|
| Implementar `SupervisorRepositorio.ts` |  Completada | Métodos CRUD implementados, relaciones con `Equipo` manejadas, prácticas de Clean Code aplicadas |

---

##  Instrucciones de Uso

1. **Repositorio GitHub:** Asegúrate de clonar el repositorio con los archivos `SupervisorRepositorio.ts`, `PersonaRepositorio.ts` y `OperadorRepositorio.ts`.
2. **Prisma Schema:** Verifica que los modelos `Supervisor`, `Operador` y `Equipo` estén definidos en `schema.prisma`.
3. **Generar cliente Prisma:**

```bash
npx prisma generate
```

4. **Sincronizar base de datos:**

```bash
npx prisma db push
```

5. **Ejecutar análisis estático con SonarLint** desde tu IDE.

---

##  Observaciones Finales

- No se detectaron problemas de alta severidad con SonarLint.
- Las prácticas de Clean Code aplicadas mejoran significativamente la legibilidad y mantenibilidad del código.
- La implementación está alineada con los objetivos y estándares del laboratorio 11.

---