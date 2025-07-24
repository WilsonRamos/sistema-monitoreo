
# Laboratorio 12: Principios SOLID

##  Objetivo

Aplicar principios de orientación a objetos **SOLID** para desarrollar software más **escalable** y **mantenible**.

---

##  Grupos

- Trabajo individual.

---

##  Pre-requisitos

- Laboratorio 11 completado.
- Proyecto en repositorio GitHub.

---

## 🔧 Actividades

En la implementación de cada componente/módulo asignado por el líder del equipo, cada miembro debe:

- Aplicar al menos **3 principios SOLID**.
- Corregir errores, *code smells* y vulnerabilidades con ayuda de **SonarLint**.
- Documentar en el `README.md` los principios aplicados con ejemplos de código.
- Actualizar Trello con el avance correspondiente.

---

##  Principios SOLID Aplicados

### 1. **S – Single Responsibility Principle (SRP)**

Cada clase tiene una única responsabilidad.  
**Ejemplo:** `SupervisorRepositorio` solo se encarga de persistencia, y los errores se delegan a `SupervisorRepositoryError`.

```ts
class SupervisorRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupervisorRepositoryError';
  }
}
```

---

### 2. **O – Open/Closed Principle (OCP)**

Las clases están abiertas para extensión pero cerradas para modificación.  
**Ejemplo:** Ambas clases (`SupervisorRepositorio` y `OperadorRepositorio`) pueden extenderse sin alterar su lógica base, por ejemplo para logging o validaciones adicionales.

---

### 3. **L – Liskov Substitution Principle (LSP)**

Las clases implementan interfaces y respetan el contrato.  
**Ejemplo:** `SupervisorRepositorio` implementa `ISupervisorRepositorio`, permitiendo sustituir la implementación sin romper el comportamiento.

---

### 4. **I – Interface Segregation Principle (ISP)**

Uso de interfaces específicas en lugar de una genérica.  
**Ejemplo:** `IOperadorRepositorio` y `ISupervisorRepositorio` definen contratos claros y separados.

---

### 5. **D – Dependency Inversion Principle (DIP)**

Las clases dependen de abstracciones (`interfaces`) y no de implementaciones concretas.  
**Ejemplo:** `SupervisorRepositorio` y `OperadorRepositorio` reciben `PrismaClient` por inyección de dependencia:

```ts
constructor(prisma: PrismaClient = new PrismaClient()) {
  this.prisma = prisma;
}
```

---

##  SonarLint

-  No se encontraron errores "Blocker" ni "Critical".
- Se corrigieron promesas no manejadas y posibles referencias nulas.
- Análisis estático aplicado a todos los archivos modificados.

---

##  Estructura Implementada

### `SupervisorRepositorio.ts`

- Métodos: `adicionar`, `modificar`, `eliminar`, `buscar`, `disconnect`
- Uso de Prisma
- Manejo de errores robusto

### `OperadorRepositorio.ts`

- Métodos: `create`, `findById`, `update`, `delete`, `disconnect`
- Cumple con SRP, DIP, OCP
- Interfaz `OperadorCreateInput`

---

##  Técnicas de Refactorización

- Extracción de métodos para mapeo (`toDomainModel`, `mapToEquipo`)
- Manejo explícito de errores con `try-catch`
- Verificación previa de existencia antes de actualizar o eliminar

---

##  Entregables

- [x] Código fuente limpio en GitHub
- [x] Documentación de principios SOLID aplicados
- [x] Reporte de SonarLint
- [x] Tablero Trello con avance registrado

---

##  Repositorio

El código se encuentra en el repositorio asignado al equipo bajo las rutas:

```
src/
├── dominio/
│   └── modelo/
├── infraestructura/
│   ├── repositorios/
│   │   ├── SupervisorRepositorio.ts
│   │   └── OperadorRepositorio.ts
```

---

##  Observaciones Finales

- Se aplicaron correctamente los principios SOLID.
- Código mantenible, limpio y escalable.
- Análisis estático exitoso.

---
